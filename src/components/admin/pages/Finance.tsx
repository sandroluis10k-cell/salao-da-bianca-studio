import { useEffect, useMemo, useState } from 'react';
import { Ban, CalendarCheck2, CircleDollarSign, Hourglass, Receipt } from 'lucide-react';
import { formatCurrency } from '../../../salonConfig';
import { addDays, admin, dayKeyOf, toDate, todayKey, type Appointment } from '../../../agendaApi';
import { useAdmin } from '../context';
import { Card, Kpi, SectionTitle, Segmented, Skeleton, useToast } from '../ui';
import { addMonths, dayRange, fmtDateShort, fmtDayNum, fmtMonthLong, fmtMonthShort, monthStart, pct } from '../utils';

type Period = 'semana' | 'mes' | 'mes_passado' | 'tres_meses' | 'ano';
const PERIODS: { value: Period; label: string }[] = [
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Este mês' },
  { value: 'mes_passado', label: 'Mês passado' },
  { value: 'tres_meses', label: 'Últimos 3 meses' },
  { value: 'ano', label: 'Este ano' },
];

const PINK = '#E88AA2';
const VIOLET = '#8B7CF6';

/** [início, fim exclusivo] do período, em chaves de dia de Brasília */
const rangeOf = (p: Period): [string, string] => {
  const t = todayKey();
  if (p === 'semana') {
    const wd = new Date(`${t}T12:00:00-03:00`).getUTCDay();
    const start = addDays(t, -((wd + 6) % 7)); // segunda-feira
    return [start, addDays(start, 7)];
  }
  if (p === 'mes') return [monthStart(t), addMonths(t, 1)];
  if (p === 'mes_passado') return [addMonths(t, -1), monthStart(t)];
  if (p === 'tres_meses') return [addMonths(t, -2), addMonths(t, 1)];
  return [`${t.slice(0, 4)}-01-01`, `${Number(t.slice(0, 4)) + 1}-01-01`];
};

export const Finance = () => {
  const { pin, price, lastUpdate } = useAdmin();
  const toast = useToast();
  const [period, setPeriod] = useState<Period>('mes');
  const [data, setData] = useState<Appointment[] | null>(null);
  const [from, to] = rangeOf(period);

  useEffect(() => {
    setData(null);
  }, [period]);
  // busca o período escolhido e recarrega junto com a atualização geral do painel
  useEffect(() => {
    let alive = true;
    admin
      .list(pin, toDate(from, '00:00'), toDate(to, '00:00'))
      .then((d) => alive && setData(d))
      .catch(() => {
        if (!alive) return;
        toast.error('Não consegui carregar o faturamento. Confira a internet.');
        setData((d) => d ?? []);
      });
    return () => {
      alive = false;
    };
  }, [pin, from, to, lastUpdate, toast]);

  const s = useMemo(() => {
    if (!data) return null;
    const now = Date.now();
    const rows = data.filter((a) => {
      const k = dayKeyOf(a.start_at);
      return k >= from && k < to;
    });
    const done = rows.filter((a) => a.status === 'concluido');
    const future = rows.filter((a) => a.status === 'confirmado' && new Date(a.start_at).getTime() > now);
    const cancelled = rows.filter((a) => a.status === 'cancelado');
    const sum = (l: Appointment[]) => l.reduce((acc, a) => acc + price(a), 0);
    const revenue = sum(done);

    // barras: por dia, ou por mês no período "Este ano"
    const monthly = period === 'ano';
    const keys = monthly
      ? Array.from({ length: 12 }, (_, i) => addMonths(from, i))
      : dayRange(from, to);
    const bucketOf = (a: Appointment) => (monthly ? monthStart(dayKeyOf(a.start_at)) : dayKeyOf(a.start_at));
    const bars = keys.map((k) => ({ key: k, done: 0, forecast: 0, n: 0 }));
    const idx = new Map(keys.map((k, i) => [k, i]));
    done.forEach((a) => {
      const b = bars[idx.get(bucketOf(a)) ?? -1];
      if (b) (b.done += price(a)), (b.n += 1);
    });
    future.forEach((a) => {
      const b = bars[idx.get(bucketOf(a)) ?? -1];
      if (b) b.forecast += price(a);
    });

    const services = new Map<string, { revenue: number; n: number }>();
    done.forEach((a) => {
      const x = services.get(a.service) ?? { revenue: 0, n: 0 };
      services.set(a.service, { revenue: x.revenue + price(a), n: x.n + 1 });
    });
    const ranking = [...services.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.revenue - a.revenue);

    const site = done.filter((a) => a.source !== 'manual');
    const manual = done.filter((a) => a.source === 'manual');

    return {
      revenue,
      forecast: sum(future),
      ticket: done.length ? revenue / done.length : 0,
      count: done.length,
      cancelRate: rows.length ? cancelled.length / rows.length : 0,
      cancelled: cancelled.length,
      total: rows.length,
      bars,
      monthly,
      ranking,
      site: { revenue: sum(site), n: site.length },
      manual: { revenue: sum(manual), n: manual.length },
    };
  }, [data, price, period, from, to]);

  return (
    <div className="space-y-6">
      <Segmented value={period} onChange={setPeriod} options={PERIODS} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1">
          <Kpi icon={CircleDollarSign} label="Faturado" value={formatCurrency(s?.revenue ?? 0)} hint="atendimentos concluídos" loading={!s} />
        </div>
        <Kpi icon={Hourglass} label="Previsto" value={formatCurrency(s?.forecast ?? 0)} hint="confirmados a seguir" loading={!s} />
        <Kpi icon={Receipt} label="Ticket médio" value={formatCurrency(s?.ticket ?? 0)} loading={!s} />
        <Kpi icon={CalendarCheck2} label="Atendimentos" value={String(s?.count ?? 0)} hint="concluídos" loading={!s} />
        <Kpi icon={Ban} label="Cancelamentos" value={pct(s?.cancelRate ?? 0)} hint={s ? `${s.cancelled} de ${s.total}` : undefined} loading={!s} />
      </div>

      <Card className="p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">Faturamento {s?.monthly ? 'por mês' : 'por dia'}</h3>
            <p className="text-sm text-white/45">
              {fmtDateShort(from)} a {fmtDateShort(addDays(to, -1))}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: PINK }} /> Faturado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={STRIPES} /> Previsto
            </span>
          </div>
        </div>
        {s ? <BarChart bars={s.bars} monthly={s.monthly} /> : <Skeleton className="h-56" />}
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="p-4 sm:p-6 lg:col-span-3">
          <SectionTitle>Serviços por receita</SectionTitle>
          {!s ? (
            <Skeleton className="h-40" />
          ) : s.ranking.length ? (
            <ul className="space-y-4">
              {s.ranking.map((r) => (
                <li key={r.name}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-white/85">{r.name}</span>
                    <span className="shrink-0 tabular-nums text-white">
                      {formatCurrency(r.revenue)} <span className="text-white/40">· {r.n}x</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-roseGold to-brand-pink"
                      style={{ width: `${Math.max(2, (r.revenue / (s.ranking[0].revenue || 1)) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-white/45">Nenhum atendimento concluído no período.</p>
          )}
        </Card>

        <Card className="p-4 sm:p-6 lg:col-span-2">
          <SectionTitle>Site x Manual</SectionTitle>
          {!s ? (
            <Skeleton className="h-40" />
          ) : s.count ? (
            <SourceSplit site={s.site} manual={s.manual} />
          ) : (
            <p className="py-8 text-center text-sm text-white/45">Sem dados no período.</p>
          )}
        </Card>
      </div>

    </div>
  );
};

const STRIPES = {
  backgroundImage: `repeating-linear-gradient(135deg, ${PINK}88 0 2px, transparent 2px 5px)`,
  boxShadow: `inset 0 0 0 1px ${PINK}66`,
};

/* ---------- gráfico de barras (CSS puro) ---------- */
type Bar = { key: string; done: number; forecast: number; n: number };
const niceMax = (v: number) => {
  if (v <= 0) return 100;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
};
const short = (v: number) => (v >= 1000 ? `R$ ${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : `R$ ${Math.round(v)}`);

const BarChart = ({ bars, monthly }: { bars: Bar[]; monthly: boolean }) => {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...bars.map((b) => b.done + b.forecast)));
  const today = todayKey();
  const labelEvery = bars.length > 40 ? 14 : bars.length > 14 ? 5 : 1;
  const a = active !== null ? bars[active] : null;

  return (
    <div className="relative select-none" onMouseLeave={() => setActive(null)}>
      <div className="relative h-56 pl-12 sm:h-64">
        {/* grade */}
        {[1, 0.5, 0].map((f) => (
          <div key={f} className="absolute left-12 right-0 border-t border-white/[0.06]" style={{ bottom: `${f * 100}%` }}>
            <span className="absolute -left-12 -translate-y-1/2 text-[10px] tabular-nums text-white/35">{short(max * f)}</span>
          </div>
        ))}
        <div className={`relative flex h-full items-end ${bars.length > 40 ? 'gap-px' : 'gap-[2px] sm:gap-1'}`}>
          {bars.map((b, i) => {
            const hDone = (b.done / max) * 100;
            const hFc = (b.forecast / max) * 100;
            const isActive = active === i;
            return (
              <button
                key={b.key}
                type="button"
                aria-label={`${monthly ? fmtMonthLong(b.key) : fmtDateShort(b.key)}: ${formatCurrency(b.done)} faturado`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(isActive ? null : i)}
                className="group relative flex h-full min-w-0 flex-1 flex-col justify-end focus:outline-none"
              >
                <span className={`absolute inset-0 rounded-md transition ${isActive ? 'bg-white/[0.05]' : ''}`} />
                {hFc > 0 && (
                  <span className="relative w-full rounded-t-[4px]" style={{ height: `${hFc}%`, ...STRIPES, marginBottom: hDone > 0 ? 2 : 0 }} />
                )}
                {hDone > 0 && (
                  <span
                    className={`relative w-full transition ${hFc > 0 ? '' : 'rounded-t-[4px]'} ${active !== null && !isActive ? 'opacity-50' : ''}`}
                    style={{ height: `${hDone}%`, background: PINK, minHeight: 2 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* eixo x */}
      <div className="mt-2 flex pl-12">
        {bars.map((b, i) => (
          <span key={b.key} className={`min-w-0 flex-1 text-center text-[10px] tabular-nums ${!monthly && b.key === today ? 'text-brand-pinkLight' : 'text-white/35'}`}>
            {i % labelEvery === 0 ? (monthly ? fmtMonthShort(b.key) : fmtDayNum(b.key)) : ''}
          </span>
        ))}
      </div>
      {/* tooltip */}
      {a && active !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-44 rounded-xl border border-white/10 bg-[#1a1a1a]/95 px-3 py-2.5 text-xs shadow-2xl backdrop-blur"
          style={{
            left: `calc(3rem + (100% - 3rem) * ${(active + 0.5) / bars.length})`,
            transform: `translateX(${active / bars.length > 0.6 ? '-100%' : active / bars.length < 0.25 ? '0' : '-50%'})`,
          }}
        >
          <p className="font-semibold text-white">{monthly ? fmtMonthLong(a.key) : fmtDateShort(a.key)}</p>
          <p className="mt-1.5 flex justify-between gap-2 text-white/60">
            Faturado <span className="tabular-nums text-white">{formatCurrency(a.done)}</span>
          </p>
          {a.forecast > 0 && (
            <p className="flex justify-between gap-2 text-white/60">
              Previsto <span className="tabular-nums text-white">{formatCurrency(a.forecast)}</span>
            </p>
          )}
          <p className="flex justify-between gap-2 text-white/60">
            Atendimentos <span className="tabular-nums text-white">{a.n}</span>
          </p>
        </div>
      )}
    </div>
  );
};

/* ---------- Site x Manual ---------- */
const SourceSplit = ({ site, manual }: { site: { revenue: number; n: number }; manual: { revenue: number; n: number } }) => {
  const total = site.revenue + manual.revenue;
  const sitePct = total ? site.revenue / total : site.n / (site.n + manual.n || 1);
  const rows = [
    { label: 'Site', color: PINK, ...site, share: sitePct },
    { label: 'Manual', color: VIOLET, ...manual, share: 1 - sitePct },
  ];
  return (
    <div>
      <div className="flex h-3 gap-[2px] overflow-hidden rounded-full">
        {rows.map((r) =>
          r.share > 0 ? <div key={r.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${r.share * 100}%`, background: r.color }} /> : null
        )}
      </div>
      <ul className="mt-5 space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{r.label}</p>
              <p className="text-xs text-white/45">
                {r.n} atendimento{r.n === 1 ? '' : 's'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-white">{formatCurrency(r.revenue)}</p>
              <p className="text-xs tabular-nums text-white/45">{pct(r.share)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
