
import CommentsSection from '@/components/CommentsSection'
import EditorOutput from '@/components/EditorOutput'
import PostVoteServer from '@/components/post-vote/PostVoteServer'
import { buttonVariants } from '@/components/ui/Button'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import { formatTimeToNow } from '@/lib/utils'
import { CachedPost } from '@/types/redis'
import { Post, User, Vote } from '@prisma/client'
import { ArrowBigDown, ArrowBigUp, Loader2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getAuthSession } from '@/lib/auth'
import PostActions from '@/components/PostActions'

interface PageProps {
    params: {
        postId: string
        slug: string
    } 
}

export const dynamic ='force-dynamic'
export const fetchCache = 'force-no-store'
const page=async ({params}: PageProps) => {

  const session = await getAuthSession()

  const cachedData = redis
    ? await redis.hgetall(`post:${params.postId}`)
    : null

  const cachedPost =
    cachedData && cachedData.id ? (cachedData as CachedPost) : null

    let post: (Post & {votes: Vote[]; author: User}) | null = null

    if (!cachedPost) {
      post =await db.post.findFirst({
        where: {
          id: params.postId
        },
        include: {
          votes: true,
          author: true
        },
      })
    }

    if(!post && !cachedPost) return notFound()

    // Ensure we fetch post if we need author verification and we have a session but only cachedPost
    if (!post && session?.user && cachedPost) {
      post = await db.post.findFirst({
        where: { id: params.postId },
        include: { votes: true, author: true },
      })
    }

  return (
  <div>
    <div className='h-full flex flex-col sm:flex-row items-center sm:items-start justify-between'>
      <Suspense fallback={<PostVoteShell />}>
        {/* @ts-expect-error Server Component */}
        <PostVoteServer postId={post?.id ?? cachedPost?.id ?? params.postId} getData={async () => {
          return await db.post.findFirst({
            where: {
              id: params.postId
            },
            include: {
              votes: true,
            }
            })
          }}   
        />
      </Suspense>

      <div className='w-full min-w-0 flex-1 flex flex-col gap-y-4'>
        <article className='w-full min-w-0 flex-1 bg-white p-4 sm:p-6 rounded-sm'>
          <div className='flex justify-between items-center mt-1'>
            <p className='max-h-40 truncate text-xs text-gray-500'>
              Posted by u/{post?.author.username ?? cachedPost?.authorUsername}{' '}
              {formatTimeToNow(new Date(post?.createdAt ?? cachedPost?.createdAt ?? new Date()))}
            </p>
            {session?.user.id === post?.authorId ? (
              <PostActions postId={post?.id ?? params.postId} slug={params.slug} />
            ) : null}
          </div>
          <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
            {post?.title ?? cachedPost?.title}
          </h1>

          <EditorOutput content={
            post?.content ??
            (typeof cachedPost?.content === 'string'
              ? JSON.parse(cachedPost.content)
              : cachedPost?.content)
          }/>
        </article>

        <div className='bg-white p-4 sm:p-6 rounded-sm'>
          <Suspense fallback={
            <Loader2 className='h-5 w-5 animate-spin text-zinc-500'/>
          }>
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={post?.id ?? cachedPost?.id} />
          </Suspense>
        </div>
      </div>
    </div>
    
  </div>
)}

function PostVoteShell(){
  return (
  <div className='flex items-center flex-col pr-6 w-20'>
    {/* upvote */}
    <div className={buttonVariants({variant: 'ghost'})}>
      <ArrowBigUp className='h-5 w-5 text-zinc-700'/>
    </div>

    {/* score*/}
    <div className='text-center py-2 font-medium text-sm text-zinc-900'>
      <Loader2 className='h-3 w-3 animate-spin'/>
    </div>

    {/* Downvote */}
    <div className={buttonVariants({variant: 'ghost'})}>
      <ArrowBigDown className='h-5 w-5 text-zinc-700' />
    </div>
  </div>
  )
}

export default page