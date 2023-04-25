// import Document, { Html, Head, Main, NextScript } from "next/document";
// import Script from "next/script";
// import { ServerStyleSheet } from "styled-components";
// import { GTM_ID } from "../lib/gtm";

// export default class MyDocument extends Document {
//   static async getInitialProps(ctx) {
//     const sheet = new ServerStyleSheet();
//     const originalRenderPage = ctx.renderPage;

//     try {
//       ctx.renderPage = () =>
//         originalRenderPage({
//           enhanceApp: (App) => (props) =>
//             sheet.collectStyles(<App {...props} />),
//         });

//       const initialProps = await Document.getInitialProps(ctx);
//       return {
//         ...initialProps,
//         styles: [initialProps.styles, sheet.getStyleElement()],
//       };
//     } finally {
//       sheet.seal();
//     }
//   }
//   //site building
//   render() {
//     return (
//       <Html lang="en-us">
//         <Head>
//           <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
//           <meta
//             name="google-site-verification"
//             content="n5KZqEu_bixbDbMe-qbvNh-aE-dcO86q7wTW3WhrAEQ"
//           />
//           <meta
//             name="msvalidate.01"
//             content="B89065AC76E262A059C967E34C3D9541"
//           />
//         </Head>

//         <body>
//           <noscript>
//             <iframe
//               // strategy="afterInteractive"
//               src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
//               height="0"
//               width="0"
//               style={{ display: "none", visibility: "hidden" }}
//             />
//           </noscript>
//           <Main />
//           <NextScript />
//           <link rel="preconnect" href="https://fonts.googleapis.com" />
//           <link rel="preconnect" href="https://fonts.gstatic.com" />
//           <link
//             href="https://fonts.googleapis.com/css2?family=Inter&family=Poppins&display=swap"
//             rel="stylesheet"
//           />
//           <Script
//             async
//             src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
//             strategy="afterInteractive"
//           />
//           <Script
//             strategy="afterInteractive"
//             src="https://www.googletagmanager.com/gtag/js?id=G-6P9D6S98K5"
//           />
//
//           <Script
//             id="google-analytics"
//             strategy="afterInteractive"
//             dangerouslySetInnerHTML={{
//               __html: `
//                         window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());

//             gtag('config', 'G-6P9D6S98K5');
//         `,
//             }}
//           />
//           <div id="root-modal"></div>
//         </body>
//       </Html>
//     );
//   }
// }

import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { ServerStyleSheet } from "styled-components";
import { GTM_ID } from "../lib/gtm";

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
      };
    } finally {
      sheet.seal();
    }
  }

  

  render() {
    return (
      <Html lang="en-us">
        <Head>
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta
            name="google-site-verification"
            content="n5KZqEu_bixbDbMe-qbvNh-aE-dcO86q7wTW3WhrAEQ"
          />
          <meta
            name="msvalidate.01"
            content="B89065AC76E262A059C967E34C3D9541"
          />
        </Head>
        <body>
          <noscript>
            <iframe
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
          <Main />
          <NextScript />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter&family=Poppins&display=swap"
            rel="stylesheet"
          />
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
            strategy="afterInteractive"
          />
          <Script
            strategy="afterInteractive"
            src="https://www.googletagmanager.com/gtag/js?id=G-6P9D6S98K5"
          />

          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                        window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-6P9D6S98K5');
        `,
            }}
          />
          <div id="root-modal"></div>
        </body>
      </Html>
    );
  }
}
