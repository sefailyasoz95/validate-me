import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { CreatePollModal } from "@/components/dashboard/create-poll-modal";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user's polls and their stats
  const { data: polls } = await supabase
    .from("questions")
    .select(
      `
      id,
      text,
      created_at,
      answers (
        id,
        answer,
        responses (
          id
        )
      )
    `
    )
    .eq("user_id", session.user.id);

  // Calculate stats
  const stats = {
    activePollsCount: polls?.length ?? 0,
    totalResponses:
      polls?.reduce(
        (sum, poll) =>
          sum +
          poll.answers.reduce(
            (answerSum, answer) => answerSum + (answer.responses?.length ?? 0),
            0
          ),
        0
      ) ?? 0,
    completionRate: polls?.length
      ? Math.round(
          (polls.reduce(
            (sum, poll) =>
              sum + (poll.answers.some((a) => a.responses?.length > 0) ? 1 : 0),
            0
          ) /
            polls.length) *
            100
        )
      : 0,
  };

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Welcome Section with Create Button */}
          <section className="bg-card rounded-lg p-6 shadow-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-card-foreground mb-2">
                  Welcome back, {session.user.email}
                </h1>
                <p className="text-muted-foreground">
                  Start creating polls to validate your business ideas
                </p>
              </div>
              <CreatePollModal />
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/polls/my"
              className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 shadow-md 
                hover:border-primary/50 transition-colors group"
            >
              <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                Active Polls
              </h3>
              <p className="text-3xl font-bold text-primary">
                {stats.activePollsCount}
              </p>
            </Link>
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 shadow-md">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Total Responses
              </h3>
              <p className="text-3xl font-bold text-primary">
                {stats.totalResponses}
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 shadow-md">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Completion Rate
              </h3>
              <p className="text-3xl font-bold text-primary">
                {stats.completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
