import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { PostEditValidator } from "@/lib/validators/post"
import { z } from "zod"

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { postId, title, content } = PostEditValidator.parse(body)

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

    await db.post.update({
      where: {
        id: postId
      },
      data: {
        title,
        content
      }
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request data passed', { status: 422 })
    }

    return new Response('Could not update post, please try again later', { status: 500 })
  }
}
