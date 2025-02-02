import React from 'react';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import { createFluidNavigator } from 'react-navigation-fluid-transitions'
import { Animated, Easing } from 'react-native' 

import Loader from './src/Load'
import HomeComponent from './src/Home'
import SettingsComponent from './src/Settings'
import DetailsComponent from './src/Details'
import ChangePasswordComponent from './src/ChangePassword'
import Modal from './src/Modal'
import Login from './src/Login'
import StartComponent from './src/introduction/Start'

const transitionConfig = {
	duration: 300,
	timing: Animated.timing,
	useNativeDriver: true,
	delay: 0
};

const MainNavigator: any = createFluidNavigator({
	'Loader': {screen: Loader},
	'Home': {screen: HomeComponent},
	'Settings': {screen: SettingsComponent},
	'ChangePassword': {screen: ChangePasswordComponent},
	'Details': {screen: DetailsComponent},
	'Modal': {screen: Modal},
	'Login': {screen: Login},
	'Start': {screen: StartComponent}
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