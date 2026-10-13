import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { MessageCircle, X, Send, MapPin, ExternalLink } from 'lucide-react';
import {
  salonConfig,
  formatCurrency,
  formatAddress,
  getGoogleMapsUrl,
  getWhatsAppUrl,
  type Service,
} from '../salonConfig';

/**
 * Assistente de atendimento do site.
 * Responde serviços, preços, endereço e horários e leva o cliente
 * para o WhatsApp da Bianca com a mensagem já escrita.
 */

type Action = { label: string; run: () => void };
type Msg =
  | { id: number; from: 'bot' | 'user'; content: ReactNode }
  | { id: number; from: 'actions'; actions: Action[] }
  | { id: number; from: 'whatsapp'; label: string; message: string };
type NewMsg = Msg extends infer M ? (M extends Msg ? Omit<M, 'id'> : never) : never;

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const waLink = (message: string) =>
  getWhatsAppUrl(salonConfig.whatsappNumber, encodeURIComponent(message));

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
  const started = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const push = (m: NewMsg) =>
    setMessages((prev) => [...prev, { ...m, id: nextId++ } as Msg]);

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
  const after = (fn: () => void) => {
    queue.current = queue.current.then(() => fn());
  };
  const actions = (list: Action[]) => after(() => push({ from: 'actions', actions: list }));
  const whatsapp = (message: string, label = 'Agendar pelo WhatsApp') =>
    after(() => push({ from: 'whatsapp', label, message }));

  const clearActions = () => setMessages((prev) => prev.filter((m) => m.from !== 'actions'));

  const user = (content: string) => {
    clearActions();
    push({ from: 'user', content });
  };

  /* ---------- fluxos ---------- */
  const menu = () =>
    actions([
      { label: '💇‍♀️ Serviços e preços', run: () => (user('Serviços e preços'), prices()) },
      { label: '📅 Agendar horário', run: () => (user('Agendar horário'), chooseService()) },
      { label: '📍 Endereço', run: () => (user('Endereço'), address()) },
      { label: '🕒 Horários', run: () => (user('Horários'), hours()) },
      { label: '💬 Falar com a Bianca', run: () => (user('Falar com a Bianca'), talk()) },
    ]);

  const backToMenu: Action = {
    label: 'Menu',
    run: () => {
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
      ...salonConfig.services.map((s) => ({
        label: s.name,
        run: () => (user(s.name), service(s)),
      })),
      backToMenu,
    ]);

  const chooseService = () => {
    bot('Perfeito! Qual serviço você quer fazer?');
    serviceButtons();
  };

  const service = (s: Service) => {
    bot(
      <div>
        <p>
          <strong>{s.name}</strong> — <span className="text-brand-pinkLight font-semibold">{formatCurrency(s.price)}</span>
        </p>
        <p className="mt-2 text-brand-white/70 text-[13px]">
          O valor pode variar conforme o comprimento e o volume do cabelo. A Bianca confirma tudo com você no WhatsApp.
        </p>
      </div>
    );
    whatsapp(
      `Olá, Bianca! Tudo bem? Vi o site e gostaria de agendar: ${s.name} (${formatCurrency(s.price)}). Quais horários você tem disponíveis? 😊`
    );
    actions([
      { label: 'Ver outros serviços', run: () => (user('Ver outros serviços'), prices()) },
      backToMenu,
    ]);
  };

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

  const hours = () => {
    const list = salonConfig.openingHours;
    if (list.length) {
      bot(
        <div>
          <p className="mb-1.5">🕒 Horário de atendimento:</p>
          <ul className="space-y-1">
            {list.map((h) => (
              <li key={h.day} className="flex justify-between gap-3">
                <span>{h.day}</span>
                <span className="text-brand-white/80">{h.time}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-brand-white/70 text-[13px]">Atendimento com horário marcado.</p>
        </div>
      );
    } else {
      bot('O atendimento é com horário marcado 😊 Chama a Bianca no WhatsApp que ela te passa os horários livres.');
    }
    whatsapp('Olá, Bianca! Vi o site. Quais horários você tem disponíveis?', 'Ver horários no WhatsApp');
    actions([{ label: 'Serviços e preços', run: () => (user('Serviços e preços'), prices()) }, backToMenu]);
  };

  const talk = () => {
    bot('Claro! Toque no botão para falar direto com a Bianca:');
    whatsapp('Olá, Bianca! Vi o site e tenho uma dúvida.', 'Abrir WhatsApp');
    actions([backToMenu]);
  };

  const answer = (raw: string) => {
    const t = normalize(raw);
    const findService = (name: string) => salonConfig.services.find((s) => s.name === name);

    if (/progressiva/.test(t) && !/(sem|com) formol/.test(t)) {
      bot(`Temos dois tipos de progressiva, as duas por ${formatCurrency(100)}. Qual você prefere?`);
      actions(
        salonConfig.services
          .filter((s) => /progressiva/i.test(s.name))
          .map((s) => ({ label: s.name, run: () => (user(s.name), service(s)) }))
      );
      return;
    }
    const hit = SERVICE_KEYWORDS.find((k) => k.match.test(t));
    const found = hit && findService(hit.name);
    if (found) return service(found);

    if (/(preco|valor|quanto|custa|tabela|servico)/.test(t)) return prices();
    if (/(agend|marcar|vaga|reserv)/.test(t)) return chooseService();
    if (/(onde|endereco|local|fica|mapa|chegar)/.test(t)) return address();
    if (/(hora|abre|fecha|funciona|aberto|domingo|sabado|segunda)/.test(t)) return hours();
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
  const toggle = () => {
    setOpen((o) => !o);
    setUnread(false);
    if (!started.current) {
      started.current = true;
      bot(
        <span>
          Oi! 👋 Bem-vinda ao <strong>{salonConfig.name}</strong>.
        </span>,
        350
      );
      bot('Posso te mostrar os serviços e preços, o endereço ou já te levar para agendar com a Bianca. O que você prefere?');
      menu();
    }
    window.setTimeout(() => inputRef.current?.focus(), 80);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    setText('');
    user(v);
    answer(v);
  };

  return (
    <>
      {/* Janela do chat */}
      <div
        role="dialog"
        aria-label="Assistente da Bianca"
        aria-hidden={!open}
        className={`fixed z-50 right-3 sm:right-7 bottom-[88px] sm:bottom-[104px] w-[calc(100vw-24px)] sm:w-[380px] h-[min(560px,calc(100dvh-120px))]
          flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-brand-blackSecondary shadow-glow-rose
          transition-all duration-300 ease-out origin-bottom-right
          ${open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}
      >
        <div className="flex items-center gap-3 bg-gradient-rose px-4 py-3.5">
          <img src={salonConfig.logoPath} alt="" className="h-10 w-10 rounded-full object-cover border-2 border-brand-white/40" />
          <div className="min-w-0">
            <p className="font-semibold text-brand-white leading-tight">Assistente da Bianca</p>
            <p className="text-xs text-brand-white/80">Responde na hora</p>
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
            if (m.from === 'whatsapp')
              return (
                <a
                  key={m.id}
                  href={waLink(m.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                >
                  <MessageCircle className="w-4 h-4" />
                  {m.label}
                </a>
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
            placeholder="Digite sua dúvida..."
            aria-label="Mensagem"
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
          {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" strokeWidth={2.1} />}
          {unread && !open && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-white opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-gradient-to-br from-brand-pinkLight to-brand-pink border border-brand-white/40" />
            </span>
          )}
        </span>
        <span className="font-semibold text-sm hidden sm:block tracking-wide-sm">
          {open ? 'Fechar' : 'Tire suas dúvidas'}
        </span>
      </button>
    </>
  );
};
