# Website SEO

`src/seo.js` owns public page titles, descriptions, canonicals, social previews and structured data. Project pages update metadata from the displayed project. Internal and missing pages use noindex and omit canonical links.

`npm run build` creates initial HTML metadata for the nine main pages and six local software case studies. Explicit Vercel rewrites serve these files while preserving the API proxy. The initial HTML also contains a visible, linked summary of the page and its relevant project/founder information. React replaces this with the full interactive design when it starts. This is not full server rendering. API-only case studies receive metadata after loading in the browser; add published case studies to the build catalog to provide their social tags without JavaScript.

Run `node scripts/seo.test.mjs` after a production build. When adding a static public route, update `src/seo.js` and its Vercel rewrite together. Social images are in `public/images/social`, with editable SVG sources and 1200×630 PNG outputs.

After deployment:

1. Check the actual response HTML for `/`, `/survey`, `/drone` and a case study. Confirm one canonical and correct social image.
2. Verify the domain in Google Search Console and submit `https://buildwithlami.com/sitemap.xml`. No account verification or submission was performed locally.
3. Use URL Inspection and monitor indexing, search queries and Core Web Vitals. Structured data does not guarantee a rich result or a ranking.
4. Keep business details and case studies accurate. Add real project evidence and client-approved testimonials as they become available.

Unknown SPA routes receive a browser-rendered noindex. The SPA catch-all still returns HTTP 200; true server-side 404 responses and full body prerendering would need a further routing/rendering change.

Guidance: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics and https://vercel.com/docs/project-configuration/vercel-json

## Personal-name visibility and qualified enquiries

The existing professional spelling, Eugene Odibenuah, remains the primary name until confirmed by the owner. The reverse order Odibenuah Eugene is a structured-data name variant. No unconfirmed misspelling is added. The founder entity is connected to the business, About page, portrait and existing LinkedIn/GitHub links.

Public pages are permitted under the shared robots.txt rule, including search crawlers such as OAI-SearchBot. This does not guarantee AI citations or prove that the production host allows these crawlers. Verify any host/CDN bot restrictions after publishing.

Suggested client-acquisition work after deployment:

- Use the same professional name, portrait, service description and website link on LinkedIn and GitHub. Suggested headline: Full-stack Software Engineer | Founder, BuildWithLami | Websites, E-commerce & Custom Software | Lagos, Nigeria. Profile edits have not been published.
- Publish detailed, accurate project stories explaining the client problem, implementation and verified outcome. Obtain permission before naming clients or claiming results. Link each story to its case study and enquiry page.
- Ask satisfied clients for genuine reviews and recommendations; avoid bought mentions or invented testimonials.
- Track qualified enquiries alongside impressions and clicks. Record lead source, requested service, proposal outcome and revenue in the existing sales workflow. Analytics configuration requires the owner's actual measurement account; none was invented.
- Submit the sitemap in Google Search Console and Bing Webmaster Tools, then inspect the About page for name searches. Account verification and submissions remain outstanding.

AI discovery references: https://developers.google.com/search/docs/appearance/ai-features and https://developers.openai.com/api/docs/bots
