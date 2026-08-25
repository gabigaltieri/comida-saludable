-- Guarda el costo de envío de cada pedido como campo separado, para poder
-- mostrarlo desglosado del total en el panel de admin. Correr una sola vez
-- en el SQL Editor de Supabase. Es aditivo: no borra ni modifica datos
-- existentes (los pedidos previos quedan con costo_envio = 0).

alter table orders
  add column if not exists costo_envio numeric not null default 0;
