"use client";

import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database } from "@/lib/types/supabase";
import { Progress } from "@/components/ui/progress";
import { CopyUrlButton } from "@/components/polls/copy-url-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ItemTypes = {
  QUESTION: 'question'
};

interface DraggableQuestionProps {
  question: QuestionWithStats;
  index: number;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
}

interface DropResult {
  handlerId: string | symbol | null;
}

const DraggableQuestion = ({ question, index, moveQuestion }: DraggableQuestionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, DropResult>({
    accept: ItemTypes.QUESTION,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.QUESTION,
    item: { type: ItemTypes.QUESTION, id: question.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`p-3 bg-muted rounded-md cursor-move ${isDragging ? 'opacity-50' : ''}`}
      data-handler-id={handlerId}>
      {question.text}
    </div>
  );
};

type QuestionWithStats = Database["public"]["Tables"]["questions"]["Row"] & {
	answers: (Database["public"]["Tables"]["answers"]["Row"] & {
		responses: Database["public"]["Tables"]["responses"]["Row"][];
	})[];
};

export default function MyPollsPage() {
	const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [orderedQuestions, setOrderedQuestions] = useState<QuestionWithStats[]>([]);
	const [isUpdating, setIsUpdating] = useState(false);
	const [questions, setQuestions] = useState<QuestionWithStats[]>([]);

	const fetchQuestions = async () => {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		if (!session) {
			redirect("/login");
			return;
		}

		const { data, error } = await supabase
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

		if (error) {
			console.error("Error fetching questions:", error);
			toast.error("Failed to fetch questions");
			return;
		}

		setQuestions(data || []);
	};

	const toggleQuestionSelection = (questionId: string) => {
		setSelectedQuestions((prev) =>
			prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
		);
	};

	const handleOpenOrderingDialog = () => {
		const orderedQs = selectedQuestions
			.map((id) => questions.find((q) => q.id === id))
			.filter((q): q is QuestionWithStats => q !== undefined);
		setOrderedQuestions(orderedQs);
		setIsDialogOpen(true);
	};

	const moveQuestion = (dragIndex: number, hoverIndex: number) => {
		const items = Array.from(orderedQuestions);
		const [reorderedItem] = items.splice(dragIndex, 1);
		items.splice(hoverIndex, 0, reorderedItem);
		setOrderedQuestions(items);
	};

	const updateQuestionOrder = async () => {
		setIsUpdating(true);
		try {
			const response = await fetch('/api/questions/order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(orderedQuestions),
			});

			if (!response.ok) {
				throw new Error('Failed to update question order');
			}

			toast.success('Question order updated successfully');
			setIsDialogOpen(false);
			setSelectedQuestions([]);
			fetchQuestions();
		} catch (error) {
			console.error('Error updating question order:', error);
			toast.error('Failed to update question order');
		} finally {
			setIsUpdating(false);
		}
	};

	useEffect(() => {
		fetchQuestions();
	}, []);

	return (
		<main className='min-h-screen bg-background'>
			<div className='container max-w-4xl mx-auto px-4 py-8'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-bold'>My Polls</h1>
					<div className='flex items-center gap-4'>
						{selectedQuestions.length > 0 && (
							<Button onClick={handleOpenOrderingDialog}>Order Selected ({selectedQuestions.length})</Button>
						)}
						<Button asChild>
							<Link href='/dashboard'>Back to Dashboard</Link>
						</Button>
					</div>
				</div>

				<div className='space-y-6'>
					{questions?.length === 0 ? (
						<div className='text-center py-12'>
							<p className='text-muted-foreground mb-4'>You haven't created any polls yet</p>
							<Button asChild>
								<Link href='/dashboard'>Create Your First Poll</Link>
							</Button>
						</div>
					) : (
						questions?.map((question: QuestionWithStats) => (
							<div
								key={question.id}
								className={`bg-card rounded-lg p-6 shadow-lg border ${
									selectedQuestions.includes(question.id) ? "border-primary" : "border-border"
								} hover:border-primary/50 transition-colors cursor-pointer`}
								onClick={() => toggleQuestionSelection(question.id)}>
								<div className='flex justify-between flex-row items-start mb-4'>
									<h2 className='text-xl font-semibold mb-2'>{question.text}</h2>
									<div className='flex flex-col items-end gap-2'>
										<CopyUrlButton pollId={question.id} />
										<p className='text-sm text-muted-foreground'>
											Created{" "}
											{new Date(question.created_at).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>
								</div>

								{/* Answers with Response Bars */}
								<div className='mt-6 space-y-4'>
									<h3 className='text-sm font-medium text-muted-foreground mb-2'>Responses</h3>
									{question.answers.map((answer) => {
										const totalResponses = question.answers.reduce((sum, a) => sum + (a.responses?.length ?? 0), 0);
										const responseCount = answer.responses?.length ?? 0;
										const percentage = totalResponses === 0 ? 0 : Math.round((responseCount / totalResponses) * 100);

										return (
											<div key={answer.id} className='space-y-2'>
												<div className='flex justify-between text-sm'>
													<span className='text-foreground'>{answer.answer}</span>
													<span className='text-muted-foreground'>
														{responseCount} ({percentage}%)
													</span>
												</div>
												<Progress value={percentage} className='h-2' />
											</div>
										);
									})}
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Order Selected Questions</DialogTitle>
					</DialogHeader>
					<DndProvider backend={HTML5Backend}>
						<div className='space-y-2'>
							{orderedQuestions.map((question, index) => (
								<DraggableQuestion
									key={question.id}
									question={question}
									index={index}
									moveQuestion={moveQuestion}
								/>
							))}
						</div>
					</DndProvider>
					<div className='mt-4 flex justify-end'>
						<Button onClick={updateQuestionOrder} disabled={isUpdating}>
							{isUpdating ? "Updating..." : "Save Order"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</main>
	);
}
