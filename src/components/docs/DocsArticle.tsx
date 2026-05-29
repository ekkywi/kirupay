import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText } from "lucide-react";
import { getPrevNextDocs } from "@/lib/docs-nav";

type TocItem = {
  id: string;
  label: string;
};

type DocsArticleProps = {
  slug: string;
  title: string;
  description: string;
  toc?: TocItem[];
  children: React.ReactNode;
};

export default function DocsArticle({ slug, title, description, toc = [], children }: DocsArticleProps) {
  const { prev, next } = getPrevNextDocs(slug);

  return (
    <div className="docs-article-grid">
      <article className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/76 p-5 shadow-xl shadow-slate-900/6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-black/20 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-400/10" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-cyan-300/18 blur-3xl dark:bg-cyan-400/9" />
        <div className="relative border-b border-slate-200/70 pb-7 dark:border-white/10">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.18em] text-blue-800 dark:border-cyan-300/15 dark:bg-blue-300/10 dark:text-cyan-200">
            <BookOpenText className="h-3.5 w-3.5" />
            Guide
          </span>
          <h1 className="mt-5 text-3xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-4xl dark:text-white">{title}</h1>
          <p className="mt-4 max-w-[78ch] text-sm leading-6 text-slate-600 md:text-base dark:text-slate-300">{description}</p>
        </div>

        <div
          className="
            docs-body relative mt-8 text-[15px] leading-7 text-slate-700 dark:text-slate-200
            [&_h2]:mt-11 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:tracking-[-0.025em] [&_h2]:text-slate-950 [&_h2]:dark:text-white
            [&_h2]:border-l-4 [&_h2]:border-blue-400 [&_h2]:pl-3
            [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-black [&_h3]:tracking-tight [&_h3]:text-slate-950 [&_h3]:dark:text-white
            [&_p]:mt-4 [&_p]:leading-7
            [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc
            [&_ol]:mt-4 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:list-decimal
            [&_li]:leading-7 [&_li::marker]:text-blue-500
            [&_pre]:mt-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[1.1rem] [&_pre]:border [&_pre]:border-slate-800 [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-6 [&_pre]:text-slate-100 [&_pre]:shadow-lg [&_pre]:shadow-slate-950/10 [&_pre]:dark:border-white/10
            [&_code]:rounded-md [&_code]:bg-blue-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-semibold [&_code]:text-blue-800 [&_code]:dark:bg-blue-300/10 [&_code]:dark:text-cyan-200
            [&_table]:mt-5 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:border [&_table]:border-slate-200 [&_table]:dark:border-white/10
            [&_th]:bg-blue-50/80 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-black [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-blue-800 [&_th]:dark:bg-blue-300/10 [&_th]:dark:text-cyan-200
            [&_td]:border-t [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-sm [&_td]:dark:border-white/10
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100
            [&_a]:font-bold [&_a]:text-blue-700 [&_a]:underline [&_a]:decoration-blue-400/60 [&_a]:underline-offset-4 [&_a]:dark:text-cyan-300
          "
        >
          {children}
        </div>

        <div className="relative mt-10 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="group rounded-[1.25rem] border border-slate-200/80 bg-white/68 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-blue-300/30 dark:hover:bg-white/[0.07]">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Previous
              </p>
              <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{prev.title}</p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={`/docs/${next.slug}`} className="group rounded-[1.25rem] border border-slate-200/80 bg-white/68 px-4 py-3 text-right transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-blue-300/30 dark:hover:bg-white/[0.07]">
              <p className="inline-flex items-center justify-end gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Next
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </p>
              <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{next.title}</p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </article>

      <aside className="docs-toc-card sticky top-28 hidden h-fit p-4 2xl:block">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700 dark:text-cyan-300">On this page</p>
        <div className="mt-3 space-y-1.5">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block rounded-xl border border-transparent px-3 py-2 text-xs leading-snug text-slate-600 transition-colors hover:border-blue-200/80 hover:bg-blue-50/70 hover:text-blue-800 dark:text-slate-300 dark:hover:border-blue-300/15 dark:hover:bg-blue-300/10 dark:hover:text-cyan-200 whitespace-normal break-words"
            >
              {item.label}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}
