import { getWhatsAppUrl } from '../../salonConfig';
import { TZ, addDays, dayKeyOf, fmtDayLong, fmtTime, todayKey, type Appointment, type ServiceRow } from '../../agendaApi';

/* ---------- senha (fica só nesta aba do navegador) ---------- */
const PIN_KEY = 'bianca-agenda-pin';
export const readPin = () => {
  try {
    return sessionStorage.getItem(PIN_KEY) || '';
  } catch {
    return '';
  }
};
export const savePin = (v: string) => {
  try {
    if (v) sessionStorage.setItem(PIN_KEY, v);
    else sessionStorage.removeItem(PIN_KEY);
  } catch {
    /* sem armazenamento: só pede a senha de novo */
  }
};

/* ---------- textos ---------- */
export const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
export const fmtPhone = (d: string) => {
  const x = d.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (x.length === 11) return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`;
  if (x.length === 10) return `(${x.slice(0, 2)}) ${x.slice(2, 6)}-${x.slice(6)}`;
  return d;
};
export const phoneKey = (d: string) => d.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
export const pct = (v: number) => `${(v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

/** Aceita "80", "80,5", "1.234,56" ou "80.5" */
export const parseMoney = (s: string): number | null => {
  const t = s.replace(/[R$\s]/g, '');
  if (!t) return null;
  const norm = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t;
  const n = Number(norm);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
};
export const moneyInput = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------- WhatsApp ---------- */
export const waClient = (phone: string, msg?: string) =>
  getWhatsAppUrl(`55${phoneKey(phone)}`, msg ? encodeURIComponent(msg) : '');

export const confirmMessage = (a: Appointment) => {
  const when = `${fmtDayLong(dayKeyOf(a.start_at))} às ${fmtTime(a.start_at)}`;
  return `Oi, ${firstName(a.client_name)}! Aqui é a Bianca. Confirmando seu horário de ${a.service} na ${when}. Te espero!`;
};

/* ---------- valores ---------- */
/** Valor do atendimento; agendamentos antigos sem valor usam o preço do serviço */
export const priceOf = (a: Appointment, services: ServiceRow[]) => {
  if (a.price !== null && a.price !== undefined && !Number.isNaN(Number(a.price))) return Number(a.price);
  return Number(services.find((s) => s.name === a.service)?.price ?? 0);
};

/* ---------- datas (horário de Brasília) ---------- */
export const monthStart = (key: string) => `${key.slice(0, 7)}-01`;
export const addMonths = (key: string, n: number) => {
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(5, 7)) - 1 + n;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  return `${yy}-${String(mm + 1).padStart(2, '0')}-01`;
};
export const daysBetween = (a: string, b: string) =>
  Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / 86_400_000);
export const dayRange = (from: string, toExcl: string) => {
  const out: string[] = [];
  for (let k = from; k < toExcl; k = addDays(k, 1)) out.push(k);
  return out;
};
const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, ...opts });
const at = (key: string) => new Date(`${key}T12:00:00-03:00`);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const fmtWeekdayShort = (key: string) => cap(fmt({ weekday: 'short' }).format(at(key)).replace('.', ''));
export const fmtDayNum = (key: string) => fmt({ day: 'numeric' }).format(at(key));
export const fmtMonthShort = (key: string) => cap(fmt({ month: 'short' }).format(at(key)).replace('.', ''));
export const fmtMonthLong = (key: string) => cap(fmt({ month: 'long', year: 'numeric' }).format(at(key)));
export const fmtDateFull = (key: string) => cap(fmt({ weekday: 'long', day: 'numeric', month: 'long' }).format(at(key)));
export const fmtDateShort = (key: string) => fmt({ day: '2-digit', month: '2-digit', year: '2-digit' }).format(at(key));
export const relativeDay = (key: string) => {
  const t = todayKey();
  if (key === t) return 'Hoje';
  if (key === addDays(t, 1)) return 'Amanhã';
  if (key === addDays(t, -1)) return 'Ontem';
  return fmtDateFull(key);
};
export const hourNow = () => Number(fmt({ hour: '2-digit', hour12: false }).format(new Date()));

export const fmtCountdown = (ms: number) => {
  if (ms <= 0) return 'agora';
  const min = Math.ceil(ms / 60_000);
  if (min < 60) return `em ${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h < 24) return `em ${h}h${m ? ` ${String(m).padStart(2, '0')}min` : ''}`;
  const d = Math.floor(h / 24);
  return `em ${d} dia${d > 1 ? 's' : ''}${h % 24 ? ` e ${h % 24}h` : ''}`;
};

/** Variação % (null quando não há base para comparar) */
export const delta = (cur: number, prev: number) => (prev > 0 ? (cur - prev) / prev : null);
