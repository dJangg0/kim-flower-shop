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

This app uses Astro's Node standalone adapter, so deploy it as a Node web service (not as a static-only site). Render is one compatible option:

1. Push this project to a GitHub branch and connect that repository to a new Render **Web Service** using the **Node** runtime.
2. Set the build command to `npm ci && npm run build` and the start command to `npm start`.
3. Set `HOST` to `0.0.0.0`, `PUBLIC_SANITY_PROJECT_ID` to the Sanity project ID, and `PUBLIC_SANITY_DATASET` to the dataset. Render provides the `PORT` value.
4. Choose an always-on plan for a production storefront. Render's free web services sleep when idle and are intended for testing, not production.
5. After the service is live, add `artbytisabelle.com` in its Custom Domains settings and follow the DNS instructions from Render at the domain's DNS provider.

The Sanity project must allow the production domain in API CORS origins with credentials enabled for Studio sign-in. Add the `www` origin as well if customers will use it directly.

## Content and sign-in

Manage products and site settings in the Studio at `/admin`. Sanity handles Studio sign-in with your Sanity account. The custom mock `/login` flow has not been implemented.

The storefront displays published products with **Active** enabled. Product prices are numbers; the currency is selected in **Site Settings**. Changing that currency changes the display format and does not convert existing prices.
