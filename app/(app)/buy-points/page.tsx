"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, CreditCard, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

const POINT_PACKAGES = [
  { id: "basic", points: 1000, price: 500, name: "Starter Pack", popular: false },
  { id: "pro", points: 2500, price: 1000, name: "Pro Pack", popular: true },
  { id: "elite", points: 6000, price: 2000, name: "Elite Pack", popular: false },
  { id: "legend", points: 15000, price: 4500, name: "Legend Pack", popular: false },
];

const PAYMENTS_EDGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1/payments';

export default function BuyPointsPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(POINT_PACKAGES[1]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handlePurchase = async () => {
    if (!user || !profile) {
      setError("Please sign in to purchase points");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Initialize payment via Edge Function
      const response = await fetch(PAYMENTS_EDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'initialize',
          userId: user.id,
          amount: selectedPackage.price,
          email: user.email,
          metadata: {
            points: selectedPackage.points,
            package: selectedPackage.name,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment initialization failed");
      }

      // Redirect to Paystack checkout
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setIsProcessing(false);
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
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#f1f5f9]">Sign In Required</h1>
          <p className="text-[#94a3b8]">Please sign in to purchase points</p>
          <Button variant="primary" onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#a855f7]/20 mb-4">
          <Coins className="w-8 h-8 text-[#a855f7]" />
        </div>
        <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Buy Points</h1>
        <p className="text-[#94a3b8] max-w-lg mx-auto">
          Purchase points to wager on matches and enter tournaments. 
          The more you buy, the better the value!
        </p>
        
        {profile && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a2e] rounded-lg">
            <span className="text-[#94a3b8]">Current Balance:</span>
            <span className="font-semibold text-[#f1f5f9]">
              {profile.points?.toLocaleString()} pts
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {POINT_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg)}
            className={`relative p-6 rounded-xl border-2 transition-all text-left ${
              selectedPackage.id === pkg.id
                ? "border-[#a855f7] bg-[#a855f7]/10"
                : "border-[#2a2a4e] hover:border-[#4a4a6e]"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#a855f7] text-white text-xs font-medium rounded-full">
                Most Popular
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#a855f7]" />
                <span className="font-semibold text-[#f1f5f9]">{pkg.name}</span>
              </div>
              
              <div className="text-3xl font-bold text-[#f1f5f9]">
                {pkg.points.toLocaleString()}
                <span className="text-lg text-[#94a3b8]"> pts</span>
              </div>
              
              <div className="text-lg text-[#94a3b8]">
                ₦{pkg.price.toLocaleString()}
              </div>
              
              <div className="text-xs text-[#64748b]">
                {Math.round(pkg.points / pkg.price)} points per ₦1
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Order Summary</h2>
        
        <div className="space-y-3">
          <div className="flex justify-between text-[#94a3b8]">
            <span>Package</span>
            <span className="text-[#f1f5f9]">{selectedPackage.name}</span>
          </div>
          <div className="flex justify-between text-[#94a3b8]">
            <span>Points</span>
            <span className="text-[#f1f5f9]">{selectedPackage.points.toLocaleString()} pts</span>
          </div>
          <div className="border-t border-[#2a2a4e] pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-[#f1f5f9]">Total</span>
              <span className="text-lg font-semibold text-[#a855f7]">
                ₦{selectedPackage.price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          "Instant delivery",
          "Secure payment",
          "24/7 support",
        ].map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-[#94a3b8]">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>

      {/* Pay Button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handlePurchase}
        isLoading={isProcessing}
        disabled={isProcessing}
        className="w-full gap-2"
      >
        <CreditCard className="w-5 h-5" />
        Pay ₦{selectedPackage.price.toLocaleString()}
      </Button>

      <p className="mt-4 text-center text-xs text-[#64748b]">
        Secured by Paystack. By purchasing, you agree to our Terms of Service.
      </p>
    </div>
  );
}
