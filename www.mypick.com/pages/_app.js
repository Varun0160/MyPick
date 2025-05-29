import "@/styles/globals.css";
import Head from "next/head";
import { AuthProvider } from "../firebase/context";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  function setupLandbot() {
    new Landbot.Livechat({
      configUrl: "https://landbot.site/v3/H-1326771-M40WPVTX4D1UXBR2/index.json"
    });
  }

  return (
    <AuthProvider>
      <Head>        <title>MyPick - Fashion E-commerce</title>
        <meta name="description" content="Shop the latest fashion trends at MyPick" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        strategy="lazyOnload"
        src="https://static.landbot.io/landbot-3/landbot-3.0.0.js"
        onLoad={setupLandbot}
      />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
