import { Link } from 'react-router-dom';
import { guides, guidePath } from '../data/guides.js';

export default function GuidesPreview() {
  return (
    <section aria-labelledby="guides-heading" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-mono uppercase tracking-widest text-accent">From scope to delivery</p>
        <h2 id="guides-heading" className="mt-3 text-3xl font-heading font-bold sm:text-4xl">Plan your next website with confidence.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {guides.map(guide => (
            <article key={guide.slug} className="rounded-2xl border border-gray-200 p-6 dark:border-white/10">
              <p className="text-xs text-gray-500 dark:text-gray-400">{guide.category} · By Eugene Odibenuah</p>
              <h3 className="mt-3 text-xl font-heading font-bold"><Link to={guidePath(guide)} className="hover:text-accent focus-visible:outline-accent">{guide.title}</Link></h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{guide.description}</p>
              <Link to={guidePath(guide)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Read the guide <span className="sr-only">: {guide.title}</span></Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
