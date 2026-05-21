// ADVERTENCIA: este rate limiter usa memoria del proceso Node.js.
// En Vercel (serverless), cada invocación puede correr en una instancia separada,
// por lo que el conteo se resetea en cada cold start y el límite es inefectivo en producción.
// Para un límite real, migrar a Upstash Redis: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
const counters = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = counters.get(key);
  if (!entry || now > entry.resetAt) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
