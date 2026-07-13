"use client"

import { FC, useState } from 'react'
import { Label } from './ui/Label'
import { Textarea } from './ui/Textarea'
import { Button } from './ui/Button'
import { useMutation } from '@tanstack/react-query'
import { CommentRequest } from '@/lib/validators/comment'
import axios, { AxiosError } from 'axios'
import { useCustomToast } from '@/hooks/use-custom-toast'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

import { UploadButton } from '@/lib/uploadthing'

interface CreateCommentProps {
  postId: string
  replyToId?: string
}

const CreateComment: FC<CreateCommentProps> = ({postId, replyToId}) => {

  const [input,setInput] = useState<string>('')
  const {loginToast} = useCustomToast()
  const router = useRouter()

  const{mutate: comment, isLoading} = useMutation({
    mutationFn: async ({postId, text, replyToId}: CommentRequest) => {
      const payload: CommentRequest ={
        postId,
        text,
        replyToId,
      }

      const {data} =await axios.patch('/api/subreddit/post/comment', payload)
      return data
    },
    onError:(err) => {
      if(err instanceof AxiosError) {
        if(err.response?.status === 401) {
            return loginToast()
        }
    }

    return toast({
        title: 'There was a Problem',
        description: 'Something went wrong, please try again later.',
        variant: 'destructive',
    })
    },
    onSuccess: () => {
      router.refresh()
      setInput('')
    },
  })

  return (
    <div className='grid w-full gap-1.5'>
      <Label htmlFor='comment'>Your Comment</Label>
      <div className='mt-2'>
        <Textarea id='comment'
          value={input}
          onChange={(e)=>setInput(e.target.value)}
          rows={1}
          placeholder='What are your thoughts?'
        />

        <div className='mt-2 flex justify-between items-center'>
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
          <Button 
          isLoading={isLoading} disabled={input.length === 0} onClick={()=>comment({postId, text: input, replyToId})}>
            Post</Button>
        </div>
      </div>
    </div>
  )
}

export default CreateComment