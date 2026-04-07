"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Banknote, AlertCircle, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

const NIGERIAN_BANKS = [
  { code: "057", name: "Zenith Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "035", name: "Wema Bank" },
  { code: "058", name: "Guaranty Trust Bank (GTB)" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Diamond Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "076", name: "Polaris Bank" },
];

const PAYMENTS_EDGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/payments';

export default function WithdrawPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const supabase = createClient();

  const MIN_WITHDRAWAL = 1000;
  const FEE = 50;

  const nairaBalance = profile ? Math.floor(profile.points / 100) : 0;

  useEffect(() => {
    if (user) {
      fetchWithdrawals();
    }
  }, [user]);

  const fetchWithdrawals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${PAYMENTS_EDGE_URL}?userId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      
      const data = await response.json();
      if (data.withdrawals) {
        setWithdrawals(data.withdrawals);
      }
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const withdrawalAmount = parseInt(amount);

    if (withdrawalAmount < MIN_WITHDRAWAL) {
      setError(`Minimum withdrawal is ₦${MIN_WITHDRAWAL}`);
      return;
    }

    if (withdrawalAmount + FEE > nairaBalance) {
      setError("Insufficient balance");
      return;
    }

    if (accountNumber.length !== 10) {
      setError("Account number must be 10 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(PAYMENTS_EDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'withdraw',
          userId: user?.id,
          amount: withdrawalAmount,
          bankCode: selectedBank,
          accountNumber,
          accountName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Withdrawal request failed");
      }

      setSuccess(true);
      fetchWithdrawals();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a855f7]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Sign In Required</h1>
          <p className="text-[#94a3b8]">Please sign in to withdraw funds</p>
          <Button variant="primary" onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">
              Request Submitted!
            </h1>
            <p className="text-[#94a3b8]">
              Your withdrawal request is being reviewed. You'll receive your
              funds within 24-48 hours.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/wallet")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/wallet")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">Withdraw Funds</h1>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#a855f7]/20 to-[#7c3aed]/10 rounded-xl p-6 mb-8 border border-[#a855f7]/30">
        <div className="flex items-center gap-3 mb-2">
          <Wallet className="w-5 h-5 text-[#a855f7]" />
          <span className="text-[#94a3b8]">Available Balance</span>
        </div>
        <div className="text-3xl font-bold text-[#f1f5f9]">
          ₦{nairaBalance.toLocaleString()}
          <span className="text-lg text-[#94a3b8] ml-2">
            ({profile?.points?.toLocaleString()} pts)
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Withdrawal Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">
            Amount (₦)
          </label>
          <Input
            type="number"
            min={MIN_WITHDRAWAL}
            max={nairaBalance - FEE}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Minimum ₦${MIN_WITHDRAWAL}`}
            className="text-lg"
          />
          <p className="mt-1 text-xs text-[#64748b]">
            Fee: ₦{FEE} | You'll receive: ₦
            {amount ? parseInt(amount) - FEE : 0}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">
            Select Bank
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full p-3 bg-[#0d0d14] border border-[#2a2a4e] rounded-lg text-[#f1f5f9] focus:outline-none focus:border-[#a855f7]"
          >
            <option value="">Choose your bank</option>
            {NIGERIAN_BANKS.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">
            Account Number
          </label>
          <Input
            type="text"
            maxLength={10}
            value={accountNumber}
            onChange={(e) =>
              setAccountNumber(e.target.value.replace(/\D/g, ""))
            }
            placeholder="10-digit account number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#94a3b8] mb-2">
            Account Name
          </label>
          <Input
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder="Name on the account"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          disabled={
            isSubmitting ||
            !amount ||
            !selectedBank ||
            !accountNumber ||
            !accountName
          }
          className="w-full"
        >
          <Banknote className="w-5 h-5 mr-2" />
          Request Withdrawal
        </Button>
      </form>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">
            Recent Requests
          </h2>
          <div className="space-y-3">
            {withdrawals.slice(0, 5).map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 bg-[#0d0d14] rounded-lg border border-[#2a2a4e]"
              >
                <div>
                  <p className="font-medium text-[#f1f5f9]">
                    ₦{withdrawal.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#64748b]">
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    withdrawal.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : withdrawal.status === "rejected"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {withdrawal.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-[#1a1a2e] rounded-lg">
        <h3 className="text-sm font-medium text-[#f1f5f9] mb-2">
          Withdrawal Info
        </h3>
        <ul className="text-xs text-[#94a3b8] space-y-1">
          <li>• Minimum withdrawal: ₦1,000</li>
          <li>• Processing fee: ₦50 per withdrawal</li>
          <li>• Processing time: 24-48 hours</li>
          <li>• Conversion rate: 100 points = ₦1</li>
        </ul>
      </div>
    </div>
  );
}
