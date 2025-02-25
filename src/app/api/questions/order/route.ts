import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const supabase = await createClient();

		// Get auth session
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Get request body
		const orderedQuestions = await request.json();

		// Validate request body
		if (!Array.isArray(orderedQuestions) || orderedQuestions.length === 0) {
			return new NextResponse("Invalid request body", { status: 400 });
		}

		// Update question order
		for (let i = 0; i < orderedQuestions.length; i++) {
			const currentQuestion = orderedQuestions[i];
			const nextQuestion = orderedQuestions[i + 1];

			// Verify question ownership
			const { data: questionData, error: questionError } = await supabase
				.from("questions")
				.select("user_id")
				.eq("id", currentQuestion.id)
				.single();

			if (questionError || !questionData) {
				return new NextResponse("Question not found", { status: 404 });
			}

			if (questionData.user_id !== session.user.id) {
				return new NextResponse("Unauthorized", { status: 403 });
			}

			const { error } = await supabase
				.from("questions")
				.update({ next_question_id: nextQuestion?.id || null })
				.eq("id", currentQuestion.id);

			if (error) {
				throw error;
			}
		}

		return new NextResponse("Questions order updated successfully", { status: 200 });
	} catch (error) {
		console.error("Error updating question order:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
