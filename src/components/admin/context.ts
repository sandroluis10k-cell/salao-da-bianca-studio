import { createContext, useContext } from 'react';
import type { Appointment, Block, ServiceRow } from '../../agendaApi';

export type Page = 'inicio' | 'agenda' | 'faturamento' | 'clientes' | 'servicos' | 'bloqueios' | 'config';

export interface AdminData {
  pin: string;
  /** null enquanto carrega pela primeira vez */
  appts: Appointment[] | null;
  blocks: Block[] | null;
  /** todos os serviços, inclusive os ocultos, na ordem do site */
  services: ServiceRow[];
  reloadServices: () => Promise<void>;
  loading: boolean;
  lastUpdate: Date | null;
  reload: () => Promise<void>;
  /** abre o modal "Novo atendimento" (opcionalmente já no dia escolhido) */
  openNew: (day?: string) => void;
  go: (p: Page, day?: string) => void;
  /** valor do atendimento (usa o preço do serviço se não tiver valor salvo) */
  price: (a: Appointment) => number;
  /** a sessão caiu (senha trocada em outro aparelho, etc.) */
  logout: () => void;
}

export const AdminCtx = createContext<AdminData>(null as unknown as AdminData);
export const useAdmin = () => useContext(AdminCtx);
