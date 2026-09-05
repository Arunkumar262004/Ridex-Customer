import React from 'react';
import {Provider} from 'react-redux';
import store from './src/app/store';
import RootNavigator from './src/app/navigation/RootNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

export default App;
