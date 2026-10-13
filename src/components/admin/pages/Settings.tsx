import { useEffect, useState, type FormEvent } from 'react';
import { Clock, KeyRound } from 'lucide-react';
import { admin, getHours, type HoursRow } from '../../../agendaApi';
import { useAdmin } from '../context';
import { Button, Card, Field, Input, Skeleton, Toggle, useToast } from '../ui';
import { DAY_NAMES, savePin } from '../utils';

export const Settings = () => {
  const { pin } = useAdmin();
  const toast = useToast();
  const [rows, setRows] = useState<HoursRow[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [newPin2, setNewPin2] = useState('');
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    getHours()
      .then(setRows)
      .catch(() => {
        toast.error('Não consegui carregar os horários.');
        setRows([]);
      });
  }, [toast]);

  const update = (i: number, patch: Partial<HoursRow>) => setRows((r) => r && r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const save = async () => {
    if (!rows) return;
    for (const r of rows) {
      if (r.active && r.close_time.slice(0, 5) <= r.open_time.slice(0, 5)) {
        return toast.error(`${DAY_NAMES[r.weekday]}: o fechamento precisa ser depois da abertura.`);
      }
    }
    setSaving(true);
    try {
      await Promise.all(rows.map((r) => admin.setHours(pin, r.weekday, r.open_time.slice(0, 5), r.close_time.slice(0, 5), r.active)));
      toast.success('Horários salvos! O site já mostra os novos horários.');
    } catch {
      toast.error('Não consegui salvar os horários. Tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  const changePin = async (e: FormEvent) => {
    e.preventDefault();
    if (newPin.length < 6) return toast.error('A nova senha precisa ter 6 caracteres ou mais.');
    if (newPin !== newPin2) return toast.error('As senhas não são iguais.');
    setChanging(true);
    try {
      const r = await admin.changePin(pin, newPin);
      if (r === 'ok') {
        savePin(newPin);
        toast.success('Senha alterada. Use a nova senha no próximo acesso.');
        setNewPin('');
        setNewPin2('');
        window.setTimeout(() => window.location.reload(), 1200);
      } else toast.error(r === 'senha_curta' ? 'A nova senha precisa ter 6 caracteres ou mais.' : 'Não foi possível trocar a senha.');
    } catch {
      toast.error('Não consegui falar com a agenda. Confira a internet.');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-5 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/10">
            <Clock className="h-4 w-4 text-brand-pinkLight" />
          </span>
          <div>
            <h3 className="font-semibold text-white">Horários de atendimento</h3>
            <p className="text-sm text-white/50">Usados para mostrar os horários livres no site.</p>
          </div>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {!rows
            ? Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="p-4 sm:px-6">
                  <Skeleton className="h-10" />
                </div>
              ))
            : rows.map((r, i) => (
                <div key={r.weekday} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5 sm:px-6">
                  <div className="flex w-36 items-center gap-3">
                    <Toggle checked={r.active} onChange={(v) => update(i, { active: v })} label={`Atender ${DAY_NAMES[r.weekday]}`} />
                    <span className={`text-sm font-medium ${r.active ? 'text-white' : 'text-white/45'}`}>{DAY_NAMES[r.weekday]}</span>
                  </div>
                  {r.active ? (
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <Input type="time" className="min-w-[96px]" value={r.open_time.slice(0, 5)} onChange={(e) => update(i, { open_time: e.target.value })} aria-label="Abre" />
                      <span className="text-sm text-white/40">às</span>
                      <Input type="time" className="min-w-[96px]" value={r.close_time.slice(0, 5)} onChange={(e) => update(i, { close_time: e.target.value })} aria-label="Fecha" />
                    </div>
                  ) : (
                    <span className="text-sm text-white/35">Fechado</span>
                  )}
                </div>
              ))}
        </div>
        <div className="border-t border-white/[0.06] p-5 sm:px-6">
          <Button variant="primary" onClick={save} loading={saving} disabled={!rows} className="w-full sm:w-auto">
            Salvar horários
          </Button>
        </div>
      </Card>

      <Card className="h-fit lg:col-span-2">
        <div className="flex items-center gap-3 border-b border-white/[0.06] p-5 sm:px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-pink/10">
            <KeyRound className="h-4 w-4 text-brand-pinkLight" />
          </span>
          <div>
            <h3 className="font-semibold text-white">Trocar senha</h3>
            <p className="text-sm text-white/50">Mínimo de 6 caracteres.</p>
          </div>
        </div>
        <form onSubmit={changePin} className="space-y-4 p-5 sm:px-6">
          <Field label="Nova senha">
            <Input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Repita a nova senha">
            <Input type="password" value={newPin2} onChange={(e) => setNewPin2(e.target.value)} autoComplete="new-password" />
          </Field>
          <Button variant="secondary" className="w-full" loading={changing}>
            Trocar senha
          </Button>
        </form>
      </Card>
    </div>
  );
};
