import type {EntryContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    directives: {
      defaultSrc: [
        "'self'",
        'https://cdn.builder.io',
        'https://cdn.shopify.com',
        'http://localhost:*',
      ],
      imgSrc: ["'self'", 'https://cdn.builder.io', 'https://cdn.shopify.com'],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "'https://builder.io'",
        "'https://www.builder.io'",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "'https://builder.io'",
        "'https://www.builder.io'",
      ],
      connectSrc: [
        "'self'",
        'https://monorail-edge.shopifysvc.com',
        'http://localhost:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
        'https://cdn.builder.io', // ✅ Allow connections to Builder.io API
      ],
      // Add any other directives you need
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);
  responseHeaders.set('X-Frame-Options', 'ALLOW-FROM https://builder.io');

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
