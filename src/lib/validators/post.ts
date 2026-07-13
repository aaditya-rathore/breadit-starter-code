import {z} from 'zod'

export const PostValidator = z.object({
    title:z
    .string()
    .min(3, {message: "Title must be at least 3 characters"})
    .max(128, {message: "Title must be at most 128 characters"}),
    subredditId:z.string(),
    content:z.any(),
})

export const PostEditValidator = z.object({
    postId: z.string(),
    title: z
        .string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(128, { message: "Title must be at most 128 characters" }),
    content: z.any(),
})

export type PostEditRequest = z.infer<typeof PostEditValidator>

export type PostCreationRequest = z.infer<typeof PostValidator>