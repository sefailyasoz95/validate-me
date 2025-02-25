"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logAnalyticsEvent } from "@/components/firebase-analytics-provider";

const formSchema = z.object({
  text: z.string().min(5, "Question must be at least 5 characters"),
  next_question_id: z.string().optional(),
  answers: z
    .array(
      z.object({
        text: z.string().min(1, "Answer cannot be empty"),
      })
    )
    .min(2, "At least 2 answers are required"),
});

export function CreatePollModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      answers: [{ text: "" }, { text: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "answers",
    rules: { minLength: 2 },
  });

  const addAnswer = () => {
    append({ text: "" });
  };

  const removeAnswer = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      console.log("Submitting values:", values);

      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No session found");
      }

      // First create the question with user_id
      const { data: question, error: questionError } = await supabase
        .from("questions")
        .insert({
          text: values.text,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (questionError) {
        console.error("Question Error:", questionError);
        throw questionError;
      }

      // Then create all answers for this question
      const { error: answersError } = await supabase.from("answers").insert(
        values.answers.map((answer) => ({
          question_id: question.id,
          answer: answer.text,
        }))
      );

      if (answersError) {
        console.error("Answers Error:", answersError);
        throw answersError;
      }

      // Log the poll creation event
      await logAnalyticsEvent("poll_created", {
        user_id: session.user.id,
        question_id: question.id,
        answers_count: values.answers.length,
      });

      toast.success("Poll created successfully!");
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="gap-2 text-lg relative animate-shimmer items-center justify-center 
            rounded-md border border-slate-800 dark:border-slate-100 
            bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] 
            bg-[length:200%_100%] px-6 font-medium text-slate-100 
            transition-colors focus:outline-none focus:ring-2 
            focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          Create Poll
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
          <DialogDescription>
            Create a poll with a question and multiple answer options.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Would you use an app that..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Answer Options</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAnswer}
                >
                  Add Option
                </Button>
              </div>

              {fields.map((field, index) => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name={`answers.${index}.text`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder={`Option ${index + 1}`}
                            {...field}
                          />
                        </FormControl>
                        {fields.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAnswer(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Creating..." : "Create Poll"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
