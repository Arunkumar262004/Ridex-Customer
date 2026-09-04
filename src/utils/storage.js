import * as Keychain from 'react-native-keychain';

const saveAuthData = async data => {
  await Keychain.setGenericPassword(
    'ridex',
    JSON.stringify(data),
    {
      service: 'ridex-auth',
    },
  );
};

const getAuthData = async () => {
  const credentials = await Keychain.getGenericPassword({
    service: 'ridex-auth',
  });

  if (!credentials) {
    return null;
  }

  return JSON.parse(credentials.password);
};

const clearAuthData = async () => {
  await Keychain.resetGenericPassword({
    service: 'ridex-auth',
  });
};

export {
  saveAuthData,
  getAuthData,
  clearAuthData,
};