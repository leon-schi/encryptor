import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { StyleSheet, TextInput, View, StatusBar, BackHandler } from 'react-native';
import { Text, Icon } from 'native-base';
import { OutlineButton } from './components/OutlineButton'
import { flowTransition } from './Transitions'
import { Transition } from 'react-navigation-fluid-transitions'
import { LoginService, LoginFailedException } from './core/LoginService'

import COLORS from './Colors'
import Biometrics from 'react-native-biometrics'

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

type State = {
    password: string,
    errorMessage: string
}

export default class Login extends React.Component<Props, State> {
    state = {
        password: '',
        errorMessage: ''
    }
    private loginService: LoginService = LoginService.getInstance();

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {return true});
        this.loginService.setMasterPassword('12345');
        //this.bio();
    }

    async bio() {
        let pulicKey = await Biometrics.createKeys('Confirm Fingerprint');
        this.loginService.setPublicKey(pulicKey);

        let payload = 'Andreas Polze';
        let token = await Biometrics.createSignature('Sign in', payload);
        await this.loginService.LoginWithToken(token, payload);
    }

    loginSuccess() {
        this.props.navigation.goBack();
    }

    promptErrorMessage(message: string) {
        this.setState({
            password: '',
            errorMessage: message
        });
    }

    performPasswordLogin = async () => {
        this.setState({errorMessage: ''});
        try {
            await this.loginService.masterPasswordLogin(this.state.password);
            this.loginSuccess();
        } catch (e) {
            if (e instanceof LoginFailedException)
                this.promptErrorMessage('Wrong Password');
            else console.log(e);
        }
    }

    render() {
        let badge = <></>;
        if (this.state.errorMessage !== '')
            badge = 
                <View style={{borderWidth: 1,
                    borderRadius: 50,
                    borderColor: 'white',
                    padding: 15,
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 40}}>
                    <Icon type="Feather" name='alert-circle' style={{color: "white", fontSize: 20, marginRight: 10}}/>
                    <Text style={{color: 'white'}}>{this.state.errorMessage}</Text>
                </View>

        return (
            <Transition appear={flowTransition}>
                <View style={styles.contentLayout}>
                    <StatusBar translucent={true} animated={true} backgroundColor="rgba(255,255, 255,00)" barStyle="light-content" />

                    <Icon type="Feather" name='lock' style={{color: "white", fontSize: 60}}/>
                    <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 30, marginVertical: 20}}>Encryptor</Text>

                    <View style={{height: 40}}>
                        {badge}
                    </View>

                    <View style={{flexDirection: 'row', marginVertical: 20}}>
                        <TextInput 
                            secureTextEntry={true} 
                            placeholderTextColor={'#ccc'} 
                            autoCompleteType="password" 
                            style={{flex: 1, fontSize: 18, borderColor: 'white', color: 'white', borderBottomWidth: 1, paddingVertical: 5}} 
                            placeholder="Password"
                            value={this.state.password}
                            onChangeText={(text) => {this.setState({password: text})}}/>
                    </View>

                    <OutlineButton 
                            title="CONFIRM" 
                            icon="check" 
                            color="white"
                            onPress={this.performPasswordLogin}></OutlineButton>
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
        paddingTop: 100
    }
});