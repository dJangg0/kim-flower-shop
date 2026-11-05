# Branded Render warm-up screen

This Cloudflare Worker sits in front of the Render web service. It checks the existing `/healthz` route before sending HTML to the browser. If Render is asleep, it immediately serves a Kim Flower Shop waiting screen and checks readiness every few seconds. As soon as `/healthz` returns `ok`, the browser opens the requested page.

The Worker is safe to preview on its `workers.dev` URL before routing the production domain to it.

## Configure and preview

1. Copy the Render service's `onrender.com` URL from its Render dashboard.
2. Replace `YOUR-SERVICE` in `wrangler.jsonc` with that service name. Keep the URL in `https://...onrender.com` form, without a path.
3. From this directory, run `npx wrangler deploy` and follow the login prompt. The Worker is deployed to its `workers.dev` preview URL while production routes remain unconfigured.
4. Open the preview URL. The storefront should load through the Worker. To see the warm-up page, open it after the Render service has spun down, or temporarily use an invalid origin while testing and then restore the correct URL.

The Sanity Studio at `/admin` may also need the `workers.dev` preview origin added to Sanity's API CORS settings. The deployed production domain should already be allowed there.

## Route the shop domain through Cloudflare

The branded screen can only appear on the public site when Cloudflare handles its DNS and routes requests through this Worker. This is a one-time domain configuration:

1. The domain must use Cloudflare DNS. If it does not, move its DNS zone to Cloudflare first.
2. In Cloudflare DNS, point the shop hostname at the Render service and enable the Cloudflare proxy (orange cloud).
3. In **Workers & Pages → kim-flower-shop-warmup → Settings → Domains & Routes**, add a route for `artbytisabelle.com/*` on the `artbytisabelle.com` zone. Add `www.artbytisabelle.com/*` too if customers use the `www` hostname.
4. Confirm the Worker preview and Render origin work before adding the production route.

Cloudflare's route runs before the proxied Render origin. The Worker forwards requests to the Render URL configured in `wrangler.jsonc`, so the public domain stays the same for customers.
