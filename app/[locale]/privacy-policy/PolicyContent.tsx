"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

export default function PolicyContent({ html, isRtl }: { html: string; isRtl: boolean }) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    // Sanitize on the client to avoid jsdom issues on server
    setSanitizedHtml(DOMPurify.sanitize(html));
  }, [html]);

  // Fallback to raw HTML (with warning) or empty while sanitizing
  // Actually, we can just render the raw HTML if we trust it, 
  // but for safety we wait for sanitization.
  // Given it's a privacy policy from their own API, we could probably
  // trust it for the first frame, but let's be safe.
  
  return (
    <article
      className={`
        max-w-none text-slate-700 dark:text-slate-300
        ${isRtl ? 'font-sans text-right' : 'text-left'}
        
        /* Headings */
        [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-6 [&>h1]:text-slate-900 dark:[&>h1]:text-white
        [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-slate-800 dark:[&>h2]:text-slate-100
        [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:text-slate-800 dark:[&>h3]:text-slate-100
        
        /* Paragraphs & Text */
        [&>p]:mb-5 [&>p]:leading-loose [&>p]:text-[1.05rem]
        
        /* Lists */
        [&>ul]:list-disc [&>ul]:ps-8 [&>ul]:mb-6 [&>ul]:space-y-2
        [&>ol]:list-decimal [&>ol]:ps-8 [&>ol]:mb-6 [&>ol]:space-y-2
        [&>li]:leading-relaxed
        
        /* Links */
        [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:font-medium hover:[&_a]:text-primary/80
        
        /* Blockquotes */
        [&_blockquote]:border-s-4 [&_blockquote]:border-primary/30 [&_blockquote]:ps-6 [&_blockquote]:italic [&_blockquote]:my-8
        
        /* Tables */
        [&_table]:w-full [&_table]:my-8 [&_table]:border-collapse
        [&_th]:bg-slate-50 dark:[&_th]:bg-slate-800 [&_th]:p-3 [&_th]:border [&_th]:border-slate-200 dark:[&_th]:border-slate-700 [&_th]:text-start
        [&_td]:p-3 [&_td]:border [&_td]:border-slate-200 dark:[&_td]:border-slate-700
      `}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml || (html ? "..." : "") }}
    />
  );
}
