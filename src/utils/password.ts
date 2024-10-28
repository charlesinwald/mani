// TODO: Remove crypto-js/SHA512 library
// import SHA512 from 'crypto-js/SHA512';
import {SHA512} from 'crypto-es/lib/sha512';
import dayjs from 'dayjs';

import {setSecureValue, getSecureValue, removeSecureValue} from './keyChain';
import RNBiometrics from 'react-native-simple-biometrics';



/**
 * Store a hashed password in Keychain
 * @param {string} password - The plain text password from form
 */
export const setPassword = async (password: string) => {
  // 1. Create a hash from password (which is plain text)
  let hash = SHA512(password).toString();

  // 2. Store the hash in keychain: Call the function here
  try {
    let res = await setSecureValue('pwdHash', hash);
    await setSecureValue(
      'pwdTimestamp',
      dayjs(new Date()).valueOf().toString(),
    );
    return res;
  } catch (error) {
    return error;
  }
};

/**
 * Retrieve hashed password from Keychain
 */
export const getPassword = async () => {
  return getSecureValue('pwdHash');
};

/**
 * Retrieve timestamp of hashed password from Keychain
 */
export const getPasswordTimestamp = async () => {
  return getSecureValue('pwdTimestamp');
};

/**
 * Retrieve hashed password status from Keychain
 */
export const getPasswordStatus = async () => {
  try {
    let pwd = await getSecureValue('pwdHash');
    return pwd ? true : false;
  } catch (error) {
    return false;
  }
};

/**
 * Compare & verify user input password with stored hash
 */
export const verifyPwdWithStoredHash = async (inputPwd: string) => {
  let hash = SHA512(inputPwd).toString();
  try {
    let pwd = await getSecureValue('pwdHash');
    return pwd === hash ? true : false;
  } catch (error) {
    return error;
  }
};

/**
 * Compare & verify hashed password with stored hash
 */
export const verifyHashWithStoredHash = async (inputHash: string) => {
  try {
    let pwd = await getSecureValue('pwdHash');
    return pwd === inputHash ? true : false;
  } catch (error) {
    return error;
  }
};

/**
 * Delete stored password
 */
export const deletePassword = async () => {
  try {
    let status = await removeSecureValue('pwdHash');
    await removeSecureValue('pwdTimestamp');
    return status;
  } catch (error) {
    return false;
  }
};

/* Update  password
 *
 */
export const updatePassword = async (
  inputCurrentPwd: string,
  newPwd: string,
) => {
  // 1. Compare input Password with Current Password
  let hashOfInputCurrentPwd = SHA512(inputCurrentPwd).toString();

  return getPassword()
    .then(currentPwd => {
      return hashOfInputCurrentPwd === currentPwd;
    })
    .then(res => {
      if (!res) {
        throw new Error('Current pasword is incorrect');
      }
      return setPassword(newPwd);
    })
    .catch(() => {
      return false;
    });
};

/*
 * Update HASH (not password)
 */
export const updateHash = async (newHash: string, timestamp: string) => {
  if (!newHash) {
    return deletePassword();
  }
  if (!timestamp) {
    timestamp = dayjs(new Date()).valueOf().toString();
  }
  try {
    let res = await setSecureValue('pwdHash', newHash);
    await setSecureValue('pwdTimestamp', timestamp);
    return res;
  } catch (error) {
    return error;
  }
};

/**
 * Authenticate user using biometrics
 */
export const authenticateWithBiometrics = async () => {
  const can = await RNBiometrics.canAuthenticate();
  if (!can) {
    console.log('Biometrics not available');
    return false;
  }
  try {
    const result = await RNBiometrics.requestBioAuth(
      'Please authenticate to unlock',
      'Please use your biometrics to unlock the app',
    );
    return result; // Returns true if authenticated
  } catch (error) {
    return false; // Authentication failed
  }
};
