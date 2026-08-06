-- Tracking real de pagos de MercadoPago + auditoria de pedidos.
-- Correr una sola vez en el SQL Editor de Supabase (Project > SQL Editor > New query).
-- Es aditivo: no borra ni modifica datos existentes.

alter table orders
  add column if not exists mp_payment_id text,
  add column if not exists mp_payment_status text,
  add column if not exists payment_checked_at timestamptz;

create index if not exists orders_mp_payment_id_idx on orders (mp_payment_id);

create table if not exists order_events (
  id bigserial primary key,
  order_id bigint references orders(id) on delete set null,
  order_number text not null,
  event_type text not null,
  detail jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_number_idx on order_events (order_number);
create index if not exists order_events_created_at_idx on order_events (created_at desc);

alter table order_events enable row level security;

create policy "service role full access to order_events"
  on order_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- service_role bypasea RLS pero igual necesita el GRANT de tabla base
-- (RLS y privilegios de Postgres son cosas distintas). Sin esto, todos los
-- INSERT desde el servidor fallan en silencio (el codigo nunca deja que un
-- error de auditoria tumbe el webhook, asi que no se nota salvo consultando).
grant all on table order_events to service_role;
grant usage, select on sequence order_events_id_seq to service_role;
