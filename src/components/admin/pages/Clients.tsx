import { useMemo, useState } from 'react';
import { MessageCircle, Search, Users } from 'lucide-react';
import { formatCurrency } from '../../../salonConfig';
import { dayKeyOf } from '../../../agendaApi';
import { useAdmin } from '../context';
import { EmptyState, Input, LinkButton, Segmented, Skeleton } from '../ui';
import { fmtDateShort, fmtPhone, phoneKey, relativeDay, waClient } from '../utils';

type Sort = 'visitas' | 'gasto' | 'recente';
type Client = { key: string; name: string; phone: string; visits: number; spent: number; last: string | null; next: string | null; lastSeen: string };

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const Clients = () => {
  const { appts, price } = useAdmin();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('recente');

  const clients = useMemo(() => {
    if (!appts) return null;
    const now = Date.now();
    const map = new Map<string, Client>();
    [...appts]
      .sort((a, b) => a.start_at.localeCompare(b.start_at))
      .forEach((a) => {
        const key = phoneKey(a.client_phone) || `nome:${normalize(a.client_name.trim())}`;
        const c = map.get(key) ?? { key, name: a.client_name, phone: a.client_phone, visits: 0, spent: 0, last: null, next: null, lastSeen: a.start_at };
        c.name = a.client_name; // nome mais recente
        c.lastSeen = a.start_at;
        if (a.client_phone) c.phone = a.client_phone;
        const past = new Date(a.start_at).getTime() <= now;
        // visita = atendimento concluído ou confirmado que já aconteceu
        if (a.status === 'concluido' || (a.status === 'confirmado' && past)) {
          c.visits += 1;
          c.spent += price(a);
          c.last = a.start_at;
        } else if (a.status === 'confirmado' && !past && !c.next) c.next = a.start_at;
        map.set(key, c);
      });
    return [...map.values()];
  }, [appts, price]);

  const list = useMemo(() => {
    if (!clients) return [];
    const t = normalize(q.trim());
    const digits = q.replace(/\D/g, '');
    const out = clients.filter((c) => !t || normalize(c.name).includes(t) || (digits.length >= 2 && phoneKey(c.phone).includes(digits)));
    return out.sort((a, b) =>
      sort === 'visitas' ? b.visits - a.visits || b.spent - a.spent : sort === 'gasto' ? b.spent - a.spent : (b.last ?? b.lastSeen).localeCompare(a.last ?? a.lastSeen)
    );
  }, [clients, q, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou telefone" className="pl-10" type="search" />
        </div>
        <Segmented<Sort>
          value={sort}
          onChange={setSort}
          options={[
            { value: 'recente', label: 'Mais recente' },
            { value: 'visitas', label: 'Mais visitas' },
            { value: 'gasto', label: 'Maior gasto' },
          ]}
        />
      </div>

      {clients && <p className="text-sm text-white/45">{list.length} cliente{list.length === 1 ? '' : 's'}</p>}

      {!clients ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[76px]" />
          ))}
        </div>
      ) : list.length ? (
        <ul className="divide-y divide-white/[0.05] overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01]">
          {list.map((c) => (
            <li key={c.key} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-white/[0.02]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-pink/25 to-brand-roseGold/15 text-sm font-semibold text-brand-pinkLight">
                {initials(c.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{c.name}</p>
                <p className="truncate text-xs text-white/45">{c.phone ? fmtPhone(c.phone) : 'Sem telefone'}</p>
                <p className="truncate text-xs text-white/35">
                  {c.last ? `Última visita ${fmtDateShort(dayKeyOf(c.last))}` : 'Ainda sem visitas'}
                  {c.next ? ` · próxima ${relativeDay(dayKeyOf(c.next)).toLowerCase()}` : ''}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-white">{formatCurrency(c.spent)}</p>
                <p className="text-xs text-white/45">
                  {c.visits} visita{c.visits === 1 ? '' : 's'}
                </p>
              </div>
              {c.phone ? (
                <LinkButton variant="whatsapp" size="icon" href={waClient(c.phone)} label={`WhatsApp de ${c.name}`}>
                  <MessageCircle className="h-4 w-4" />
                </LinkButton>
              ) : (
                <span className="w-10" />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Users}
          title={q ? 'Nenhuma cliente encontrada' : 'Ainda sem clientes'}
          text={q ? 'Confira o nome ou o número digitado.' : 'As clientes aparecem aqui conforme os atendimentos forem marcados.'}
        />
      )}
    </div>
  );
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
