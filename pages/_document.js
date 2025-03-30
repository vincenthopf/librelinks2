import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Get the Tinybird token from environment variables - use ANALYTICS_TOKEN for link clicks
  // const tinybirdToken = process.env.ANALYTICS_TOKEN || process.env.NEXT_PUBLIC_TINYBIRD_API_KEY;

  // Use environment variables for Plausible configuration with no fallbacks to ensure correct values
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleScriptUrl =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ||
    'https://plausible.io/js/script.file-downloads.hash.outbound-links.pageview-props.revenue.tagged-events.js';

  return (
    <Html lang="en">
      <Head>
        {/* Add Tinybird token as meta tag for client-side access */}
        {/* {tinybirdToken && <meta name="tinybird-token" content={tinybirdToken} />} */}

        {/* Tinybird Web Analytics Script */}
        {/* <script
          defer
          src="https://unpkg.com/@tinybirdco/flock.js"
          data-host="https://api.us-east.tinybird.co"
          data-token={tinybirdToken}
        ></script> */}

        {/* Plausible Analytics Script - with all required features */}
        {plausibleDomain && (
          <>
            <script defer data-domain={plausibleDomain} src={plausibleScriptUrl}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }`,
              }}
            ></script>
          </>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>{' '}
    </Html>
  );
}
