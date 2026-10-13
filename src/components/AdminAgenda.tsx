import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { CalendarDays, Lock, LogOut, MessageCircle, Check, X, RefreshCw, Ban, Clock, KeyRound, Trash2 } from 'lucide-react';
import { salonConfig, getWhatsAppUrl } from '../salonConfig';
import {
  admin,
  addDays,
  dayKeyOf,
  fmtDayLong,
  fmtTime,
  getHours,
  todayKey,
  toDate,
  type Appointment,
  type Block,
  type HoursRow,
} from '../agendaApi';

/** Página da Bianca: /agenda */

const PIN_KEY = 'bianca-agenda-pin';
const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const readPin = () => {
  try {
    return sessionStorage.getItem(PIN_KEY) || '';
  } catch {
    return '';
  }
};
const savePin = (v: string) => {
  try {
    if (v) sessionStorage.setItem(PIN_KEY, v);
    else sessionStorage.removeItem(PIN_KEY);
  } catch {
    /* sem armazenamento: só pede a senha de novo */
  }
};
const fmtPhone = (d: string) => (d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d);
const waClient = (phone: string, msg: string) =>
  getWhatsAppUrl(`55${phone.replace(/^55/, '')}`, encodeURIComponent(msg));

const card = 'rounded-2xl border border-white/10 bg-brand-blackSecondary';
const input =
  'w-full rounded-xl border border-white/10 bg-brand-black px-3.5 py-2.5 text-brand-white placeholder:text-brand-white/35 outline-none focus:border-brand-pink';

/* ================= Login ================= */
const Login = ({ onReady }: { onReady: (pin: string) => void }) => {
  const [mode, setMode] = useState<'loading' | 'setup' | 'login'>('loading');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    admin
      .status()
      .then((s) => setMode(s === 'pronto' ? 'login' : 'setup'))
      .catch(() => setErr('Sem conexão com a agenda. Verifique a internet.'));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      if (mode === 'setup') {
        if (pin.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        if (pin !== pin2) throw new Error('As senhas não são iguais.');
        const r = await admin.setup(pin);
        if (r !== 'ok') throw new Error('A senha já foi criada. Entre com ela.');
        onReady(pin);
      } else {
        const r = await admin.login(pin);
        if (r === 'ok') onReady(pin);
        else if (r === 'bloqueado') throw new Error('Muitas tentativas erradas. Espere 15 minutos.');
        else throw new Error('Senha incorreta.');
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro ao entrar.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <form onSubmit={submit} className={`${card} w-full max-w-sm p-7`}>
        <div className="flex flex-col items-center text-center">
          <img src={salonConfig.logoPath} alt="" className="h-16 w-16 rounded-2xl object-cover" />
          <h1 className="mt-4 font-display text-2xl text-brand-white">Agenda da Bianca</h1>
          <p className="mt-1 text-sm text-brand-white/60">
            {mode === 'setup' ? 'Primeiro acesso: crie a sua senha.' : 'Digite sua senha para ver os agendamentos.'}
          </p>
        </div>
        <div className="mt-6 space-y-3">
          <input
            type="password"
            className={input}
            placeholder={mode === 'setup' ? 'Nova senha (mín. 6 caracteres)' : 'Senha'}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
            autoFocus
          />
          {mode === 'setup' && (
            <input
              type="password"
              className={input}
              placeholder="Repita a senha"
              value={pin2}
              onChange={(e) => setPin2(e.target.value)}
              autoComplete="new-password"
            />
          )}
          {err && <p className="text-sm text-red-300">{err}</p>}
          <button disabled={busy || mode === 'loading'} className="btn-primary w-full disabled:opacity-60">
            <Lock className="w-4 h-4" /> {mode === 'setup' ? 'Criar senha e entrar' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= Painel ================= */
type Tab = 'agenda' | 'bloquear' | 'horarios';

export const AdminAgenda = () => {
  const [pin, setPin] = useState(readPin);
  const [tab, setTab] = useState<Tab>('agenda');
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    document.title = 'Agenda — Bianca Alves';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
  }, []);

  const logout = () => {
    savePin('');
    setPin('');
  };

  const load = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    try {
      const from = toDate(addDays(todayKey(), -1), '00:00');
      const to = toDate(addDays(todayKey(), 60), '00:00');
      const ok = await admin.login(pin);
      if (ok !== 'ok') return logout();
      const [a, b] = await Promise.all([admin.list(pin, from, to), admin.listBlocks(pin, from, to)]);
      setAppts(a);
      setBlocks(b);
      setLastUpdate(new Date());
    } catch {
      /* mantém a última lista */
    } finally {
      setLoading(false);
    }
  }, [pin]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 60_000);
    return () => window.clearInterval(t);
  }, [load]);

  const grouped = useMemo(() => {
    const list = appts.filter((a) => showCancelled || a.status !== 'cancelado');
    const map = new Map<string, Appointment[]>();
    list.forEach((a) => {
      const k = dayKeyOf(a.start_at);
      map.set(k, [...(map.get(k) || []), a]);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [appts, showCancelled]);

  if (!pin) {
    return (
      <Login
        onReady={(p) => {
          savePin(p);
          setPin(p);
        }}
      />
    );
  }

  const setStatus = async (a: Appointment, status: Appointment['status']) => {
    if (status === 'cancelado' && !window.confirm(`Cancelar o horário de ${a.client_name}? O horário volta a ficar livre no site.`)) return;
    await admin.setStatus(pin, a.id, status);
    load();
  };

  const upcoming = appts.filter((a) => a.status === 'confirmado' && new Date(a.end_at) > new Date());
  const today = todayKey();
  const countToday = upcoming.filter((a) => dayKeyOf(a.start_at) === today).length;

  return (
    <div className="min-h-screen bg-brand-black text-brand-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-brand-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <img src={salonConfig.logoPath} alt="" className="h-9 w-9 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight">Agenda da Bianca</p>
            <p className="text-xs text-brand-white/55">
              {countToday} hoje · {upcoming.length} próximos
              {lastUpdate && ` · atualizado ${fmtTime(lastUpdate)}`}
            </p>
          </div>
          <button onClick={load} className="ml-auto rounded-full p-2 hover:bg-white/10" aria-label="Atualizar">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={logout} className="rounded-full p-2 hover:bg-white/10" aria-label="Sair">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-4 pb-2">
          {(
            [
              ['agenda', 'Agendamentos', CalendarDays],
              ['bloquear', 'Bloquear horário', Ban],
              ['horarios', 'Horários', Clock],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm ${
                tab === k ? 'bg-gradient-rose text-brand-white' : 'text-brand-white/70 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        {tab === 'agenda' && (
          <>
            <label className="mb-4 flex items-center gap-2 text-sm text-brand-white/60">
              <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
              Mostrar cancelados
            </label>
            {grouped.length === 0 && (
              <div className={`${card} p-8 text-center text-brand-white/60`}>
                Nenhum agendamento ainda. Quando alguém marcar pelo site, aparece aqui. 💖
              </div>
            )}
            <div className="space-y-6">
              {grouped.map(([day, list]) => (
                <section key={day}>
                  <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide-sm text-brand-pinkLight">
                    {day === today ? 'Hoje · ' : day === addDays(today, 1) ? 'Amanhã · ' : ''}
                    {fmtDayLong(day)}
                  </h2>
                  <div className="space-y-2.5">
                    {list.map((a) => {
                      const isNew = Date.now() - new Date(a.created_at).getTime() < 24 * 3600_000;
                      const when = `${fmtDayLong(day)} às ${fmtTime(a.start_at)}`;
                      return (
                        <div
                          key={a.id}
                          className={`${card} p-4 ${a.status === 'cancelado' ? 'opacity-50' : ''} ${
                            a.status === 'concluido' ? 'opacity-70' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 shrink-0 text-center">
                              <p className="font-display text-xl leading-none">{fmtTime(a.start_at)}</p>
                              <p className="mt-1 text-xs text-brand-white/50">até {fmtTime(a.end_at)}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">
                                {a.client_name}
                                {isNew && a.status === 'confirmado' && (
                                  <span className="ml-2 rounded-full bg-brand-pink/20 px-2 py-0.5 text-[11px] text-brand-pinkLight">novo</span>
                                )}
                                {a.status !== 'confirmado' && (
                                  <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[11px]">{a.status}</span>
                                )}
                              </p>
                              <p className="text-sm text-brand-white/70">{a.service}</p>
                              <p className="text-sm text-brand-white/50">{fmtPhone(a.client_phone)}</p>
                            </div>
                          </div>
                          {a.status === 'confirmado' && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                href={waClient(
                                  a.client_phone,
                                  `Oi, ${a.client_name.split(' ')[0]}! Aqui é a Bianca. Confirmando seu horário de ${a.service} na ${when}. Te espero!`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-sm font-semibold text-white"
                              >
                                <MessageCircle className="w-4 h-4" /> WhatsApp
                              </a>
                              <button
                                onClick={() => setStatus(a, 'concluido')}
                                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-sm hover:bg-white/5"
                              >
                                <Check className="w-4 h-4" /> Concluído
                              </button>
                              <button
                                onClick={() => setStatus(a, 'cancelado')}
                                className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 px-3 py-1.5 text-sm text-red-300 hover:bg-red-400/10"
                              >
                                <X className="w-4 h-4" /> Cancelar
                              </button>
                            </div>
                          )}
                          {a.status === 'cancelado' && (
                            <button
                              onClick={() => setStatus(a, 'confirmado')}
                              className="mt-3 text-sm text-brand-pinkLight underline"
                            >
                              Reativar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}

        {tab === 'bloquear' && <BlockTab pin={pin} blocks={blocks} reload={load} />}
        {tab === 'horarios' && <HoursTab pin={pin} />}
      </main>
    </div>
  );
};

/* ================= Bloquear horários ================= */
const BlockTab = ({ pin, blocks, reload }: { pin: string; blocks: Block[]; reload: () => void }) => {
  const [day, setDay] = useState(todayKey());
  const [allDay, setAllDay] = useState(true);
  const [from, setFrom] = useState('18:00');
  const [to, setTo] = useState('22:00');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const start = toDate(day, allDay ? '00:00' : from);
    const end = allDay ? toDate(addDays(day, 1), '00:00') : toDate(day, to);
    if (end <= start) return setMsg('O horário final precisa ser depois do inicial.');
    await admin.addBlock(pin, start, end, reason || (allDay ? 'Dia bloqueado' : 'Horário bloqueado'));
    setMsg('Bloqueado! Esse horário não aparece mais no site.');
    setReason('');
    reload();
  };

  const remove = async (b: Block) => {
    await admin.removeBlock(pin, b.id);
    reload();
  };

  return (
    <div className="space-y-5">
      <form onSubmit={save} className={`${card} space-y-3 p-5`}>
        <p className="text-sm text-brand-white/60">Use para folgas, compromissos ou horários que você não quer liberar no site.</p>
        <input type="date" className={input} value={day} min={todayKey()} onChange={(e) => setDay(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} /> Dia inteiro
        </label>
        {!allDay && (
          <div className="flex gap-2">
            <input type="time" className={input} value={from} onChange={(e) => setFrom(e.target.value)} />
            <input type="time" className={input} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}
        <input className={input} placeholder="Motivo (opcional, só você vê)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button className="btn-primary w-full">
          <Ban className="w-4 h-4" /> Bloquear
        </button>
        {msg && <p className="text-sm text-brand-pinkLight">{msg}</p>}
      </form>

      <div className="space-y-2">
        {blocks.length === 0 && <p className="text-sm text-brand-white/50">Nenhum bloqueio.</p>}
        {blocks.map((b) => {
          const k = dayKeyOf(b.start_at);
          const full = fmtTime(b.start_at) === '00:00' && fmtTime(b.end_at) === '00:00';
          return (
            <div key={b.id} className={`${card} flex items-center gap-3 p-3.5`}>
              <Ban className="w-4 h-4 text-brand-pink" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">{fmtDayLong(k)}</p>
                <p className="text-brand-white/60">
                  {full ? 'Dia inteiro' : `${fmtTime(b.start_at)} às ${fmtTime(b.end_at)}`}
                  {b.reason ? ` · ${b.reason}` : ''}
                </p>
              </div>
              <button onClick={() => remove(b)} className="rounded-full p-2 hover:bg-white/10" aria-label="Remover bloqueio">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================= Horários de atendimento ================= */
const HoursTab = ({ pin }: { pin: string }) => {
  const [rows, setRows] = useState<HoursRow[]>([]);
  const [msg, setMsg] = useState('');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    getHours().then(setRows).catch(() => setMsg('Não consegui carregar os horários.'));
  }, []);

  const update = (i: number, patch: Partial<HoursRow>) =>
    setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const save = async () => {
    for (const r of rows) {
      if (r.close_time.slice(0, 5) <= r.open_time.slice(0, 5)) {
        setMsg(`${DAY_NAMES[r.weekday]}: o fechamento precisa ser depois da abertura.`);
        return;
      }
    }
    await Promise.all(rows.map((r) => admin.setHours(pin, r.weekday, r.open_time.slice(0, 5), r.close_time.slice(0, 5), r.active)));
    setMsg('Horários salvos! O site já mostra os novos horários.');
  };

  const changePin = async () => {
    const r = await admin.changePin(pin, newPin);
    if (r === 'ok') {
      savePin(newPin);
      setMsg('Senha alterada. Use a nova senha no próximo acesso.');
      setNewPin('');
      window.setTimeout(() => window.location.reload(), 1200);
    } else setMsg(r === 'senha_curta' ? 'A nova senha precisa ter 6 caracteres ou mais.' : 'Não foi possível trocar a senha.');
  };

  return (
    <div className="space-y-5">
      <div className={`${card} divide-y divide-white/5`}>
        {rows.map((r, i) => (
          <div key={r.weekday} className="flex flex-wrap items-center gap-3 p-3.5">
            <label className="flex w-32 items-center gap-2 text-sm">
              <input type="checkbox" checked={r.active} onChange={(e) => update(i, { active: e.target.checked })} />
              {DAY_NAMES[r.weekday]}
            </label>
            {r.active ? (
              <div className="flex items-center gap-2">
                <input type="time" className={`${input} w-28`} value={r.open_time.slice(0, 5)} onChange={(e) => update(i, { open_time: e.target.value })} />
                <span className="text-brand-white/50">às</span>
                <input type="time" className={`${input} w-28`} value={r.close_time.slice(0, 5)} onChange={(e) => update(i, { close_time: e.target.value })} />
              </div>
            ) : (
              <span className="text-sm text-brand-white/40">Fechado</span>
            )}
          </div>
        ))}
      </div>
      <button onClick={save} className="btn-primary w-full">
        <Clock className="w-4 h-4" /> Salvar horários
      </button>

      <div className={`${card} space-y-3 p-5`}>
        <p className="flex items-center gap-2 font-semibold">
          <KeyRound className="w-4 h-4 text-brand-pink" /> Trocar senha
        </p>
        <input type="password" className={input} placeholder="Nova senha" value={newPin} onChange={(e) => setNewPin(e.target.value)} autoComplete="new-password" />
        <button onClick={changePin} className="btn-secondary w-full">
          Trocar senha
        </button>
      </div>
      {msg && <p className="text-sm text-brand-pinkLight">{msg}</p>}
    </div>
  );
};
