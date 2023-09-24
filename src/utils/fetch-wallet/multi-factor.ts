import {
  ReconstructMasterKeyInput,
  ReconstructMasterKeyOutput,
  GenerateMetadataInput,
  GenerateMetadataOutput,
  Metadata,
  Tkey,
  AddNewDeviceInMetadataInput,
  AddNewDeviceInMetadataOutput,
  EnableMFAInput,
  EnableMFAOutput,
  DeviceKey,
  CalculateIndexFromValueInput,
  CalculateIndexFromValueOutput,
  UpdateMetadataPasswordMFAOutput,
  UpdateMetadataPasswordMFAInput,
  UpdateMetadataRecoveryMFAInput,
  UpdateMetadataRecoveryMFAOutput,
} from './types';
import elliptic from 'elliptic';
import { v4 as uuidv4 } from 'uuid';
import BN from 'bn.js';
import moment from 'moment';

const secp256k1 = new elliptic.ec('secp256k1');
const n = secp256k1.curve.n;

export const generateMetadata = async (
  params: GenerateMetadataInput,
): Promise<GenerateMetadataOutput> => {
  const { owner, shareB, deviceInfo, enableMFA } = params;
  const keypair = secp256k1.genKeyPair();
  const privateKey = keypair.getPrivate();

  const nodeValue = shareB;
  const nodeIndex = secp256k1.genKeyPair().getPrivate();

  const deviceIndex = secp256k1.genKeyPair().getPrivate();
  const deviceValue = interpolate(
    [new BN(0), nodeIndex],
    [privateKey, nodeValue],
    deviceIndex,
  );

  const mustShares = 2;

  const metadata: Metadata = {
    enabledMFA: false,
    owner,
    masterPublicKey: keypair.getPublic("hex"),
    tkey: {
      total: mustShares,
      threshold: mustShares,
      node: {
        index: nodeIndex.toString('hex'),
      },
      devices: [
        {
          id: uuidv4(),
          deviceIndex: !enableMFA && deviceIndex.toString('hex'),
          deviceValue: deviceValue.toString('hex'),
          deviceInfo,
        },
      ],
    },
  };

  return metadata;
};

export const reconstructMasterKey = async (
  params: ReconstructMasterKeyInput,
): Promise<ReconstructMasterKeyOutput> => {
  const { shareA, shareB } = params;
  const indices = [shareA.index, shareB.index];
  const values = [shareA.value, shareB.value];
  const masterPrivateKey = interpolate(indices, values, new BN(0));

  return {
    masterKey: masterPrivateKey,
  };
};

export const enableMFA = async (
  params: EnableMFAInput,
): Promise<EnableMFAOutput> => {
  const { oldMetadata, shareB, deviceInfo, recoveryEmail, passphrase } = params;

  if (oldMetadata.enabledMFA) {
    throw new Error('Already enabled MFA');
  }

  const { owner, tkey, masterPublicKey } = oldMetadata;
  const { node, devices } = tkey;
  if (!devices[0]) {
    throw new Error('Should generate metadata before enable MFA');
  }

  const nodeValue = shareB;
  const nodeIndex = new BN(node.index, 'hex');

  const oldDeviceIndex = new BN(devices[0].deviceIndex, 'hex');
  const oldDeviceValue = new BN(devices[0].deviceValue, 'hex');

  const newDeviceIndex = secp256k1.genKeyPair().getPrivate();

  const newDeviceValue = interpolate(
    [nodeIndex, oldDeviceIndex],
    [nodeValue, oldDeviceValue],
    newDeviceIndex,
  );

  const newDevice = {
    id: uuidv4(),
    deviceValue: newDeviceValue.toString('hex'),
    deviceInfo,
  };

  // Generate recovery-value
  const newRecoveryIndex = secp256k1.genKeyPair().getPrivate();
  const newRecoveryValue = interpolate(
    [nodeIndex, oldDeviceIndex],
    [nodeValue, oldDeviceValue],
    newRecoveryIndex,
  );
  // Generate passphrase-index
  const { masterKey } = await reconstructMasterKey({
    shareA: {
      index: newDeviceIndex,
      value: newDeviceValue,
    },
    shareB: {
      index: nodeIndex,
      value: nodeValue,
    }
  });
  const { newIndex: newPassphraseIndex } = await calculateIndexFromValue({
    newValue: new BN(passphrase, 'hex'),
    shareB: {
      index: nodeIndex,
      value: nodeValue,
    },
    masterPrivateKey: masterKey,
  });

  const newMetadata: Metadata = {
    enabledMFA: true,
    masterPublicKey,
    owner,
    tkey: {
      threshold: 2,
      total: 2,
      node,
      recovery: { index: newRecoveryIndex.toString("hex"), email: recoveryEmail, createdAt: moment().unix() },
      passphrase: { index: newPassphraseIndex.toString("hex") },
      devices: [
        {
          ...newDevice,
          deviceIndex: newDeviceIndex.toString('hex'),
        },
      ],
    },
  };

  return { metadata: newMetadata, device: newDevice, recovery: { value: newRecoveryValue } };
};

export const updateMetadataPasswordMFA = async (
  params: UpdateMetadataPasswordMFAInput,
): Promise<UpdateMetadataPasswordMFAOutput> => {
  const { shareB, decryptedMetadata, passphrase, masterPrivateKey } = params;

  if (!decryptedMetadata.enabledMFA) {
    throw new Error('User does not enable MFA yet');
  }

  const { owner, tkey, masterPublicKey } = decryptedMetadata;
  const { node } = tkey;

  const nodeValue = shareB;
  const nodeIndex = new BN(node.index, 'hex');

  // Generate passphrase-index
  const { newIndex: newPassphraseIndex } = await calculateIndexFromValue({
    newValue: new BN(passphrase, 'hex'),
    shareB: {
      index: nodeIndex,
      value: nodeValue,
    },
    masterPrivateKey,
  });

  const newMetadata: Metadata = {
    enabledMFA: true,
    masterPublicKey,
    owner,
    tkey: {
      ...tkey,
      passphrase: { index: newPassphraseIndex.toString("hex") },
    },
  };

  return { metadata: newMetadata };
};

export const updateMetadataRecoveryMFA = async (
  params: UpdateMetadataRecoveryMFAInput,
): Promise<UpdateMetadataRecoveryMFAOutput> => {
  const { shareB, decryptedMetadata, recoveryEmail, masterPrivateKey } = params;

  if (!decryptedMetadata.enabledMFA) {
    throw new Error('User does not enable MFA yet');
  }

  const { owner, tkey, masterPublicKey } = decryptedMetadata;
  const { node } = tkey;

  const nodeValue = shareB;
  const nodeIndex = new BN(node.index, 'hex');

  // Generate recovery-value
  const newRecoveryIndex = secp256k1.genKeyPair().getPrivate();
  const newRecoveryValue = interpolate(
    [nodeIndex, new BN(0)],
    [nodeValue, masterPrivateKey],
    newRecoveryIndex,
  );

  const newMetadata: Metadata = {
    enabledMFA: true,
    masterPublicKey,
    owner,
    tkey: {
      ...tkey,
      recovery: { index: newRecoveryIndex.toString("hex"), email: recoveryEmail, createdAt: moment().unix() },

    },
  };

  return { metadata: newMetadata,  recovery: { value: newRecoveryValue } };
};



export const addNewDeviceInMetadata = async (
  params: AddNewDeviceInMetadataInput,
): Promise<AddNewDeviceInMetadataOutput> => {
  const { metadata, deviceInfo, shareB, shareOtherIndex, shareOtherValue } = params;
  const { enabledMFA, tkey } = metadata;

  if (enabledMFA) {
    const { devices, node } = tkey;
    const nodeIndex = new BN(node.index, 'hex');
    const nodeValue = new BN(shareB, 'hex');
    // let newDevices: DeviceKey[] = tkey;
    // if (tkey.devices[0].deviceValue) {
    //   newDevices
    // }
    const newDeviceIndex = secp256k1.genKeyPair().getPrivate();

    const newDeviceValue = interpolate(
      [nodeIndex, new BN(shareOtherIndex, 'hex')],
      [nodeValue, new BN(shareOtherValue, 'hex')],
      newDeviceIndex,
    );

    const newDevice: DeviceKey = {
      id: uuidv4(),
      deviceValue: newDeviceValue.toString('hex'),
      deviceInfo,
    };
    devices.push({
      ...newDevice, deviceIndex: newDeviceIndex.toString('hex'),
      deviceValue: null,
    });
    const newTkey: Tkey = {
      ...tkey,
      total: tkey.total + 1,
      devices,
    };
    const newMetadata: Metadata = {
      ...metadata,
      tkey: newTkey,
    };

    return { metadata: newMetadata, device: newDevice };

  } else {
    const { devices, node } = tkey;
    const nodeIndex = new BN(node.index, 'hex');
    const nodeValue = new BN(shareB, 'hex');

    const lastDevice = devices[devices.length - 1];
    const deviceIndex = new BN(lastDevice.deviceIndex, 'hex');
    const deviceValue = new BN(lastDevice.deviceValue, 'hex');

    const newDeviceIndex = secp256k1.genKeyPair().getPrivate();

    const newDeviceValue = interpolate(
      [nodeIndex, deviceIndex],
      [nodeValue, deviceValue],
      newDeviceIndex,
    );

    const newDevice: DeviceKey = {
      id: uuidv4(),
      deviceValue: newDeviceValue.toString('hex'),
      deviceInfo,
    };

    devices.push({ ...newDevice, deviceIndex: newDeviceIndex.toString('hex') });

    const newTkey: Tkey = {
      ...tkey,
      total: tkey.total + 1,
      devices,
    };
    const newMetadata: Metadata = {
      ...metadata,
      tkey: newTkey,
    };

    return { metadata: newMetadata, device: newDevice };
  }
};

// Function calculates index from value (using for recovery email, password factors)
export const calculateIndexFromValue = async (
  params: CalculateIndexFromValueInput,
): Promise<CalculateIndexFromValueOutput> => {
  const { masterPrivateKey, shareB, newValue } = params;
  const coefficient = shareB.value
    .sub(masterPrivateKey)
    .mul(shareB.index.invm(n))
    .umod(n);

  const newIndex = newValue
    .sub(masterPrivateKey)
    .mul(coefficient.invm(n))
    .umod(n);

  return { newIndex };
};

const interpolate = (indices: BN[], values: BN[], xPoint: BN): BN | null => {
  let result = new BN(0);
  if (values.length !== indices.length) {
    return null;
  }

  for (let i = 0; i < values.length; i++) {
    let iBN = indices[i];
    let upper = new BN(1);
    let lower = new BN(1);

    for (let j = 0; j < values.length; j++) {
      if (j !== i) {
        let jBN = indices[j];

        upper = upper.mul(xPoint.sub(jBN));
        upper = upper.umod(n);

        let temp = iBN.sub(jBN);
        temp = temp.umod(n);
        lower = lower.mul(temp).umod(n);
      }
    }
    let delta = upper.mul(lower.invm(n)).umod(n);
    delta = delta.mul(values[i]).umod(n);
    result = result.add(delta).umod(n);
  }

  return result;
};
