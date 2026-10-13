import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Ban,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Home as HomeIcon,
  LogOut,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Settings as SettingsIcon,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { salonConfig } from '../salonConfig';
import { admin, addDays, fmtTime, getServices, todayKey, toDate, type Appointment, type Block, type ServiceRow } from '../agendaApi';
import { AdminCtx, type AdminData, type Page } from './admin/context';
import { AdminProviders, Button, Modal } from './admin/ui';
import { Login } from './admin/Login';
import { NewAppointmentModal } from './admin/NewAppointmentModal';
import { Home } from './admin/pages/Home';
import { Agenda } from './admin/pages/Agenda';
import { Finance } from './admin/pages/Finance';
import { Clients } from './admin/pages/Clients';
import { Blocks } from './admin/pages/Blocks';
import { Settings } from './admin/pages/Settings';
import { addMonths, monthStart, priceOf, readPin, savePin } from './admin/utils';

/** Página da Bianca: /agenda */

const PAGES: { id: Page; label: string; icon: LucideIcon; title: string; subtitle: string }[] = [
  { id: 'inicio', label: 'Início', icon: HomeIcon, title: 'Início', subtitle: 'Resumo do seu dia e do mês' },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays, title: 'Agenda', subtitle: 'Seus atendimentos dia a dia' },
  { id: 'faturamento', label: 'Faturamento', icon: CircleDollarSign, title: 'Faturamento', subtitle: 'Quanto entrou e quanto está previsto' },
  { id: 'clientes', label: 'Clientes', icon: Users, title: 'Clientes', subtitle: 'Histórico de visitas e gastos' },
  { id: 'bloqueios', label: 'Bloqueios', icon: Ban, title: 'Bloqueios', subtitle: 'Folgas e horários fechados no site' },
  { id: 'config', label: 'Configurações', icon: SettingsIcon, title: 'Configurações', subtitle: 'Horários de atendimento e senha' },
];
const MOBILE_MAIN: Page[] = ['inicio', 'agenda', 'faturamento', 'clientes'];
/** histórico carregado no painel (clientes, KPIs do mês anterior) */
const HISTORY_MONTHS = 24;
const FUTURE_DAYS = 120;

const pageFromHash = (): Page => {
  const h = window.location.hash.replace('#', '') as Page;
  return PAGES.some((p) => p.id === h) ? h : 'inicio';
};

const ADMIN_CSS = `
@keyframes admFade{from{opacity:0}to{opacity:1}}
@keyframes admUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
@keyframes admDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}
.no-scrollbar{scrollbar-width:none}.no-scrollbar::-webkit-scrollbar{display:none}
`;

export const AdminAgenda = () => {
  const [pin, setPin] = useState(readPin);

  useEffect(() => {
    document.title = 'Agenda — Bianca Alves';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
  }, []);

  return (
    <AdminProviders>
      <style>{ADMIN_CSS}</style>
      {pin ? (
        <Dashboard
          pin={pin}
          onLogout={() => {
            savePin('');
            setPin('');
          }}
        />
      ) : (
        <Login
          onReady={(p) => {
            savePin(p);
            setPin(p);
          }}
        />
      )}
    </AdminProviders>
  );
};

/* ================= Painel ================= */
const Dashboard = ({ pin, onLogout }: { pin: string; onLogout: () => void }) => {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [agendaDay, setAgendaDay] = useState(todayKey);
  const [appts, setAppts] = useState<Appointment[] | null>(null);
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newOpen, setNewOpen] = useState<{ day?: string } | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    getServices()
      .then(setServices)
      .catch(() => {
        /* o modal deixa digitar o serviço */
      });
  }, []);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const t = todayKey();
      const from = toDate(addMonths(monthStart(t), -HISTORY_MONTHS), '00:00');
      const to = toDate(addDays(t, FUTURE_DAYS), '00:00');
      const ok = await admin.login(pin);
      if (ok !== 'ok') return onLogout();
      const [a, b] = await Promise.all([admin.list(pin, from, to), admin.listBlocks(pin, toDate(addDays(t, -1), '00:00'), to)]);
      setAppts(a);
      setBlocks(b);
      setLastUpdate(new Date());
    } catch {
      /* mantém a última lista */
      setAppts((x) => x ?? []);
      setBlocks((x) => x ?? []);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [pin, onLogout]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 60_000);
    return () => window.clearInterval(t);
  }, [load]);

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((p: Page, day?: string) => {
    if (day) setAgendaDay(day);
    setPage(p);
    setMoreOpen(false);
    if (window.location.hash !== `#${p}`) window.history.replaceState(null, '', `#${p}`);
    window.scrollTo({ top: 0 });
  }, []);

  const price = useCallback((a: Appointment) => priceOf(a, services), [services]);

  const ctx: AdminData = useMemo(
    () => ({
      pin,
      appts,
      blocks,
      services,
      loading,
      lastUpdate,
      reload: load,
      openNew: (day?: string) => setNewOpen({ day }),
      go,
      price,
      logout: onLogout,
    }),
    [pin, appts, blocks, services, loading, lastUpdate, load, go, price, onLogout]
  );

  const meta = PAGES.find((p) => p.id === page)!;

  return (
    <AdminCtx.Provider value={ctx}>
      <div className="min-h-[100dvh] overflow-x-hidden bg-brand-black font-sans text-white antialiased">
        <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(232,138,162,0.08),transparent)]" />

        {/* ---------- menu lateral (computador) ---------- */}
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl lg:flex">
          <div className="flex items-center gap-3 px-5 pb-6 pt-6">
            <img src={salonConfig.logoPath} alt="" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
            <div className="min-w-0">
              <p className="font-display text-lg leading-tight text-white">Bianca Alves</p>
              <p className="text-xs text-white/40">Painel do salão</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3">
            {PAGES.map((p) => {
              const active = p.id === page;
              return (
                <button
                  key={p.id}
                  onClick={() => go(p.id)}
                  className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/60 ${
                    active ? 'bg-white/[0.07] text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-brand-pink to-brand-roseGold" />}
                  <p.icon className={`h-[18px] w-[18px] ${active ? 'text-brand-pink' : ''}`} />
                  {p.label}
                </button>
              );
            })}
          </nav>
          <div className="border-t border-white/[0.06] p-3">
            {lastUpdate && <p className="px-3 pb-2 text-[11px] text-white/30">Atualizado às {fmtTime(lastUpdate)}</p>}
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/55 transition hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px]" /> Sair
            </button>
          </div>
        </aside>

        {/* ---------- conteúdo ---------- */}
        <div className="relative lg:pl-64">
          <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-brand-black/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-10 lg:py-5">
              <img src={salonConfig.logoPath} alt="" className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-white/10 lg:hidden" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-display text-xl leading-tight text-white lg:text-[26px]">{meta.title}</h1>
                <p className="hidden truncate text-sm text-white/45 sm:block">{meta.subtitle}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => load()} aria-label="Atualizar" title={lastUpdate ? `Atualizado às ${fmtTime(lastUpdate)}` : 'Atualizar'}>
                <RefreshCw className={`h-[18px] w-[18px] ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="primary" onClick={() => setNewOpen({ day: page === 'agenda' ? agendaDay : undefined })} className="px-3 sm:px-4">
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">Novo</span>
                <span className="hidden sm:inline">Novo atendimento</span>
              </Button>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:px-10 lg:pb-16 lg:pt-8">
            {page === 'inicio' && <Home />}
            {page === 'agenda' && <Agenda day={agendaDay} setDay={setAgendaDay} />}
            {page === 'faturamento' && <Finance />}
            {page === 'clientes' && <Clients />}
            {page === 'bloqueios' && <Blocks />}
            {page === 'config' && <Settings />}
          </main>
        </div>

        {/* ---------- barra inferior (celular) ---------- */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-[#0b0b0b]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-5">
            {MOBILE_MAIN.map((id) => {
              const p = PAGES.find((x) => x.id === id)!;
              return <TabButton key={id} icon={p.icon} label={p.label} active={page === id} onClick={() => go(id)} />;
            })}
            <TabButton icon={MoreHorizontal} label="Mais" active={page === 'bloqueios' || page === 'config' || moreOpen} onClick={() => setMoreOpen(true)} />
          </div>
        </nav>

        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="Mais opções">
          <div className="space-y-2">
            {PAGES.filter((p) => !MOBILE_MAIN.includes(p.id)).map((p) => (
              <button
                key={p.id}
                onClick={() => go(p.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-4 text-left transition hover:bg-white/[0.05]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-pink/10">
                  <p.icon className="h-5 w-5 text-brand-pinkLight" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-white">{p.label}</span>
                  <span className="block truncate text-sm text-white/45">{p.subtitle}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </button>
            ))}
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-white/60 transition hover:bg-white/[0.04] hover:text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
                <LogOut className="h-5 w-5" />
              </span>
              Sair
            </button>
          </div>
        </Modal>

        {newOpen && <NewAppointmentModal day={newOpen.day} onClose={() => setNewOpen(null)} />}
      </div>
    </AdminCtx.Provider>
  );
};

const TabButton = ({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`relative flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 transition active:scale-95 ${active ? 'text-white' : 'text-white/45'}`}
  >
    {active && <span className="absolute top-0 h-[2px] w-8 rounded-b-full bg-gradient-to-r from-brand-pink to-brand-roseGold" />}
    <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${active ? 'bg-brand-pink/15' : ''}`}>
      <Icon className={`h-[20px] w-[20px] ${active ? 'text-brand-pink' : ''}`} />
    </span>
    <span className="max-w-full truncate text-[10.5px] font-medium">{label}</span>
  </button>
);
