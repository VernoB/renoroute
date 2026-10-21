export function healthBody(): { ok: true } {
  return { ok: true };
}

export function healthResponse(): Response {
  return Response.json(healthBody());
}

if (import.meta.main) {
  const { initFunctionSentry } = await import('../_shared/sentry.ts');
  await initFunctionSentry();
  Deno.serve(() => healthResponse());
}
