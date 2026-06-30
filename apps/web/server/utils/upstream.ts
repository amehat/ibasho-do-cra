// Propage le statut HTTP de l'API au lieu d'une 500 opaque.
export function upstreamError(err: unknown): never {
  const status = (err as { response?: { status?: number } })?.response?.status ?? 502;
  throw createError({ statusCode: status, statusMessage: "Échec de l'appel à l'API" });
}
