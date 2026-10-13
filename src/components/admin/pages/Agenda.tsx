import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarHeart, CalendarX2, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatCurrency } from '../../../salonConfig';
import { addDays, dayKeyOf, fmtTime, todayKey, type Appointment } from '../../../agendaApi';
import { useAdmin } from '../context';
import { AppointmentCard } from '../AppointmentCard';
import { Timeline } from './Home';
import { Button, EmptyState, Segmented, Skeleton } from '../ui';
import { dayRange, fmtDayNum, fmtMonthShort, fmtWeekdayShort, relativeDay } from '../utils';

type Filter = 'todos' | Appointment['status'];
const PAST_DAYS = 30;
const FUTURE_DAYS = 90;

export const Agenda = ({ day, setDay }: { day: string; setDay: (d: string) => void }) => {
  const { appts, blocks, price, openNew } = useAdmin();
  const [filter, setFilter] = useState<Filter>('todos');
  const stripRef = useRef<HTMLDivElement>(null);
  const today = todayKey();

  const days = useMemo(() => dayRange(addDays(today, -PAST_DAYS), addDays(today, FUTURE_DAYS)), [today]);
  const byDay = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    (appts ?? []).forEach((a) => {
      const k = dayKeyOf(a.start_at);
      m.set(k, [...(m.get(k) ?? []), a]);
    });
    m.forEach((l) => l.sort((a, b) => a.start_at.localeCompare(b.start_at)));
    return m;
  }, [appts]);

  // mantém o dia escolhido visível na faixa
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>(`[data-day="${day}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [day]);

  const all = byDay.get(day) ?? [];
  const list = filter === 'todos' ? all : all.filter((a) => a.status === filter);
  const live = all.filter((a) => a.status !== 'cancelado');
  const dayTotal = live.reduce((s, a) => s + price(a), 0);
  const dayBlocks = (blocks ?? []).filter((b) => dayKeyOf(b.start_at) <= day && dayKeyOf(new Date(new Date(b.end_at).getTime() - 1)) >= day);
  const count = (s: Appointment['status']) => all.filter((a) => a.status === s).length;

  return (
    <div className="space-y-5">
      {/* faixa de dias */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => setDay(addDays(day, -1))} aria-label="Dia anterior">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div ref={stripRef} className="no-scrollbar -mx-4 flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0">
          {days.map((k) => {
            const selected = k === day;
            const has = (byDay.get(k) ?? []).some((a) => a.status !== 'cancelado');
            const isToday = k === today;
            return (
              <button
                key={k}
                data-day={k}
                onClick={() => setDay(k)}
                className={`relative flex w-[54px] shrink-0 snap-center flex-col items-center rounded-2xl border py-2.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink/60 ${
                  selected
                    ? 'border-transparent bg-gradient-to-b from-brand-pink to-brand-roseGold text-white shadow-[0_8px_24px_-10px_rgba(232,138,162,0.8)]'
                    : isToday
                      ? 'border-brand-pink/40 bg-brand-pink/[0.07] text-white'
                      : `border-white/[0.06] bg-white/[0.02] hover:border-white/15 ${k < today ? 'text-white/40' : 'text-white/80'}`
                }`}
              >
                <span className={`text-[11px] font-medium ${selected ? 'text-white/85' : isToday ? 'text-brand-pinkLight' : ''}`}>
                  {isToday ? 'Hoje' : fmtWeekdayShort(k)}
                </span>
                <span className="mt-0.5 text-lg font-semibold leading-tight tabular-nums">{fmtDayNum(k)}</span>
                <span className={`text-[10px] ${selected ? 'text-white/75' : 'text-white/35'}`}>{fmtMonthShort(k)}</span>
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${has ? (selected ? 'bg-white' : 'bg-brand-pink') : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
        <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={() => setDay(addDays(day, 1))} aria-label="Próximo dia">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* resumo do dia */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-2xl text-white">{relativeDay(day)}</h2>
          <p className="mt-0.5 text-sm text-white/50">
            {live.length} atendimento{live.length === 1 ? '' : 's'} · {formatCurrency(dayTotal)}
            {day !== today && (
              <button onClick={() => setDay(today)} className="ml-2 font-medium text-brand-pinkLight hover:text-white">
                Ir para hoje
              </button>
            )}
          </p>
        </div>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todos', label: 'Todos', count: all.length },
            { value: 'confirmado', label: 'Confirmados', count: count('confirmado') },
            { value: 'concluido', label: 'Concluídos', count: count('concluido') },
            { value: 'cancelado', label: 'Cancelados', count: count('cancelado') },
          ]}
        />
      </div>

      {dayBlocks.map((b) => {
        const full = fmtTime(b.start_at) === '00:00' && fmtTime(b.end_at) === '00:00';
        return (
          <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-white/12 bg-white/[0.015] px-4 py-3 text-sm text-white/55">
            <CalendarX2 className="h-4 w-4 shrink-0 text-white/40" />
            <span>
              Bloqueado {full ? 'o dia inteiro' : `das ${fmtTime(b.start_at)} às ${fmtTime(b.end_at)}`}
              {b.reason ? ` · ${b.reason}` : ''}
            </span>
          </div>
        );
      })}

      {!appts ? (
        <div className="space-y-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : list.length ? (
        <Timeline
          items={list.map((a) => ({ id: a.id, time: fmtTime(a.start_at), past: new Date(a.end_at).getTime() < Date.now(), node: <AppointmentCard a={a} /> }))}
        />
      ) : (
        <EmptyState
          icon={CalendarHeart}
          title={all.length ? 'Nada com esse filtro' : 'Nenhum atendimento'}
          text={all.length ? 'Troque o filtro para ver os outros atendimentos do dia.' : 'Este dia ainda está livre na sua agenda.'}
          action={
            !all.length && day >= today ? (
              <Button variant="secondary" onClick={() => openNew(day)}>
                <Plus className="h-4 w-4" /> Lançar atendimento
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
};
