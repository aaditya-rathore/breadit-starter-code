"use client"
import { FC } from 'react'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,DropdownMenuContent } from './ui/DropdownMenu'
import { MoreHorizontal, Edit, Trash } from 'lucide-react'
import { Button } from './ui/Button'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from '@/hooks/use-toast'

interface PostActionsProps {
  postId: string
  slug: string
}

const PostActions: FC<PostActionsProps> = ({postId, slug}) => {
  const router = useRouter()

  const {mutate: deletePost, isLoading} = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(`/api/subreddit/post/delete?postId=${postId}`)
      return data
    },
    onError: () => {
      toast({
        title: 'Something went wrong',
        description: 'Post could not be deleted. Please try again.',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        title: 'Post deleted',
        description: 'Your post was successfully deleted.',
      })
      router.push(`/r/${slug}`)
      router.refresh()
    }
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm'>
          <MoreHorizontal className='h-5 w-5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem className='cursor-pointer' onSelect={() => router.push(`/r/${slug}/post/${postId}/edit`)}>
          <Edit className='h-4 w-4 mr-2' />
          Edit Post
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className='cursor-pointer text-red-600 focus:bg-red-50' onSelect={(e) => {
          e.preventDefault()
          deletePost()
        }} disabled={isLoading}>
          <Trash className='h-4 w-4 mr-2' />
          Delete Post
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
export default PostActions
