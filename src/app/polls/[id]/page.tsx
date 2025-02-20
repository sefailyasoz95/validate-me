import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database } from "@/lib/types/supabase";
import { PollResponses } from "@/components/polls/poll-responses";

type QuestionWithAnswers = Database["public"]["Tables"]["questions"]["Row"] & {
	answers: (Database["public"]["Tables"]["answers"]["Row"] & {
		responses: Database["public"]["Tables"]["responses"]["Row"][];
	})[];
};

export default async function PollPage({ params }: { params: { id: string } }) {
	const supabase = await createClient();

	// Get auth status
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// Fetch question with answers and response counts
	const { data: question, error } = await supabase
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
		.eq("id", params.id)
		.single<QuestionWithAnswers>();

	if (error || !question) {
		redirect("/dashboard"); // or to a 404 page
	}

	// Check if the user has already responded to this question
	let hasResponded = false;
	if (session) {
		const { data: responses } = await supabase
			.from("responses")
			.select("id")
			.eq("user_id", session.user.id)
			.eq("question_id", question.id);

		hasResponded = responses && responses.length > 0 ? true : false;
	}

	return (
		<main className='min-h-screen bg-background'>
			<div className='container max-w-3xl mx-auto px-4 py-8'>
				<div className='space-y-8'>
					{/* Question Card */}
					<div className='bg-card rounded-lg p-6 shadow-lg border border-border'>
						<h1 className='text-2xl font-bold text-card-foreground mb-6'>{question.text}</h1>

						<PollResponses question={question} hasResponded={hasResponded} userId={session?.user.id} />

						{!session && (
							<div className='mt-8 text-center'>
								<p className='text-muted-foreground mb-4'>Sign in to answer this poll</p>
								<Button asChild>
									<Link href='/login'>Sign in</Link>
								</Button>
							</div>
						)}

						{hasResponded && (
							<p className='mt-4 text-sm text-muted-foreground text-center'>You already answered this poll.</p>
						)}
					</div>

					{/* Back Button */}
					<div className='flex justify-center'>
						<Button variant='ghost' asChild>
							<Link href='/dashboard'>Back to Dashboard</Link>
						</Button>
					</div>
				</div>
			</div>
		</main>
	);
}
