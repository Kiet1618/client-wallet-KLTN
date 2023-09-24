import {
  ErrorApi,
  GetMetadataResponse,
  GetMasterKeyDisableMFARequest,
  GetMasterKeyDisableMFAResponse,
  Metadata,
  GetMetadataRequest,
  EncryptedMetadata,
  GetMasterKeyFromStorageInput,
  GetMasterKeyFromStorageOutput,
  UserEnableMFAInput,
  GetMasterKeyFrom2ShareInput,
  GetMasterKeyFrom2ShareOutput,
  ChangePasswordMFAInput,
  ResendRecoveryMFAInput,
  ResendRecoveryMFAOutput,
  RemoveDeviceMFAInput,
  RemoveDeviceMFAOutput,
} from './types';
import { METADATA_URL } from '@app/common/config';
import { getPublic, encrypt, decrypt } from '@toruslabs/eccrypto';
import * as storage from './../../helper/storage-service';
import axios from 'axios';
import {
  addNewDeviceInMetadata,
  generateMetadata,
  reconstructMasterKey,
  enableMFA,
  updateMetadataPasswordMFA,
  updateMetadataRecoveryMFA
} from './multi-factor';
import { deviceInfo } from '../device-info';
import BN from 'bn.js';
import { findIndex, isEmpty } from 'lodash';
import { ec, generateAddressFromPrivKey } from './fetch-shareB';
import { keccak256 } from 'web3-utils';
import { hexToWords, wordsToHex } from '../generate-words';

export const updateMetadata = async (owner: string, shareB: string, encryptedMetadata: { [key: string]: any }) => {
  const msg = keccak256(JSON.stringify(encryptedMetadata));
  const signature = ec
    .sign(msg, Buffer.from(shareB, 'hex'), 'hex')
    .toDER('hex');

  await axios.put(`${METADATA_URL}/storages`, {
    signature,
    encryptedMetadata,
    owner: owner.toLowerCase(),
  });
}

export const getMasterKeyDisableMFA = async (
  input: GetMasterKeyDisableMFARequest,
): Promise<{ data?: GetMasterKeyDisableMFAResponse; error?: ErrorApi }> => {
  const { owner, shareB, decryptedMetadata } = input;
  const publicShareB = getPublic(Buffer.from(shareB, 'hex'));
  const deviceInfoString = deviceInfo();
  let encryptedMetadata: EncryptedMetadata;

  let privKey: BN;
  if (!decryptedMetadata.enabledMFA) {
    const storageShare = storage.getShareDeviceFromLocalStorage();
    // console.log("🚀 ~ file: metadata.ts:98 ~ storageShare:", storageShare)
    if (isEmpty(storageShare)) {
      const { device, metadata } = await addNewDeviceInMetadata({
        deviceInfo: deviceInfoString,
        metadata: decryptedMetadata,
        shareB,
      });
      await storage.storeShareDeviceOnLocalStorage(device);

      const encryptedMetadataBuffer = await encrypt(
        publicShareB,
        Buffer.from(JSON.stringify(metadata)),
      );
      // Set buffer to string
      encryptedMetadata = {
        mac: encryptedMetadataBuffer.mac.toString('hex'),
        iv: encryptedMetadataBuffer.iv.toString('hex'),
        ephemPublicKey: encryptedMetadataBuffer.ephemPublicKey.toString('hex'),
        ciphertext: encryptedMetadataBuffer.ciphertext.toString('hex'),
      };

      await updateMetadata(owner, shareB, encryptedMetadata);
      // const msg = keccak256(JSON.stringify(encryptedMetadata));
      // const signature = ec
      //   .sign(msg, Buffer.from(shareB, 'hex'), 'hex')
      //   .toDER('hex');

      // await axios.put(`${METADATA_URL}/storages`, {
      //   signature,
      //   encryptedMetadata,
      //   owner: owner.toLowerCase(),
      // });

      // Because index 0 always exist
      const firstShareA = decryptedMetadata.tkey.devices[0];
      const { masterKey } = await reconstructMasterKey({
        shareA: {
          index: new BN(firstShareA?.deviceIndex, 'hex'),
          value: new BN(firstShareA?.deviceValue, 'hex'),
        },
        shareB: {
          index: new BN(decryptedMetadata.tkey.node.index, 'hex'),
          value: new BN(shareB, 'hex'),
        },
      });
      privKey = masterKey;
    }
    if (!isEmpty(storageShare)) {
      const shareAIndex = findIndex(
        decryptedMetadata.tkey?.devices,
        (device) => {
          return device.id === storageShare.id;
        },
      );
      if (shareAIndex < 0) {
        return {
          data: null,
          error: { statusCode: "404", errorMessage: "Not found share in local storage" }
        }
      }
      const { masterKey } = await reconstructMasterKey({
        shareA: {
          index: new BN(
            decryptedMetadata.tkey.devices[shareAIndex]?.deviceIndex,
            'hex',
          ),
          value: new BN(storageShare?.deviceValue, 'hex'),
        },
        shareB: {
          index: new BN(decryptedMetadata.tkey.node.index, 'hex'),
          value: new BN(shareB, 'hex'),
        },
      });
      privKey = masterKey;
    }
  }
  if (!privKey) {
    return {
      data: null,
      error: { statusCode: "404", errorMessage: "Cannot reconstruct master-key" }
    }
  }
  const ethAddress = generateAddressFromPrivKey(privKey);
  return { data: { privKey, ethAddress }, error: null, };
};

/**
 * @case enable MFA true, For device local storage not found
 * @param input 
 * @returns 
 */
export const getMasterKeyFrom2Shares = async (
  input: GetMasterKeyFrom2ShareInput,
): Promise<{ data?: GetMasterKeyFrom2ShareOutput; error?: ErrorApi }> => {
  const { owner, shareB, decryptedMetadata, type } = input;
  let { shareOtherValue } = input;
  const publicShareB = getPublic(Buffer.from(shareB, 'hex'));
  const deviceInfoString = deviceInfo();

  let privKey: BN;
  let shareOtherIndex: string;
  if (type === "passphrase") {
    shareOtherIndex = decryptedMetadata.tkey.passphrase.index;
    shareOtherValue = keccak256(shareOtherValue).substring(2);
    let { masterKey } = await reconstructMasterKey({
      shareA: {
        index: new BN(shareOtherIndex, 'hex'),
        value: new BN(shareOtherValue, 'hex'),
      },
      shareB: {
        index: new BN(decryptedMetadata.tkey.node.index, 'hex'),
        value: new BN(shareB, 'hex'),
      }
    });
    privKey = masterKey;
  }
  if (type === "recovery") {
    shareOtherIndex = decryptedMetadata.tkey.recovery.index;
    try {
      shareOtherValue = wordsToHex(shareOtherValue);
      let { masterKey } = await reconstructMasterKey({
        shareA: {
          index: new BN(shareOtherIndex, 'hex'),
          value: new BN(shareOtherValue, 'hex'),
        },
        shareB: {
          index: new BN(decryptedMetadata.tkey.node.index, 'hex'),
          value: new BN(shareB, 'hex'),
        }
      });
      privKey = masterKey;
    } catch (error) {
      return {
        data: null,
        error: {
          statusCode: "404",
          errorMessage: error?.message || "Invalid recovery"
        }
      }
    }
  };

  const privKeyString = privKey.toString('hex').padStart(64, "0");

  const publicKey = getPublic(Buffer.from(privKeyString, 'hex'));
  if (publicKey.toString("hex") !== decryptedMetadata.masterPublicKey) {
    return {
      data: null,
      error: {
        statusCode: "404",
        errorMessage: "Invalid recovery or passphrase"
      }
    }
  }
  // storage new device
  const { device, metadata } = await addNewDeviceInMetadata({
    deviceInfo: deviceInfoString,
    metadata: decryptedMetadata,
    shareB,
    shareOtherIndex: shareOtherIndex,
    shareOtherValue: shareOtherValue,
  });
  await storage.storeShareDeviceOnLocalStorage(device);

  const encryptedMetadataBuffer = await encrypt(
    publicShareB,
    Buffer.from(JSON.stringify(metadata)),
  );
  // Set buffer to string
  const encryptedMetadata = {
    mac: encryptedMetadataBuffer.mac.toString('hex'),
    iv: encryptedMetadataBuffer.iv.toString('hex'),
    ephemPublicKey: encryptedMetadataBuffer.ephemPublicKey.toString('hex'),
    ciphertext: encryptedMetadataBuffer.ciphertext.toString('hex'),
  };
  await updateMetadata(owner, shareB, encryptedMetadata);

  const ethAddress = generateAddressFromPrivKey(privKey);
  return { data: { privKey, ethAddress }, error: null, };
};

/**
 * @case enable MFA true, For device local storage found
 * @param input 
 * @returns 
 */
export const getMasterKeyFromStorage = async (
  input: GetMasterKeyFromStorageInput,
): Promise<{ data?: GetMasterKeyFromStorageOutput; error?: ErrorApi }> => {
  const { owner, shareB, decryptedMetadata } = input;
  const publicShareB = getPublic(Buffer.from(shareB, 'hex'));
  let privKey: BN;
  const storageShare = storage.getShareDeviceFromLocalStorage();
  if (isEmpty(storageShare)) {
    return {
      data: null, error: {
        errorMessage: "Not found share in local storage",
        statusCode: "404",
      }
    }
  }
  if (!isEmpty(storageShare)) {
    const shareAIndex = findIndex(
      decryptedMetadata.tkey?.devices,
      (device) => {
        return device.id === storageShare.id;
      },
    );
    if (shareAIndex < 0) {
      return {
        data: null, error: {
          errorMessage: "Not found share in local storage",
          statusCode: "404",
        }
      }
    }

    const { masterKey } = await reconstructMasterKey({
      shareA: {
        index: new BN(
          decryptedMetadata.tkey.devices[shareAIndex]?.deviceIndex,
          'hex',
        ),
        value: new BN(storageShare?.deviceValue, 'hex'),
      },
      shareB: {
        index: new BN(decryptedMetadata.tkey.node.index, 'hex'),
        value: new BN(shareB, 'hex'),
      },
    });
    privKey = masterKey;
  }
  if (!privKey) {
    throw Error("Cannot reconstruct master-key");
  }

  const ethAddress = generateAddressFromPrivKey(privKey);
  return { data: { privKey, ethAddress }, error: null, };
};

/**
 * @case enable MFA
 * @param input 
 * @returns 
 */
export const enabledMFA = async (
  input: UserEnableMFAInput,
): Promise<{ data?: { recovery: string }; error?: ErrorApi }> => {
  try {
    const { owner, shareB, decryptedMetadata, recoveryEmail, passphrase } = input;
    const publicShareB = getPublic(Buffer.from(shareB, 'hex'));
    const deviceInfoString = deviceInfo();

    const passphraseBN = new BN(keccak256(passphrase).substring(2), "hex");
    const { metadata, device, recovery } = await enableMFA({
      deviceInfo: deviceInfoString,
      oldMetadata: decryptedMetadata,
      shareB: new BN(shareB, "hex"),
      passphrase: passphraseBN,
      recoveryEmail,
    });
    alert(hexToWords(recovery.value.toString("hex")))
    // Call api update metadata
    const encryptedMetadataBuffer = await encrypt(
      publicShareB,
      Buffer.from(JSON.stringify(metadata)),
    );
    // Set buffer to string
    let encryptedMetadata = {
      mac: encryptedMetadataBuffer.mac.toString('hex'),
      iv: encryptedMetadataBuffer.iv.toString('hex'),
      ephemPublicKey: encryptedMetadataBuffer.ephemPublicKey.toString('hex'),
      ciphertext: encryptedMetadataBuffer.ciphertext.toString('hex'),
    };

    await updateMetadata(owner, shareB, encryptedMetadata);
    // storage new device
    await storage.storeShareDeviceOnLocalStorage(device);
    return {
      data: {
        recovery: hexToWords(recovery.value.toString("hex"))
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: { statusCode: "500", errorMessage: error.message || "Unknown" } }
  }
};

/**
 * @case change account passowrd MFA
 * @param input 
 * @returns 
 */
export const changeAccountPassword = async (
  input: ChangePasswordMFAInput,
): Promise<{ data?: boolean; error?: ErrorApi }> => {
  try {
    const { owner, shareB, decryptedMetadata, passphrase, masterPrivateKey } = input;
    const publicShareB = getPublic(Buffer.from(shareB, 'hex'));

    const passphraseBN = new BN(keccak256(passphrase).substring(2), "hex");
    const { metadata } = await updateMetadataPasswordMFA({
      owner,
      decryptedMetadata,
      shareB: new BN(shareB, "hex"),
      masterPrivateKey: new BN(masterPrivateKey, "hex"),
      passphrase: passphraseBN,
    });
    // Call api update metadata
    const encryptedMetadataBuffer = await encrypt(
      publicShareB,
      Buffer.from(JSON.stringify(metadata)),
    );
    // Set buffer to string
    let encryptedMetadata = {
      mac: encryptedMetadataBuffer.mac.toString('hex'),
      iv: encryptedMetadataBuffer.iv.toString('hex'),
      ephemPublicKey: encryptedMetadataBuffer.ephemPublicKey.toString('hex'),
      ciphertext: encryptedMetadataBuffer.ciphertext.toString('hex'),
    };

    await updateMetadata(owner, shareB, encryptedMetadata);
    return {
      data: true,
      error: null,
    };
  } catch (error) {
    return { data: null, error: { statusCode: "500", errorMessage: error.message || "Unknown" } }
  }
};

/**
 * @case change account passowrd MFA
 * @param input 
 * @returns 
 */
export const changeRecovery = async (
  input: ResendRecoveryMFAInput,
): Promise<{ data?: ResendRecoveryMFAOutput; error?: ErrorApi }> => {
  try {
    const { owner, shareB, decryptedMetadata, recoveryEmail, masterPrivateKey } = input;
    const publicShareB = getPublic(Buffer.from(shareB, 'hex'));

    const { metadata, recovery } = await updateMetadataRecoveryMFA({
      owner,
      decryptedMetadata,
      shareB: new BN(shareB, "hex"),
      masterPrivateKey: new BN(masterPrivateKey, "hex"),
      recoveryEmail,
    });
    // Call api update metadata
    const encryptedMetadataBuffer = await encrypt(
      publicShareB,
      Buffer.from(JSON.stringify(metadata)),
    );
    // Set buffer to string
    let encryptedMetadata = {
      mac: encryptedMetadataBuffer.mac.toString('hex'),
      iv: encryptedMetadataBuffer.iv.toString('hex'),
      ephemPublicKey: encryptedMetadataBuffer.ephemPublicKey.toString('hex'),
      ciphertext: encryptedMetadataBuffer.ciphertext.toString('hex'),
    };

    await updateMetadata(owner, shareB, encryptedMetadata);
    // Send mail
    const words = hexToWords(recovery.value.toString("hex"));
    return {
      data: { metadata, phrase: words },
      error: null,
    };
  } catch (error) {
    return { data: null, error: { statusCode: "500", errorMessage: error.message || "Unknown" } }
  }
};

/**
 * @case Remove device
 * @param input 
 * @returns 
 */
export const removeDeviceMFA = async (
  input: RemoveDeviceMFAInput,
): Promise<{ data?: RemoveDeviceMFAOutput; error?: ErrorApi }> => {
  try {
    const { owner, shareB, deviceId } = input;
    let { decryptedMetadata } = input;
    const { tkey: { devices } } = decryptedMetadata;
    const publicShareB = getPublic(Buffer.from(shareB, 'hex'));
    const afterDevice = devices.filter(device => device.id !== deviceId);
    const metadata = {
      ...decryptedMetadata,
      tkey: {
        ...decryptedMetadata.tkey,
        devices: afterDevice
      }
    };
    // Call api update metadata
    const encryptedMetadataBuffer = await encrypt(
      publicShareB,
      Buffer.from(JSON.stringify(metadata)),
    );
    // Set buffer to string
    let encryptedMetadata = {
      mac: encryptedMetadataBuffer.mac.toString('hex'),
      iv: encryptedMetadataBuffer.iv.toString('hex'),
      ephemPublicKey: encryptedMetadataBuffer.ephemPublicKey.toString('hex'),
      ciphertext: encryptedMetadataBuffer.ciphertext.toString('hex'),
    };

    await updateMetadata(owner, shareB, encryptedMetadata);
    return {
      data: true,
      error: null,
    };
  } catch (error) {
    return { data: null, error: { statusCode: "500", errorMessage: error.message || "Unknown" } }
  }
};

export const getMetadata = async (
  input: GetMetadataRequest,
): Promise<{ data?: GetMetadataResponse; error?: ErrorApi }> => {
  const { owner, shareB } = input;
  const publicShareB = getPublic(Buffer.from(shareB, 'hex'));
  const deviceInfoString = deviceInfo();
  let error: ErrorApi;
  let encryptedMetadata: EncryptedMetadata;
  try {
    const { data: metadata } = await axios.get<GetMetadataResponse>(
      `${METADATA_URL}/storages/${owner.toLowerCase()}`,
    );
    encryptedMetadata = metadata.encryptedMetadata;
  } catch (err) {
    error = {
      errorMessage: err?.response?.data.message,
      statusCode: err?.response?.data.statusCode,
    };
  }

  // Case: First time user sign in DWallet, auto storage metadata
  if (error?.errorMessage?.includes('Can not find metadata')) {
    const metadata = await generateMetadata({
      shareB: new BN(shareB, 'hex'),
      owner,
      deviceInfo: deviceInfoString,
    });
    try {
      const encryptedMetadataBuffer = await encrypt(
        publicShareB,
        Buffer.from(JSON.stringify(metadata)),
      );
      // Set buffer to string
      encryptedMetadata = {
        mac: encryptedMetadataBuffer.mac.toString('hex'),
        iv: encryptedMetadataBuffer.iv.toString('hex'),
        ephemPublicKey: encryptedMetadataBuffer.ephemPublicKey.toString('hex'),
        ciphertext: encryptedMetadataBuffer.ciphertext.toString('hex'),
      };

      const msg = keccak256(JSON.stringify(encryptedMetadata));
      const signature = ec
        .sign(msg, Buffer.from(shareB, 'hex'), 'hex')
        .toDER('hex');

      await axios.post(`${METADATA_URL}/storages`, {
        encryptedMetadata,
        signature,
        publicKey: publicShareB.toString('hex'),
        owner: owner.toLowerCase(),
      });
    } catch (err) {
      error = {
        errorMessage: err?.response?.data.message,
        statusCode: err?.response?.data.statusCode,
      };
    }
    if (error) return { error, data: null };
    // await storage.storeShareOnLocalStorage(removeFieldValue(metadata), "shares")
  }

  const metadata = await decrypt(Buffer.from(shareB, 'hex'), {
    ephemPublicKey: Buffer.from(encryptedMetadata.ephemPublicKey, 'hex'),
    iv: Buffer.from(encryptedMetadata.iv, 'hex'),
    mac: Buffer.from(encryptedMetadata.mac, 'hex'),
    ciphertext: Buffer.from(encryptedMetadata.ciphertext, 'hex'),
  });
  const decryptedMetadata = JSON.parse(metadata.toString()) as Metadata;
  return { data: { owner, metadata: decryptedMetadata }, error: null }
};
