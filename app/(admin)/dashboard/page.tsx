import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  Trophy, 
  Wallet, 
  Swords, 
  TrendingUp, 
  AlertCircle 
} from "lucide-react";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch statistics
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: totalMatches } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true });

  const { count: activeTournaments } = await supabase
    .from("tournaments")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress");

  const { count: pendingWithdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Fetch recent activity
  const { data: recentTransactions } = await supabase
    .from("wallet_transactions")
    .select("*, profiles:user_id(username)")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: pendingWithdrawalRequests } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles:user_id(username)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { 
      label: "Total Users", 
      value: totalUsers || 0, 
      icon: Users,
      trend: "+12%",
      color: "blue"
    },
    { 
      label: "Total Matches", 
      value: totalMatches || 0, 
      icon: Swords,
      trend: "+8%",
      color: "purple"
    },
    { 
      label: "Active Tournaments", 
      value: activeTournaments || 0, 
      icon: Trophy,
      trend: "+3",
      color: "green"
    },
    { 
      label: "Pending Withdrawals", 
      value: pendingWithdrawals || 0, 
      icon: Wallet,
      trend: "Action needed",
      trendType: "warning",
      color: "orange"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#f1f5f9]">Admin Dashboard</h1>
        <p className="text-[#94a3b8] mt-1">Overview of platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#64748b] text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-[#f1f5f9] mt-2">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${stat.trendType === 'warning' ? 'text-orange-500' : 'text-green-500'}`} />
              <span className={`text-sm ${stat.trendType === 'warning' ? 'text-orange-500' : 'text-green-500'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Withdrawals Alert */}
      {pendingWithdrawalRequests && pendingWithdrawalRequests.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            <h2 className="text-lg font-semibold text-orange-400">
              Pending Withdrawals ({pendingWithdrawalRequests.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingWithdrawalRequests.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg"
              >
                <div>
                  <p className="font-medium text-[#f1f5f9]">
                    ₦{withdrawal.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#64748b]">
                    {withdrawal.profiles?.username || "Unknown"} • {" "}
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin/withdrawals?id=${withdrawal.id}`}
                    className="px-4 py-2 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Review
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2a4e]">
          <h2 className="text-lg font-semibold text-[#f1f5f9]">
            Recent Transactions
          </h2>
        </div>
        <div className="divide-y divide-[#2a2a4e]">
          {recentTransactions?.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 flex items-center justify-between hover:bg-[#1a1a2e] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "earned" || transaction.type === "purchased"
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {transaction.type === "earned" || transaction.type === "purchased" ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <Wallet className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#f1f5f9]">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-[#64748b]">
                    {transaction.profiles?.username || "Unknown"} • {" "}
                    {new Date(transaction.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div
                className={`font-semibold ${
                  transaction.type === "earned" || transaction.type === "purchased"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {transaction.type === "earned" || transaction.type === "purchased"
                  ? "+"
                  : "-"}
                {Math.abs(transaction.amount).toLocaleString()} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/admin/tournaments/create"
          className="p-6 bg-[#0d0d14] border border-[#2a2a4e] rounded-xl hover:border-[#a855f7] transition-colors"
        >
          <Trophy className="w-8 h-8 text-[#a855f7] mb-4" />
          <h3 className="font-semibold text-[#f1f5f9]">Create Tournament</h3>
          <p className="text-sm text-[#64748b] mt-1">
            Set up a new tournament with prizes
          </p>
        </a>
        <a
          href="/admin/users"
          className="p-6 bg-[#0d0d14] border border-[#2a2a4e] rounded-xl hover:border-[#a855f7] transition-colors"
        >
          <Users className="w-8 h-8 text-[#a855f7] mb-4" />
          <h3 className="font-semibold text-[#f1f5f9]">Manage Users</h3>
          <p className="text-sm text-[#64748b] mt-1">
            View and manage user accounts
          </p>
        </a>
        <a
          href="/admin/disputes"
          className="p-6 bg-[#0d0d14] border border-[#2a2a4e] rounded-xl hover:border-[#a855f7] transition-colors"
        >
          <AlertCircle className="w-8 h-8 text-[#a855f7] mb-4" />
          <h3 className="font-semibold text-[#f1f5f9]">Resolve Disputes</h3>
          <p className="text-sm text-[#64748b] mt-1">
            Review and settle match disputes
          </p>
        </a>
      </div>
    </div>
  );
}
