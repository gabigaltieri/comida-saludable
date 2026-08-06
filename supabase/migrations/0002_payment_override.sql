-- Permite al admin desbloquear manualmente un pedido de MercadoPago sin pago
-- confirmado (por ejemplo: el cliente pago por transferencia/efectivo o
-- arreglo directo con el admin). Correr una sola vez en el SQL Editor de
-- Supabase. Es aditivo: no borra ni modifica datos existentes.

alter table orders
  add column if not exists payment_override_note text,
  add column if not exists payment_override_at timestamptz;
