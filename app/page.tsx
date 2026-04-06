import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { GameCard } from "@/components/features/GameCard";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { TestimonialCard } from "@/components/landing/TestimonialCard";
import { Button } from "@/components/ui/Button";
import { GAMES } from "@/lib/utils/constants";
import { Swords, Trophy, Wallet, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="fade-up">
      {/* Hero Section */}
      <Hero />

      {/* Games Section */}
      <section className="py-16 md:py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9] mb-4">
              Choose Your <span className="gradient-text">Battle</span>
            </h2>
            <p className="text-[#94a3b8] max-w-xl mx-auto">
              Compete in 1v1 matches, tournaments, and squad battles across your favorite games.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {GAMES.map((game) => (
              <Link
                key={game.id}
                href={`/matches?game=${game.id}`}
                className="block"
              >
                <GameCard game={game} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9] mb-4">
              Why Choose <span className="gradient-text">WX Arena?</span>
            </h2>
            <p className="text-[#94a3b8] max-w-xl mx-auto">
              Everything you need to compete, win, and earn rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Swords}
              title="Skill-Based Matches"
              description="Compete in fair 1v1 battles and squad matches. Matchmaking based on your skill level ensures balanced competition."
              delay={0}
            />
            <FeatureCard
              icon={Trophy}
              title="Daily Tournaments"
              description="Join free and paid tournaments with massive prize pools. Climb the ranks and prove you're the best."
              delay={0.1}
            />
            <FeatureCard
              icon={Wallet}
              title="Win Real Rewards"
              description="Earn points for every win, redeem for prizes, or withdraw to your preferred payment method."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9] mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#a855f7]">1</span>
              </div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Create Account</h3>
              <p className="text-sm text-[#94a3b8]">
                Sign up in seconds. Link your gaming accounts and set up your profile.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#a855f7]">2</span>
              </div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Find Matches</h3>
              <p className="text-sm text-[#94a3b8]">
                Browse open matches or create your own. Set your wager and game rules.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#a855f7]/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#a855f7]">3</span>
              </div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Win & Earn</h3>
              <p className="text-sm text-[#94a3b8]">
                Compete, win matches, and earn points. Withdraw or redeem for prizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#f1f5f9] mb-4">
              What Players <span className="gradient-text">Say</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <TestimonialCard
              quote="WX Arena changed the game for me. I went from playing casually to winning tournaments and earning real money. The competition is fierce but fair!"
              author="PhantomX"
              role="Top-ranked eFootball Player"
              rating={5}
              delay={0}
            />
            <TestimonialCard
              quote="Best platform for competitive mobile gaming in Africa. The matchmaking is quick, payouts are fast, and the community is amazing. Highly recommend!"
              author="NightStalker"
              role="Free Fire Champion"
              rating={5}
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#050508]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-6">
            Ready to <span className="gradient-text">Compete?</span>
          </h2>
          <p className="text-lg text-[#94a3b8] mb-8 max-w-2xl mx-auto">
            Join 50,000+ players already competing on WX Arena. 
            Sign up free and start your journey to the top.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="group">
                Get Started Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="ghost" size="lg">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
