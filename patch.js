const fs = require('fs');
let content = fs.readFileSync('src/app/r/[slug]/post/[postId]/page.tsx', 'utf8');

const target = `<article className='w-full min-w-0 flex-1 rounded-sm bg-white p-4 sm:p-6'>
        <p className='max-h-40 mt-1 truncate text-xs text-gray-500'>
          Posted by u/{authorUsername}{' '}
          {formatTimeToNow(new Date(createdAt))}
        </p>
        <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
          {title}
        </h1>

        <EditorOutput content={content} />

        <Suspense fallback={
        <Loader2 className='h-5 w-5 animate-spin text-zinc-500'/>
      }>
          {/* @ts-expect-error Server Component */}
          <CommentsSection postId={postId} />
        </Suspense>
      </article>`;

const replacement = `<div className='w-full min-w-0 flex-1 flex flex-col gap-y-4'>
        <article className='w-full min-w-0 flex-1 rounded-sm bg-white p-4 sm:p-6'>
          <p className='max-h-40 mt-1 truncate text-xs text-gray-500'>
            Posted by u/{authorUsername}{' '}
            {formatTimeToNow(new Date(createdAt))}
          </p>
          <h1 className='text-xl font-semibold py-2 leading-6 text-gray-900'>
            {title}
          </h1>

          <EditorOutput content={content} />
        </article>

        <div className='bg-white p-4 sm:p-6 rounded-sm'>
          <Suspense fallback={<Loader2 className='h-5 w-5 animate-spin text-zinc-500'/>}>
            {/* @ts-expect-error Server Component */}
            <CommentsSection postId={postId} />
          </Suspense>
        </div>
      </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/app/r/[slug]/post/[postId]/page.tsx', content);
