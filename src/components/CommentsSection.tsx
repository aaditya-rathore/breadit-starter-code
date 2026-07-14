import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import PostComment from './PostComment'
import CreateComment from './CreateComment'
import { Comment, CommentVote, User } from '@prisma/client'

interface CommentsSectionProps {
  postId: string
}

type ExtendedComment = Comment & {
  author: User
  votes: CommentVote[]
  replies?: ExtendedComment[]
}

const CommentNode = ({ comment, session }: { comment: ExtendedComment, session: any }) => {
  const votesAmt = comment.votes.reduce((acc, vote) => {
    if (vote.type === 'UP') return acc + 1
    if (vote.type === 'DOWN') return acc - 1
    return acc
  }, 0)

  const currentVote = comment.votes.find((vote) => vote.userId === session?.user.id)

  return (
    <div className='flex flex-col'>
      <div className='mb-2'>
        <PostComment
          postId={comment.postId}
          currentVote={currentVote}
          votesAmt={votesAmt}
          comment={comment}
        />
      </div>

      {/* recursively render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className='ml-2 border-l-2 border-zinc-200 py-2 pl-4 flex flex-col gap-y-4'>
          {comment.replies
            .sort((a, b) => b.votes.length - a.votes.length)
            .map((reply) => (
              <CommentNode key={reply.id} comment={reply} session={session} />
            ))}
        </div>
      )}
    </div>
  )
}

const CommentsSection = async ({ postId }: CommentsSectionProps) => {
  const session = await getAuthSession()

  // Fetch all comments for the post in a single flat query
  const comments = await db.comment.findMany({
    where: {
      postId,
    },
    include: {
      author: true,
      votes: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Build the tree in memory
  const commentsMap = new Map<string, ExtendedComment>()
  const topLevelComments: ExtendedComment[] = []

  // Initialize map with empty replies
  comments.forEach((comment) => {
    commentsMap.set(comment.id, { ...comment, replies: [] })
  })

  // Link children to parents
  comments.forEach((comment) => {
    const mappedComment = commentsMap.get(comment.id)!
    if (comment.replyToId) {
      const parent = commentsMap.get(comment.replyToId)
      if (parent) {
        parent.replies!.push(mappedComment)
      } else {
        // If parent somehow doesn't exist (e.g. deleted), treat as top level
        topLevelComments.push(mappedComment)
      }
    } else {
      topLevelComments.push(mappedComment)
    }
  })

  return (
    <div className='mt-4 flex w-full min-w-0 flex-col gap-y-4'>
      <div className='flex w-full min-w-0 flex-col gap-y-6 mt-4'>
        {topLevelComments.map((topLevelComment) => (
          <div key={topLevelComment.id} className='bg-white p-4 sm:p-6 rounded-sm shadow-sm'>
            <CommentNode comment={topLevelComment} session={session} />
          </div>
        ))}
      </div>

      <div className='bg-white p-4 sm:p-6 rounded-sm shadow-sm mt-4'>
        <CreateComment postId={postId} />
      </div>
    </div>
  )
}

export default CommentsSection