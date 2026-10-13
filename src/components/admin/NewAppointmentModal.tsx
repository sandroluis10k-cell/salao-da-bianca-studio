import { useEffect, useState, type FormEvent } from 'react';
import { formatCurrency } from '../../salonConfig';
import { admin, todayKey, toDate } from '../../agendaApi';
import { useAdmin } from './context';
import { Button, Field, Input, Modal, Select, useToast } from './ui';
import { moneyInput, parseMoney, relativeDay } from './utils';

const OTHER = '__outro__';

const RESULT: Record<string, string> = {
  senha_incorreta: 'Sua sessão expirou. Entre de novo com a sua senha.',
  duracao_invalida: 'Confira a duração do atendimento.',
  nome_invalido: 'Confira o nome da cliente.',
  horario_ocupado: 'Já existe um atendimento ou bloqueio nesse horário. Escolha outro horário.',
};

/** Próxima meia hora cheia, no horário de Brasília */
const nextHalfHour = () => {
  const now = new Date(Date.now() + 30 * 60_000);
  const hm = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const [h, m] = hm.split(':').map(Number);
  return `${String(h).padStart(2, '0')}:${m < 30 ? '00' : '30'}`;
};

/** Lançar atendimento feito por fora do site (WhatsApp, balcão) */
export const NewAppointmentModal = ({ day, onClose }: { day?: string; onClose: () => void }) => {
  const { pin, services, reload, logout, go } = useAdmin();
  const toast = useToast();
  const [service, setService] = useState(services[0]?.name ?? OTHER);
  const [custom, setCustom] = useState('');
  const [date, setDate] = useState(day && day >= todayKey() ? day : todayKey());
  const [time, setTime] = useState(nextHalfHour);
  const [duration, setDuration] = useState(String(services[0]?.duration_min ?? 60));
  const [price, setPrice] = useState(services[0] ? moneyInput(services[0].price) : '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // serviços podem chegar depois que o modal abriu
  useEffect(() => {
    if (service === OTHER && services.length && !custom && !price) pick(services[0].name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  const pick = (v: string) => {
    setService(v);
    const s = services.find((x) => x.name === v);
    if (s) {
      setDuration(String(s.duration_min));
      setPrice(moneyInput(s.price));
    }
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    setErr('');
    const svc = service === OTHER ? custom.trim() : service;
    const dur = Number(duration);
    const value = parseMoney(price);
    const digits = phone.replace(/\D/g, '');
    if (!svc) return setErr('Informe o serviço.');
    if (!date || !/^\d{2}:\d{2}$/.test(time)) return setErr('Informe a data e a hora.');
    if (!Number.isInteger(dur) || dur < 5 || dur > 720) return setErr('A duração precisa estar entre 5 e 720 minutos.');
    if (value === null) return setErr('Digite um valor válido, por exemplo 80,00.');
    if (name.trim().length < 2) return setErr('Informe o nome da cliente.');
    if (digits && (digits.length < 10 || digits.length > 13)) return setErr('Confira o WhatsApp: use DDD + número.');

    setBusy(true);
    try {
      const r = await admin.createAppointment(pin, {
        service: svc,
        start: toDate(date, time),
        durationMin: dur,
        name: name.trim(),
        phone: digits,
        price: value,
      });
      if (r === 'ok') {
        toast.success(`Atendimento de ${name.trim()} lançado: ${relativeDay(date).toLowerCase()} às ${time}, ${formatCurrency(value)}.`);
        await reload();
        go('agenda', date);
        onClose();
      } else if (r === 'senha_incorreta') {
        toast.error(RESULT[r]);
        logout();
      } else setErr(RESULT[r] ?? 'Não foi possível salvar. Tente de novo.');
    } catch {
      setErr('Não consegui falar com a agenda. Confira a internet e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Novo atendimento"
      subtitle="Para horários marcados pelo WhatsApp ou no salão."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => submit()} loading={busy}>
            Salvar atendimento
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-2 gap-x-3 gap-y-4">
        <div className="col-span-2">
          <Field label="Serviço">
            <Select value={service} onChange={(e) => pick(e.target.value)}>
              {services.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} · {formatCurrency(Number(s.price))}
                </option>
              ))}
              <option value={OTHER}>Outro…</option>
            </Select>
          </Field>
        </div>
        {service === OTHER && (
          <div className="col-span-2">
            <Field label="Nome do serviço">
              <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Ex.: Corte, Penteado…" autoFocus />
            </Field>
          </div>
        )}
        <Field label="Data">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Hora">
          <Input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field label="Duração (min)">
          <Input type="number" inputMode="numeric" min={5} max={720} step={5} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Field>
        <Field label="Valor (R$)">
          <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
        </Field>
        <div className="col-span-2">
          <Field label="Nome da cliente">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" placeholder="Nome e sobrenome" />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="WhatsApp" hint="Com DDD. Opcional, mas ajuda a agrupar a cliente e mandar mensagem.">
            <Input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(62) 99999-9999" />
          </Field>
        </div>
        {err && <p className="col-span-2 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{err}</p>}
        <button type="submit" className="hidden" />
      </form>
    </Modal>
  );
};
