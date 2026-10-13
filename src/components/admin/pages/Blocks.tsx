import { useState, type FormEvent } from 'react';
import { Ban, CalendarX2, Trash2 } from 'lucide-react';
import { addDays, admin, dayKeyOf, fmtTime, todayKey, toDate, type Block } from '../../../agendaApi';
import { useAdmin } from '../context';
import { Button, Card, EmptyState, Field, Input, SectionTitle, Skeleton, Toggle, useConfirm, useToast } from '../ui';
import { relativeDay } from '../utils';

export const Blocks = () => {
  const { pin, blocks, reload } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [day, setDay] = useState(todayKey());
  const [allDay, setAllDay] = useState(true);
  const [from, setFrom] = useState('18:00');
  const [to, setTo] = useState('22:00');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const start = toDate(day, allDay ? '00:00' : from);
    const end = allDay ? toDate(addDays(day, 1), '00:00') : toDate(day, to);
    if (end <= start) return toast.error('O horário final precisa ser depois do inicial.');
    setBusy(true);
    try {
      if (await admin.addBlock(pin, start, end, reason.trim() || (allDay ? 'Dia bloqueado' : 'Horário bloqueado'))) {
        toast.success('Bloqueado! Esse horário não aparece mais no site.');
        setReason('');
        await reload();
      } else toast.error('Não foi possível bloquear.');
    } catch {
      toast.error('Não consegui falar com a agenda. Confira a internet.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (b: Block) => {
    const yes = await confirm({
      title: 'Remover bloqueio?',
      text: `${relativeDay(dayKeyOf(b.start_at))}${isFull(b) ? ' (dia inteiro)' : `, das ${fmtTime(b.start_at)} às ${fmtTime(b.end_at)}`} volta a ficar disponível para agendamento no site.`,
      confirmLabel: 'Remover',
      danger: true,
    });
    if (!yes) return;
    setRemoving(b.id);
    try {
      await admin.removeBlock(pin, b.id);
      toast.success('Bloqueio removido.');
      await reload();
    } catch {
      toast.error('Não consegui remover. Tente de novo.');
    } finally {
      setRemoving(null);
    }
  };

  const upcoming = (blocks ?? []).filter((b) => new Date(b.end_at).getTime() > Date.now()).sort((a, b) => a.start_at.localeCompare(b.start_at));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="h-fit p-5 sm:p-6 lg:col-span-2">
        <form onSubmit={save} className="space-y-4">
          <div>
            <h3 className="font-semibold text-white">Novo bloqueio</h3>
            <p className="mt-1 text-sm text-white/50">Para folgas, compromissos ou horários que você não quer liberar no site.</p>
          </div>
          <Field label="Dia">
            <Input type="date" value={day} min={todayKey()} onChange={(e) => setDay(e.target.value)} />
          </Field>
          <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
            <span className="text-sm text-white/80">Dia inteiro</span>
            <Toggle checked={allDay} onChange={setAllDay} label="Dia inteiro" />
          </div>
          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="De">
                <Input type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
              </Field>
              <Field label="Até">
                <Input type="time" value={to} onChange={(e) => setTo(e.target.value)} />
              </Field>
            </div>
          )}
          <Field label="Motivo" hint="Opcional. Só você vê.">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: Consulta médica" />
          </Field>
          <Button variant="primary" className="w-full" loading={busy}>
            {!busy && <Ban className="h-4 w-4" />} Bloquear
          </Button>
        </form>
      </Card>

      <section className="lg:col-span-3">
        <SectionTitle>Próximos bloqueios</SectionTitle>
        {!blocks ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : upcoming.length ? (
          <ul className="space-y-2">
            {upcoming.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-3.5 transition hover:border-white/[0.13]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                  <CalendarX2 className="h-4 w-4 text-brand-pinkLight" />
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium text-white">{relativeDay(dayKeyOf(b.start_at))}</p>
                  <p className="truncate text-white/50">
                    {isFull(b) ? 'Dia inteiro' : `${fmtTime(b.start_at)} às ${fmtTime(b.end_at)}`}
                    {b.reason ? ` · ${b.reason}` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(b)} loading={removing === b.id} aria-label="Remover bloqueio" className="hover:text-red-300">
                  {removing !== b.id && <Trash2 className="h-4 w-4" />}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={CalendarX2} title="Nenhum bloqueio" text="Toda a sua agenda está aberta para agendamentos no site." />
        )}
      </section>
    </div>
  );
};

const isFull = (b: Block) => fmtTime(b.start_at) === '00:00' && fmtTime(b.end_at) === '00:00';
