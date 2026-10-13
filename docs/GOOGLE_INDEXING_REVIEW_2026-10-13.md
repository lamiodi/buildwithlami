# Google indexing review — 13 October 2026

Website: https://www.buildwithlami.com

## Conclusion

The corrected Search Console report supplied by the owner shows 8 **Discovered – currently not indexed** URLs and 2 **Page with redirect** URLs. The eight example URLs all have no last-crawled date. Discovered means Google knows the URL but has not crawled it. This report does not establish why crawling has been postponed or the index status of the homepage. These are the corrected counts; the earlier 19/11 figures are superseded.

Redirecting URLs are not intended to be indexed themselves. The site's apex domain redirects to www, which matches its canonical URLs and sitemap. Keep these domain redirects. Inspect the destination URLs rather than trying to index HTTP, non-www, trailing-slash or legacy-ID variants.

## Confirmed technical findings

- All 15 current sitemap URLs returned HTTP 200 with matching www canonicals, `index, follow` metadata, page-specific titles and initial HTML content. No X-Robots-Tag excluded these pages. Checks included requests with a Googlebot-like user agent; these do not prove access from Google's actual crawler infrastructure.
- robots.txt and sitemap.xml returned HTTP 200. Public routes and the assets required for rendering are allowed. Private client/admin/payment/signing routes remain excluded.
- The homepage's 10 linked JavaScript/CSS resources returned HTTP 200 with appropriate content types.
- Browser checks confirmed that the homepage, About page and MediOS case study rendered their real content. The About page displayed Eugene Odibenuah, an indexable robots directive and the expected canonical. No JavaScript console errors were recorded on About. The initial summary was replaced by React; it did not remain as visible preview text.
- An unknown top-level URL returned HTTP 404. An unknown project returned 503 during an initial backend delay, then correctly returned 404 once the backend responded.
- A real published project at `/projects/033b3854-bbb8-4109-8851-9e507fbb6f10` repeatedly returned HTTP 503 despite its backend record returning HTTP 200. Its canonical slug URL `/projects/medios-hospital-os` already returned HTTP 200. This is a confirmed failure affecting the alternate project URL, not evidence of a homepage indexing block.
- The project handler depended on `process.cwd()/dist/app.html`. In a monorepo runtime rooted above frontend, this location is missing. The revised loader also supports the frontend subdirectory and module-relative packaged file. The live error was hidden by the previous catch block; its exact production filesystem path could not be observed from public responses.
- The static summary's escaping table incorrectly converted ampersands to less-than entities and omitted less-than escaping. Corrected HTML escaping preserves page text and safe markup.

## Changes

- After checking publication and division, published UUID/alternate-ID project requests redirect permanently to the project's slug URL. Existing software projects then use the already generated static case-study HTML.
- Project HTML lookup supports both frontend and repository-root deployment layouts and logs rendering failures for diagnosis.
- Survey and drone project canonical URLs also use their published slug.
- Fixed static summary escaping and added regression coverage for redirects, drafts, unsafe slugs, shell lookup, shell failures and division canonicals.

## Production verification after deployment

Vercel reported successful deployment of commit `a38f8a9`. Checked the eight exact examples from the corrected report after deployment:

| Public URL path | HTTP | Canonical | Robots / content |
| --- | --- | --- | --- |
| /contact | 200 | Matches URL | Indexable; initial HTML present |
| /drone | 200 | Matches URL | Indexable; initial HTML present |
| /projects | 200 | Matches URL | Indexable; initial HTML present |
| /projects/sourceline-limited | 200 | Matches URL | Indexable; initial HTML present |
| /projects/tiabrand-ecommerce | 200 | Matches URL | Indexable; initial HTML present |
| /projects/vonnex2x-enterprise-erp | 200 | Matches URL | Indexable; initial HTML present |
| /projects/wodibenuah-fair | 200 | Matches URL | Indexable; initial HTML present |
| /survey | 200 | Matches URL | Indexable; initial HTML present |

All these URLs use https://www.buildwithlami.com, have no noindex response header, and are included in the live sitemap. The sitemap returned HTTP 200, contained 15 canonical URLs and reflected the updated HTML content date of 2026-10-13. Three requests encountered a brief local DNS lookup failure on the first pass; retries succeeded. This does not establish a DNS failure at Google's crawler.

The formerly failing published UUID URL now returns HTTP 308 with Location `/projects/medios-hospital-os`; following it returns HTTP 200 with that canonical. This verifies the production fix for the alternate URL. It does not show that this separate error caused the eight discovered-page entries, nor that Google has indexed them since deployment.

The two redirecting example URLs were not supplied, so their exact destinations remain unverified. Domain and legitimate legacy-ID redirects should be retained. For the eight discovered URLs, use Search Console's live URL test and request indexing of the canonical pages once; their current HTTP/metadata checks do not show an indexing prohibition.

## Owner actions in Search Console

Local validation passed: production build, 13 routing regression tests, SEO assertions for all 15 generated pages, and actual built-shell rendering from both frontend and repository-root working directories. Deployment verification is separate from these local checks.

1. Keep or re-add the Domain property `buildwithlami.com` and complete Google's ownership verification if requested. Removing a Search Console property does not itself remove the site from Google's index.
2. Submit `https://www.buildwithlami.com/sitemap.xml` and confirm the Sitemaps report says **Success**. The current sitemap has 15 canonical public URLs; a larger historical discovery count is not itself an error.
3. Inspect `https://www.buildwithlami.com/` and `https://www.buildwithlami.com/about`. Choose **Test live URL**, confirm fetch and indexing are allowed, then **Request indexing** once for each important page. Do the same for `/services`, `/projects` and the main service division pages if relevant.
4. Open **Discovered – currently not indexed** and examine its example URLs. Focus on current sitemap URLs. Private application routes, old variants and redirecting URLs should not be forced into the index.
5. Inspect an example from **Page with redirect** and verify its final destination is the expected current URL. HTTP/non-www and legacy project redirects are intentional. Do not remove correct redirects just to clear the report.
6. If canonical public URLs remain undiscovered by crawling, review Search Console's Crawl stats and host availability, then inspect the homepage's referring pages. Keep the site linked from genuine public profiles and publish accurate, useful case studies. Do not repeatedly delete the property, resubmit the same URL, buy links or manufacture testimonials.

These changes improve crawl reliability. Requesting indexing and submitting a sitemap do not guarantee crawling, inclusion or a ranking. No Search Console account actions have been performed by the agent.

## References

- Google Search Console, [Page indexing report](https://support.google.com/webmasters/answer/7440203?hl=en)
- Google Search Central, [Request recrawling](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- Google Search Central, [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- Google Search Central, [Troubleshoot crawling errors](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- Vercel, [Using files in Vercel Functions](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions)
