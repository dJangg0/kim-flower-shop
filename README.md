# Kim Flower Shop

An Astro storefront with a Sanity-powered product catalog and an embedded Sanity Studio.

## Requirements

- Node.js 22.23.4 (pinned in `mise.toml` and `.node-version`)
- npm
- A Sanity project for products and site settings
- Docker only if you prefer to run the app in a container

There is no separate local backend to start. Sanity hosts the CMS and content; Astro runs the storefront and embeds the Studio at `/admin`.

## Run with Node

From the project directory:

```sh
npm ci
npm run dev
```

`npm ci` is needed once for a fresh checkout. Open the storefront at <http://localhost:4321/> and the Sanity Studio at <http://localhost:4321/admin>.

This workspace already has its `.env` configured. On another checkout, copy `.env.example` to `.env` and fill in the Sanity project ID and dataset before starting Astro.

## Run with Docker (optional)

```sh
docker compose up --build
```

Open the same URLs on <http://localhost:4321/>. Stop the container with `Ctrl+C` or run `docker compose down` from the project directory.

## Deploy to production

The storefront is statically generated from published Sanity content during each deployment. Vercel serves the generated pages from its CDN, so there is no app server to wake from idle:

1. Import this GitHub repository into Vercel and keep the Astro framework preset, build command (`npm run build`), and output directory (`dist`).
2. Add `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` as Vercel environment variables for the environments you deploy.
3. Add `artbytisabelle.com` in the Vercel project's Domains settings and follow its DNS instructions.
4. In Sanity, create a Vercel Deploy Hook and a webhook that calls it when published content changes. This rebuilds the storefront so product and site-setting edits appear on the site.

The Sanity project must allow the production domain in API CORS origins with credentials enabled for Studio sign-in. Add the `www` origin as well if customers will use it directly.

## Content and sign-in

Manage products and site settings in the Studio at `/admin`. Sanity handles Studio sign-in with your Sanity account. The custom mock `/login` flow has not been implemented.

The storefront displays published products with **Active** enabled. Product prices are numbers; the currency is selected in **Site Settings**. Changing that currency changes the display format and does not convert existing prices.
