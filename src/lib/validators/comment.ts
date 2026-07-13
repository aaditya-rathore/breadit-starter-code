import {z} from 'zod'

export const CommentValidator = z.object({
    postId: z.string(),
    text: z.string(),
    replyToId: z.string().optional(),
})

export type CommentRequest = z.infer<typeof CommentValidator>

export const CommentEditValidator = z.object({
    commentId: z.string(),
    text: z.string(),
})

export type CommentEditRequest = z.infer<typeof CommentEditValidator>

export const CommentDeleteValidator = z.object({
    commentId: z.string(),
})

export type CommentDeleteRequest = z.infer<typeof CommentDeleteValidator>