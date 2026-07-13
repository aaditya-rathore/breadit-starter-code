import Editor from "@/components/Editor"
import { Button } from "@/components/ui/Button"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface PageProps {
  params: {
    slug: string
    postId: string
  }
}

const page = async ({ params }: PageProps) => {
  const post = await db.post.findFirst({
    where: {
      id: params.postId,
      subreddit: {
        name: params.slug,
      },
    },
  })

  if (!post) return notFound()

  return (
    <div className='flex flex-col items-start gap-6'>
      <div className='border-b border-gray-200 pb-5'>
        <div className='-ml-2 -mt-2 flex flex-wrap items-baseline'>
          <h3 className='ml-2 mt-2 text-base font-semibold leading-6 text-gray-900'>
            Edit Post
          </h3>
          <p className='ml-2 mt-1 truncate text-sm text-gray-500'>
            in r/{params.slug}
          </p>
        </div>
      </div>

      <Editor subredditId={post.subredditId} post={post} />

      <div className='w-full flex justify-end'>
        <Button type='submit' className='w-full' form='subreddit-post-form'>
          Save Post
        </Button>
      </div>
    </div>
  )
}

export default page
