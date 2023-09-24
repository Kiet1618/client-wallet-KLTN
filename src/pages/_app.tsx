import React from 'react';
import type { AppProps } from 'next/app';
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@app/store";
import ProviderApp from "./ProviderApp"
// import 'antd/dist/antd.css';
import 'antd/dist/reset.css'
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';



export default function MyApp(props: AppProps & { session: Session }) {
  return (
    <ReduxProvider store={store}>
      <SessionProvider session={props.session}>
        <ProviderApp  {...props} />
      </SessionProvider>
    </ReduxProvider>
  )
}
