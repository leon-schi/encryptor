import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import { Animated, Easing } from 'react-native' 

import HomeComponent from './src/Home'
import DetailsComponent from './src/Details'
import Modal from './src/Modal'

const transitionConfig = () => {
  return {
      transitionSpec: {
      duration: 500,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
      },
      screenInterpolator: sceneProps => {
      const { layout, position, scene } = sceneProps;

      const thisSceneIndex = scene.index;
      const width = layout.initWidth;

      const translateX = position.interpolate({
          inputRange: [thisSceneIndex - 1, thisSceneIndex],
          outputRange: [width, 0],
          extrapolate: 'clamp'
      });

      return {
          transform: [{ translateX }]
      }
    }
  }
}

const MainNavigator = createStackNavigator({
  'Home': {
    screen: HomeComponent,
    navigationOptions: ({ navigation }) => ({
      transitionConfig: transitionConfig
    })
  },
  'Details': {screen: DetailsComponent},
  'Modal': {screen: Modal}
},{
  headerMode: 'none',
  navigationOptions: {
    headerVisible: false,
  }
});

const App = createAppContainer(MainNavigator);
export default App;