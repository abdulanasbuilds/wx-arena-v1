// Supabase Edge Function: Payment Processing
// Handles Paystack payments securely on the server

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
const PAYSTACK_API = "https://api.paystack.co";

serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { action } = await req.json();

    if (action === "initialize") {
      const { userId, amount, email, metadata } = await req.json();

      if (!userId || !amount || !email) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers }
        );
      }

      // Generate unique reference
      const reference = `wx_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Initialize transaction with Paystack
      const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo/cents
          reference,
          callback_url: `${Deno.env.get("PUBLIC_APP_URL")}/wallet/verify/`,
          metadata: {
            user_id: userId,
            points: metadata?.points || 0,
            package: metadata?.package || "",
          },
        }),
      });

      const data = await response.json();

      if (!data.status) {
        return new Response(
          JSON.stringify({ error: data.message || "Payment initialization failed" }),
          { status: 400, headers }
        );
      }

      // Store pending transaction
      await supabaseClient.from("wallet_transactions").insert({
        user_id: userId,
        type: "purchased",
        amount: metadata?.points || 0,
        description: `Points purchase - ₦${amount}`,
        reference_type: "paystack",
        reference_id: reference,
        status: "pending",
      });

      return new Response(
        JSON.stringify({
          authorization_url: data.data.authorization_url,
          reference: data.data.reference,
        }),
        { headers }
      );
    }

    if (action === "verify") {
      const { reference } = await req.json();

      if (!reference) {
        return new Response(
          JSON.stringify({ error: "Transaction reference required" }),
          { status: 400, headers }
        );
      }

      // Verify transaction with Paystack
      const response = await fetch(
        `${PAYSTACK_API}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET}`,
          },
        }
      );

      const data = await response.json();

      if (!data.status || data.data.status !== "success") {
        return new Response(
          JSON.stringify({
            error: "Payment verification failed",
            status: data.data?.status,
          }),
          { status: 400, headers }
        );
      }

      // Get transaction details
      const { data: transaction } = await supabaseClient
        .from("wallet_transactions")
        .select("*")
        .eq("reference_id", reference)
        .single();

      if (!transaction || transaction.status === "completed") {
        return new Response(
          JSON.stringify({ error: "Transaction not found or already processed" }),
          { status: 400, headers }
        );
      }

      const userId = transaction.user_id;
      const points = transaction.amount;

      // Credit points to user
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single();

      if (profile) {
        await supabaseClient
          .from("profiles")
          .update({ points: profile.points + points })
          .eq("id", userId);

        // Update transaction status
        await supabaseClient
          .from("wallet_transactions")
          .update({
            status: "completed",
            description: `Points purchase - ${points} points credited`,
          })
          .eq("reference_id", reference);

        return new Response(
          JSON.stringify({
            success: true,
            message: `${points} points credited successfully`,
            newBalance: profile.points + points,
          }),
          { headers }
        );
      }

      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers,
      });
    }

    if (action === "withdraw") {
      const MINIMUM_WITHDRAWAL = 1000; // ₦1000
      const WITHDRAWAL_FEE = 50; // ₦50

      const { userId, amount, bankCode, accountNumber, accountName } = await req.json();

      if (!userId || !amount || !bankCode || !accountNumber || !accountName) {
        return new Response(
          JSON.stringify({ error: "All fields are required" }),
          { status: 400, headers }
        );
      }

      if (amount < MINIMUM_WITHDRAWAL) {
        return new Response(
          JSON.stringify({ error: `Minimum withdrawal is ₦${MINIMUM_WITHDRAWAL}` }),
          { status: 400, headers }
        );
      }

      // Check user balance
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("points")
        .eq("id", userId)
        .single();

      if (!profile) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers,
        });
      }

      const nairaValue = Math.floor(profile.points / 100);

      if (nairaValue < amount + WITHDRAWAL_FEE) {
        return new Response(
          JSON.stringify({ error: "Insufficient balance" }),
          { status: 400, headers }
        );
      }

      const pointsToDeduct = (amount + WITHDRAWAL_FEE) * 100;

      // Create withdrawal request
      const { data: withdrawal, error: withdrawalError } = await supabaseClient
        .from("withdrawal_requests")
        .insert({
          user_id: userId,
          amount: amount,
          fee: WITHDRAWAL_FEE,
          total_deducted: amount + WITHDRAWAL_FEE,
          points_deducted: pointsToDeduct,
          bank_code: bankCode,
          account_number: accountNumber,
          account_name: accountName,
          status: "pending",
        })
        .select()
        .single();

      if (withdrawalError) {
        return new Response(
          JSON.stringify({ error: "Failed to create withdrawal request" }),
          { status: 500, headers }
        );
      }

      // Deduct points immediately
      await supabaseClient
        .from("profiles")
        .update({ points: profile.points - pointsToDeduct })
        .eq("id", userId);

      // Log transaction
      await supabaseClient.from("wallet_transactions").insert({
        user_id: userId,
        type: "withdrawal",
        amount: -pointsToDeduct,
        description: `Withdrawal request #${withdrawal.id} - ₦${amount}`,
        reference_type: "withdrawal",
        reference_id: withdrawal.id,
        status: "pending",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Withdrawal request submitted for review",
          requestId: withdrawal.id,
          estimatedTime: "24-48 hours",
        }),
        { headers }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers,
    });
  }

  // Handle GET requests for fetching withdrawals
  if (req.method === "GET") {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID required" }),
        { status: 400, headers }
      );
    }

    try {
      const { data: withdrawals, error } = await supabaseClient
        .from("withdrawal_requests")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch withdrawals" }),
          { status: 500, headers }
        );
      }

      return new Response(JSON.stringify({ withdrawals }), { headers });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers,
  });
});
