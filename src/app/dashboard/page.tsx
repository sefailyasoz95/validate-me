import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { CreatePollModal } from "@/components/dashboard/create-poll-modal";
import Link from "next/link";
import {
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileCompletionWrapper } from "@/components/dashboard/profile-completion-modal";

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

  // Fetch how many questions the user has answered
  const { count: answeredCount } = await supabase
    .from("responses")
    .select("id", { count: "exact", head: true })
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
    answeredCount: answeredCount || 0,
  };

  // Get recent polls (last 3)
  const recentPolls = polls?.slice(0, 3) || [];

  return (
    <main className="min-h-screen bg-background">
      <DashboardHeader user={session.user} />
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Welcome Section with Create Button */}
          <section className="bg-gradient-to-br from-card to-card/80 rounded-lg p-8 shadow-lg border border-border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-card-foreground mb-2">
                  Welcome back,{" "}
                  {session.user.user_metadata.name || session.user.email}
                </h1>
                <p className="text-muted-foreground max-w-xl">
                  Create polls to validate your business ideas and get valuable
                  feedback from your audience.
                </p>
              </div>
              <CreatePollModal />
            </div>
          </section>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6">
            <Link
              href="/polls/my"
              className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 shadow-md 
                hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                    Active Polls
                  </h3>
                  <p className="text-3xl font-bold text-primary">
                    {stats.activePollsCount}
                  </p>
                </div>
              </div>
            </Link>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 shadow-md">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-1">
                    Total Responses
                  </h3>
                  <p className="text-3xl font-bold text-blue-500">
                    {stats.totalResponses}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-lg border border-border/50 shadow-md">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-1">
                    Polls Answered
                  </h3>
                  <p className="text-3xl font-bold text-purple-500">
                    {stats.answeredCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Polls Section */}
          {recentPolls.length > 0 && (
            <section className="bg-card rounded-lg p-6 shadow-lg border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Recent Polls</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/polls/my" className="flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {recentPolls.map((poll) => {
                  const totalResponses = poll.answers.reduce(
                    (sum, answer) => sum + (answer.responses?.length || 0),
                    0
                  );

                  return (
                    <div
                      key={poll.id}
                      className="p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium mb-1">{poll.text}</h3>
                          <p className="text-sm text-muted-foreground">
                            {poll.answers.length} answers · {totalResponses}{" "}
                            responses
                          </p>
                        </div>
                        <Button size="sm" variant="secondary" asChild>
                          <Link href={`/polls/${poll.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty State */}
          {recentPolls.length === 0 && (
            <section className="bg-card rounded-lg p-8 shadow-lg border border-border text-center">
              <h2 className="text-xl font-semibold mb-2">No polls yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first poll to start gathering feedback and
                validating your ideas.
              </p>
              <CreatePollModal />
            </section>
          )}
        </div>
      </div>
      <ProfileCompletionWrapper userId={session.user.id} />
    </main>
  );
}
