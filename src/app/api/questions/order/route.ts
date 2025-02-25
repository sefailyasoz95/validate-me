import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the ordered questions from the request
    const orderedQuestions = await request.json();

    if (!Array.isArray(orderedQuestions) || orderedQuestions.length < 2) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    // First, reset all next_question_id for these questions to avoid conflicts
    const questionIds = orderedQuestions.map((q) => q.id);
    await supabase
      .from("questions")
      .update({ next_question_id: null })
      .in("id", questionIds)
      .eq("user_id", session.user.id);

    // Then set the next_question_id for each question
    const updates = [];
    for (let i = 0; i < orderedQuestions.length - 1; i++) {
      const currentQuestion = orderedQuestions[i];
      const nextQuestion = orderedQuestions[i + 1];

      updates.push(
        supabase
          .from("questions")
          .update({ next_question_id: nextQuestion.id })
          .eq("id", currentQuestion.id)
          .eq("user_id", session.user.id)
      );
    }

    // Clear the next_question_id for the last question
    updates.push(
      supabase
        .from("questions")
        .update({ next_question_id: null })
        .eq("id", orderedQuestions[orderedQuestions.length - 1].id)
        .eq("user_id", session.user.id)
    );

    // Execute all updates
    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating question order:", error);
    return NextResponse.json(
      { error: "Failed to update question order" },
      { status: 500 }
    );
  }
}
