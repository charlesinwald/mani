import React, {useEffect} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';
import AppNavigator from './src/navigation/AppNavigation';
import RNBootSplash from 'react-native-bootsplash';

if (__DEV__) {
  console.log('Running in development mode!');
}

const App = () => {
  useEffect(() => {
    // Hide the splash screen after the app has loaded
    RNBootSplash.hide({fade: true});
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.light}>
          <AppNavigator />
        </ApplicationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
