import { GetPrivateKeyResponse } from "@app/utils/fetch-wallet/types";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: User;
    wallet: GetPrivateKeyResponse
  }
}