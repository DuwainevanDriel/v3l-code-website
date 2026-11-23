# SEO, analytics and Google Ads

## Environment variables (all optional)

| Variable                       | Purpose                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GTM_ID`           | GTM container id (`GTM-XXXXXXX`). Without it there is no consent banner and no tracking. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Search Console HTML-tag token. Rendered as `<meta name="google-site-verification">`.     |
| `NEXT_PUBLIC_PHONE`            | E.164 number. Shows click-to-call links in footer and contact page.                      |

Set them in Vercel (Production + Preview) and redeploy; `NEXT_PUBLIC_*` values are baked in at build time.

## Search Console

Either: add `NEXT_PUBLIC_GSC_VERIFICATION` (token from "HTML tag" method) and redeploy, or verify the domain with a DNS TXT record at the registrar (preferred, covers all subdomains). Then submit `https://v3lcode.com/sitemap.xml`.

## Consent

- With `NEXT_PUBLIC_GTM_ID` set, a head script sets Google Consent Mode v2 defaults to `denied`.
- GTM is **not loaded** until the visitor clicks Accept. Choice is stored in `localStorage` (`v3l-consent`). Footer "Cookie settings" reopens the choice.
- Declining sends a `denied` consent update; no conversion events are pushed.

## Events pushed to `dataLayer` (after consent)

| Event           | When                                      | Params                                                  |
| --------------- | ----------------------------------------- | ------------------------------------------------------- |
| `generate_lead` | Contact form or landing-page form success | `form_source` (`contact` or the campaign slug), `gclid` |
| `click_to_call` | Click on any `tel:` link                  | `link_url`, `gclid`                                     |
| `click_email`   | Click on any `mailto:` link               | `link_url`, `gclid`                                     |

## GTM setup (one-off, in the GTM container)

1. Tag: Google tag / GA4 configuration with the GA4 measurement id, trigger All Pages, consent checks on `analytics_storage`.
2. Tags: GA4 Event for each custom event above (Custom Event triggers with the same names). Mark `generate_lead` as a key event in GA4.
3. Google Ads: Conversion Linker (All Pages) and a Conversion tag on `generate_lead` (and optionally `click_to_call`), with `ad_storage` consent required.
4. Verify with GTM Preview / GA4 DebugView.

## gclid

Redirects keep query strings. After consent, the `gclid` is stored in `localStorage` (`v3l-gclid`) and attached to conversion events; the Conversion Linker also keeps it in `_gcl_aw`.

## Ads landing pages

`/lp/[campaign]`: minimal header, one form, `noindex`. Add campaigns in `src/lib/campaigns.ts`.

## Structured data

Organization (all pages), BreadcrumbList (inner pages), Service (service pages), FAQPage (pricing, mirrors visible FAQ). No LocalBusiness: no street address has been supplied.
