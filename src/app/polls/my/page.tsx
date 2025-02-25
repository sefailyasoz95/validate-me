"use client";

import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database } from "@/lib/types/supabase";
import { Progress } from "@/components/ui/progress";
import { CopyUrlButton } from "@/components/polls/copy-url-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { BarChart3, Search, SlidersHorizontal, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const ItemTypes = {
  QUESTION: "question",
};

interface DraggableQuestionProps {
  question: QuestionWithStats;
  index: number;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
}

interface DropResult {
  handlerId: string | symbol | null;
}

const DraggableQuestion = ({
  question,
  index,
  moveQuestion,
}: DraggableQuestionProps) => {
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
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
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
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`p-3 bg-muted rounded-md cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
      data-handler-id={handlerId}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {index + 1}
        </div>
        <span className="truncate">{question.text}</span>
      </div>
    </motion.div>
  );
};

type QuestionWithStats = Database["public"]["Tables"]["questions"]["Row"] & {
  answers: (Database["public"]["Tables"]["answers"]["Row"] & {
    responses: Database["public"]["Tables"]["responses"]["Row"][];
  })[];
  next_question?: {
    id: string;
    text: string;
  };
};

export default function MyPollsPage() {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orderedQuestions, setOrderedQuestions] = useState<QuestionWithStats[]>(
    []
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [questions, setQuestions] = useState<QuestionWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "responses">(
    "newest"
  );

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
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

      const questionsWithNextInfo = await Promise.all(
        (data || []).map(async (question) => {
          if (question.next_question_id) {
            const { data: nextQuestion } = await supabase
              .from("questions")
              .select("id, text")
              .eq("id", question.next_question_id)
              .single();

            return {
              ...question,
              next_question: nextQuestion
                ? {
                    id: nextQuestion.id,
                    text: nextQuestion.text,
                  }
                : undefined,
            };
          }
          return question;
        })
      );

      setQuestions(questionsWithNextInfo as QuestionWithStats[]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
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
      const response = await fetch("/api/questions/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderedQuestions),
      });

      if (!response.ok) {
        throw new Error("Failed to update question order");
      }

      toast.success("Question order updated successfully");
      setIsDialogOpen(false);
      setSelectedQuestions([]);
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question order:", error);
      toast.error("Failed to update question order");
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter and sort questions
  const filteredQuestions = questions
    .filter((q) => q.text.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (sortBy === "responses") {
        const responsesA = a.answers.reduce(
          (sum, ans) => sum + (ans.responses?.length || 0),
          0
        );
        const responsesB = b.answers.reduce(
          (sum, ans) => sum + (ans.responses?.length || 0),
          0
        );
        return responsesB - responsesA;
      }
      return 0;
    });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <h1 className="text-3xl font-bold">My Polls</h1>
          <div className="flex items-center gap-4">
            {selectedQuestions.length > 0 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <Button onClick={handleOpenOrderingDialog}>
                  Order Selected ({selectedQuestions.length})
                </Button>
              </motion.div>
            )}
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search polls..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Badge
                variant={sortBy === "newest" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSortBy("newest")}
              >
                Newest
              </Badge>
              <Badge
                variant={sortBy === "oldest" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSortBy("oldest")}
              >
                Oldest
              </Badge>
              <Badge
                variant={sortBy === "responses" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSortBy("responses")}
              >
                Most Responses
              </Badge>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {filteredQuestions.length === 0 ? (
              <motion.div
                variants={item}
                className="text-center py-12 bg-card rounded-lg border border-border shadow-md"
              >
                {searchQuery ? (
                  <>
                    <p className="text-muted-foreground mb-4">
                      No polls match your search
                    </p>
                    <Button onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">
                      You haven't created any polls yet
                    </p>
                    <Button asChild>
                      <Link href="/dashboard">Create Your First Poll</Link>
                    </Button>
                  </>
                )}
              </motion.div>
            ) : (
              filteredQuestions.map((question: QuestionWithStats, index) => (
                <motion.div
                  key={question.id}
                  variants={item}
                  className={`bg-card rounded-lg p-6 shadow-lg border ${
                    selectedQuestions.includes(question.id)
                      ? "border-primary"
                      : "border-border"
                  } hover:border-primary/50 transition-colors cursor-pointer`}
                  onClick={() => toggleQuestionSelection(question.id)}
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                    {question.answers.map((answer, ansIndex) => {
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
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{
                              delay: 0.3 + ansIndex * 0.1,
                              duration: 0.8,
                              ease: "easeOut",
                            }}
                          >
                            <Progress value={percentage} className="h-2" />
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>

                  {question.next_question && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Next Question:
                        </span>
                        <Badge variant="outline" className="font-normal">
                          {question.next_question.text}
                        </Badge>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Order Selected Questions</DialogTitle>
          </DialogHeader>
          <DndProvider backend={HTML5Backend}>
            <div className="space-y-2">
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
          <div className="mt-4 flex justify-end">
            <Button onClick={updateQuestionOrder} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
