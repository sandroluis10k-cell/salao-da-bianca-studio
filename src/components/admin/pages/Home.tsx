import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, CalendarClock, CalendarDays, CalendarHeart, CircleDollarSign, MessageCircle, Receipt, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../salonConfig';
import { addDays, dayKeyOf, fmtTime, todayKey } from '../../../agendaApi';
import { useAdmin } from '../context';
import { AppointmentCard } from '../AppointmentCard';
import { Button, Card, EmptyState, Kpi, LinkButton, SectionTitle, Skeleton } from '../ui';
import { addMonths, confirmMessage, daysBetween, delta, fmtCountdown, fmtDateFull, hourNow, monthStart, relativeDay, waClient } from '../utils';

export const Home = () => {
  const { appts, price, openNew, go } = useAdmin();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  const today = todayKey();
  const h = hourNow();
  const greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';

  const stats = useMemo(() => {
    if (!appts) return null;
    const mStart = monthStart(today);
    const prevStart = addMonths(today, -1);
    const dayOfMonth = daysBetween(mStart, today) + 1;
    const prevDays = daysBetween(prevStart, mStart);
    const prevSameEnd = addDays(prevStart, Math.min(dayOfMonth, prevDays));
    const live = appts.filter((a) => a.status !== 'cancelado');
    const done = appts.filter((a) => a.status === 'concluido');
    const inRange = (k: string, from: string, to: string) => k >= from && k < to;

    const revMonth = done.filter((a) => inRange(dayKeyOf(a.start_at), mStart, addDays(today, 1)));
    const revPrevSame = done.filter((a) => inRange(dayKeyOf(a.start_at), prevStart, prevSameEnd));
    const sum = (l: typeof appts) => l.reduce((s, a) => s + price(a), 0);

    const doneMonthAll = done.filter((a) => inRange(dayKeyOf(a.start_at), mStart, addMonths(today, 1)));
    const donePrevAll = done.filter((a) => inRange(dayKeyOf(a.start_at), prevStart, mStart));
    const ticket = doneMonthAll.length ? sum(doneMonthAll) / doneMonthAll.length : 0;
    const ticketPrev = donePrevAll.length ? sum(donePrevAll) / donePrevAll.length : 0;

    const prevMonthCount = live.filter((a) => inRange(dayKeyOf(a.start_at), prevStart, mStart)).length;
    const todayList = appts.filter((a) => dayKeyOf(a.start_at) === today).sort((a, b) => a.start_at.localeCompare(b.start_at));
    const todayCount = todayList.filter((a) => a.status !== 'cancelado').length;
    const next7 = live.filter((a) => {
      const k = dayKeyOf(a.start_at);
      return k >= today && k < addDays(today, 7) && new Date(a.end_at).getTime() > Date.now();
    }).length;

    return {
      revenue: sum(revMonth),
      revenueDelta: delta(sum(revMonth), sum(revPrevSame)),
      todayCount,
      todayDelta: delta(todayCount, prevMonthCount / prevDays),
      next7,
      next7Delta: delta(next7, (prevMonthCount / prevDays) * 7),
      ticket,
      ticketDelta: delta(ticket, ticketPrev),
      todayList,
    };
  }, [appts, price, today]);

  const next = useMemo(
    () =>
      appts
        ?.filter((a) => a.status === 'confirmado' && new Date(a.end_at).getTime() > now)
        .sort((a, b) => a.start_at.localeCompare(b.start_at))[0],
    [appts, now]
  );

  const loading = !stats;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-white/45">{fmtDateFull(today)}</p>
        <h2 className="mt-1 font-display text-[28px] leading-tight text-white sm:text-[34px]">
          {greeting}, Bianca <span className="text-brand-pink">✦</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi icon={CircleDollarSign} label="Faturamento do mês" value={formatCurrency(stats?.revenue ?? 0)} change={stats?.revenueDelta} hint="vs. mês anterior" loading={loading} />
        <Kpi icon={CalendarDays} label="Atendimentos hoje" value={String(stats?.todayCount ?? 0)} change={stats?.todayDelta} hint="vs. média/dia" loading={loading} />
        <Kpi icon={CalendarClock} label="Próximos 7 dias" value={String(stats?.next7 ?? 0)} change={stats?.next7Delta} hint="vs. média/semana" loading={loading} />
        <Kpi icon={Receipt} label="Ticket médio do mês" value={formatCurrency(stats?.ticket ?? 0)} change={stats?.ticketDelta} hint="vs. mês anterior" loading={loading} />
      </div>

      <section>
        <SectionTitle>Próximo atendimento</SectionTitle>
        {loading ? (
          <Skeleton className="h-40" />
        ) : next ? (
          <div className="relative overflow-hidden rounded-2xl border border-brand-pink/20 bg-gradient-to-br from-brand-pink/[0.14] via-brand-roseGold/[0.06] to-transparent p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-pink/20 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-pink/15 px-2.5 py-1 text-xs font-semibold text-brand-pinkLight">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-pink" />
                  {new Date(next.start_at).getTime() <= now ? 'Acontecendo agora' : fmtCountdown(new Date(next.start_at).getTime() - now)}
                </span>
                <p className="mt-3 truncate font-display text-2xl text-white sm:text-[28px]">{next.client_name}</p>
                <p className="mt-1 text-sm text-white/65">
                  {next.service} · {formatCurrency(price(next))}
                </p>
                <p className="mt-0.5 text-sm text-white/45">
                  {relativeDay(dayKeyOf(next.start_at))}, {fmtTime(next.start_at)} – {fmtTime(next.end_at)}
                </p>
              </div>
              <div className="flex gap-2">
                {next.client_phone && (
                  <LinkButton variant="whatsapp" href={waClient(next.client_phone, confirmMessage(next))} className="flex-1 sm:flex-none">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </LinkButton>
                )}
                <Button variant="secondary" onClick={() => go('agenda', dayKeyOf(next.start_at))} className="flex-1 sm:flex-none">
                  Ver na agenda <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-pink/10">
              <Sparkles className="h-5 w-5 text-brand-pinkLight" />
            </span>
            <p className="text-sm text-white/60">Nenhum atendimento marcado por enquanto. Quando alguém agendar pelo site, aparece aqui.</p>
          </Card>
        )}
      </section>

      <section>
        <SectionTitle
          action={
            <button onClick={() => go('agenda', today)} className="text-[13px] font-medium text-brand-pinkLight hover:text-white">
              Ver agenda
            </button>
          }
        >
          Hoje
        </SectionTitle>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : stats.todayList.length ? (
          <Timeline items={stats.todayList.map((a) => ({ id: a.id, time: fmtTime(a.start_at), past: new Date(a.end_at).getTime() < now, node: <AppointmentCard a={a} /> }))} />
        ) : (
          <EmptyState
            icon={CalendarHeart}
            title="Dia livre por aqui"
            text="Nenhum atendimento marcado para hoje."
            action={
              <Button variant="secondary" onClick={() => openNew(today)}>
                Lançar atendimento
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
};

/** Linha do tempo vertical */
export const Timeline = ({ items }: { items: { id: string; time: string; past?: boolean; node: ReactNode }[] }) => (
  <ol className="relative space-y-3 pl-6 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-px before:bg-gradient-to-b before:from-brand-pink/50 before:via-white/10 before:to-transparent">
    {items.map((it) => (
      <li key={it.id} className="relative">
        <span
          className={`absolute -left-6 top-5 h-[15px] w-[15px] rounded-full border-2 border-brand-black ${
            it.past ? 'bg-white/25' : 'bg-gradient-to-br from-brand-pink to-brand-roseGold shadow-[0_0_0_4px_rgba(232,138,162,0.12)]'
          }`}
          aria-hidden
        />
        {it.node}
      </li>
    ))}
  </ol>
);
