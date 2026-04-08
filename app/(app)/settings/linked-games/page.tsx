import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Gamepad2, Plus, ExternalLink } from "lucide-react";

export default async function LinkedGamesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: linkedGames } = await supabase
    .from("linked_games")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Linked Games</h1>
          <p className="text-[#94a3b8]">Connect your game accounts to track stats</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#a855f7] text-white rounded-xl hover:bg-[#c084fc] transition-colors font-medium">
          <Plus className="w-4 h-4" />
          Link Game
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {linkedGames && linkedGames.length > 0 ? (
          linkedGames.map((game) => (
            <div key={game.id} className="bg-[#0d0d14] border border-[#2a2a4e] rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#16213e] rounded-xl flex items-center justify-center text-xl">
                   🎮
                </div>
                <div>
                  <h3 className="font-semibold text-[#f1f5f9]">{game.display_name}</h3>
                  <p className="text-sm text-[#64748b]">{game.game_id} • {game.platform}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#64748b]" />
            </div>
          ))
        ) : (
          <div className="md:col-span-2 bg-[#0d0d14] border border-[#2a2a4e] border-dashed rounded-2xl p-12 text-center">
            <p className="text-[#64748b]">No games linked yet.</p>
            <p className="text-sm text-[#4a4a6a] mt-1">Connect your accounts to start competing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
