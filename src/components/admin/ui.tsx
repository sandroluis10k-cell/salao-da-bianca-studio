import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import { AlertTriangle, CheckCircle2, Loader2, TrendingDown, TrendingUp, X, type LucideIcon } from 'lucide-react';
import type { Appointment } from '../../agendaApi';
import { pct } from './utils';

/* ---------- classes base ---------- */
export const cardCls =
  'rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_12px_32px_-18px_rgba(0,0,0,0.8)]';
export const inputCls =
  'w-full min-w-0 rounded-xl border border-white/10 bg-brand-black/70 px-3.5 py-2.5 text-[15px] text-brand-white placeholder:text-white/30 outline-none transition focus:border-brand-pink/70 focus:ring-4 focus:ring-brand-pink/10 [color-scheme:dark]';
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black';

/* ---------- botões ---------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';
const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-brand-pink to-brand-roseGold text-white shadow-[0_8px_24px_-10px_rgba(232,138,162,0.7)] hover:brightness-110 active:brightness-95',
  secondary: 'border border-white/12 bg-white/[0.03] text-white/90 hover:bg-white/[0.07] hover:border-white/20',
  ghost: 'text-white/70 hover:bg-white/[0.06] hover:text-white',
  danger: 'border border-red-400/25 text-red-300 hover:bg-red-400/10',
  whatsapp: 'bg-[#25D366]/15 text-[#5BE38E] border border-[#25D366]/25 hover:bg-[#25D366]/25',
};
const sizes = { sm: 'h-9 px-3 text-[13px] gap-1.5', md: 'h-11 px-4 text-sm gap-2', icon: 'h-10 w-10 justify-center' };

export const Button = ({
  variant = 'secondary',
  size = 'md',
  loading,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: keyof typeof sizes; loading?: boolean }) => (
  <button
    {...rest}
    disabled={rest.disabled || loading}
    className={`inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

export const LinkButton = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  href,
  label,
}: {
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
  href: string;
  label?: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition ${focusRing} ${variants[variant]} ${sizes[size]} ${className}`}
  >
    {children}
  </a>
);

/* ---------- card / blocos ---------- */
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`${cardCls} ${className}`}>{children}</div>
);

export const SectionTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h2 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white/50">{children}</h2>
    {action}
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />
);

export const EmptyState = ({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text?: string;
  action?: ReactNode;
}) => (
  <div className={`${cardCls} flex flex-col items-center px-6 py-12 text-center`}>
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-brand-pink/20 blur-xl" />
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-pink/20 bg-brand-pink/10">
        <Icon className="h-6 w-6 text-brand-pinkLight" />
      </div>
    </div>
    <p className="mt-4 font-display text-xl text-white">{title}</p>
    {text && <p className="mt-1.5 max-w-sm text-sm text-white/55">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

/* ---------- badges ---------- */
const statusStyle: Record<Appointment['status'], [string, string]> = {
  confirmado: ['Confirmado', 'bg-brand-pink/12 text-brand-pinkLight border-brand-pink/25'],
  concluido: ['Concluído', 'bg-emerald-400/10 text-emerald-300 border-emerald-400/25'],
  cancelado: ['Cancelado', 'bg-white/[0.05] text-white/45 border-white/10 line-through'],
};
export const StatusBadge = ({ status }: { status: Appointment['status'] }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyle[status][1]}`}>
    {statusStyle[status][0]}
  </span>
);
export const Tag = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'pink' | 'violet' }) => (
  <span
    className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
      tone === 'pink' ? 'bg-brand-pink/10 text-brand-pinkLight' : tone === 'violet' ? 'bg-[#8B7CF6]/12 text-[#B8AEFA]' : 'bg-white/[0.06] text-white/60'
    }`}
  >
    {children}
  </span>
);

/* ---------- formulário ---------- */
export const Field = ({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-[13px] font-medium text-white/65">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-white/40">{hint}</span>}
  </label>
);
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${inputCls} ${p.className ?? ''}`} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...p} className={`${inputCls} appearance-none bg-[length:16px] pr-9 ${p.className ?? ''}`} style={{ backgroundImage: CHEVRON, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }} />
);
const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff80' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

export const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition ${focusRing} ${checked ? 'bg-gradient-to-r from-brand-pink to-brand-roseGold' : 'bg-white/15'}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
  </button>
);

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className = '',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={`no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 ${className}`}>
      <div className="inline-flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-medium transition ${focusRing} ${
              value === o.value ? 'bg-white/[0.09] text-white shadow-sm' : 'text-white/55 hover:text-white'
            }`}
          >
            {o.label}
            {o.count !== undefined && <span className="ml-1.5 text-white/40">{o.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- KPI ---------- */
export const Kpi = ({
  icon: Icon,
  label,
  value,
  change,
  hint,
  loading,
  invert,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: number | null;
  hint?: string;
  loading?: boolean;
  /** quando subir é ruim (ex.: cancelamentos) */
  invert?: boolean;
}) => {
  const good = change !== null && change !== undefined && (invert ? change < 0 : change > 0);
  const bad = change !== null && change !== undefined && (invert ? change > 0 : change < 0);
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[13px] text-white/55">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-pink/10">
          <Icon className="h-3.5 w-3.5 text-brand-pinkLight" />
        </span>
        <span className="truncate">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-8 w-28" />
      ) : (
        <p className="mt-3 truncate text-[22px] font-semibold tracking-tight text-white tabular-nums sm:text-[26px]">{value}</p>
      )}
      <div className="mt-1.5 flex min-h-[20px] flex-wrap items-center gap-x-1.5 text-xs">
        {change !== undefined && !loading && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold ${
              good ? 'bg-emerald-400/10 text-emerald-300' : bad ? 'bg-red-400/10 text-red-300' : 'bg-white/[0.06] text-white/50'
            }`}
          >
            {change === null ? (
              '—'
            ) : (
              <>
                {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change > 0 ? '+' : ''}
                {pct(change)}
              </>
            )}
          </span>
        )}
        {hint && <span className="text-white/40">{hint}</span>}
      </div>
    </Card>
  );
};

/* ---------- modal ---------- */
export const Modal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[admFade_.15s_ease-out]" onClick={onClose} />
      <div className="relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl border border-white/10 bg-[#101010] shadow-2xl animate-[admUp_.25s_cubic-bezier(.22,1,.36,1)] sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b border-white/[0.06] px-5 pb-4 pt-5">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar" className="-mr-2 -mt-1">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && (
          <div className="flex gap-2 border-t border-white/[0.06] px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] [&>*]:flex-1 sm:justify-end sm:[&>*]:flex-none">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- confirmação ---------- */
type ConfirmOpts = { title: string; text?: string; confirmLabel?: string; danger?: boolean };
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

/* ---------- toasts ---------- */
type Toast = { id: number; kind: 'success' | 'error' | 'warning'; text: string };
const ToastCtx = createContext<{ success: (t: string) => void; error: (t: string) => void; warning: (t: string) => void }>({
  success: () => {},
  error: () => {},
  warning: () => {},
});
export const useToast = () => useContext(ToastCtx);

export const AdminProviders = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  const [toastApi] = useState(() => ({
    success: (t: string) => push('success', t),
    error: (t: string) => push('error', t),
    warning: (t: string) => push('warning', t),
  }));

  const [confirm, setConfirm] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const ask = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setConfirm({ ...o, resolve })), []);
  const close = (v: boolean) => {
    confirm?.resolve(v);
    setConfirm(null);
  };

  return (
    <ToastCtx.Provider value={toastApi}>
      <ConfirmCtx.Provider value={ask}>
        {children}
        <Modal
          open={!!confirm}
          onClose={() => close(false)}
          title={confirm?.title ?? ''}
          footer={
            <>
              <Button variant="secondary" onClick={() => close(false)}>
                Voltar
              </Button>
              <Button variant={confirm?.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
                {confirm?.confirmLabel ?? 'Confirmar'}
              </Button>
            </>
          }
        >
          <div className="flex gap-3">
            {confirm?.danger && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-400/10">
                <AlertTriangle className="h-5 w-5 text-red-300" />
              </span>
            )}
            <p className="text-[15px] leading-relaxed text-white/70">{confirm?.text}</p>
          </div>
        </Modal>
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:top-auto lg:items-end">
          {toasts.map((t) => (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md animate-[admDown_.25s_ease-out] ${
                t.kind === 'success'
                  ? 'border-emerald-400/20 bg-[#0f1a14]/95 text-emerald-100'
                  : t.kind === 'warning'
                    ? 'border-amber-400/25 bg-[#1c170d]/95 text-amber-100'
                    : 'border-red-400/25 bg-[#1c1012]/95 text-red-100'
              }`}
            >
              {t.kind === 'success' ? (
                <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-emerald-300" />
              ) : (
                <AlertTriangle className={`mt-px h-4 w-4 shrink-0 ${t.kind === 'warning' ? 'text-amber-300' : 'text-red-300'}`} />
              )}
              <span className="min-w-0 flex-1">{t.text}</span>
            </div>
          ))}
        </div>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
};
