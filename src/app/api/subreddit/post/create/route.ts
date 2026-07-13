import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) {
            return new Response("Unauthorized", { status: 401 })
        }

        const body = await req.json()

        const {subredditId , title, content} = PostValidator.parse(body)

        const subreddit = await db.subreddit.findUnique({
            where: {
                id: subredditId,
            },
            select: {
                creatorId: true,
            },
        })

        if (!subreddit) {
            return new Response("Subreddit not found", { status: 404 })
        }

        const subscriptionExits = await db.subscription.findFirst({
            where: {
                subredditId,
                userId: session.user.id
            },
        })

        const isCreator = subreddit.creatorId === session.user.id

        if (!subscriptionExits && !isCreator) {
            return new Response(" Subscribe to post", {
                 status: 400, 
            })
        }

        if (!subscriptionExits && isCreator) {
            await db.subscription.upsert({
                where: {
                    userId_subredditId: {
                        subredditId,
                        userId: session.user.id,
                    },
                },
                create: {
                    subredditId,
                    userId: session.user.id,
                },
                update: {},
            })
        }

        await db.post.create({
            data: {
                title,
                content,
                authorId: session.user.id,
                subredditId,
            },
        })

        return new Response('OK')
    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response('Invalid request data passed', {status: 422})
        }
        return new Response('Could not post to subreddit at this time, please try again later', {status: 500})
    }
}
