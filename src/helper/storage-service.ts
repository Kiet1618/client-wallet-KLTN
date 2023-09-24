import { DeviceKey } from "@app/utils/fetch-wallet/types";

function getWindow(): Window {
    if (typeof window !== "undefined") return window;
}

const win = getWindow();
type ShareDevice = DeviceKey;

export const storeShareDeviceOnLocalStorage = async (share: DeviceKey): Promise<void> => {
    try {
        const fileStr = JSON.stringify(share);
        // if (!storageAvailable("localStorage")) {
        //     throw Error("Storage unavailable");
        // }
        win.localStorage.setItem("share-device", fileStr);
    } catch (error) {
        return;
    }
};

export const getShareDeviceFromLocalStorage = (): ShareDevice => {
    try {
        // if (!storageAvailable("localStorage")) {
        //     throw Error("Storage unavailable");
        // }
        const foundFile = win.localStorage.getItem("share-device");
        return JSON.parse(foundFile || "{}");
    } catch (error) {
        return null
    }
};
export const getListTokens = () => {
    try {
        const data = win.localStorage.getItem('currentListTokens');
        return JSON.parse(data);
    }
    catch {
        return null;
    }
}