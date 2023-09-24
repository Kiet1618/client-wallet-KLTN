import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { NONE_LAYOUT } from '@app/common/config';

const AppLayout = dynamic(() => import('../components/Layout'), { ssr: false });

export default function ProviderApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  if (!NONE_LAYOUT.includes(router.pathname)) {
    return (
      <AppLayout>
        <Head>
          <title>d-Wallet</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </AppLayout>
    );
  }
  else {
    return (
      <>
        <Head>
          <title>d-Wallet</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}