/**
 * Cloudflare D1 utilities
 */

export async function executeQuery<T>(
  db: D1Database,
  query: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await db.prepare(query).bind(...(params || [])).all();
  return result.results as T[];
}

export async function executeUpdate(
  db: D1Database,
  query: string,
  params?: unknown[]
): Promise<number> {
  const result = await db.prepare(query).bind(...(params || [])).run();
  return result.meta.changes;
}
