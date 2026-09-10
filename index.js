import { AppRegistry, LogBox } from 'react-native';
import { Logger } from 'mappls-map-react-native';
import App from './App';
import { name as appName } from './app.json';

LogBox.ignoreLogs([
  'Mappls error',
  'enableTrafficStopIcon',
  'Method not Provisioned',
]);

// Intercept Mappls SDK logger to suppress non-fatal native provisioning warnings
Logger.setLogCallback(log => {
  if (
    log?.message?.includes('enableTrafficStopIcon') ||
    log?.message?.includes('Method not Provisioned')
  ) {
    return true; // Prevents default console.error popup
  }
  return false;
});

AppRegistry.registerComponent(appName, () => App);
