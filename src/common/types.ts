import { GetPrivateKeyResponse } from "@app/utils/fetch-wallet/types";
import { Session } from "next-auth";

export type AuthSession = Session & { id_token: string, wallet: GetPrivateKeyResponse }
export type MasterKey = {
    ethAddress?: string;
    privKey?: string;
}