import { z } from "zod";

export const quizCreationSchema = z.object({
  topic: z
    .string()
    .min(4, { message: "Topic must be 4 characters long" })
    .max(50),
  type: z.enum(["mcq", "open_ended"]),
  amount: z.number().min(1).max(10),
});

export const checkAnswerSchema = z.object({
  userAnswer: z.string(),
  questionId: z.string(),
});

export const endGameSchema = z.object({
  gameId: z.string(),
});
