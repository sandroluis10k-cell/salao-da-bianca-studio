import { useState, type FormEvent } from 'react';
import { Check, CircleDollarSign, Globe, MessageCircle, PenLine, RotateCcw, X } from 'lucide-react';
import { formatCurrency } from '../../salonConfig';
import { admin, dayKeyOf, fmtTime, type Appointment } from '../../agendaApi';
import { useAdmin } from './context';
import { Button, Field, Input, LinkButton, Modal, StatusBadge, Tag, useConfirm, useToast } from './ui';
import { confirmMessage, firstName, fmtPhone, moneyInput, parseMoney, relativeDay, waClient } from './utils';

const NETWORK_ERROR = 'Não consegui falar com a agenda. Confira a internet e tente de novo.';

/** Card de um atendimento com as ações (WhatsApp, concluir, valor, cancelar/reativar) */
export const AppointmentCard = ({ a, showDay }: { a: Appointment; showDay?: boolean }) => {
  const { pin, price, reload } = useAdmin();
  const confirm = useConfirm();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const value = price(a);
  const isNew = a.source !== 'manual' && Date.now() - new Date(a.created_at).getTime() < 24 * 3600_000 && a.status === 'confirmado';
  const cancelled = a.status === 'cancelado';

  const run = async (key: string, fn: () => Promise<boolean>, ok: string, fail: string) => {
    setBusy(key);
    try {
      if (await fn()) {
        toast.success(ok);
        await reload();
      } else toast.error(fail);
    } catch {
      toast.error(NETWORK_ERROR);
    } finally {
      setBusy(null);
    }
  };

  const conclude = () =>
    run('concluir', () => admin.setStatus(pin, a.id, 'concluido'), `Atendimento de ${firstName(a.client_name)} concluído.`, 'Não foi possível concluir.');

  const cancel = async () => {
    const yes = await confirm({
      title: 'Cancelar atendimento?',
      text: `O horário de ${a.client_name} (${a.service}, ${relativeDay(dayKeyOf(a.start_at)).toLowerCase()} às ${fmtTime(a.start_at)}) volta a ficar livre no site. Você pode reativar depois.`,
      confirmLabel: 'Cancelar atendimento',
      danger: true,
    });
    if (yes) run('cancelar', () => admin.setStatus(pin, a.id, 'cancelado'), 'Atendimento cancelado.', 'Não foi possível cancelar.');
  };

  const reactivate = () =>
    run(
      'reativar',
      () => admin.setStatus(pin, a.id, 'confirmado'),
      'Atendimento reativado.',
      'Não deu para reativar: esse horário já está ocupado.'
    );

  return (
    <div
      className={`group rounded-2xl border p-4 transition ${
        cancelled
          ? 'border-white/[0.05] bg-white/[0.01]'
          : 'border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.015] hover:border-white/[0.13]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-[58px] shrink-0 ${cancelled ? 'opacity-50' : ''}`}>
          <p className="text-[17px] font-semibold leading-none tabular-nums text-white">{fmtTime(a.start_at)}</p>
          <p className="mt-1 text-xs tabular-nums text-white/40">{fmtTime(a.end_at)}</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`truncate font-semibold text-white ${cancelled ? 'text-white/50 line-through' : ''}`}>{a.client_name}</p>
              <p className="truncate text-sm text-white/60">{a.service}</p>
            </div>
            <p className={`shrink-0 text-[15px] font-semibold tabular-nums ${cancelled ? 'text-white/35 line-through' : 'text-white'}`}>
              {formatCurrency(value)}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={a.status} />
            {a.source === 'manual' ? (
              <Tag tone="violet">
                <PenLine className="mr-1 h-3 w-3" /> Manual
              </Tag>
            ) : (
              <Tag tone="pink">
                <Globe className="mr-1 h-3 w-3" /> Site
              </Tag>
            )}
            {isNew && <Tag>Novo</Tag>}
            {showDay && <Tag>{relativeDay(dayKeyOf(a.start_at))}</Tag>}
            {a.client_phone && <span className="text-xs text-white/40">{fmtPhone(a.client_phone)}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2 border-t border-white/[0.05] pt-3.5">
        {cancelled ? (
          <Button size="sm" variant="secondary" onClick={reactivate} loading={busy === 'reativar'}>
            {busy !== 'reativar' && <RotateCcw className="h-3.5 w-3.5" />} Reativar
          </Button>
        ) : (
          <>
            {a.client_phone && (
              <LinkButton size="sm" variant="whatsapp" href={waLinkFor(a)}>
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </LinkButton>
            )}
            {a.status === 'confirmado' && (
              <Button size="sm" variant="secondary" onClick={conclude} loading={busy === 'concluir'}>
                {busy !== 'concluir' && <Check className="h-3.5 w-3.5" />} Concluir
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
              <CircleDollarSign className="h-3.5 w-3.5" /> Valor
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel} loading={busy === 'cancelar'} className="ml-auto text-white/50 hover:text-red-300">
              {busy !== 'cancelar' && <X className="h-3.5 w-3.5" />} Cancelar
            </Button>
          </>
        )}
      </div>

      {editing && <PriceModal a={a} current={value} onClose={() => setEditing(false)} />}
    </div>
  );
};

const waLinkFor = (a: Appointment) => waClient(a.client_phone, confirmMessage(a));

/* ---------- editar valor ---------- */
const PriceModal = ({ a, current, onClose }: { a: Appointment; current: number; onClose: () => void }) => {
  const { pin, reload } = useAdmin();
  const toast = useToast();
  const [val, setVal] = useState(moneyInput(current));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const save = async (e?: FormEvent) => {
    e?.preventDefault();
    const n = parseMoney(val);
    if (n === null) return setErr('Digite um valor válido, por exemplo 80,00.');
    setBusy(true);
    try {
      if (await admin.setPrice(pin, a.id, n)) {
        toast.success(`Valor atualizado para ${formatCurrency(n)}.`);
        await reload();
        onClose();
      } else setErr('Não foi possível salvar o valor.');
    } catch {
      setErr(NETWORK_ERROR);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Editar valor"
      subtitle={`${a.client_name} · ${a.service}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => save()} loading={busy}>
            Salvar valor
          </Button>
        </>
      }
    >
      <form onSubmit={save}>
        <Field label="Valor cobrado (R$)" hint="Use para descontos, adicionais ou ajustes.">
          <Input inputMode="decimal" value={val} onChange={(e) => (setVal(e.target.value), setErr(''))} autoFocus />
        </Field>
        {err && <p className="mt-3 text-sm text-red-300">{err}</p>}
      </form>
    </Modal>
  );
};
