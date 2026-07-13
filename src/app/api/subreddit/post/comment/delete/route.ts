import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentDeleteValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function DELETE(req: Request) {
    try {
        const body = await req.json()
        const { commentId } = CommentDeleteValidator.parse(body)

        const session = await getAuthSession()
        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 })
        }

        const comment = await db.comment.findUnique({
            where: { id: commentId }
        })

        if (!comment) {
            return new Response("Comment not found", { status: 404 })
        }

        if (comment.authorId !== session.user.id) {
            return new Response("Forbidden", { status: 403 })
        }

        await db.comment.delete({
            where: { id: commentId }
        })

        return new Response('Success')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request data passed', { status: 422 })
        }
        return new Response('Could not delete comment, please try again later', { status: 500 })
    }
}
