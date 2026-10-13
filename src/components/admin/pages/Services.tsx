import { useEffect, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Clock, EyeOff, Info, PenLine, Plus, Scissors } from 'lucide-react';
import { formatCurrency } from '../../../salonConfig';
import { admin, type ServiceRow } from '../../../agendaApi';
import { useAdmin } from '../context';
import { Button, Card, EmptyState, Field, Input, Modal, Select, Skeleton, Toggle, useToast } from '../ui';
import { moneyInput, parseMoney } from '../utils';

const NETWORK_ERROR = 'Não consegui falar com a agenda. Confira a internet e tente de novo.';
const RESULT: Record<string, string> = {
  senha_incorreta: 'Sua sessão expirou. Entre de novo com a sua senha.',
  nome_invalido: 'Confira o nome do serviço.',
  duracao_invalida: 'A duração precisa ficar entre 15 minutos e 10 horas.',
  preco_invalido: 'Confira o preço: use um valor válido, por exemplo 80,00.',
  ja_existe: 'Já existe um serviço com esse nome.',
  nao_encontrado: 'Esse serviço não existe mais. Atualize a página e tente de novo.',
};

/** 90 -> "1h30", 45 -> "45 min", 120 -> "2h" */
export const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return `${h}h${m ? String(m).padStart(2, '0') : ''}`;
};

type Editing = { service: ServiceRow | null } | null;

export const Services = () => {
  const { pin, services, reloadServices, logout, refreshKey } = useAdmin();
  const toast = useToast();
  const [list, setList] = useState<ServiceRow[] | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // lista local (permite reordenar na hora, antes de o banco responder)
  useEffect(() => {
    let alive = true;
    admin
      .listServices(pin)
      .then((l) => alive && setList(l))
      .catch(() => {
        if (!alive) return;
        toast.error('Não consegui carregar os serviços. Confira a internet.');
        setList(services);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, refreshKey]);
  useEffect(() => {
    if (services.length) setList(services);
  }, [services]);

  const move = async (i: number, dir: -1 | 1) => {
    if (!list) return;
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const prev = list;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
    setBusy(`move:${next[j].name}`);
    try {
      if (!(await admin.reorderServices(pin, next.map((s) => s.name)))) throw new Error();
      await reloadServices();
    } catch {
      setList(prev);
      toast.error('Não consegui salvar a nova ordem. Tente de novo.');
    } finally {
      setBusy(null);
    }
  };

  const toggle = async (s: ServiceRow) => {
    setBusy(`toggle:${s.name}`);
    try {
      const r = await admin.saveService(pin, {
        oldName: s.name,
        name: s.name,
        durationMin: s.duration_min,
        price: Number(s.price),
        active: !s.active,
        description: s.description ?? '',
      });
      if (r === 'ok') {
        setList((l) => l && l.map((x) => (x.name === s.name ? { ...x, active: !s.active } : x)));
        toast.success(s.active ? `${s.name} foi ocultado do site.` : `${s.name} voltou a aparecer no site.`);
        await reloadServices();
      } else if (r === 'senha_incorreta') {
        toast.error(RESULT[r]);
        logout();
      } else toast.error(RESULT[r] ?? 'Não foi possível salvar. Tente de novo.');
    } catch {
      toast.error(NETWORK_ERROR);
    } finally {
      setBusy(null);
    }
  };

  const activeCount = list?.filter((s) => s.active).length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3 text-sm text-white/60 sm:flex-1">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-pinkLight" />
          Serviços ocultos não aparecem no site nem no agendamento.
        </p>
        <Button variant="secondary" onClick={() => setEditing({ service: null })}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      {list && list.length > 0 && (
        <p className="text-sm text-white/45">
          {list.length} serviço{list.length === 1 ? '' : 's'} · {activeCount} no site
        </p>
      )}

      {!list ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      ) : list.length ? (
        <ul className="space-y-3">
          {list.map((s, i) => (
            <li
              key={s.name}
              className={`rounded-2xl border p-4 transition sm:p-5 ${
                s.active
                  ? 'border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.015] hover:border-white/[0.13]'
                  : 'border-dashed border-white/[0.08] bg-white/[0.01]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="!h-9 !w-9"
                    disabled={i === 0 || !!busy}
                    onClick={() => move(i, -1)}
                    aria-label={`Subir ${s.name}`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="!h-9 !w-9"
                    disabled={i === list.length - 1 || !!busy}
                    onClick={() => move(i, 1)}
                    aria-label={`Descer ${s.name}`}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`font-semibold ${s.active ? 'text-white' : 'text-white/50'}`}>{s.name}</p>
                      {s.description ? (
                        <p className={`mt-0.5 line-clamp-2 text-sm ${s.active ? 'text-white/55' : 'text-white/35'}`}>{s.description}</p>
                      ) : (
                        <p className="mt-0.5 text-sm italic text-white/25">Sem descrição</p>
                      )}
                    </div>
                    <p className={`shrink-0 text-[15px] font-semibold tabular-nums ${s.active ? 'text-white' : 'text-white/40'}`}>
                      {formatCurrency(Number(s.price))}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-white/50">
                      <Clock className="h-3.5 w-3.5" /> {fmtDuration(s.duration_min)}
                    </span>
                    {!s.active && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-white/55">
                        <EyeOff className="h-3 w-3" /> Oculto
                      </span>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-[13px] text-white/60">
                        <span>{s.active ? 'Ativo' : 'Oculto'}</span>
                        <Toggle checked={s.active} onChange={() => !busy && toggle(s)} label={`Mostrar ${s.name} no site`} />
                      </label>
                      <Button size="sm" variant="ghost" onClick={() => setEditing({ service: s })}>
                        <PenLine className="h-3.5 w-3.5" /> Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Scissors}
          title="Nenhum serviço cadastrado"
          text="Cadastre os serviços que aparecem no site e no agendamento."
          action={
            <Button variant="primary" onClick={() => setEditing({ service: null })}>
              <Plus className="h-4 w-4" /> Novo serviço
            </Button>
          }
        />
      )}

      {editing && (
        <ServiceModal
          service={editing.service}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await reloadServices();
          }}
        />
      )}
    </div>
  );
};

/* ---------- criar / editar ---------- */
const HOURS = Array.from({ length: 11 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

const ServiceModal = ({ service, onClose, onSaved }: { service: ServiceRow | null; onClose: () => void; onSaved: () => void }) => {
  const { pin, logout } = useAdmin();
  const toast = useToast();
  const initialMin = service?.duration_min ?? 60;
  const [name, setName] = useState(service?.name ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [hours, setHours] = useState(Math.floor(initialMin / 60));
  const [minutes, setMinutes] = useState(MINUTES.includes(initialMin % 60) ? initialMin % 60 : Math.round((initialMin % 60) / 15) * 15 % 60);
  const [price, setPrice] = useState(service ? moneyInput(Number(service.price)) : '');
  const [active, setActive] = useState(service?.active ?? true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const duration = hours * 60 + minutes;

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setErr('');
    const n = name.trim();
    const value = parseMoney(price);
    if (n.length < 2) return setErr('Informe o nome do serviço.');
    if (duration < 15 || duration > 600) return setErr(RESULT.duracao_invalida);
    if (value === null) return setErr(RESULT.preco_invalido);
    setBusy(true);
    try {
      const r = await admin.saveService(pin, {
        oldName: service ? service.name : null,
        name: n,
        durationMin: duration,
        price: value,
        active,
        description: description.trim(),
      });
      if (r === 'ok') {
        toast.success(service ? `${n} foi atualizado.` : `${n} foi criado${active ? ' e já aparece no site' : ''}.`);
        onSaved();
      } else if (r === 'senha_incorreta') {
        toast.error(RESULT[r]);
        logout();
      } else setErr(RESULT[r] ?? 'Não foi possível salvar. Tente de novo.');
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
      title={service ? 'Editar serviço' : 'Novo serviço'}
      subtitle={service ? service.name : 'Aparece no site e no agendamento quando estiver ativo.'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => submit()} loading={busy}>
            {service ? 'Salvar alterações' : 'Criar serviço'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Escova" maxLength={60} autoFocus={!service} />
        </Field>
        <Field label="Descrição curta" hint="Opcional. Aparece abaixo do preço no site.">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={160}
            placeholder="Ex.: Inclui lavagem e finalização."
            className="w-full min-w-0 resize-none rounded-xl border border-white/10 bg-brand-black/70 px-3.5 py-2.5 text-[15px] text-brand-white outline-none transition placeholder:text-white/30 focus:border-brand-pink/70 focus:ring-4 focus:ring-brand-pink/10"
          />
        </Field>
        <div>
          <span className="mb-1.5 block text-[13px] font-medium text-white/65">Duração</span>
          <div className="grid grid-cols-2 gap-3">
            <Select value={hours} onChange={(e) => setHours(Number(e.target.value))} aria-label="Horas">
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {h} {h === 1 ? 'hora' : 'horas'}
                </option>
              ))}
            </Select>
            <Select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} aria-label="Minutos">
              {MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </Select>
          </div>
          <span className={`mt-1 block text-xs ${duration < 15 || duration > 600 ? 'text-red-300' : 'text-white/40'}`}>
            {duration < 15 ? 'Mínimo de 15 minutos.' : duration > 600 ? 'Máximo de 10 horas.' : `Total: ${fmtDuration(duration)}`}
          </span>
        </div>
        <Field label="Preço (R$)">
          <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
        </Field>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
          <div>
            <p className="text-sm text-white/85">{active ? 'Ativo' : 'Oculto'}</p>
            <p className="text-xs text-white/40">{active ? 'Aparece no site e no agendamento.' : 'Não aparece no site nem no agendamento.'}</p>
          </div>
          <Toggle checked={active} onChange={setActive} label="Serviço ativo" />
        </div>
        {err && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{err}</p>}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};
