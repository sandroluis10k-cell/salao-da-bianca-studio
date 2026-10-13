/**
 * Agenda online da Bianca (banco de dados no Supabase).
 * A chave abaixo é pública (publishable): ela só permite chamar as funções
 * liberadas no banco. Dados dos clientes ficam protegidos.
 */
const SUPABASE_URL = 'https://edoqibwsfqngcfunuyil.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8EOJtgzKWimZPyInYKFnVw_TCtysXLv';

export const TZ = 'America/Sao_Paulo';
/** Brasil sem horário de verão: Brasília = UTC-3 */
const OFFSET = '-03:00';
const SLOT_STEP_MIN = 30;
const MIN_ADVANCE_MIN = 60;

async function call<T>(path: string, body?: unknown, method = 'POST'): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.message || data.hint)) || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
const rpc = <T,>(fn: string, args: Record<string, unknown> = {}) => call<T>(`rpc/${fn}`, args);

/* ---------- tipos ---------- */
export interface ServiceRow { name: string; duration_min: number; price: number }
export interface HoursRow { weekday: number; open_time: string; close_time: string; active: boolean }
export interface Busy { start_at: string; end_at: string }
export interface Appointment {
  id: string;
  service: string;
  duration_min: number;
  start_at: string;
  end_at: string;
  client_name: string;
  client_phone: string;
  status: 'confirmado' | 'cancelado' | 'concluido';
  created_at: string;
  /** valor cobrado pelo atendimento */
  price: number | null;
  /** 'site' = agendado pelo site; 'manual' = lançado pela Bianca */
  source: 'site' | 'manual';
}
export interface Block { id: string; start_at: string; end_at: string; reason: string | null }

/* ---------- datas (sempre no horário de Brasília) ---------- */
/** "2026-10-15" do dia de hoje em Brasília */
export const todayKey = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export const addDays = (key: string, n: number) => {
  const d = new Date(`${key}T12:00:00${OFFSET}`);
  d.setUTCDate(d.getUTCDate() + n);
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
};
export const weekdayOf = (key: string) => new Date(`${key}T12:00:00${OFFSET}`).getUTCDay();
export const toDate = (key: string, hhmm: string) => new Date(`${key}T${hhmm.slice(0, 5)}:00${OFFSET}`);

export const fmtDayLong = (key: string) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, weekday: 'long', day: '2-digit', month: '2-digit' }).format(toDate(key, '12:00'));
export const fmtDayShort = (key: string) => {
  const t = todayKey();
  if (key === t) return 'Hoje';
  if (key === addDays(t, 1)) return 'Amanhã';
  const s = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, weekday: 'short', day: '2-digit', month: '2-digit' })
    .format(toDate(key, '12:00'))
    .replace('.', '');
  return s.charAt(0).toUpperCase() + s.slice(1);
};
export const fmtTime = (d: Date | string) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(d));
export const dayKeyOf = (d: Date | string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(d));

/* ---------- público ---------- */
export const getServices = () =>
  call<ServiceRow[]>('services?select=name,duration_min,price&order=sort', undefined, 'GET');
export const getHours = () =>
  call<HoursRow[]>('opening_hours?select=*&order=weekday', undefined, 'GET');
export const getBusy = (from: Date, to: Date) =>
  rpc<Busy[]>('get_busy', { p_from: from.toISOString(), p_to: to.toISOString() });

/** Horários livres de um dia para um serviço com a duração informada */
export function freeSlots(dayKey: string, durationMin: number, hours: HoursRow[], busy: Busy[]): Date[] {
  const h = hours.find((x) => x.weekday === weekdayOf(dayKey) && x.active);
  if (!h) return [];
  const open = toDate(dayKey, h.open_time).getTime();
  const close = toDate(dayKey, h.close_time).getTime();
  const minStart = Date.now() + MIN_ADVANCE_MIN * 60_000;
  const dur = durationMin * 60_000;
  const ranges = busy.map((b) => [new Date(b.start_at).getTime(), new Date(b.end_at).getTime()]);
  const out: Date[] = [];
  for (let t = open; t + dur <= close; t += SLOT_STEP_MIN * 60_000) {
    if (t < minStart) continue;
    if (ranges.some(([s, e]) => t < e && t + dur > s)) continue;
    out.push(new Date(t));
  }
  return out;
}

const ERRORS: Record<string, string> = {
  HORARIO_OCUPADO: 'Esse horário acabou de ser reservado por outra pessoa 😕',
  FORA_DO_HORARIO: 'Esse horário está fora do atendimento.',
  DATA_INVALIDA: 'Essa data não está disponível para agendamento.',
  NOME_INVALIDO: 'Confira o seu nome.',
  TELEFONE_INVALIDO: 'Confira o número de WhatsApp (com DDD).',
  LIMITE_AGENDAMENTOS: 'Você já tem 3 horários marcados. Para mais, fale com a Bianca no WhatsApp.',
  SERVICO_INVALIDO: 'Serviço indisponível no momento.',
};
export const friendlyError = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  const key = Object.keys(ERRORS).find((k) => m.includes(k));
  return key ? ERRORS[key] : 'Não consegui concluir agora. Tente de novo ou fale com a Bianca no WhatsApp.';
};

export const book = (service: string, start: Date, name: string, phone: string) =>
  rpc<{ id: string; start_at: string; end_at: string }[]>('book_appointment', {
    p_service: service,
    p_start: start.toISOString(),
    p_name: name,
    p_phone: phone,
  }).then((r) => r[0]);

/** Link para o cliente salvar o horário no Google Agenda dele */
export const googleCalendarLink = (title: string, start: Date, end: Date, details: string, location: string) => {
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const p = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${f(start)}/${f(end)}`, details, location });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
};

/* ---------- área da Bianca ---------- */
export const admin = {
  status: () => rpc<string>('admin_status'),
  setup: (pin: string) => rpc<string>('admin_setup', { p_pin: pin }),
  login: (pin: string) => rpc<string>('admin_login', { p_pin: pin }),
  changePin: (pin: string, next: string) => rpc<string>('admin_change_pin', { p_pin: pin, p_new: next }),
  list: (pin: string, from: Date, to: Date) =>
    rpc<Appointment[]>('admin_list', { p_pin: pin, p_from: from.toISOString(), p_to: to.toISOString() }),
  setStatus: (pin: string, id: string, status: Appointment['status']) =>
    rpc<boolean>('admin_set_status', { p_pin: pin, p_id: id, p_status: status }),
  listBlocks: (pin: string, from: Date, to: Date) =>
    rpc<Block[]>('admin_list_blocks', { p_pin: pin, p_from: from.toISOString(), p_to: to.toISOString() }),
  addBlock: (pin: string, start: Date, end: Date, reason: string) =>
    rpc<boolean>('admin_add_block', { p_pin: pin, p_start: start.toISOString(), p_end: end.toISOString(), p_reason: reason }),
  removeBlock: (pin: string, id: string) => rpc<boolean>('admin_remove_block', { p_pin: pin, p_id: id }),
  setHours: (pin: string, weekday: number, open: string, close: string, active: boolean) =>
    rpc<boolean>('admin_set_hours', { p_pin: pin, p_weekday: weekday, p_open: open, p_close: close, p_active: active }),
  /** Lança atendimento feito por fora do site (ignora o horário de funcionamento) */
  createAppointment: (
    pin: string,
    a: { service: string; start: Date; durationMin: number; name: string; phone: string; price: number }
  ) =>
    rpc<'ok' | 'senha_incorreta' | 'duracao_invalida' | 'nome_invalido' | 'horario_ocupado'>('admin_create_appointment', {
      p_pin: pin,
      p_service: a.service,
      p_start: a.start.toISOString(),
      p_duration_min: a.durationMin,
      p_name: a.name,
      p_phone: a.phone,
      p_price: a.price,
    }),
  setPrice: (pin: string, id: string, price: number) => rpc<boolean>('admin_set_price', { p_pin: pin, p_id: id, p_price: price }),
};
