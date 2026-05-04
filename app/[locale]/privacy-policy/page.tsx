import { Metadata } from "next";
import PolicyContent from "./PolicyContent";
import { Link } from "@/i18n/routing";

// Force dynamic rendering to prevent caching
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
  const lang = searchParams?.lang;

  /**
   * Determine API language:
   * 1 = Arabic
   * 2 = English
   */
  let apiLang = "1"; // Default Arabic
  if (lang === "1" || lang === "2") {
    apiLang = lang;
  } else {
    apiLang = locale === "en" ? "2" : "1";
  }

  const apiUrl = `https://dentzoneapi.runasp.net/api/Policy/get-policy?lang=${apiLang}`;

  let htmlContent = "";

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        "Accept": "text/html",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    htmlContent = await response.text();
  } catch (err) {
    console.error("Error fetching privacy policy:", err);
    htmlContent = apiLang === "1"
      ? "<p>حدث خطأ أثناء تحميل سياسة الخصوصية. يرجى المحاولة مرة أخرى لاحقاً.</p>"
      : "<p>An error occurred while loading the privacy policy. Please try again later.</p>";
  }

  const isRtl = apiLang === "1";
  const dir = isRtl ? "rtl" : "ltr";
  
  // Safe date formatting
  const today = new Date();
  const formattedDate = isRtl 
    ? `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
    : today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
                {isRtl ? "منصة DENTZONE" : "DENTZONE Platform"}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-12">
            <PolicyContent html={htmlContent} isRtl={isRtl} />
          </div>

          {/* Footer Section */}
          <div className="bg-slate-50 dark:bg-slate-900/50 py-8 px-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>
              {isRtl ? "© ٢٠٢٤ DENTZONE. جميع الحقوق محفوظة." : "© 2024 DENTZONE. All rights reserved."}
            </div>
            <div className="flex items-center gap-4">
              <span>{isRtl ? "آخر تحديث: " : "Last Updated: "}{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/privacy-policy?lang=1"
            locale={locale}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${apiLang === '1' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}
          >
            العربية
          </Link>
          <Link
            href="/privacy-policy?lang=2"
            locale={locale}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${apiLang === '2' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}
          >
            English
          </Link>
        </div>
      </div>
    </main>
  );
}
