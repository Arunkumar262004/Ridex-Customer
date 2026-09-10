import React from 'react';

import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import store from './src/app/store';
import RootNavigator from './src/app/navigation/RootNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;