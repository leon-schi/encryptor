import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import { createFluidNavigator } from 'react-navigation-fluid-transitions'
import { Animated, Easing } from 'react-native' 

import HomeComponent from './src/Home'
import DetailsComponent from './src/Details'
import Modal from './src/Modal'

const transitionConfig = {
	duration: 400,
	timing: Animated.timing,
	useNativeDriver: true,
	delay: 0
};

const MainNavigator: any = createFluidNavigator({
	'Home': {screen: HomeComponent},
	'Details': {screen: DetailsComponent},
	'Modal': {screen: Modal}
	}, {
		headerMode: 'none',
		navigationOptions: {
			headerVisible: false,
		},
		transitionConfig,
		defaultNavigationOptions: { gesturesEnabled: true }
});

const App = createAppContainer(MainNavigator);
export default App;