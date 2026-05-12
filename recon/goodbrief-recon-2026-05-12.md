# Goodbrief.io — Forensic Recon Dossier
Date: 2026-05-12 | Target: https://www.goodbrief.io | Method: static analysis only (no JS execution)

---

## 1. Surface map

All fetches over HTTPS. Headers from `curl -I`/`-D`.

| Path | Status | Content-Type | Size | Notes |
|------|--------|--------------|------|-------|
| `/` | 200 | text/html | 42,429 | Main app (index.html, full nav + radio options + brief output shell). |
| `/about` | 200 | text/html | 17,726 | About page (server-rendered HTML — different from SPA fallback). |
| `/faq` | 200 | text/html | 12,652 | FAQ page (server-rendered). |
| `/newsletter` | 200 | text/html | 15,311 | Buttondown embedded form. |
| `/robots.txt` | 200 | **text/html** 11,005 | SPA/Express fallback. No real robots.txt exists. |
| `/sitemap.xml` | 200 | text/html 11,005 | Same fallback. **No sitemap.** |
| `/manifest.json` | 200 | application/json | 359 | Real PWA manifest (see §3). |
| `/humans.txt` | 200 | text/html 11,005 | Fallback. **No humans.txt.** |
| `/sitemap_index.xml` | 200 | text/html 11,005 | Fallback. |
| `/brief/logo` | 200 | text/html 11,005 | Fallback (no route). |
| `/brief/logo/food` | 404 | text/html 154 | Real 404. |
| `/briefs` `/library` `/examples` | 200 | text/html 11,005 | All fallback (no route). |
| `/api/generate` `/api/brief` `/tag/logo` | 404 | text/html | Real 404. |
| `/v1` | 200 | text/html 2,849 | **Legacy v1 site is still live.** Critical — see §4. |
| `/brief` (POST) | 200 | application/json | varies | **Generation endpoint.** Returns `{name,desc,job,deadline}`. |
| `/export` (POST) | 200 | application/pdf or image/png | ~30 KB | Server-rendered PDF/PNG of the brief. |

Express server with SPA fallback returns index.html for unknown GETs (size 11,005 = pre-render index). Real pages (`/about`, `/faq`, `/newsletter`) have distinct sizes.

---

## 2. Tech stack (evidence-based)

**Server (verbatim headers, `/`):**
```
Server: Heroku
Via: 1.1 heroku-router
X-Powered-By: Express
Vary: Accept-Encoding
Etag: W/"a5bd-VqcCnd0SfkXuN8tdCFJL6fmJMDQ"
Nel: {"report_to":"heroku-nel",...}
```
No CDN (no cf-ray, no x-vercel-id, no x-amz-cf-id). Hosted directly on **Heroku** (Express/Node). NEL reporting endpoint = heroku-nel.

**Front end:** Plain server-rendered HTML + a single 8.1 KB hand-written script `/js/main.min.js` (NOT bundled by Webpack — not React/Vue/Next/Nuxt/Svelte/Astro). No `__NEXT_DATA__`, no `__NUXT__`, no hydration markers. CSS is a single `/main.min.css` (43 KB) compiled via Tailwind — class names include `bg-teal-500 dark:bg-black min-h-screen overflow-auto transition-colors duration-1000`, `sm:max-w-1/3`, arbitrary values like `text-[0.65em]`. There is **no JS framework**.

**Icons:** `ionicons@5.4.0` from unpkg (CDN script tags).

**Bundle paths (all `<script>` and `<link href>` from `/`):**
```
<script src="https://www.googletagmanager.com/gtag/js?id=UA-131354364-1">
<script defer data-domain="goodbrief.io" src="https://plausible.io/js/script.tagged-events.js">
<script src="/js/main.min.js">
<script src="https://unpkg.com/ionicons@5.4.0/dist/ionicons.js">
<script type="module" src="https://unpkg.com/ionicons@5.4.0/dist/ionicons/ionicons.esm.js">
<script nomodule src="https://unpkg.com/ionicons@5.4.0/dist/ionicons/ionicons.js">
<script src="//m.servedby-buysellads.com/monetization.custom.js">

<link rel="manifest" href="/favicons/site.webmanifest?v=3">
<link rel="preload" href="/main.min.css" as="style">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap">
<link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,800&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100..1,900&display=swap">
```

**Fonts:** Google Fonts — Roboto Mono (400, 700), Nunito Sans (400, 700, 800), Poppins (all weights + italics). Not self-hosted.

**Analytics — verbatim:**
- Google Analytics (Universal, deprecated since GA4): `gtag('config','UA-131354364-1')`
- Plausible: `<script defer data-domain="goodbrief.io" src="https://plausible.io/js/script.tagged-events.js">` — uses `plausible-event-name=...` class attributes for custom events (e.g. `plausible-event-name=Merch+Header` on newsletter link).

**Ads:** BuySellAds (`servedby-buysellads.com/monetization.custom.js`) + CarbonAds on mobile only (injected in JS: `cdn.carbonads.com/carbon.js?serve=CESIPK77&placement=goodbriefio`).

---

## 3. SEO & metadata

**Verbatim from `/` `<head>`:**
```html
<title>Get Unique Design Briefs - Creative Brief Generator | Good Brief</title>
<meta name="title" content="Goodbrief: Get Unique Design Briefs" />
<meta name="description" content="Randomly generate smart design briefs to practice your design skills, get content for your portfolio and gain experience working off a real design brief." />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://goodbrief.io/" />
<meta property="og:title" content="Goodbrief: Get Unique Design Briefs" />
<meta property="og:description" content="Randomly generate design briefs to practice your design skills, get content for your portfolio and gain experience." />
<meta property="og:image" content="https://goodbrief.io/social.png" />
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://goodbrief.io/" />
<meta property="twitter:title" content="Goodbrief: Get Unique Design Briefs" />
<meta property="twitter:description" content="Randomly generate design briefs to practice your design skills, get content for your portfolio and gain experience." />
<meta property="twitter:image" content="https://goodbrief.io/social.png" />
<meta name="theme-color" content="#0F9587" />
<meta name="apple-mobile-web-app-title" content="Goodbrief" />
<meta name="application-name" content="Goodbrief" />
<meta name="msapplication-TileColor" content="#086054" />
```

- **No `<link rel="canonical">`** anywhere.
- **No `<meta name="robots">`** anywhere.
- **No JSON-LD / schema.org** blocks (`grep -oE '<script type="application/ld\+json">'` returned nothing).
- **No hreflang / alternate** tags.
- **No sitemap.xml** (the URL returns the SPA fallback HTML).
- **No robots.txt** (same).
- `/about`, `/faq`, `/newsletter` reuse the homepage `<title>` and meta tags — **they do not have route-specific SEO metadata**.

**Manifest (`/manifest.json` verbatim):**
```json
{
  "short_name": "/Brief",
  "name": "/Brief: Creative Design Brief Generator",
  "icons": [{"src":"icon.png","sizes":"192x192","type":"image/png"}],
  "start_url": "/?utm_source=homescreen",
  "background_color": "#00BFA5",
  "Theme_color": "#00BFA5",
  "display": "standalone"
}
```
Note the typo: `Theme_color` (capital T). The HTML also references a second manifest at `/favicons/site.webmanifest?v=3`.

**Indexable URL count today:** effectively 4 (`/`, `/about`, `/faq`, `/newsletter`) plus `/v1`. No per-(type,industry) routes, no permalinks for generated briefs.

---

## 4. The combinatorial database (CRITICAL)

### Architecture

**Generation runs server-side.** `main.min.js` posts to `/brief`:

```js
fetch("/brief", { method:"POST", mode:"cors",
  headers:{"Content-Type":"application/json"},
  body: JSON.stringify({job:e[0], industry:e[1]}) })
  .then(e=>e.json())
  .then(e=>{ setLoading(!1); renderBrief(window.brief=e) });
```

Response shape (verbatim sample for `{job:"logo",industry:"food"}`):
```json
{"name":"Bloomer",
 "desc":"We are a company that makes and distributes Mexican soft drinks. Our main product is made with love and shipped directly to your home. Our target audience is parents. We want to convey a sense of innocence, while at the same time being inexpensive.",
 "job":"You must create a logo using the information given in this brief. They would prefer an emblem logo that uses the color green. The logo will be used on the company website. Take into account the company's values and preferences, and make sure it will work for the planned use-cases.",
 "deadline":"4 days"}
```

The current (v3) database is NOT in the client bundle. `main.min.js` is 8,262 bytes and contains zero string arrays of generator data. **The DB is server-side on Heroku and not directly downloadable.**

### v1 = full client-side DB still online at `/v1`

`/v1` is the legacy v1 site, still served at https://goodbrief.io/v1 with this banner: *"A new version is available! Check out goodbrief.io"*. Its generator is **fully client-side** in `/js/v1/script.js` (67,914 bytes). Internally credited: `// Drug-o-Matic Name Generator by Wordlab www.wordlab.com`.

**Extracted v1 array inventory** (counts via regex over `new Array(...)` literals):

| Array | Count | Purpose | Sample items |
|---|---|---|---|
| `array1` | 43 (13 non-empty) | Name prefix | `"Black ","Blue ","Flying ","Gold ","Green ","Hot ","Jumping ","Live ","Main ","New ","Red ","Running ","Silver "` (30 blanks for weighted "no prefix") |
| `array2` | **4,941** | Name core (Wordlab list) | `Abundant, Abyss, Acorn, Acre, Adieu, Adoo, Aerial, Aero, Afterglow, Agent, Agio, Agog, Aha!, Air Cell, Air Flow, ... Babylon, ... Jetsound, ... Ultrasonic` |
| `array3` | 34 (24 non-empty) | Name suffix | `" Factory"," Flux"," Global"," Inc"×6," Industries"×2," International"," Mix"," Services"×2," Systems"×4," Technologies"×2," Works"×2," Worldwide"` (10 blanks; "Inc" weighted 6×) |
| `word1array` (tech) | 4 | Tech action verb | `develops, produces, inspires, researches` |
| `word2array` (tech) | 42 | Tech use-case | `communicate, connect, travel, ...` (matches v3: "to be healthy", "to listen to music", "to learn code", etc.) |
| `word3array` (tech) | 6 | Tech ingredient A | `innovative software, big ideas, a dedicated team, blockchain technology, machine learning, years of experience in the industry` |
| `word4array` (tech) | 5 | Tech ingredient B | `beautiful design, an easy to use interface, a friendly face, ease of use, a lovable mascot` |
| `word5array` (tech) | 2 | Product type | `an app, a device` |
| `word6array` (tech) | 4 | Where used | `on the go, at home, wherever you are, ...` |
| `word7array` (tech) | 4 | Tech backing | `our groundbreaking technology, new creative techniques, years of scientific discovery, our cloud technology` |
| `word8array` (shared) | 17 | "sense of X" emotion | `comfort, wonder, innocence, ...` (v3 also returns: bravery, delight, eagerness, elegance, excitement, faithfulness, fame, glamour, importance, mystery, security, victory) |
| `word9array` (shared) | 14 | "while being Y" adjective | `realistic, down-to-earth, professional, agreeable, approachable, business-like, calm, fresh, gentle, inexpensive, kind, lively, modern, old-fashioned` |
| `word1array` (food) | 15 | Cuisine adj | `vegan, vegetarian, low-calorie, ...` (v3 adds nationalities: African, German, Greek, Indian, Israeli, Italian, Mexican, Russian, all-American, delicious, gluten-free, healthy) |
| `word2array` (food) | 7 | Food noun | `food, drinks, desserts, pastries, snacks, finger-food, soft drinks` |
| `word3array` (food) | 5 | Process | `a secret recipe, fresh ingredients, the world's top chefs, love, attention to detail` |
| `word4array` (food) | 4 | Distribution | `shipped directly to your home, available in stores worldwide, served in your favorite diners, served in 5-star restaurants across the nation` |
| `word1array` (store) | 3 | Store type | `little corner-shop, big chain of stores, family store` |
| `word2array` (store) | 31 | Product type | `specialty goods, party supplies, board games, ...` |
| `word3array` (store) | 3 | Differentiator | `superior quality, reputation, price` |
| `word4array` (store) | 4 | USP | `home-made feel, authenticity, convenience, ...` |
| `word1array` (ent) | 20 | Media type | `indie movies, web shows, comic books, ...` |
| `word3array` (ent) | 9 | Price adj | `suprisingly witty [sic], cheap, expensive, ...` |
| `genderA` | 3 | Audience gender | `male, female, ""` (blank = unisex) |
| `occupationA` | 7 | Audience age | `seniors, adults, teens, ...` |
| `moneyA` | 12 | Audience class | `" of the lower class"," of the middle class"," of the upper class", ...` |
| `colorStyleArray` | 4 | Color style | `One Color, Two Color, Full Color, ...` |
| `colorArray` | 11 | Brand color | `Red, Orange, Yellow, ...` (v3 returns: black, blue, green, grey, orange, purple, red, white, yellow) |
| `logoStyleArray` | 4 | Logo type | `Combination Logo, Monogram, Wordmark, ...` (v3 returns 7: combination mark, lettermark, mascot logo, pictorial mark, wordmark, abstract logo mark, emblem logo) |
| `printArray` `embroideryArray` `vehicleArray` `iconArray` | 2 each | Use-case toggles | `"Print.","" / "Embroidery.","" / ...` |

### v1 generation function — verbatim

Company name: `compNameGen()` picks one item from array1+array2+array3 uniformly at random:
```js
var max1 = 42; var max2 = 4940; var max3 = 33;
index1 = Math.round(Math.random()*max1);
index2 = Math.round(Math.random()*max2);
index3 = Math.round(Math.random()*max3);
```
Combinatorial space (v1 names) = 43 × 4941 × 34 = **7,221,342 unique names**.

Deadline (v1, with bugs):
```js
var deadline = Math.floor((Math.random()*8)+1);
if (deadline/4 == 1) return(deadline/4 + " Month.")
else if (deadline/4 == 2) return(deadline/4 + " Months.");
else if (deadline==1) return(dealine + " Week.")   // typo: 'dealine' = ReferenceError
else return(deadline + " Weeks.")
```
Note `dealine` typo (undefined variable). v3 fixed this — deadlines now return strings like `"3 days"`, `"1 week"`, `"6 days"`, `"10 days"` (observed range 1–10 days uniformly).

Job descriptions in v1 are mostly **static strings** per type (e.g. branding: *"You must create the total branding package. This includes creating an appropriate brand name, a consistent visual system, and of course a great logo."*). v3 retains this exact string verbatim for `brandid` (confirmed: 3 sequential `brandid/tech` requests returned byte-identical job strings).

### v3 server-side DB — measured from sampling

I cannot read the v3 source directly, but slot-level inventories extracted from 40 `logo/food` + 30 `website/tech` API calls:

**Deadlines (v3):** uniform over `{2 days, 3 days, 4 days, 5 days, 6 days, 8 days, 9 days, 10 days, 1 week}` (1 week == 7; 1–10 day range minus a couple unobserved).

**Logo style preferences (v3, 7 items):** `combination mark, lettermark, mascot logo, pictorial mark, wordmark, abstract logo mark, emblem logo`.

**Brand colors (v3, 9 items):** `black, blue, green, grey, orange, purple, red, white, yellow`.

**Logo use-cases (v3, 3 items):** `embroidered on uniforms / printed on the side of vehicles / used on the company website`.

**Target audience (v3, 11 items observed):** `adults, college students, couples, married couples, men, millenials [sic], parents, people on a budget, people who live alone, women, young adults`.

**"Sense of X" (v3, 15 emotions observed):** `bravery, comfort, delight, eagerness, elegance, excitement, faithfulness, fame, glamour, importance, innocence, mystery, security, victory, wonder`.

**"While being Y" (v3, 13 adjectives observed):** `agreeable, approachable, business-like, calm, down-to-earth, fresh, gentle, inexpensive, kind, lively, modern, old-fashioned, realistic`.

**Food description slot fills (v3):** cuisine adj × food noun. Observed cuisines: `African, German, Greek, Indian, Israeli, Italian, Mexican, Russian, all-American, delicious, gluten-free, healthy, low-calorie, vegan, vegetarian` (15). Food nouns: `food, drinks, soft drinks, snacks, finger-food, pastries, desserts` (7).

**Food "made with" process (v3, 5):** `a secret recipe / attention to detail / fresh ingredients / love / the world's top chefs`. **Distribution (4):** `shipped directly to your home / available in stores worldwide / served in 5-star restaurants across the nation / served in your favorite diners`.

**Tech description verbs (v3, 4):** `develops / produces / inspires / researches`.

**Tech use-cases (v3, ≥20 observed):** `be healthy / check the weather / communicate / create / discover new movies / discover places to eat / drink / keep track of your appointments / keep up with the latest fashions / learn a language / learn code / listen to music / make payments / play games / read books / read your mail / share your music / share your photos / share your videos / travel`.

**Tech ingredient A (v3, 6):** `a dedicated team / big ideas / blockchain technology / innovative software / machine learning / years of experience in the industry`. **B (v3, 6):** `a friendly face / a lovable mascot / an easy to use interface / beautiful design / ease of use / the latest fashions`.

**Website goals (v3, 7):** `emphasize the brand's values / increase sales / increase search rankings / make a landing page that maximizes conversions / make it clear what the company does / make the website easy to navigate / provide a great user experience`. **Pages combinator (v3):** `{about page | contact page | information page}` × `{product pages | shop page}` × `{blog | privacy policy page | terms of service page}` = 18 page combos. **Style preferences (v3, 7):** `colorful, luxurious, minimal, modern, monochromatic, old-fashioned, trendy`.

**Job types (radio values verbatim from index.html):** `logo, billboard, brandid, illus, packaging, website, random` (7 — minus "random" = 6 real).

**Industries (radio values verbatim):** `tech, store, ent, edu, fashion, food, realestate, sports, transp, travel, random` (11 — minus "random" = 10 real). The HTML emits radios in this order with ion-icons (shapes, magnet, color-palette, etc.). Note: industry `edu, fashion, realestate, sports, transp, travel` did not exist in v1.

**Theoretical combo grid:** 6 jobs × 10 industries = **60 (type, industry) pairs** (all valid — every pair I tested returned 200 with a coherent brief).

### Structure

The DB is **slot-keyed by industry** (a template per industry is selected, with sub-arrays per slot), and **template-keyed by job** (each job picks its own job-description template family). The output is one company-description sentence assembled from industry-specific slots + a job-description sentence assembled from job-specific slots + a uniform-random deadline + a generated company name. Names are still the v1 Wordlab schema (prefix + core + suffix). Selection is **uniform random with replacement**, no weighting beyond the repeated entries in array1/array3 (blanks for "no prefix/suffix", "Inc" repeated 6× = 6/24 ≈ 25% of non-empty suffixes).

### Obfuscation

`main.min.js` is minified but **fully readable** (no name mangling beyond `e/t/o/n/i/c` variable renames — function names preserved). v1 `script.js` is uncommented but **unminified**.

---

## 5. Generation behavior probe

Confirmed by repeated POSTs (no JS execution required): identical `{job, industry}` posts return **different** briefs each time. Sampling rule per `main.min.js`: there is no client-side caching of options between generations beyond `localStorage.briefoptions = JSON.stringify(e)` which only remembers the user's last selection. Each call hits `/brief` and the server returns a freshly randomised payload. **Server uses random selection** (matches v1 `Math.floor(Math.random()*arr.length)` pattern; v3 likely uses Node's `Math.random()` similarly).

`/export` is also server-side: `fetch("/export", body: JSON.stringify({brief, format}))` — accepts the current brief object and a format (`pdf` | `png`) and returns the binary. Confirmed working: posting `{brief:{name:"Test",desc:"x",job:"y",deadline:"z"},format:"pdf"}` returns a valid 30,204-byte PDF v1.4.

---

## 6. UX/UI structural notes

**Page weight (first load, measured):**
- index.html: 42,429 bytes (gzip not negotiated in my probe)
- main.min.css: 44,393 bytes (Tailwind compiled, single sheet)
- main.min.js: 8,262 bytes
- + ionicons (CDN), Google Fonts (3 families), Plausible, GTM, BSA monetization
- **Critical HTML+CSS+JS local total ≈ 95 KB.**

**HTTP requests on first load (estimate, not full waterfall):** ~10 (HTML, CSS, JS, manifest, 3 favicon files, 3 font CSS endpoints; fonts cascade adds more). Not measured precisely.

**Color tokens in main.min.css:** not measured (regex would be unreliable on Tailwind compiled output; visible custom colors: `#00bfa5` body bg, `#000` dark mode bg, `#0F9587` theme-color, `#086054` MS tile, `#005EFE`/`#002c5c` on Goodpalette).

**Typography:** Headings use Poppins (multiple weights including 800 black). Body uses Nunito Sans 400/700/800. Monospace UI labels (Type:, Industry:, brief name) use Roboto Mono 400/700. No specific font sizes measured; HTML uses Tailwind utilities like `text-2xl`, `text-[0.65em]`, `font-mono font-bold text-sm tracking-wider uppercase`.

**Accessibility hints:**
- `<html lang="en">` set.
- Form controls use `<input type="radio">` with associated `<label for=...>` (verbatim: `<label class="flex p-3 w-full cursor-pointer items-center" for="job-logo">`) — keyboard-accessible.
- Radios are visually hidden via `class="invisible absolute"`, label provides hit target — semantic but relies on label rendering.
- No explicit ARIA roles seen.
- Images: `<img src="/assets/logo32.png" class="mr-3 h-8 self-center" />` — **no alt attribute** on the logo.
- Generate button is an `<input type="button" value="Generate" onclick="generateBrief()">` — inline handler, not a `<button>`.
- Theme toggle uses `<button type="button" onclick="changeTheme()">` with ion-icons — no `aria-label`.

**Responsive:** Tailwind sm:/md:/lg: utilities throughout. Mobile viewport set: `<meta name="viewport" content="width=device-width, initial-scale=1">`. Mobile-only carbon ad injection in JS (`isMobile()` check).

**Dark mode:** localStorage-backed, respects `prefers-color-scheme: dark`, toggled by `changeTheme()` adding `.dark` to `<html>`. Body bg transitions `transition-colors duration-1000` (slow).

---

## 7. SERP and competitive landscape

**Query: "design brief generator"** — Top 10:
1. goodbrief.io (position 1)
2. fakeclients.com
3. briefly-generator.webflow.io
4. brandbrief.io/design-brief-generator
5. sharpen.design
6. figma.com/community/plugin/.../ux-brief-generator
7. goodbrief.io/v1 (position 7 — Goodbrief's own legacy!)
8. fakebrief.com
9. perchance.org/designbriefs
10. na.studio/brief

**Query: "creative brief generator practice designers"** — Goodbrief position 1; new entrants: brieftodesign.com, nikharabrief.vercel.app, uwarp.design/goodbrief (a directory listing of Goodbrief).

**Query: "fake design brief / design brief practice"** — fakeclients.com leads; Goodbrief #2. New: briefup.co/designers, braaands.co/fake-client-design-brief-generator.

**Query: "logo brief generator practice portfolio"** — fakeclients.com #1, Goodbrief #2. New: fakeclients.com/logodesign.

**Top competitors:**

| Competitor | URL | Value prop | Free/paid | AI? |
|---|---|---|---|---|
| FakeClients | fakeclients.com | Mock client briefs across 9 categories (logo/web/graphic/UI/UX/etc). Free + Pro upgrade (200+ "in-depth briefs"). | Freemium | Mixed (older = curated, Pro implies more variety) |
| Brandbrief | brandbrief.io | "300M+ combinations". Weekly curated briefs, competition format ("52 challenges a year"), community/feed. | Free | Curated; positions as real-client-style |
| Briefly | briefly-generator.webflow.io | "AI-powered creative brief generator" for fictitious clients. | Free | **Yes (AI)** |
| Sharpen.design | sharpen.design | Open-ended design challenge prompts, 21 categories, 2 generators. | Free | No (curated) |
| FakeBrief | fakebrief.com | "Generates realistic web design briefs with AI." | Free | **Yes (AI)** |
| Brieftodesign | brieftodesign.com | Daily UI/UX/logo/graphic challenges. | Free | Curated |
| Nikhara | nikharabrief.vercel.app | "Hyper-realistic AI-powered design briefs" — vercel deploy, indie. | Free | **Yes (AI)** |
| Brief Up | briefup.co/designers | "Fake designer project briefs" for web/branding/app. | Free | Curated |
| Not Another | na.studio/brief | Studio-branded brief generator for branding/marketing/web. | Free | Mixed |
| Perchance | perchance.org/designbriefs | Community Perchance generator; user-editable templates. | Free | No |

**Keyword competition tier:** **medium**. Several strong sites, but no Google Ads visible in SERP previews; mix of indie tools and one or two AI entrants. Goodbrief ranks #1 or #2 for primary terms but is at risk from AI-first entrants (Briefly, FakeBrief, Nikhara) — these match user intent ("generate a brief") with potentially more variety per output.

---

## 8. Internationalization

- `<html lang="en">` only. No `hreflang`, no `<link rel="alternate">`, no language switcher in nav, no `/pt|/es|/fr|/de` route hits.
- Bundle strings are 100% English. No i18n library imports (no `i18next`, no `next-i18n`, no `vue-i18n` — N/A anyway since not React/Vue).
- Industries include `all-American` and "Russian/Mexican/German/Greek/Indian/Israeli/Italian" cuisines — cultural breadth in *content* but UI is English-only.
- **No findings of any localised version.**

---

## 9. Newsletter and creator funnel

**Newsletter provider (verbatim):**
```
action="https://buttondown.com/api/emails/embed-subscribe/goodbrief"
```
**Buttondown** (indie ESP). Embedded form on `/newsletter`. CTA in main nav has Plausible event class `plausible-event-name=Merch+Header` (note: the class says "Merch" — possibly stale naming, but tags click as Merch).

**Goodpalette.io** — by the same creator (logo in Goodbrief's header links to it). Stack snapshot:
- `Server: Heroku`, `X-Powered-By: Express` — **same Heroku/Express setup**.
- HTML head includes `<div id="root">` + `<script>!function(e)...{` chunked loader → this is a **Webpack/CRA build (React)** with `static/js/...chunk.js` and `static/css/main.c40b3d58.chunk.css`. Different from Goodbrief (no framework). Goodpalette is more complex (UI mockups, color tooling).
- Plausible: `<script defer data-domain="goodpalette.io" src="https://plausible.io/js/plausible.js">` — same provider, different snippet variant.
- Same favicon/manifest/social.png convention. Same indie style.

**Manu's other projects mentioned:**
- About page links: Bluesky `bsky.app/profile/goodbrief.bsky.social`, Instagram `instagram.com/goodbriefio`, contact `hello@goodbrief.io`.
- About page "thanks" section lists named contributors: Eduardo Pastana, Anna Kartamish, Catherine Jackson, Cooper Newnam, Joe Double Doors, Peter Nusta.
- Footer signature on every page: `Made by Manu v3.0` (confirms v3 = current rebuild).
- manu.coffee referenced in FAQ/About body text (the creator's personal site / writing).

---

## 10. Notable gaps / opportunities (factual)

**Inventory of clearly absent features:**
- **No authentication / accounts** — no signup, no login form, no JWT/cookie auth seen.
- **No permalinks for generated briefs** — output is ephemeral; refreshing loses it. Only persisted state is `localStorage.briefoptions` (user's last (job, industry) pair).
- **No public API documentation** — `/brief` and `/export` are undocumented but trivially callable (no auth, no CORS gate observed, no rate limiting confirmed but likely exists).
- **No saved/favorited briefs**.
- **No tag/category browsing pages** — `/tag/logo`, `/briefs`, `/library`, `/examples` are all 404 (fallback HTML).
- **No sitemap.xml, no robots.txt, no schema.org, no canonical, no hreflang** — minimal SEO surface.
- **No route-specific titles/meta** for `/about`, `/faq`, `/newsletter` (all inherit homepage `<title>`).
- **No i18n / no non-English version**.
- **No CDN** (Heroku direct).
- **No JSON-LD breadcrumbs, FAQPage, or Article schema** on `/faq` (huge missed FAQPage rich-result opportunity).
- **No social sharing of a specific brief** (no per-brief URL → can't be shared without exporting PDF/PNG).
- **No "regenerate just one slot"** (e.g. "keep this name, get a new deadline"). All-or-nothing.
- **No examples gallery / inspiration feed** — Brandbrief and FakeClients both have this.
- **No difficulty levels / time tiers / "challenge mode"** — Sharpen and Brandbrief use this.
- **Accessibility gaps:** logo `<img>` has no alt; theme button has no aria-label; Generate "button" is an `<input type=button>`.
- **GA Universal Analytics (`UA-131354364-1`) is deprecated** — still firing. GA4 not present.
- **No bundled icons** — depends on unpkg ionicons CDN; CDN outage breaks all UI icons.
- **CSS responsive-utility class `@media` queries:** only 1 raw `@media` token detected in main.min.css (Tailwind compiles them, but the count was low — suggests an older/lighter Tailwind config or that the file is partially de-mediafied). Not a bug, just notable.
- **v1 site still publicly reachable** at `/v1` and indexed in SERP — duplicates the brand for the same keyword and could cannibalize ranking; also exposes the original combinatorial DB (this report extracted it).
- **`localStorage.theme === Theme.DARK` typo-safe but `Theme_color` typo in manifest.json**.
- **No A/B testing instrumentation, no user feedback widget, no error tracking** (no Sentry/Rollbar/Bugsnag tags seen).

**SEO surface area today vs theoretical:** Indexable today ≈ 4 URLs. Theoretical maximum if every (job, industry) pair got a dedicated landing page: 6 × 10 = 60. Adding example briefs per pair (say 10 each) = ~600. Adding individual permalink briefs (uncapped) = effectively unlimited. **The current site captures ~7% of the achievable SEO surface area in the simplest case (4/60).**

---

## Appendix A — 10 verbatim company names from `array2` (v1 DB, position 0–9)

`Abundant, Abyss, Acorn, Acre, Adieu, Adoo, Aerial, Aero, Afterglow, Agent`

## Appendix B — 10 verbatim v3 logo/food briefs (names only, from 40 samples)

`Greatest, Bloomer, Clear Bean Works, Canyon, Super Mermaid, High Five, Flavorful Olive, Eon, Foliage Bistro, Cog Cafe` — these clearly use a different (richer) name generator than v1's Wordlab-only set (multi-word forms like "Clear Bean Works", "Foliage Bistro" suggest an industry-aware adj+noun+suffix grammar; v1 names rarely produced "Bistro"/"Cafe" suffixes).

## Appendix C — Files saved locally

`D:\goodbrief\recon\home.html, about.html, faq.html, newsletter.html, main.min.js, main.min.css, manifest.json, v1.html, v1_script.js, big_logo_food.jsonl (40 samples), big_web_tech.jsonl (30 samples), export_test.bin (PDF probe), count_arrays.py, sample_array2.py, *_headers.txt`.

---

Sources (SERP):
- [Get Unique Design Briefs - Creative Brief Generator | Good Brief](https://goodbrief.io/)
- [FakeClients — Design Brief Generator](https://fakeclients.com/)
- [Briefly | AI Powered Creative Brief Generator](https://briefly-generator.webflow.io/)
- [Free Design Brief Generator — BRANDBRIEF](https://www.brandbrief.io/design-brief-generator)
- [Sharpen — Design Challenge Generator](https://sharpen.design/)
- [FakeBrief - Web Project Brief Generator](https://www.fakebrief.com/)
- [Design Brief Generator (perchance)](https://perchance.org/designbriefs)
- [Brief Generator | Not Another Studio](https://www.na.studio/brief)
- [Brieftodesign.com](https://www.brieftodesign.com/)
- [Nikhara - AI Creative Design Brief Generator](https://nikharabrief.vercel.app/)
- [Designer Briefs | Brief Up](https://briefup.co/designers)
- [Creative Design Brief Generator (v1)](https://goodbrief.io/v1)
