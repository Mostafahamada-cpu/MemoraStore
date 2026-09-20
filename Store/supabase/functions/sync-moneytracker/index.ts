// Supabase Edge Function: sync-moneytracker
//
// Bridges the Memora admin dashboard (a static site, no server of its own)
// to the Money Tracker webhook. The dashboard cannot hold the webhook secret
// - anything in the browser is public - so it calls this function with the
// admin's Supabase session, and this function, which does hold the secret,
// forwards the order to Money Tracker.
//
//   admin.js  --(supabase.functions.invoke, admin JWT)-->  this function
//   this function  --(Bearer MONEYTRACKER_WEBHOOK_SECRET)-->  Money Tracker
//
// Deployed with --no-verify-jwt so the request reaches us; the session is
// then checked explicitly below (auth.getUser) and anything unauthenticated
// gets a 401. This is also what makes a stolen anon key useless here: the
// anon key alone is not a signed-in user.
//
// Secrets (set with `supabase secrets set`):
//   MONEYTRACKER_WEBHOOK_URL     https://<money-tracker>/api/webhooks/memora
//   MONEYTRACKER_WEBHOOK_SECRET  same value as MEMORA_WEBHOOK_SECRET there
// SUPABASE_URL and SUPABASE_ANON_KEY are injected by the platform.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface OrderPayload {
  orderId: string;
  customerName?: string | null;
  purchasedProduct?: string | null;
  productCategory?: string | null;
  totalAmount: number | string;
  paymentMethod?: string | null;
  paidAt?: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  // 1. The caller must be a signed-in Memora admin.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ ok: false, error: "Not signed in" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return json({ ok: false, error: "Not signed in" }, 401);

  // 2. Secrets must be configured, otherwise there is nothing to call.
  const webhookUrl = Deno.env.get("MONEYTRACKER_WEBHOOK_URL");
  const webhookSecret = Deno.env.get("MONEYTRACKER_WEBHOOK_SECRET");
  if (!webhookUrl || !webhookSecret) {
    return json(
      { ok: false, error: "Money Tracker secrets are not configured on the Edge Function" },
      500,
    );
  }

  // 3. Minimal shape check; Money Tracker validates the rest.
  let order: OrderPayload;
  try {
    order = await req.json();
  } catch {
    return json({ ok: false, error: "Body must be JSON" }, 400);
  }
  if (!order || typeof order.orderId !== "string" || !order.orderId) {
    return json({ ok: false, error: "orderId is required" }, 400);
  }

  // 4. Forward to Money Tracker and relay its answer verbatim.
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify({
        orderId: order.orderId,
        customerName: order.customerName ?? null,
        purchasedProduct: order.purchasedProduct ?? null,
        productCategory: order.productCategory ?? null,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod ?? null,
        paidAt: order.paidAt ?? new Date().toISOString(),
      }),
    });

    const text = await response.text();
    let result: Record<string, unknown>;
    try {
      result = JSON.parse(text);
    } catch {
      result = { ok: false, error: `Money Tracker returned ${response.status}: ${text.slice(0, 200)}` };
    }

    // Relay non-2xx as a failure so admin.js can mark the order "failed".
    return json(result, response.ok ? 200 : response.status);
  } catch (error) {
    return json(
      { ok: false, error: `Could not reach Money Tracker: ${error instanceof Error ? error.message : String(error)}` },
      502,
    );
  }
});
