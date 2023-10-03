import { DeviceKey } from "@app/utils/fetch-wallet/types";

function getWindow(): Window {
    if (typeof window !== "undefined") return window;
}

const win = getWindow();
type ShareDevice = DeviceKey;
type ShareDeviceByEmail = Array<{
    email: string;
    share: DeviceKey;
}>;

export const storeShareDeviceOnLocalStorage = async (share: DeviceKey, email: string): Promise<void> => {
    try {
        const currentKeys = await getShareDeviceFromLocalStorage() || [];
        const exeisted = currentKeys.find((item) => item.email === email);
        if (exeisted) {
            return;
        }
        const updatedKeys = [...currentKeys, { email, share }];
        const fileStr = JSON.stringify(updatedKeys);
        win.localStorage.setItem("share-device", fileStr);
    } catch (error) {
        console.error(error);
    }
};

export const getShareDeviceFromLocalStorage = (): ShareDeviceByEmail => {
    try {
        const foundFile = win.localStorage.getItem("share-device");
        return JSON.parse(foundFile) || [];
    } catch (error) {
        console.error(error);
        return [];
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