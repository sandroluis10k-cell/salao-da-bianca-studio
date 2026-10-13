import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { MessageCircle, X, Send, MapPin, ExternalLink, CalendarCheck, Clock } from 'lucide-react';
import {
  salonConfig,
  formatCurrency,
  formatAddress,
  getGoogleMapsUrl,
  getWhatsAppUrl,
  type Service,
} from '../salonConfig';
import {
  addDays,
  book,
  fmtDayLong,
  fmtDayShort,
  fmtTime,
  freeSlots,
  friendlyError,
  getBusy,
  getHours,
  getServices,
  todayKey,
  toDate,
  weekdayOf,
  type HoursRow,
  type ServiceRow,
} from '../agendaApi';

/**
 * Assistente de atendimento do site.
 * Responde serviços, preços, endereço e horários e AGENDA direto na agenda da Bianca.
 */

type Action = { label: string; run: () => void };
type Msg =
  | { id: number; from: 'bot' | 'user'; content: ReactNode }
  | { id: number; from: 'actions'; actions: Action[] }
  | { id: number; from: 'link'; label: string; href: string; tone: 'whatsapp' };
type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, 'id'> : never) : never;

type Booking = { service: Service; duration: number; day?: string; start?: Date; name?: string; phone?: string };
type Expect = null | 'name' | 'phone';

const DAYS_AHEAD = 14;

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const waLink = (message: string) =>
  getWhatsAppUrl(salonConfig.whatsappNumber, encodeURIComponent(message));

const fmtPhone = (digits: string) =>
  digits.length === 11 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : digits;

// Palavras que identificam cada serviço (combos primeiro)
const SERVICE_KEYWORDS: { match: RegExp; name: string }[] = [
  { match: /hidratac\w*\s*(e|\+|com)\s*escova/, name: 'Hidratação e escova' },
  { match: /colorac\w*\s*(e|\+|com)\s*escova/, name: 'Coloração e escova' },
  { match: /sem formol|organica/, name: 'Progressiva sem formol' },
  { match: /com formol/, name: 'Progressiva com formol' },
  { match: /botox/, name: 'Botox capilar' },
  { match: /colorac|colocac|tinta|pintar|tingir|cor do cabelo/, name: 'Coloração' },
  { match: /hidrata/, name: 'Hidratação' },
  { match: /escova/, name: 'Escova' },
];

let nextId = 1;

export const ChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [unread, setUnread] = useState(true);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [expect, setExpect] = useState<Expect>(null);
  const started = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const booking = useRef<Booking | null>(null);
  const agenda = useRef<{ hours: HoursRow[]; services: ServiceRow[] } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  // Botões "Agendar" do site abrem o chat direto no agendamento (ver openBooking em salonConfig)
  useEffect(() => {
    const handler = (e: Event) => {
      const name = (e as CustomEvent<{ service?: string }>).detail?.service;
      openToBooking(salonConfig.services.find((s) => s.name === name));
    };
    window.addEventListener('abrir-agendamento', handler);
    return () => window.removeEventListener('abrir-agendamento', handler);
  });

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const push = (m: NewMsg) => setMessages((prev) => [...prev, { ...m, id: nextId++ } as Msg]);

  // Mensagens do assistente saem em fila, com "digitando..."
  const bot = (content: ReactNode, delay = 550) => {
    queue.current = queue.current.then(
      () =>
        new Promise<void>((resolve) => {
          setTyping(true);
          window.setTimeout(() => {
            setTyping(false);
            push({ from: 'bot', content });
            resolve();
          }, delay);
        })
    );
  };
  const after = (fn: () => void | Promise<void>) => {
    queue.current = queue.current.then(() => fn()).catch(() => undefined);
  };
  const actions = (list: Action[]) => after(() => push({ from: 'actions', actions: list }));
  const whatsapp = (message: string, label = 'Falar no WhatsApp') =>
    after(() => push({ from: 'link', label, href: waLink(message), tone: 'whatsapp' }));
  const clearActions = () => setMessages((prev) => prev.filter((m) => m.from !== 'actions'));
  const user = (content: string) => {
    clearActions();
    push({ from: 'user', content });
  };

  const loadAgenda = async () => {
    if (agenda.current) return agenda.current;
    const [hours, services] = await Promise.all([getHours(), getServices()]);
    agenda.current = { hours, services };
    return agenda.current;
  };

  /* ---------- menu ---------- */
  const menu = () =>
    actions([
      { label: '📅 Agendar horário', run: () => (user('Agendar horário'), chooseService()) },
      { label: '💇‍♀️ Serviços e preços', run: () => (user('Serviços e preços'), prices()) },
      { label: '📍 Endereço', run: () => (user('Endereço'), address()) },
      { label: '🕒 Horários', run: () => (user('Horários'), hours()) },
      { label: '💬 Falar com a Bianca', run: () => (user('Falar com a Bianca'), talk()) },
    ]);

  const backToMenu: Action = {
    label: 'Menu',
    run: () => {
      setExpect(null);
      booking.current = null;
      user('Menu');
      bot('Como posso te ajudar?');
      menu();
    },
  };

  const prices = () => {
    bot(
      <div>
        <p className="mb-2">Nossos serviços:</p>
        <ul className="space-y-1.5">
          {salonConfig.services.map((s) => (
            <li key={s.name} className="flex justify-between gap-3 border-b border-dashed border-white/10 pb-1.5 last:border-0">
              <span>{s.name}</span>
              <span className="font-semibold text-brand-pinkLight whitespace-nowrap">{formatCurrency(s.price)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
    bot('Quer agendar algum? Toque no serviço 👇');
    serviceButtons();
  };

  const serviceButtons = () =>
    actions([
      ...salonConfig.services.map((s) => ({ label: s.name, run: () => (user(s.name), startBooking(s)) })),
      backToMenu,
    ]);

  const chooseService = () => {
    bot('Vamos agendar! 💖 Qual serviço você quer fazer?');
    serviceButtons();
  };

  /* ---------- AGENDAMENTO ---------- */
  const startBooking = (s: Service) => {
    after(async () => {
      try {
        const ag = await loadAgenda();
        const dur = ag.services.find((x) => x.name === s.name)?.duration_min ?? 60;
        booking.current = { service: s, duration: dur };
        bot(
          <div>
            <p>
              <strong>{s.name}</strong> — <span className="text-brand-pinkLight font-semibold">{formatCurrency(s.price)}</span>
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-brand-white/70 text-[13px]">
              <Clock className="w-3.5 h-3.5" /> Duração aproximada: {dur >= 60 ? `${Math.floor(dur / 60)}h${dur % 60 ? dur % 60 : ''}` : `${dur} min`}
            </p>
          </div>
        );
        chooseDay();
      } catch {
        bot('Não consegui abrir a agenda agora 😕 Mas a Bianca agenda pra você no WhatsApp:');
        whatsapp(`Olá, Bianca! Vi o site e gostaria de agendar: ${s.name}.`, 'Agendar pelo WhatsApp');
        menu();
      }
    });
  };

  const chooseDay = () => {
    after(async () => {
      const b = booking.current;
      const ag = agenda.current;
      if (!b || !ag) return;
      const start = todayKey();
      const days: string[] = [];
      for (let i = 0; i < DAYS_AHEAD; i++) {
        const k = addDays(start, i);
        if (ag.hours.some((h) => h.weekday === weekdayOf(k) && h.active)) days.push(k);
      }
      // Busca a ocupação das próximas 2 semanas de uma vez
      let busy: Awaited<ReturnType<typeof getBusy>> = [];
      try {
        busy = await getBusy(toDate(start, '00:00'), toDate(addDays(start, DAYS_AHEAD), '00:00'));
      } catch {
        /* segue sem ocupação; o banco valida no final */
      }
      const withSlots = days.filter((d) => freeSlots(d, b.duration, ag.hours, busy).length > 0);
      if (!withSlots.length) {
        bot('Poxa, a agenda das próximas duas semanas está cheia 😕 Fala com a Bianca que ela tenta um encaixe:');
        whatsapp(`Olá, Bianca! Queria agendar ${b.service.name}, mas não achei horário no site. Tem algum encaixe?`, 'Pedir encaixe no WhatsApp');
        actions([backToMenu]);
        return;
      }
      bot('Qual dia fica melhor pra você?');
      actions([
        ...withSlots.slice(0, 10).map((d) => ({
          label: fmtDayShort(d),
          run: () => {
            user(fmtDayShort(d));
            chooseTime(d, busy);
          },
        })),
        { label: 'Trocar serviço', run: () => (user('Trocar serviço'), chooseService()) },
      ]);
    });
  };

  const chooseTime = (day: string, busy: Awaited<ReturnType<typeof getBusy>>) => {
    const b = booking.current;
    const ag = agenda.current;
    if (!b || !ag) return;
    b.day = day;
    const slots = freeSlots(day, b.duration, ag.hours, busy);
    bot(<span>Horários livres na <strong>{fmtDayLong(day)}</strong>:</span>);
    actions([
      ...slots.map((t) => ({
        label: fmtTime(t),
        run: () => {
          user(fmtTime(t));
          b.start = t;
          askName();
        },
      })),
      { label: 'Outro dia', run: () => (user('Outro dia'), chooseDay()) },
    ]);
  };

  const askName = () => {
    bot('Perfeito! Qual é o seu nome?');
    after(() => {
      setExpect('name');
      inputRef.current?.focus();
    });
  };

  const askPhone = () => {
    bot('E o seu WhatsApp com DDD? (a Bianca usa para confirmar com você)');
    after(() => {
      setExpect('phone');
      inputRef.current?.focus();
    });
  };

  const confirmBooking = () => {
    const b = booking.current;
    if (!b?.start || !b.name || !b.phone || !b.day) return;
    const end = new Date(b.start.getTime() + b.duration * 60_000);
    bot(
      <div>
        <p className="mb-2">Confere se está tudo certo:</p>
        <div className="space-y-1 rounded-xl bg-brand-black/60 border border-white/10 p-3 text-[13.5px]">
          <p>💇‍♀️ <strong>{b.service.name}</strong> ({formatCurrency(b.service.price)})</p>
          <p>📅 {fmtDayLong(b.day)}</p>
          <p>🕒 {fmtTime(b.start)} às {fmtTime(end)}</p>
          <p>👤 {b.name} · {fmtPhone(b.phone)}</p>
        </div>
      </div>
    );
    actions([
      { label: '✅ Confirmar agendamento', run: () => (user('Confirmar'), doBook()) },
      { label: 'Mudar horário', run: () => (user('Mudar horário'), chooseDay()) },
      backToMenu,
    ]);
  };

  const doBook = () => {
    after(async () => {
      const b = booking.current;
      if (!b?.start || !b.name || !b.phone || !b.day) return;
      setTyping(true);
      try {
        const r = await book(b.service.name, b.start, b.name, b.phone);
        setTyping(false);
        const start = new Date(r.start_at);
        const when = `${fmtDayLong(b.day)} às ${fmtTime(start)}`;
        push({
          from: 'bot',
          content: (
            <div>
              <p className="flex items-center gap-2 font-semibold text-brand-pinkLight">
                <CalendarCheck className="w-4 h-4" /> Horário reservado!
              </p>
              <p className="mt-1.5">
                {b.name.split(' ')[0]}, seu horário de <strong>{b.service.name}</strong> está marcado para <strong>{when}</strong>. 💖
              </p>
              <p className="mt-1.5 text-brand-white/70 text-[13px]">📍 {formatAddress(salonConfig.address)}</p>
            </div>
          ),
        });
        push({
          from: 'link',
          tone: 'whatsapp',
          label: 'Enviar confirmação para a Bianca',
          href: waLink(
            `Olá, Bianca! Acabei de agendar pelo site:\nServiço: ${b.service.name}\nData: ${when}\nNome: ${b.name}\nAté lá!`
          ),
        });
        booking.current = null;
        agenda.current = null; // recarrega ocupação na próxima
        push({ from: 'actions', actions: [backToMenu] });
      } catch (e) {
        setTyping(false);
        push({ from: 'bot', content: friendlyError(e) });
        if (String(e).includes('HORARIO_OCUPADO')) {
          bot('Vou te mostrar os horários atualizados 👇');
          chooseDay();
        } else {
          push({
            from: 'actions',
            actions: [{ label: 'Tentar de novo', run: () => (user('Tentar de novo'), doBook()) }, backToMenu],
          });
          push({ from: 'link', tone: 'whatsapp', label: 'Agendar pelo WhatsApp', href: waLink(`Olá, Bianca! Quero agendar ${b.service.name}.`) });
        }
      }
    });
  };

  /* ---------- informações ---------- */
  const address = () => {
    bot(
      <div>
        <p className="flex gap-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-pink" />
          <span>{formatAddress(salonConfig.address)}</span>
        </p>
        <a
          href={getGoogleMapsUrl(salonConfig.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 font-semibold text-brand-pink hover:underline"
        >
          Abrir no Google Maps <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
    actions([{ label: 'Agendar horário', run: () => (user('Agendar horário'), chooseService()) }, backToMenu]);
  };

  const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const hours = () => {
    after(async () => {
      try {
        const ag = await loadAgenda();
        const active = ag.hours.filter((h) => h.active);
        const allSame = active.length === 7 && active.every((h) => h.open_time === active[0].open_time && h.close_time === active[0].close_time);
        bot(
          <div>
            <p className="mb-1.5">🕒 Horário de atendimento:</p>
            {allSame ? (
              <p>Todos os dias, das {active[0].open_time.slice(0, 5)} às {active[0].close_time.slice(0, 5)}</p>
            ) : (
              <ul className="space-y-1">
                {ag.hours.map((h) => (
                  <li key={h.weekday} className="flex justify-between gap-3">
                    <span>{DAY_NAMES[h.weekday]}</span>
                    <span className="text-brand-white/80">{h.active ? `${h.open_time.slice(0, 5)} às ${h.close_time.slice(0, 5)}` : 'Fechado'}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-brand-white/70 text-[13px]">Atendimento com horário marcado.</p>
          </div>
        );
      } catch {
        bot('O atendimento é com horário marcado 😊');
      }
      actions([{ label: '📅 Agendar horário', run: () => (user('Agendar horário'), chooseService()) }, backToMenu]);
    });
  };

  const talk = () => {
    bot('Claro! Toque no botão para falar direto com a Bianca:');
    whatsapp('Olá, Bianca! Vi o site e tenho uma dúvida.', 'Abrir WhatsApp');
    actions([backToMenu]);
  };

  /* ---------- texto livre ---------- */
  const answer = (raw: string) => {
    const t = normalize(raw);
    const findService = (name: string) => salonConfig.services.find((s) => s.name === name);

    if (/progressiva/.test(t) && !/(sem|com) formol/.test(t)) {
      bot(`Temos dois tipos de progressiva, as duas por ${formatCurrency(100)}. Qual você prefere?`);
      actions(
        salonConfig.services
          .filter((s) => /progressiva/i.test(s.name))
          .map((s) => ({ label: s.name, run: () => (user(s.name), startBooking(s)) }))
      );
      return;
    }
    const hit = SERVICE_KEYWORDS.find((k) => k.match.test(t));
    const found = hit && findService(hit.name);
    if (found) return startBooking(found);

    if (/(agend|marcar|vaga|reserv|horario livre|tem horario)/.test(t)) return chooseService();
    if (/(preco|valor|quanto|custa|tabela|servico)/.test(t)) return prices();
    if (/(onde|endereco|local|fica|mapa|chegar)/.test(t)) return address();
    if (/(hora|abre|fecha|funciona|aberto|domingo|sabado|segunda)/.test(t)) return hours();
    if (/(cancel|desmarc|remarc)/.test(t)) {
      bot('Para cancelar ou remarcar, é só avisar a Bianca no WhatsApp 😊');
      whatsapp('Olá, Bianca! Preciso cancelar/remarcar meu horário.', 'Falar no WhatsApp');
      return menu();
    }
    if (/(pix|cartao|dinheiro|pagamento|pagar|parcel)/.test(t)) {
      bot('As formas de pagamento a Bianca te confirma no WhatsApp 😊');
      whatsapp('Olá, Bianca! Quais formas de pagamento você aceita?', 'Perguntar no WhatsApp');
      return menu();
    }
    if (/(instagram|insta|foto|trabalho|resultado|antes)/.test(t)) {
      bot(
        <span>
          Veja os trabalhos da Bianca no Instagram:{' '}
          <a href={salonConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-pink hover:underline">
            @{salonConfig.instagramUsername}
          </a>
        </span>
      );
      return menu();
    }
    if (/^(oi|ola|bom dia|boa tarde|boa noite|e ?ai|opa)\b/.test(t)) {
      bot('Oi! 😊 Como posso te ajudar?');
      return menu();
    }
    if (/(obrigad|valeu|brigad)/.test(t)) {
      bot('Imagina! Estamos te esperando 💖');
      return menu();
    }
    bot('Não entendi bem 🙈 Mas a Bianca pode te responder direto:');
    whatsapp(`Olá, Bianca! Vi o site e tenho uma dúvida: ${raw}`, 'Enviar pergunta no WhatsApp');
    menu();
  };

  /* ---------- abrir / enviar ---------- */
  const greet = () => {
    started.current = true;
    bot(<span>Oi! 👋 Bem-vinda ao <strong>{salonConfig.name}</strong>.</span>, 350);
  };

  const toggle = () => {
    setOpen((o) => !o);
    setUnread(false);
    if (!started.current) {
      greet();
      bot('Você já pode marcar seu horário por aqui, na hora! Ou, se preferir, te mostro os serviços e preços. 😊');
      menu();
    }
    window.setTimeout(() => inputRef.current?.focus(), 80);
  };

  const openToBooking = (service?: Service) => {
    setOpen(true);
    setUnread(false);
    setExpect(null);
    booking.current = null;
    if (!started.current) greet();
    else clearActions();
    if (service) {
      push({ from: 'user', content: `Quero agendar ${service.name}` });
      startBooking(service);
    } else chooseService();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setText('');
    const b = booking.current;

    if (expect === 'name' && b) {
      if (v.length < 2) {
        push({ from: 'user', content: v });
        bot('Pode me dizer seu nome? 😊');
        return;
      }
      user(v);
      b.name = v.replace(/\s+/g, ' ').slice(0, 80);
      setExpect(null);
      askPhone();
      return;
    }
    if (expect === 'phone' && b) {
      user(v);
      let digits = v.replace(/\D/g, '');
      if (digits.startsWith('55') && digits.length >= 12) digits = digits.slice(2);
      if (digits.length < 10 || digits.length > 11) {
        bot('Hmm, esse número não parece certo. Digita com DDD, por exemplo: 62 99999-9999');
        return;
      }
      b.phone = digits;
      setExpect(null);
      confirmBooking();
      return;
    }
    user(v);
    answer(v);
  };

  const placeholder =
    expect === 'name' ? 'Digite seu nome...' : expect === 'phone' ? 'Ex.: 62 99999-9999' : 'Digite sua dúvida...';

  return (
    <>
      {/* Janela do chat */}
      <div
        role="dialog"
        aria-label="Assistente da Bianca"
        aria-hidden={!open}
        className={`fixed z-50 right-3 sm:right-7 bottom-[88px] sm:bottom-[104px] w-[calc(100vw-24px)] sm:w-[380px] h-[min(580px,calc(100dvh-120px))]
          flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-brand-blackSecondary shadow-glow-rose
          transition-all duration-300 ease-out origin-bottom-right
          ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
      >
        <div className="flex items-center gap-3 bg-gradient-rose px-4 py-3.5">
          <img src={salonConfig.logoPath} alt="" className="h-10 w-10 rounded-full object-cover border-2 border-brand-white/40" />
          <div className="min-w-0">
            <p className="font-semibold text-brand-white leading-tight">Assistente da Bianca</p>
            <p className="text-xs text-brand-white/80">Agende seu horário na hora</p>
          </div>
          <button
            type="button"
            onClick={toggle}
            aria-label="Fechar conversa"
            className="ml-auto rounded-full p-1.5 text-brand-white hover:bg-brand-white/15"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={bodyRef} className="flex-1 overflow-y-auto px-3.5 py-4 space-y-2.5 bg-brand-black" aria-live="polite">
          {messages.map((m) => {
            if (m.from === 'actions')
              return (
                <div key={m.id} className="flex flex-wrap gap-1.5 pt-0.5">
                  {m.actions.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={a.run}
                      className="rounded-full border border-brand-pink/50 px-3 py-1.5 text-[13px] text-brand-pinkLight hover:bg-gradient-rose hover:text-brand-white hover:border-transparent transition-colors"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              );
            if (m.from === 'link')
              return (
                <div key={m.id}>
                  <a
                    href={m.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold hover:brightness-110 bg-[#25D366] text-white"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {m.label}
                  </a>
                </div>
              );
            const mine = m.from === 'user';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                    mine
                      ? 'bg-gradient-rose text-brand-white rounded-br-md'
                      : 'bg-brand-blackSecondary text-brand-white/90 border border-white/[0.07] rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex">
              <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-brand-blackSecondary px-4 py-3">
                <span className="flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="h-1.5 w-1.5 rounded-full bg-brand-pink animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 border-t border-white/10 bg-brand-blackSecondary p-2.5">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            aria-label="Mensagem"
            inputMode={expect === 'phone' ? 'tel' : 'text'}
            autoComplete={expect === 'name' ? 'name' : expect === 'phone' ? 'tel' : 'off'}
            className="flex-1 rounded-full border border-white/10 bg-brand-black px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-white/40 outline-none focus:border-brand-pink"
          />
          <button
            type="submit"
            aria-label="Enviar"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-rose text-brand-white hover:brightness-110"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Botão flutuante */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Fechar conversa' : 'Abrir conversa com o salão'}
        className={`group fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center gap-3 pl-3.5 pr-3.5 sm:pr-5 py-3 rounded-full bg-gradient-rose text-brand-white shadow-glow-rose
          hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ease-out
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}
      >
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-white/15">
          {open ? <X className="w-5 h-5" /> : <CalendarCheck className="w-5 h-5" strokeWidth={2.1} />}
          {unread && !open && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-white opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-br from-brand-pinkLight to-brand-pink border border-brand-white/40" />
            </span>
          )}
        </span>
        <span className="font-semibold text-sm hidden sm:block tracking-wide-sm">{open ? 'Fechar' : 'Agendar horário'}</span>
      </button>
    </>
  );
};
