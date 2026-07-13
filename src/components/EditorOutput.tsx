"use client"

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { FC } from 'react'


const Output= dynamic(
    async () => (await import('editorjs-react-renderer')).default,
{
    ssr: false,
})
interface EditorOutputProps {
    content: any
}

const style={
    paragraph:{
        fontsize:'0.875rem',
        lineHeight:'1.25rem',
    },
}

const renderers = {
    image:CustomImageRenderer,
    code:CustomCodeRenderer,
    table:CustomTableRenderer,
    linkTool: CustomLinkRenderer,
}

const EditorOutput: FC<EditorOutputProps> = ({content}) => {
  if (!content) return null
  
  let parsedContent
  try {
    parsedContent = typeof content === 'string' ? JSON.parse(content) : content
  } catch (e) {
    return null
  }

  // editorjs-react-renderer crashes if data.blocks is missing
  if (!parsedContent || !parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
    return null
  }

  return( 
  <Output data={parsedContent}  style={style} className='text-sm' renderers={renderers}/>
)}

function CustomCodeRenderer({data}: any) {
  return (
      <pre className='bg-gray-800 rounded-md p-4'>
        <code className='text-gray-100 text-sm'>{data.code}</code>
      </pre>
  )  
}

function CustomImageRenderer({data}: any) {
  const src =data.file.url

  return (
      <div className='relative w-full min-h-[15rem]'>
        <Image alt='image' className='object-contain' fill src={src} />
      </div>
  )
}

function CustomTableRenderer({ data }: any) {
  const { content, withHeadings } = data
  if (!content || !Array.isArray(content) || content.length === 0) return null

  const headings = withHeadings ? content[0] : null
  const rows = withHeadings ? content.slice(1) : content

  return (
    <div className='overflow-x-auto my-4'>
      <table className='min-w-full divide-y divide-gray-200 border'>
        {headings && (
          <thead className='bg-gray-50'>
            <tr>
              {headings.map((heading: string, i: number) => (
                <th key={i} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border'>
                  <div dangerouslySetInnerHTML={{ __html: heading }} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className='bg-white divide-y divide-gray-200'>
          {rows.map((row: string[], rowIndex: number) => (
            <tr key={rowIndex}>
              {row.map((cell: string, cellIndex: number) => (
                <td key={cellIndex} className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 border'>
                  <div dangerouslySetInnerHTML={{ __html: cell }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CustomLinkRenderer({ data }: any) {
  return (
    <a href={data.link} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row bg-zinc-50 border border-zinc-200 rounded-md overflow-hidden hover:bg-zinc-100 transition-colors my-4 no-underline">
      {data.meta?.image?.url && (
         <div className="relative w-full sm:w-48 h-32 sm:h-auto bg-zinc-100 shrink-0">
           <Image src={data.meta.image.url} alt="preview" fill className="object-cover" />
         </div>
      )}
      <div className="p-4 flex flex-col gap-1 overflow-hidden">
        <h3 className="font-semibold text-base text-zinc-900 truncate m-0">{data.meta?.title || data.link}</h3>
        {data.meta?.description && (
          <p className="text-sm text-zinc-500 line-clamp-2 m-0">{data.meta.description}</p>
        )}
        <p className="text-xs text-zinc-400 mt-1 truncate m-0">{data.link}</p>
      </div>
    </a>
  )
}

export default EditorOutput