const STATUS_PATH = '/__warmup/status';
const HEALTH_PATH = '/healthz';
const HEALTH_TIMEOUT_MS = 1800;

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const origin = getRenderOrigin(env.RENDER_ORIGIN);

		if (!origin) {
			return new Response(
				'Configure RENDER_ORIGIN in edge/warmup/wrangler.jsonc before deploying this Worker.',
				{
					status: 500,
					headers: { 'content-type': 'text/plain; charset=utf-8' },
				},
			);
		}

		if (url.pathname === STATUS_PATH && request.method === 'GET') {
			const ready = await isRenderReady(origin);
			return Response.json(
				{ ready },
				{ headers: { 'cache-control': 'no-store' } },
			);
		}

		if (isDocumentRequest(request) && !(await isRenderReady(origin))) {
			return warmupPage();
		}

		try {
			return await proxyToRender(request, origin);
		} catch {
			if (isDocumentRequest(request)) return warmupPage();

			return new Response('The flower shop is temporarily unavailable.', {
				status: 502,
				headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
			});
		}
	},
};

function getRenderOrigin(value) {
	if (typeof value !== 'string') return null;

	try {
		const url = new URL(value);
		if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash) return null;
		return url;
	} catch {
		return null;
	}
}

function isDocumentRequest(request) {
	return request.method === 'GET' && request.headers.get('accept')?.includes('text/html');
}

async function isRenderReady(origin) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

	try {
		const response = await fetch(new URL(HEALTH_PATH, origin), {
			method: 'GET',
			headers: { accept: 'text/plain' },
			cache: 'no-store',
			redirect: 'manual',
			signal: controller.signal,
		});

		return response.ok && (await response.text()).trim() === 'ok';
	} catch {
		return false;
	} finally {
		clearTimeout(timeout);
	}
}

async function proxyToRender(request, origin) {
	const publicUrl = new URL(request.url);
	const targetUrl = new URL(`${publicUrl.pathname}${publicUrl.search}`, origin);
	const requestForRender = new Request(targetUrl, request);
	const headers = new Headers(requestForRender.headers);
	headers.set('x-forwarded-host', publicUrl.host);
	headers.set('x-forwarded-proto', publicUrl.protocol.slice(0, -1));
	const forwardedRequest = new Request(requestForRender, { headers, redirect: 'manual' });
	const response = await fetch(forwardedRequest);
	const location = response.headers.get('location');

	if (!location || ![301, 302, 303, 307, 308].includes(response.status)) return response;

	const redirectUrl = new URL(location, origin);
	if (redirectUrl.origin !== origin.origin) return response;
	redirectUrl.protocol = publicUrl.protocol;
	redirectUrl.host = publicUrl.host;

	const responseHeaders = new Headers(response.headers);
	responseHeaders.set('location', redirectUrl.toString());
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}

function warmupPage() {
	return new Response(WARMUP_HTML, {
		status: 200,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'no-store, no-cache, must-revalidate',
			'x-content-type-options': 'nosniff',
			'referrer-policy': 'same-origin',
		},
	});
}

const WARMUP_HTML = `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="theme-color" content="#fbf9f5" />
		<meta name="robots" content="noindex, nofollow" />
		<title>Opening the shop — Kim Flower Shop</title>
		<style>
			:root {
				color-scheme: light;
				font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
				font-synthesis: none;
				text-rendering: optimizeLegibility;
				-webkit-font-smoothing: antialiased;
				--page: #fbf9f5;
				--ink: #292b27;
				--muted: #77766f;
				--rose: #8d4f59;
				--line: #e8e2d9;
			}

			* { box-sizing: border-box; }

			body {
				min-width: 320px;
				min-height: 100svh;
				margin: 0;
				display: grid;
				place-items: center;
				padding: 2rem 1.5rem;
				background:
					radial-gradient(ellipse at 15% 15%, rgb(232 217 202 / 32%), transparent 28rem),
					radial-gradient(ellipse at 92% 86%, rgb(141 79 89 / 7%), transparent 30rem),
					var(--page);
				color: var(--ink);
			}

			main {
				width: min(100%, 34rem);
				text-align: center;
			}

			.brand {
				display: inline-flex;
				align-items: center;
				gap: 0.7rem;
				color: var(--ink);
				text-align: left;
			}

			.brand-mark {
				width: 2.85rem;
				height: 2.85rem;
				display: grid;
				place-items: center;
				border: 1px solid color-mix(in srgb, var(--rose), transparent 68%);
				border-radius: 50%;
				color: var(--rose);
			}

			.brand-mark svg { width: 1.95rem; height: 1.95rem; overflow: visible; }
			.brand-name { display: grid; gap: 0.16rem; }
			.brand-name strong {
				font-family: "Iowan Old Style", "Baskerville", "Palatino Linotype", Georgia, serif;
				font-size: 1.13rem;
				font-weight: 500;
				letter-spacing: -0.035em;
			}
			.brand-name small {
				color: var(--muted);
				font-size: 0.58rem;
				letter-spacing: 0.12em;
				text-transform: uppercase;
			}

			.content { margin-top: clamp(4.5rem, 12vh, 7.5rem); }

			.bloom {
				width: 5.5rem;
				height: 5.5rem;
				margin: 0 auto 2.3rem;
				color: var(--rose);
			}

			.bloom svg { width: 100%; height: 100%; overflow: visible; }
			.bloom-petals {
				transform-box: fill-box;
				transform-origin: center;
				animation: bloom-in 1.5s cubic-bezier(.2,.75,.25,1) infinite alternate;
			}

			h1 {
				margin: 0;
				font-family: "Iowan Old Style", "Baskerville", "Palatino Linotype", Georgia, serif;
				font-size: clamp(2.5rem, 9vw, 4.2rem);
				font-weight: 400;
				letter-spacing: -0.065em;
				line-height: 0.98;
			}

			h1 em { color: var(--rose); font-weight: 400; }

			.description {
				max-width: 31rem;
				margin: 1.4rem auto 0;
				color: var(--muted);
				font-size: 0.96rem;
				line-height: 1.8;
			}

			.progress {
				width: min(100%, 18rem);
				height: 2px;
				margin: 2.2rem auto 0.85rem;
				overflow: hidden;
				background: var(--line);
			}

			.progress span {
				width: 38%;
				height: 100%;
				display: block;
				background: var(--rose);
				transform: translateX(-110%);
				animation: progress 1.9s ease-in-out infinite;
			}

			.status {
				min-height: 1.4em;
				margin: 0;
				color: var(--muted);
				font-size: 0.7rem;
				letter-spacing: 0.1em;
				text-transform: uppercase;
			}

			.retry {
				margin-top: 1.2rem;
				padding: 0.55rem 0.9rem;
				border: 1px solid var(--line);
				border-radius: 999px;
				background: transparent;
				color: var(--ink);
				font: inherit;
				font-size: 0.78rem;
				cursor: pointer;
			}

			.retry:hover { border-color: var(--rose); color: var(--rose); }
			.retry[hidden] { display: none; }

			footer {
				margin-top: clamp(4rem, 10vh, 6.5rem);
				color: #9a9890;
				font-size: 0.7rem;
			}

			@keyframes bloom-in {
				from { transform: scale(.82) rotate(-7deg); }
				to { transform: scale(1) rotate(2deg); }
			}

			@keyframes progress {
				from { transform: translateX(-110%); }
				to { transform: translateX(280%); }
			}

			@media (prefers-reduced-motion: reduce) {
				*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
			}
		</style>
	</head>
	<body>
		<main aria-busy="true">
			<div class="brand">
				<span class="brand-mark" aria-hidden="true">
					<svg viewBox="0 0 40 40" fill="none">
						<path d="M20 5.5c3.2 4.1 4.4 7 3.5 9.1 2.3-1.1 5.6-.2 10 2.5-4.4 2.6-7.7 3.4-10 2.3 1 2.2-.2 5.3-3.5 9.5-3.1-4.2-4.2-7.3-3.2-9.5-2.4 1.1-5.7.3-10-2.3 4.3-2.7 7.6-3.6 10-2.5-1-2.1.1-5 3.2-9.1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
						<circle cx="20" cy="18.5" r="2.2" fill="currentColor" />
						<path d="M20 29v6m0-3c-2.2-2.2-4.4-2.3-6.4-.5M20 32c2.2-2.2 4.4-2.3 6.4-.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</span>
				<span class="brand-name">
					<strong>Kim Flower Shop</strong>
					<small>Flowers for the everyday</small>
				</span>
			</div>

			<section class="content" aria-labelledby="loading-title">
				<div class="bloom" aria-hidden="true">
					<svg viewBox="0 0 88 88" fill="none">
						<g class="bloom-petals" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round">
							<path d="M44 9c6.4 8.3 7.8 14.7 4.4 19.1 5.8-1.3 11.4 1.9 16.8 9.6-9.8 2.8-16.3 1.8-19.4-3.1 1.2 6.2-2.7 12.3-11.5 18.4-2.9-9.8-2-16.3 2.7-19.5-6.2 1-12.3-2.9-18.1-11.7 9.7-2.6 16.1-1.6 19.2 3.2-1-6.1 2.9-12.1 11.9-18Z" />
							<circle cx="44" cy="36" r="4.5" fill="currentColor" />
						</g>
						<path d="M44 53v25m0-12c-8-8-15.5-8.3-22.5-1.8M44 66c8-8 15.5-8.3 22.5-1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
					</svg>
				</div>
				<h1 id="loading-title">We’re gathering<br /><em>your flowers.</em></h1>
				<p class="description" id="loading-description">
					The shop is opening after a quiet moment. This usually takes about a minute.
				</p>
				<div class="progress" role="presentation"><span></span></div>
				<p class="status" id="loading-status" role="status" aria-live="polite">Preparing a fresh start</p>
				<button class="retry" id="retry-button" type="button" hidden>Check again</button>
			</section>

			<footer>Thank you for waiting a little while.</footer>
		</main>
		<script>
			const description = document.querySelector('#loading-description');
			const status = document.querySelector('#loading-status');
			const retryButton = document.querySelector('#retry-button');
			const startedAt = Date.now();
			let navigating = false;
			let checking = false;

			async function checkShop() {
				if (navigating || checking) return;
				checking = true;

				try {
					const response = await fetch('/__warmup/status', {
						cache: 'no-store',
						headers: { accept: 'application/json' },
					});
					const result = await response.json();

					if (result.ready) {
						navigating = true;
						document.querySelector('main').setAttribute('aria-busy', 'false');
						status.textContent = 'The shop is ready';
						window.location.replace(window.location.href);
						return;
					}
				} catch {
					// Keep the branded waiting page visible and retry automatically.
				}

				checking = false;
				const elapsed = Date.now() - startedAt;
				if (elapsed > 90000) {
					description.textContent = 'We’re still opening the shop. It may take a little longer after a quiet spell.';
					status.textContent = 'Still getting things ready';
				}
				if (elapsed > 150000) retryButton.hidden = false;
			}

			retryButton.addEventListener('click', checkShop);
			checkShop();
			window.setInterval(checkShop, 3500);
		</script>
	</body>
</html>`;
