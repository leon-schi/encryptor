import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { StyleSheet, TextInput, View, StatusBar } from 'react-native';
import { Text, Icon } from 'native-base';
import { OutlineButton } from './components/OutlineButton'
import { flowTransition } from './Transitions'
import { Transition } from 'react-navigation-fluid-transitions'

import COLORS from './Colors'

import Biometrics from 'react-native-biometrics'

export default class Login extends React.Component {

    componentDidMount() {
        Biometrics.createKeys('Confirm fingerprint')
            .then((publicKey) => {
                console.log(publicKey)
            })
            .catch(() => {
                console.log('no');
            })
    }

    render() {
        return (
            <Transition appear={flowTransition}>
                <View style={styles.contentLayout}>
                    <StatusBar animated={true} backgroundColor={COLORS.primary} barStyle="light-content" />

                    <Icon type="Feather" name='lock' style={{color: "white", fontSize: 60}}/>
                    <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 30, marginVertical: 20}}>Encryptor</Text>

                    <View style={{flexDirection: 'row', marginVertical: 20}}>
                        <TextInput secureTextEntry={true} placeholderTextColor={'#ccc'} autoCompleteType="password" style={{flex: 1, fontSize: 18, borderColor: 'white', color: 'white', borderBottomWidth: 1, paddingVertical: 5}} placeholder="Password"/>
                    </View>

                    <OutlineButton 
                            title="CONFIRM" 
                            icon="check" 
                            color="white"
                            onPress={() => {}}></OutlineButton>
                </View>
            </Transition>
        );
    }
}

const styles = StyleSheet.create({
    contentLayout: {
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: 30,
        paddingTop: 60
    }
});