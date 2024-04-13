import {z} from 'zod'

export const quizCreationSchema = z.object({
    topic: z.string().min(4, {message:"Topic must be 4 characters long"}).max(50),
    type: z.enum(['mcq', 'open_ended']),
    amount: z.number().min(1).max(10),
})