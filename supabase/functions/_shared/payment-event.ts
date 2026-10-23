import { type PlanOutput } from '../../../packages/shared/src/ai/plan.ts';
import { resolvePlanProduct } from '../../../packages/shared/src/payments/products.ts';
import {
  parsePaymentEvent,
  rebuildPlanContent,
  type PaymentEvent,
  type UnlockPlanItem,
} from '../../../packages/shared/src/payments/unlock.ts';

export type PaymentRow = {
  id: string;
  planId: string;
  ownerId: string;
  providerEventId: string | null;
  status: string;
};

export type UnlockStore = {
  eventAlreadyApplied: (provider: PaymentEvent['provider'], eventId: string) => Promise<boolean>;
  loadPlan: (
    planId: string,
    ownerId: string,
  ) => Promise<{
    id: string;
    ownerId: string;
    unlockedAt: string | null;
    content: PlanOutput;
    items: UnlockPlanItem[];
  } | null>;
  upsertPayment: (input: {
    event: PaymentEvent;
    status: 'succeeded' | 'refunded';
    amountCents: number;
  }) => Promise<PaymentRow>;
  writeUnlock: (input: {
    planId: string;
    productCode: string;
    unlockedAt: string | null;
    status: 'unlocked' | 'preview';
    content: PlanOutput;
  }) => Promise<void>;
};

export type ApplyPaymentResult =
  | { ok: true; replayed: boolean; unlocked: boolean }
  | { ok: false; reason: 'invalid' | 'forbidden' | 'error' };

export async function applyPaymentEvent(
  event: PaymentEvent,
  store: UnlockStore,
  nowIso: string,
): Promise<ApplyPaymentResult> {
  const parsed = parsePaymentEvent(event);
  if (!parsed) {
    return { ok: false, reason: 'invalid' };
  }
  if (await store.eventAlreadyApplied(parsed.provider, parsed.eventId)) {
    return { ok: true, replayed: true, unlocked: parsed.kind === 'purchase' };
  }

  const plan = await store.loadPlan(parsed.planId, parsed.ownerId);
  if (!plan || plan.ownerId !== parsed.ownerId) {
    return { ok: false, reason: 'forbidden' };
  }

  if (parsed.kind === 'refund') {
    await store.upsertPayment({ event: parsed, status: 'refunded', amountCents: parsed.amountCents ?? 0 });
    await store.writeUnlock({
      planId: plan.id,
      productCode: typeof parsed.productCode === 'string' ? parsed.productCode : 'plan_49',
      unlockedAt: null,
      status: 'preview',
      content: plan.content,
    });
    return { ok: true, replayed: false, unlocked: false };
  }

  const product = resolvePlanProduct({ productCode: parsed.productCode });
  if (!product) {
    return { ok: false, reason: 'invalid' };
  }
  await store.upsertPayment({
    event: parsed,
    status: 'succeeded',
    amountCents: product.amountCents,
  });
  await store.writeUnlock({
    planId: plan.id,
    productCode: product.code,
    unlockedAt: plan.unlockedAt ?? nowIso,
    status: 'unlocked',
    content: rebuildPlanContent(plan.content, plan.items),
  });
  return { ok: true, replayed: false, unlocked: true };
}

export function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= (left.charCodeAt(i) ?? 0) ^ (right.charCodeAt(i) ?? 0);
  }
  return diff === 0;
}

export function verifyRevenueCatAuth(header: string | null, secret: string): boolean {
  if (!header || !secret) {
    return false;
  }
  const expected = secret.replace(/^Bearer\s+/i, '');
  const received = header.replace(/^Bearer\s+/i, '');
  return expected.length > 0 && timingSafeEqual(received, expected);
}

export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
): Promise<boolean> {
  if (!header || !secret || secret.includes('replace_me')) {
    return false;
  }
  const parts = Object.fromEntries(
    header.split(',').map((part) => {
      const [key, ...rest] = part.split('=');
      return [key?.trim() ?? '', rest.join('=')];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) {
    return false;
  }
  const expected = await hmacSha256Hex(secret, `${timestamp}.${payload}`);
  return timingSafeEqual(expected, signature);
}

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const bytes = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message)),
  );
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
