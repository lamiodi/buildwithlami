import { Link, useParams } from 'react-router-dom';
import { guides, guidePath } from '../data/guides.js';
import GuidesPreview from '../components/GuidesPreview.jsx';
import NotFoundPage from './NotFoundPage.jsx';

export default function GuidesPage() {
  const { slug } = useParams();
  const guide = guides.find(item => item.slug === slug);
  if (slug && !guide) return <NotFoundPage />;
  if (!guide) return <div className="pt-28 pb-16"><header className="mx-auto max-w-7xl px-6 md:px-12"><h1 className="font-heading text-4xl font-bold sm:text-5xl">Website planning & project guides</h1><p className="mt-5 max-w-2xl leading-relaxed text-gray-600 dark:text-gray-300">Practical guidance from Eugene Odibenuah at BuildWithLami, drawn from the work in this portfolio.</p></header><GuidesPreview /></div>;
  return (
    <article className="mx-auto max-w-4xl px-6 pb-20 pt-32 md:px-12">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-gray-600 dark:text-gray-300"><Link to="/">Home</Link><span aria-hidden="true"> / </span><Link to="/guides">Guides</Link></nav>
      <p className="text-xs font-mono uppercase tracking-widest text-accent">{guide.category}</p>
      <h1 className="mt-4 font-heading text-4xl font-bold leading-tight sm:text-5xl">{guide.title}</h1>
      <p className="mt-5 text-sm text-gray-600 dark:text-gray-300">By <Link to="/about" className="underline underline-offset-4">Eugene Odibenuah</Link> · <time dateTime={guide.date}>15 October 2026</time></p>
      <p className="mt-8 text-lg leading-relaxed text-gray-700 dark:text-gray-200">{guide.intro}</p>
      {guide.image && <figure className="mt-8"><img src={guide.image} alt={guide.imageAlt} width="1440" height="900" className="h-auto w-full rounded-2xl border border-gray-200 dark:border-white/10" /><figcaption className="mt-3 text-sm text-gray-500 dark:text-gray-400">{guide.imageAlt}. <Link to={`/projects/${guide.projectSlug}#project-gallery`} className="underline">Explore the project gallery</Link>.</figcaption></figure>}
      <nav aria-label="In this guide" className="my-10 rounded-2xl border border-gray-200 p-6 dark:border-white/10"><p className="font-semibold">In this guide</p><ul className="mt-3 space-y-2">{guide.sections.map(section => <li key={section.id}><a className="inline-block py-1 text-sm underline underline-offset-4 hover:text-accent" href={`#${section.id}`}>{section.title}</a></li>)}</ul></nav>
      {guide.sections.map(section => (
        <section key={section.id} id={section.id} className="my-10 scroll-mt-28">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">{section.title}</h2>
          {section.paragraphs?.map(paragraph => <p key={paragraph} className="mt-4 leading-relaxed text-gray-700 dark:text-gray-200">{paragraph}</p>)}
          {section.items && <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-700 dark:text-gray-200">{section.items.map(item => <li key={item}>{item}</li>)}</ul>}
        </section>
      ))}
      <aside className="mt-12 rounded-2xl border border-gray-200 p-6 dark:border-white/10"><h2 className="text-2xl font-heading font-bold">Put this into practice</h2><p className="mt-4 leading-relaxed">Review <Link to={`/projects/${guide.projectSlug}`} className="underline decoration-accent underline-offset-4">{guide.projectTitle}</Link>, explore <Link to={`/services#${guide.serviceAnchor}`} className="underline underline-offset-4">the related service</Link> and compare <Link to={`/pricing#${guide.service}`} className="underline underline-offset-4">current pricing and inclusions</Link>.</p><Link to={`/contact?service=${guide.service}`} className="btn-primary mt-6 inline-flex">Discuss your project</Link></aside>
      <nav aria-label="More guides" className="mt-10 border-t border-gray-200 pt-6 dark:border-white/10">{guides.filter(item => item.slug !== guide.slug).map(item => <Link key={item.slug} className="block py-3 underline underline-offset-4" to={guidePath(item)}>{item.title}</Link>)}</nav>
    </article>
  );
}
