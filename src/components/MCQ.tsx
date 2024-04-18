"use client";
import { Game, Question } from "@prisma/client";
import React, { useEffect } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "./ui/button";
import { differenceInSeconds } from "date-fns";
import Link from "next/link";
import { BarChart, ChevronRight, Currency, Loader2, Timer } from "lucide-react";
// import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import MCQCounter from "./MCQCounter";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import { toast, useToast } from "./ui/use-toast";
import { cn, formatTimeDelta } from "@/lib/utils";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "options" | "question">[] };
};

const MCQ = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  //   const [hasEnded, setHasEnded] = React.useState(false);
  //   const [stats, setStats] = React.useState({
  //     correct_answers: 0,
  //     wrong_answers: 0,
  //   });
  const [selectedChoice, setSelectedChoice] = React.useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = React.useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = React.useState<number>(0);
  const [hasEnded, setHasEnded] = React.useState<boolean>(false);
  const [now, setNow] = React.useState<Date>(new Date());
  const { toast } = useToast();

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!hasEnded) {
        setNow(new Date());
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [hasEnded])

  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  const { mutate: checkAnswer, isPending: isChecking } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: options[selectedChoice]
      }
      const response = await axios.post('/api/checkAnswer', payload);
      return response.data
    }
  });

  const handleNext = React.useCallback(() => {
    if (isChecking) return;
    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }) => {
        if (isCorrect) {
          toast({
            title: "Correct!",
            description: "Correct Answer",
            variant: 'success'
          })
          setCorrectAnswers((prev) => prev + 1)
        } else {
          toast({
            title: "Incorrect!",
            description: "Incorrect Answer",
            variant: 'destructive'
          })
          setWrongAnswers((prev) => prev + 1);
        }
        if (questionIndex === game.questions.length - 1) {
          setHasEnded(true);
          return;
        }
        setQuestionIndex((prev) => prev + 1);
      },
    });
  }, [checkAnswer, toast, isChecking, questionIndex, game.questions.length]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == '1') {
        setSelectedChoice(0);
      } else if (event.key === '2') {
        setSelectedChoice(1);
      } else if (event.key === '3') {
        setSelectedChoice(2);
      } else if (event.key === '4') {
        setSelectedChoice(3);
      } else if (event.key === 'Enter') {
        handleNext();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleNext]);

  const options = React.useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];
    return JSON.parse(currentQuestion.options as string) as string[];
  }, [currentQuestion]);

  if (hasEnded) {
    return (
      <div className="absolute flex flex-col justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="px-4 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You completed in {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
        </div>
        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants(), "mt=2")}>
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }
  //   const { toast } = useToast();
  //   const { mutate: checkAnswer, isLoading: isChecking } = useMutation({
  //     mutationFn: async () => {
  //       const payload: z.infer<typeof checkAnswerSchema> = {
  //         questionId: currentQuestion.id,
  //         userInput: options[selectedChoice],
  //       };
  //       const response = await axios.post(`/api/checkAnswer`, payload);
  //       return response.data;
  //     },
  //   });

  //   const { mutate: endGame } = useMutation({
  //     mutationFn: async () => {
  //       const payload: z.infer<typeof endGameSchema> = {
  //         gameId: game.id,
  //       };
  //       const response = await axios.post(`/api/endGame`, payload);
  //       return response.data;
  //     },
  //   });

  //   React.useEffect(() => {
  //     const interval = setInterval(() => {
  //       if (!hasEnded) {
  //         setNow(new Date());
  //       }
  //     }, 1000);
  //     return () => clearInterval(interval);
  //   }, [hasEnded]);

  //   const handleNext = React.useCallback(() => {
  //     checkAnswer(undefined, {
  //       onSuccess: ({ isCorrect }) => {
  //         if (isCorrect) {
  //           setStats((stats) => ({
  //             ...stats,
  //             correct_answers: stats.correct_answers + 1,
  //           }));
  //           toast({
  //             title: "Correct",
  //             description: "You got it right!",
  //             variant: "success",
  //           });
  //         } else {
  //           setStats((stats) => ({
  //             ...stats,
  //             wrong_answers: stats.wrong_answers + 1,
  //           }));
  //           toast({
  //             title: "Incorrect",
  //             description: "You got it wrong!",
  //             variant: "destructive",
  //           });
  //         }
  //         if (questionIndex === game.questions.length - 1) {
  //           endGame();
  //           setHasEnded(true);
  //           return;
  //         }
  //         setQuestionIndex((questionIndex) => questionIndex + 1);
  //       },
  //     });
  //   }, [checkAnswer, questionIndex, game.questions.length, toast, endGame]);

  //   React.useEffect(() => {
  //     const handleKeyDown = (event: KeyboardEvent) => {
  //       const key = event.key;

  //       if (key === "1") {
  //         setSelectedChoice(0);
  //       } else if (key === "2") {
  //         setSelectedChoice(1);
  //       } else if (key === "3") {
  //         setSelectedChoice(2);
  //       } else if (key === "4") {
  //         setSelectedChoice(3);
  //       } else if (key === "Enter") {
  //         handleNext();
  //       }
  //     };

  //     document.addEventListener("keydown", handleKeyDown);

  //     return () => {
  //       document.removeEventListener("keydown", handleKeyDown);
  //     };
  //   }, [handleNext]);

  //   if (hasEnded) {
  // return (
  //   <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
  //     <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
  //       You Completed in{" "}
  //       {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
  //     </div>
  //     <Link
  //       href={`/statistics/${game.id}`}
  //       className={cn(buttonVariants({ size: "lg" }), "mt-2")}
  //     >
  //       View Statistics
  //       <BarChart className="w-4 h-4 ml-2" />
  //     </Link>
  //   </div>
  // );
  //   }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          {/* topic */}
          <p>
            <span className="text-slate-400">Topic</span> &nbsp;
            <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
              {game.topic}
            </span>
          </p>
          <div className="flex self-start mt-3 text-slate-400">
            <Timer className="mr-2" />
            {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
          </div>
        </div>
        <MCQCounter
          correctAnswers={correctAnswers}
          wrongAnswers={wrongAnswers}
        />
      </div>
      <Card className="w-full mt-4">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
            <div>{questionIndex + 1}</div>
            <div className="text-base text-slate-400">
              {game.questions.length}
            </div>
          </CardTitle>
          <CardDescription className="flex-grow text-lg">
            {currentQuestion?.question}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-col items-center justify-center w-full mt-4">
        {options.map((option, index) => {
          return (
            <Button
              key={option}
              //  key={index} He did this
              variant={selectedChoice === index ? "default" : "outline"}
              className="justify-start w-full py-8 mb-4"
              onClick={() => setSelectedChoice(index)}
            >
              <div className="flex items-center justify-start">
                <div className="p-2 px-3 mr-5 border rounded-md">
                  {index + 1}
                </div>
                <div className="text-start">{option}</div>
              </div>
            </Button>
          );
        })}
        <Button
          //   variant="default"
          className="mt-2"
          //   size="lg"
          disabled={isChecking}
          onClick={() => {
            handleNext();
          }}
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default MCQ;