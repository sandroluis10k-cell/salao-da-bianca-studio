import { useEffect, useState } from 'react';
import { getServices, type ServiceRow } from './agendaApi';
import { salonConfig } from './salonConfig';

/**
 * Serviços do site, vindos do banco (o que a Bianca cadastra no painel /agenda).
 * Busca uma única vez e compartilha entre todos os componentes.
 * Enquanto carrega, ou se der erro, usa a lista do salonConfig como reserva.
 */

const DEFAULT_DURATION_MIN = 60;

export const FALLBACK_SERVICES: ServiceRow[] = salonConfig.services.map((s, i) => ({
  name: s.name,
  duration_min: DEFAULT_DURATION_MIN,
  price: s.price,
  active: true,
  sort: i,
  description: s.description ?? '',
}));

let cache: ServiceRow[] | null = null;
let request: Promise<ServiceRow[]> | null = null;

const load = () => {
  if (!request) {
    request = getServices()
      .then((rows) => {
        const list = rows
          .filter((s) => s.active !== false)
          .map((s) => ({ ...s, price: Number(s.price), duration_min: Number(s.duration_min) || DEFAULT_DURATION_MIN, description: s.description ?? '' }));
        // banco vazio: mantém a lista de reserva para o site não ficar sem serviços
        cache = list.length ? list : FALLBACK_SERVICES;
        return cache;
      })
      .catch((e) => {
        request = null; // tenta de novo na próxima vez que alguém precisar
        throw e;
      });
  }
  return request;
};

export const useServices = (): ServiceRow[] => {
  const [services, setServices] = useState<ServiceRow[]>(cache ?? FALLBACK_SERVICES);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    load()
      .then((list) => alive && setServices(list))
      .catch(() => {
        /* fica com a lista de reserva */
      });
    return () => {
      alive = false;
    };
  }, []);
  return services;
};
