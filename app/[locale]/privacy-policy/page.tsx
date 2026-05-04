import DOMPurify from "isomorphic-dompurify";
import { Metadata } from "next";

// Force dynamic rendering to prevent caching as requested
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Privacy Policy | DENTZONE",
  description: "Privacy Policy for DENTZONE platform",
};

interface PrivacyPolicyProps {
  params: {
    locale: string;
  };
  searchParams: {
    lang?: string;
  };
}

export default async function PrivacyPolicyPage({
  params,
  searchParams,
}: PrivacyPolicyProps) {
  const { locale } = params;
  const lang = searchParams.lang;

  /**
   * Determine API language:
   * 1 = Arabic
   * 2 = English
   * Priority: searchParams.lang > params.locale
   */
  let apiLang = "1"; // Default Arabic
  if (lang === "1" || lang === "2") {
    apiLang = lang;
  } else {
    // If locale is 'en', use lang=2, otherwise use lang=1 (Arabic)
    apiLang = locale === "en" ? "2" : "1";
  }

  const apiUrl = `https://dentzoneapi.runasp.net/api/Policy/get-policy?lang=${apiLang}`;

  let htmlContent = "";
  let error = null;

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch policy: ${response.statusText}`);
    }

    htmlContent = await response.text();
  } catch (err) {
    console.error("Error fetching privacy policy:", err);
    error = err;
    htmlContent = apiLang === "1"
      ? "<p>حدث خطأ أثناء تحميل سياسة الخصوصية. يرجى المحاولة مرة أخرى لاحقاً.</p>"
      : "<p>An error occurred while loading the privacy policy. Please try again later.</p>";
  }

  // Sanitize HTML to protect against XSS
  const sanitizedHtml = DOMPurify.sanitize(htmlContent);

  // Determine layout direction
  const isRtl = apiLang === "1";
  const dir = isRtl ? "rtl" : "ltr";

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8" dir={dir}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          {/* Header Section */}
          <div className="bg-primary/5 py-8 px-6 md:px-10 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center p-2 border border-slate-100 dark:border-slate-700">
                <img src="/LOGO.png" alt="DENTZONE Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white text-center">
                {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {isRtl ? "منصة DENTZONE" : "DENTZONE Platform"}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-12">
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
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </div>

          {/* Footer Section */}
          <div className="bg-slate-50 dark:bg-slate-900/50 py-8 px-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>
              {isRtl ? "© ٢٠٢٤ DENTZONE. جميع الحقوق محفوظة." : "© 2024 DENTZONE. All rights reserved."}
            </div>
            <div className="flex items-center gap-4">
              {isRtl ? (
                <span>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</span>
              ) : (
                <span>Last Updated: {new Date().toLocaleDateString('en-US')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Language Switcher - Optional but nice */}
        <div className="mt-8 flex justify-center gap-4">
          <a
            href={`/${locale}/privacy-policy?lang=1`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${apiLang === '1' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}
          >
            العربية
          </a>
          <a
            href={`/${locale}/privacy-policy?lang=2`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${apiLang === '2' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}
          >
            English
          </a>
        </div>
      </div>
    </main>
  );
}
