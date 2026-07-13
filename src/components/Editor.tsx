"use client"

import { FC, useCallback, useEffect, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { useForm } from 'react-hook-form'
import { PostCreationRequest, PostValidator } from '@/lib/validators/post'
import { zodResolver } from '@hookform/resolvers/zod'
import type EditorJs  from '@editorjs/editorjs'
import { uploadFiles } from '@/lib/uploadthing'
import { toast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { usePathname, useRouter } from 'next/navigation'
import {z} from 'zod'
import { Post } from '@prisma/client'

interface EditorProps {
  subredditId: string
  post?: Pick<Post, 'id' | 'title' | 'content'>
}

const Editor: FC<EditorProps> = ({subredditId, post}) => {

    const {
        register,
        handleSubmit,
        formState: {errors},
    } =useForm<PostCreationRequest>({
        resolver: zodResolver(PostValidator),
        defaultValues: {
            subredditId,
            title: post?.title ?? '',
            content: post?.content ?? null,
        },
    })

    const ref = useRef<EditorJs>()
    const [isMounted, setIsMounted] = useState<boolean>(false)
    const _titleRef = useRef<HTMLTextAreaElement>(null)
    const pathname = usePathname()
    const router = useRouter()

    const initializeEditor = useCallback(async () => {
        const EditorJs = (await import('@editorjs/editorjs')).default
        const Header = (await import('@editorjs/header')).default
        const Embed = (await import('@editorjs/embed')).default
        const Table = (await import('@editorjs/table')).default
        const List = (await import('@editorjs/list')).default
        const Code = (await import('@editorjs/code')).default
        const LinkTool = (await import('@editorjs/link')).default
        const InlineCode = (await import('@editorjs/inline-code')).default
        const ImageTool = (await import('@editorjs/image')).default

        if(!ref.current) {
            const editor = new EditorJs({
                holder: 'editor',
                onReady() {
                    ref.current = editor
                },
                placeholder: 'Type here to write your Post...',
                inlineToolbar: true,
                data: post?.content ? (typeof post.content === 'string' ? JSON.parse(post.content) : post.content) : { blocks: [] },
                tools: {
                    header: Header,
                    linkTool:{
                        class: LinkTool,
                        config: {
                            endpoint: '/api/link',
                        },
                    },
                    image:{
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file: File){
                                    const [res] = await uploadFiles("imageUploader", { files: [file] })

                                    return {
                                        success: 1,
                                        file: {
                                            url: res.url,
                                        },
                                    }
                                },
                            },
                        },
                    },
                    list: List,
                    code: Code,
                    inlineCode: InlineCode,
                    table: Table,
                    embed: Embed,
                },
            })
        }
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMounted(true)
        }
    },[])

    useEffect(() => {
        if(Object.keys(errors).length) {
            for(const [_key, value] of Object.entries(errors)) {
                value
                toast({
                    title: 'Something went wrong',
                    description: (value as {message: string}).message,
                    variant: 'destructive',
                })
            }
        }
    }, [errors])

    useEffect(() => {
        const init = async () => {
            await initializeEditor()

            setTimeout(() => {
                _titleRef.current?.focus()
            },0)
        }

        if(isMounted) {
            init()

            return () => {
               ref.current?.destroy()
               ref.current = undefined 
            }
        }
    }, [isMounted, initializeEditor])

    const {mutate:savePost} =useMutation({
        mutationFn: async({
            title,
            content,
            subredditId,
        }: PostCreationRequest) => {
            if (post) {
                const payload = { title, content, postId: post.id }
                const {data} = await axios.patch('/api/subreddit/post/edit', payload)
                return data
            } else {
                const payload : PostCreationRequest = {
                    title,
                    content,
                    subredditId,
                }
                const {data} =await axios.post('/api/subreddit/post/create',payload)
                return data
            }
        },
        onError: () => {
            return toast({
                title: 'Something went wrong',
                description: 'Your post could not be saved, please try again later.',
                variant: 'destructive',
            })
        },
        onSuccess: () => {
            if (post) {
                router.push(`/r/${pathname.split('/')[2]}/post/${post.id}`)
            } else {
                const newPathname =pathname.split('/').slice(0,-1).join('/')
                router.push(newPathname)
            }
            router.refresh()

            return toast({
                description: post ? 'Your post has been updated.' : 'Your post has been Published.',
            })
        },
    })

    async function onSubmit(data: PostCreationRequest) {
        const blocks = await ref.current?.save()

        const payload : PostCreationRequest = {
            title: data.title,
            content:blocks,
            subredditId,
        }

        savePost(payload)
    }

    if (!isMounted) {
        return null
    }

    const {ref: titleRef, ...rest} = register('title')

  return (
     <div className='w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200'>
        <form
         id='subreddit-post-form'
          className='w-fit'
          onSubmit={handleSubmit(onSubmit)}>
            <div className='prose prose-stone dark:prose-invert'>
              <TextareaAutosize
              ref={(e) => {
                titleRef(e)

                // @ts-ignore
                _titleRef.current = e
              }}
              {...rest} 
              
              placeholder='Title' 
              className='w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none' 
              />

              <div id='editor' className='min-h-[500px]'/>  
            </div>
          </form>
     </div>
  ) 
}

export default Editor
