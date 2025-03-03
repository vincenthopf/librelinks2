import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Get the Tinybird token from environment variables - use ANALYTICS_TOKEN for link clicks
  const tinybirdToken = process.env.ANALYTICS_TOKEN || process.env.NEXT_PUBLIC_TINYBIRD_API_KEY;

  return (
    <Html lang="en">
      <Head>
        {/* Add Tinybird token as meta tag for client-side access */}
        {tinybirdToken && <meta name="tinybird-token" content={tinybirdToken} />}

        {/* Tinybird Web Analytics Script */}
        <script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-host="https://api.us-east.tinybird.co"
          data-token={tinybirdToken}
        ></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>{' '}
    </Html>
  );
}
