"use client"

import { FC, useRef, useState } from 'react'
import UserAvatar from './UserAvatar'
import { Comment, CommentVote, User } from '@prisma/client'
import { formatTimeToNow } from '@/lib/utils'
import CommentVotes from "@/components/CommentVotes"
import { Button } from './ui/Button'
import { MessageSquare, MoreHorizontal, Edit, Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { useMutation } from '@tanstack/react-query'
import { CommentRequest, CommentEditRequest, CommentDeleteRequest } from '@/lib/validators/comment'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu'

import { UploadButton } from '@/lib/uploadthing'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type ExtendedComment = Comment & {
    votes: CommentVote[]
    author: User
    
}

interface PostCommentProps {
  comment: ExtendedComment
  votesAmt: number
  currentVote: CommentVote | undefined
  postId: string
}

const PostComment: FC<PostCommentProps> = ({comment, votesAmt, currentVote, postId}) => {

    const commentRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const {data: session} = useSession()
    const [isReplying, setIsReplying] = useState<boolean>(false)
    const [input, setInput] = useState<string>('')

    const {mutate: PostComment, isLoading} =useMutation({
        mutationFn: async({postId, text, replyToId}: CommentRequest) => {
            const payload: CommentRequest = {
                postId,
                text,
                replyToId,
            }

            const{data} =await axios.patch(`/api/subreddit/post/comment`, payload)
            return data
        },
        onError:() => {
            return toast({
                title: 'Something went wrong.',
                description: 'Your comment was not posted successfully. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            router.refresh()
            setIsReplying(false)
        }
    })

    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [editInput, setEditInput] = useState<string>(comment.text)

    const { mutate: editComment, isLoading: isEditLoading } = useMutation({
        mutationFn: async ({ commentId, text }: CommentEditRequest) => {
            const payload: CommentEditRequest = { commentId, text }
            const { data } = await axios.patch(`/api/subreddit/post/comment/edit`, payload)
            return data
        },
        onError: () => {
            return toast({
                title: 'Something went wrong.',
                description: 'Your comment was not edited successfully. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            router.refresh()
            setIsEditing(false)
        }
    })

    const { mutate: deleteComment, isLoading: isDeleteLoading } = useMutation({
        mutationFn: async ({ commentId }: CommentDeleteRequest) => {
            const payload: CommentDeleteRequest = { commentId }
            const { data } = await axios.delete(`/api/subreddit/post/comment/delete`, { data: payload })
            return data
        },
        onError: () => {
            return toast({
                title: 'Something went wrong.',
                description: 'Your comment was not deleted successfully. Please try again.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            router.refresh()
        }
    })

  return( 
  <div ref={commentRef} className='flex flex-col w-full'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center'>
        <UserAvatar user={{            
                name: comment.author.name || null, 
                image: comment.author.image || null        
        }}
            className='h-6 w-6'
        />

        <div className='ml-2 flex items-center gap-x-2'>
            <p className='text-sm font-medium text-gray-900'>
                u/{comment.author.username}
            </p>
            <p className='max-h-40 truncate text-xs text-gray-500'>
                {formatTimeToNow(new Date(comment.createdAt))}
            </p>
        </div>
      </div>
      
      {session?.user.id === comment.authorId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className='mr-2 h-4 w-4' /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteComment({ commentId: comment.id })} disabled={isDeleteLoading}>
              <Trash className='mr-2 h-4 w-4 text-red-600' /> <span className='text-red-600'>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>

    {isEditing ? (
      <div className='mt-2 grid w-full gap-1.5'>
        <Textarea 
          value={editInput}
          onChange={(e) => setEditInput(e.target.value)}
          placeholder='Edit your comment...'
          rows={3}
        />
        <div className='flex justify-end gap-2 mt-2'>
          <Button variant='subtle' onClick={() => {
            setIsEditing(false)
            setEditInput(comment.text)
          }}>Cancel</Button>
          <Button 
            isLoading={isEditLoading} 
            disabled={editInput.length === 0 || editInput === comment.text} 
            onClick={() => editComment({ commentId: comment.id, text: editInput })}
          >
            Save
          </Button>
        </div>
      </div>
    ) : (
      <div className='text-sm text-zinc-900 mt-2 prose prose-sm max-w-none'>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({node: _node, ...props}) => (
                <a {...props} target="_blank" rel="noopener noreferrer" />
              )
            }}
          >
            {comment.text}
          </ReactMarkdown>
      </div>
    )}

    <div className='flex gap-2 items-center flex-wrap'>
        <CommentVotes commentId={comment.id} initialVotesAmt={votesAmt} initialVote={currentVote} />


      <Button onClick={() => {
        if(!session) return router.push('/sign-in')
        setIsReplying(true)

      }} variant='ghost' size='xs'>
        <MessageSquare className='h-4 w-4 mr-1.5' />
        Reply</Button>  

        {isReplying ? (
            <div className='grid w-full gap-1.5'>
                <Label htmlFor='comment'>Your Comment</Label>
                <div className='mt-2'>
                <Textarea id='comment'
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                rows={1}
                placeholder='What are your thoughts?'
        />

        <div className='mt-2 flex justify-between items-center w-full'>
          <div className='w-fit'>
            <UploadButton
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                  setInput(prev => prev + (prev.length > 0 ? `\n![image](${res[0].url})` : `![image](${res[0].url})`))
                }
              }}
              onUploadError={(error: Error) => {
                toast({
                  title: 'Upload failed',
                  description: error.message,
                  variant: 'destructive',
                })
              }}
            />
          </div>
          <div className='flex gap-2'>
            <Button tabIndex={-1} variant='subtle' onClick={() => setIsReplying(false)}>Cancel</Button>
            <Button 
            isLoading={isLoading} disabled={input.length === 0} onClick={()=> {
              if(!input) return
              PostComment({
                  postId,
                  text: input,
                  replyToId: comment.replyToId ?? comment.id,
              })
            }}>
              Post</Button>
          </div>
        </div>
        </div>
      </div>
        ): null}
    </div>
  </div>
  )
}

export default PostComment
