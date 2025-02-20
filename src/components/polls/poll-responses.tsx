"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PollResponsesProps {
	question: {
		id: string;
		text: string;
		answers: {
			id: string;
			answer: string;
			responses: { id: string }[];
		}[];
	};
	hasResponded: boolean;
	userId?: string;
}

export function PollResponses({ question, hasResponded, userId }: PollResponsesProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const handleResponse = async (answerId: string) => {
		if (!userId) return;

		setIsSubmitting(true);
		try {
			const { error: responseError } = await supabase.from("responses").insert({
				user_id: userId,
				question_id: question.id,
				answer_id: answerId,
			});

			if (responseError) {
				console.error("Error submitting response:", responseError);
			} else {
				router.refresh(); // Refresh the page to show updated responses
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='space-y-4'>
			{question.answers.map((answer) => (
				<div
					key={answer.id}
					className='flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50'>
					<span className='text-foreground'>{answer.answer}</span>
					<div className='flex items-center gap-4'>
						<span className='text-sm text-muted-foreground'>{answer.responses?.length ?? 0} responses</span>
						{userId && !hasResponded ? (
							<Button variant='secondary' size='sm' onClick={() => handleResponse(answer.id)} disabled={isSubmitting}>
								{isSubmitting ? "Submitting..." : "Select"}
							</Button>
						) : null}
					</div>
				</div>
			))}
		</div>
	);
}
