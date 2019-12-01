import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { StyleSheet, TextInput, View, StatusBar, BackHandler, Image } from 'react-native';
import { Text, Icon } from 'native-base';
import { OutlineButton } from './components/OutlineButton'
import { flowTransition } from './Transitions'
import { Transition } from 'react-navigation-fluid-transitions'
import { LoginService, LoginFailedException, BiometryType } from './core/LoginService'
import { EncryptionService } from './core/EncryptionService'

import COLORS from './Colors'

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>,
}

type State = {
    password: string,
    errorMessage: string,
    biometryType: BiometryType
}

export default class Login extends React.Component<Props, State> {
    state = {
        password: '',
        errorMessage: '',
        biometryType: BiometryType.Pending
    }
    private loginService: LoginService = LoginService.getInstance();
    private encryptionService: EncryptionService = EncryptionService.getInstance();
    private onLoginSuccess: Function = () => {};
    private mode: 'any' | 'password' | 'biometric' = 'any';
    private message: string = '';

    constructor(props: Props) {
        super(props);
        this.onLoginSuccess = this.props.navigation.getParam('onLoginSuccess', () => {});
        this.mode = this.props.navigation.getParam('mode', 'any');
        this.message = this.props.navigation.getParam('message', '');

        this.state.biometryType = this.loginService.getAvailableSensor();
        this.loginService.getAvailableBiometry().then((biometryType: BiometryType) => {
            if (this.state.biometryType !== biometryType)
                this.setState({biometryType: biometryType});
        })
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', () => {return true});
        if (this.mode != 'password')
            this.biometryCheck();
    }

    async biometryCheck() {
        let enabled = await this.loginService.isBiometicAuthenticaionSet()

        if (enabled) {
            this.promptBiometryPopup();
        }
    }

    promptBiometryPopup = async () => {
        try {
            await this.loginService.biometricAuthentication();
            this.loginSuccess();
        } catch (e) {}
    }

    loginSuccess() {
        this.onLoginSuccess();
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
            console.log(this.loginService.getMasterPasswordHash())
            this.loginSuccess();
        } catch (e) {
            if (e instanceof LoginFailedException)
                this.promptErrorMessage('Wrong Password');
            else console.log(e);
        }
    }

    biometryButton() {
        if (this.encryptionService.isBiometryEnabled()) {
            if (this.mode == 'password')
                return <></>;
            else if (this.state.biometryType == BiometryType.Fingerprint)
                return <OutlineButton 
                    title="USE FINGERPRINT" 
                    icon="fingerprint"
                    iconType="Entypo" 
                    color="white"
                    onPress={this.promptBiometryPopup}></OutlineButton>
            else if (this.state.biometryType == BiometryType.FaceID)
                return <OutlineButton 
                    title="USE FACE ID" 
                    icon="camera"
                    iconType="Entypo" 
                    color="white"
                    onPress={this.promptBiometryPopup}></OutlineButton>
            return <></>;
        }
    }

    inputField() {
        if (this.mode != 'biometric') {
            return <>
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
            </>
        }
        return <></>
    }

    getMessage() {
        if (this.message == '')
            return (<></>);
        else
            return (<Text style={{textAlign: 'center', color: 'white', marginTop: 10}}>{this.message}</Text>);
    }

    getModeInfo() {
        let modeInfo = '';
        if (this.mode == 'password')
            modeInfo = 'Password required'
        else if (this.mode == 'biometric') {
            if (this.state.biometryType == BiometryType.Fingerprint)
                modeInfo = 'Fingerprint required'
            else
                modeInfo = 'Face-ID required'
        }

        if (modeInfo == '')
            return (<></>);
        else
            return (<Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', marginVertical: 5}}>{modeInfo}</Text>);
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

                    {//<Icon type="Feather" name='lock' style={{color: "white", fontSize: 60}}/>
                    }
                    <Image source={require('../assets/outlinelogowhite.png')} style={{width: 100, height: 100}}/>
                    <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 30, marginBottom: 10}}>Encryptor</Text>
                    <Icon type="Feather" name='lock' style={{color: "white", fontSize: 35, marginRight: 10, marginBottom: 10}}/>

                    {this.getMessage()}
                    {this.getModeInfo()}
                    

                    <View style={{height: 40}}>
                        {badge}
                    </View>

                    {this.inputField()}

                    {this.biometryButton()}
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