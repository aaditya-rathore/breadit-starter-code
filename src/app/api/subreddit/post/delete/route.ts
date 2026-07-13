import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const url = new URL(req.url)
    const postId = url.searchParams.get('postId')

    if (!postId) {
      return new Response('Invalid request', { status: 400 })
    }

    const post = await db.post.findUnique({
      where: {
        id: postId
      }
    })

    if (!post) {
      return new Response('Post not found', { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return new Response('Unauthorized', { status: 403 })
    }

    await db.post.delete({
      where: {
        id: postId
      }
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request data passed', { status: 422 })
    }

    return new Response('Could not delete post, please try again later', { status: 500 })
  }
}
