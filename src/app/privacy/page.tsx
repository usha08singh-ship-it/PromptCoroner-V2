import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-300 flex flex-col pt-20 px-6">
      <div className="max-w-3xl mx-auto w-full flex-1 mb-20">
        <Link href="/" className="text-brand-accent hover:text-white transition-colors mb-8 inline-block font-medium">
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold text-white mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-sm leading-relaxed glass-panel p-8 rounded-3xl">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as your email address when you authenticate, and the text prompts you submit for analysis.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your email address solely for account management and tracking your daily usage limits. The prompts you submit are sent to our AI partners (e.g., Groq) for the purpose of generating forensic diagnostics and rewritten alternatives.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Sharing and Security</h2>
            <p>We do not sell, rent, or share your personal information or email address with third-party advertisers. Your data is stored securely using industry-standard infrastructure (Supabase). We employ security measures to protect against unauthorized access.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookies and Tracking</h2>
            <p>We use standard session cookies to keep you logged in. We do not use invasive third-party tracking pixels for advertising purposes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
