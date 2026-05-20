import Link from "next/link";
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
      <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-300/25 to-blue-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-500/15 to-transparent blur-2xl" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight landing-heading">{title}</h1>
          <p className="mt-3 max-w-[78ch] text-sm md:text-base landing-body">{description}</p>
        </div>

        <div
          className="
            docs-body mt-8 text-[15px] leading-7 text-slate-700 dark:text-slate-200
            [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-900 [&_h2]:dark:text-white
            [&_h2]:border-l-4 [&_h2]:border-cyan-500 [&_h2]:pl-3
            [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_h3]:dark:text-white
            [&_p]:mt-4 [&_p]:leading-7
            [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:list-disc
            [&_ol]:mt-4 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:list-decimal
            [&_li]:leading-7
            [&_pre]:mt-5 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-slate-200 [&_pre]:bg-slate-950 [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:leading-6 [&_pre]:text-slate-100 [&_pre]:dark:border-white/10
            [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-slate-800 [&_code]:dark:bg-white/10 [&_code]:dark:text-slate-100
            [&_table]:mt-5 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:border [&_table]:border-slate-200 [&_table]:dark:border-white/10
            [&_th]:bg-slate-50 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-slate-500 [&_th]:dark:bg-white/[0.04] [&_th]:dark:text-slate-300
            [&_td]:border-t [&_td]:border-slate-200 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-sm [&_td]:dark:border-white/10
            [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100
            [&_a]:font-medium [&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-400/60 [&_a]:underline-offset-4 [&_a]:dark:text-blue-400
          "
        >
          {children}
        </div>

        <div className="mt-10 grid sm:grid-cols-2 gap-3">
          {prev ? (
            <Link href={`/docs/${prev.slug}`} className="rounded-xl border landing-border bg-slate-50/80 px-4 py-3 transition-colors hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
              <p className="text-[11px] uppercase tracking-[0.16em] landing-subtle">Previous</p>
              <p className="mt-1 text-sm font-semibold landing-heading">{prev.title}</p>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={`/docs/${next.slug}`} className="rounded-xl border landing-border bg-slate-50/80 px-4 py-3 text-right transition-colors hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.07]">
              <p className="text-[11px] uppercase tracking-[0.16em] landing-subtle">Next</p>
              <p className="mt-1 text-sm font-semibold landing-heading">{next.title}</p>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </article>

      <aside className="docs-toc-card hidden 2xl:block sticky top-28 h-fit p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">On this page</p>
        <div className="mt-2 space-y-1">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block rounded px-2 py-1 text-xs leading-snug text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10 whitespace-normal break-words"
            >
              {item.label}
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
}
