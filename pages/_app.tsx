import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>HeartChat AI</title>
        <meta
          name="description"
          content="AI companion chat platform with stylish purple theme."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

