import { createClient } from "@/lib/supabase/server";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default async function AdminWithdrawalsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const supabase = await createClient();

  // Fetch all withdrawal requests
  const { data: withdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*, profiles:user_id(id, username, email)")
    .order("created_at", { ascending: false });

  // Fetch specific withdrawal if ID provided
  let selectedWithdrawal = null;
  if (searchParams.id) {
    const { data } = await supabase
      .from("withdrawal_requests")
      .select("*, profiles:user_id(id, username, email)")
      .eq("id", searchParams.id)
      .single();
    selectedWithdrawal = data;
  }

  const pendingCount = withdrawals?.filter((w) => w.status === "pending").length || 0;
  const completedCount = withdrawals?.filter((w) => w.status === "completed").length || 0;
  const rejectedCount = withdrawals?.filter((w) => w.status === "rejected").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#f1f5f9]">Withdrawal Management</h1>
        <p className="text-[#94a3b8] mt-1">Review and process withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
              <p className="text-sm text-[#94a3b8]">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-green-400">{completedCount}</p>
              <p className="text-sm text-[#94a3b8]">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-400">{rejectedCount}</p>
              <p className="text-sm text-[#94a3b8]">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Withdrawal Detail */}
      {selectedWithdrawal && (
        <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">
            Withdrawal #{selectedWithdrawal.id.slice(0, 8)}
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-[#64748b]">User</p>
              <p className="font-medium text-[#f1f5f9]">
                {selectedWithdrawal.profiles?.username || "Unknown"}
              </p>
              <p className="text-sm text-[#64748b]">
                {selectedWithdrawal.profiles?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#64748b]">Amount</p>
              <p className="text-2xl font-bold text-[#f1f5f9]">
                ₦{selectedWithdrawal.amount.toLocaleString()}
              </p>
              <p className="text-sm text-[#64748b]">
                Fee: ₦{selectedWithdrawal.fee} • User receives: ₦
                {selectedWithdrawal.amount - selectedWithdrawal.fee}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#64748b]">Bank</p>
              <p className="font-medium text-[#f1f5f9]">
                {selectedWithdrawal.account_name}
              </p>
              <p className="text-sm text-[#64748b]">
                {selectedWithdrawal.bank_code} • {selectedWithdrawal.account_number}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#64748b]">Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  selectedWithdrawal.status === "completed"
                    ? "bg-green-500/20 text-green-400"
                    : selectedWithdrawal.status === "rejected"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {selectedWithdrawal.status}
              </span>
            </div>
          </div>

          {selectedWithdrawal.status === "pending" && (
            <form action="/api/admin/withdrawals/process" method="POST" className="flex gap-4">
              <input type="hidden" name="id" value={selectedWithdrawal.id} />
              <input type="hidden" name="action" value="approve" />
              <button
                type="submit"
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                Approve & Process
              </button>
              <button
                type="submit"
                formaction="/api/admin/withdrawals/process?action=reject"
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Reject
              </button>
            </form>
          )}
        </div>
      )}

      {/* Withdrawals List */}
      <div className="bg-[#0d0d14] border border-[#2a2a4e] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#2a2a4e]">
          <h2 className="text-lg font-semibold text-[#f1f5f9]">
            All Withdrawals
          </h2>
        </div>
        <div className="divide-y divide-[#2a2a4e]">
          {withdrawals?.map((withdrawal) => (
            <a
              key={withdrawal.id}
              href={`/admin/withdrawals?id=${withdrawal.id}`}
              className={`p-4 flex items-center justify-between hover:bg-[#1a1a2e] transition-colors ${
                selectedWithdrawal?.id === withdrawal.id ? "bg-[#1a1a2e]" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    withdrawal.status === "completed"
                      ? "bg-green-500/20"
                      : withdrawal.status === "rejected"
                      ? "bg-red-500/20"
                      : "bg-yellow-500/20"
                  }`}
                >
                  {withdrawal.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : withdrawal.status === "rejected" ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#f1f5f9]">
                    ₦{withdrawal.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#64748b]">
                    {withdrawal.profiles?.username || "Unknown"} • {" "}
                    {new Date(withdrawal.created_at).toLocaleDateString()}
                  </p>
                </div>
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
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
