"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database } from "@/lib/types/supabase";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type QuestionWithAnswers = Database["public"]["Tables"]["questions"]["Row"] & {
  answers: (Database["public"]["Tables"]["answers"]["Row"] & {
    responses: Database["public"]["Tables"]["responses"]["Row"][];
  })[];
};

export default function PollPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionWithAnswers | null>(null);
  const [session, setSession] = useState<any>(null);
  const [hasResponded, setHasResponded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get auth status
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);

        // Fetch question with answers and response counts
        const { data: questionData, error } = await supabase
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
          .eq("id", id)
          .single();

        if (error || !questionData) {
          router.push("/dashboard");
          return;
        }

        setQuestion(questionData as QuestionWithAnswers);

        // Check if the user has already responded to this question
        if (sessionData.session) {
          const { data: responses } = await supabase
            .from("responses")
            .select("id")
            .eq("user_id", sessionData.session.user.id)
            .eq("question_id", id);

          setHasResponded(responses && responses.length > 0 ? true : false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, router]);

  const handleResponse = async (answerId: string) => {
    if (!session) return;

    try {
      setIsSubmitting(true);
      const { error: responseError } = await supabase.from("responses").insert({
        user_id: session.user.id,
        question_id: id,
        answer_id: answerId,
      });

      if (responseError) {
        console.error("Error submitting response:", responseError);
        toast.error("Failed to submit response");
      } else {
        toast.success("Response submitted successfully");
        setHasResponded(true);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Poll not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {session && (
            <div className="flex flex-row items-center gap-x-2">
              <img
                src={session.user.user_metadata.avatar_url}
                className="w-12 h-12 rounded-full object-cover"
                alt="User avatar"
              />
              <div className="flex flex-col">
                <span className="text-lg font-semibold">Question Owner</span>
                <small className="">{session.user.user_metadata.email}</small>
              </div>
            </div>
          )}
          {/* Question Card */}
          <div className="bg-card rounded-lg p-6 shadow-lg border border-border">
            <div className="flex flex-row w-full items-center justify-between">
              <h1 className="text-2xl font-bold text-card-foreground mb-6">
                {question.text}
              </h1>
              <small>{format(new Date(question.created_at), "PPP")}</small>
            </div>

            <div className="space-y-4">
              {question.answers.map((answer) => (
                <div
                  key={answer.id}
                  className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50"
                >
                  <span className="text-foreground">{answer.answer}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {answer.responses?.length ?? 0} responses
                    </span>
                    {session && !hasResponded ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleResponse(answer.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Select"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {!session && (
              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Sign in to answer this poll
                </p>
                <Button asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            )}

            {hasResponded && (
              <p className="mt-4 text-sm text-muted-foreground text-center">
                You already answered this question.
              </p>
            )}
            {question.next_question_id && hasResponded && (
              <div className="flex justify-center mt-4">
                <Button asChild>
                  <Link href={`/polls/${question.next_question_id}`}>
                    Next Question
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
