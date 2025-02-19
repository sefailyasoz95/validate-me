import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database } from "@/lib/types/supabase";
import { Progress } from "@/components/ui/progress";
import { CopyUrlButton } from "@/components/polls/copy-url-button";

type QuestionWithStats = Database["public"]["Tables"]["questions"]["Row"] & {
  answers: (Database["public"]["Tables"]["answers"]["Row"] & {
    responses: Database["public"]["Tables"]["responses"]["Row"][];
  })[];
};

export default async function MyPollsPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch all questions created by the user
  const { data: questions } = await supabase
    .from("questions")
    .select(
      `
      *,
      answers (
        id,
        answer,
        responses (
          id
        )
      )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .returns<QuestionWithStats[]>();

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Polls</h1>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <div className="space-y-6">
          {questions?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't created any polls yet
              </p>
              <Button asChild>
                <Link href="/dashboard">Create Your First Poll</Link>
              </Button>
            </div>
          ) : (
            questions?.map((question: QuestionWithStats) => (
              <div
                key={question.id}
                className="bg-card rounded-lg p-6 shadow-lg border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex justify-between flex-row items-start mb-4">
                  <h2 className="text-xl font-semibold mb-2">
                    {question.text}
                  </h2>
                  <div className="flex flex-col items-end gap-2">
                    <CopyUrlButton pollId={question.id} />
                    <p className="text-sm text-muted-foreground">
                      Created{" "}
                      {new Date(question.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Answers with Response Bars */}
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Responses
                  </h3>
                  {question.answers.map((answer) => {
                    const totalResponses = question.answers.reduce(
                      (sum, a) => sum + (a.responses?.length ?? 0),
                      0
                    );
                    const responseCount = answer.responses?.length ?? 0;
                    const percentage =
                      totalResponses === 0
                        ? 0
                        : Math.round((responseCount / totalResponses) * 100);

                    return (
                      <div key={answer.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground">
                            {answer.answer}
                          </span>
                          <span className="text-muted-foreground">
                            {responseCount} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
