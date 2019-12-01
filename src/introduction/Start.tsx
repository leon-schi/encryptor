import React from 'react';
import { SafeAreaView, View, StyleSheet, TextInput, ScrollView, Animated, Dimensions, BackHandler, StatusBar } from 'react-native'
import { Text, Icon } from 'native-base';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';

import { OutlineButton } from '../components/OutlineButton'
import { EncryptionService } from '../core/EncryptionService'
import { LoginService, BiometryType } from '../core/LoginService'
import { AuthenticationHelper } from '../core/AuthenticationHelper'
import COLORS from '../Colors';

const horizontalPadding = 20;
const width = Dimensions.get('window').width - 2*horizontalPadding;

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

type State = {
    password: string,
    confirmation: string,
    errorMessage: string
}

export default class StartComponent extends React.Component<Props, State> {
    state = {
        password: '',
        confirmation: '',
        errorMessage: ''
    }
    private authenticationHelper: AuthenticationHelper = new AuthenticationHelper(this.props.navigation);
    offset: Animated.Value = new Animated.Value(0);

    constructor(props: Props) {
        super(props);
        BackHandler.addEventListener('hardwareBackPress', () => {return true});
    }

    transition() {
        Animated.timing(this.offset, {toValue: -width, duration: 300}).start();
    }

    render() {
        return (
                <SafeAreaView style={styles.contentLayout}>
                    <StatusBar translucent={true} animated={true} backgroundColor="rgba(255,255, 255,0)" barStyle="dark-content" />
                    <ScrollView style={{
                        paddingTop: 70,
                        padding: horizontalPadding}}>
                        <View style={{alignItems: 'center'}}>
                            <Icon type="Feather" name='lock' style={{color: COLORS.primary, fontSize: 60}}/>
                            <Text style={{color: COLORS.primary, textAlign: 'center', fontWeight: 'bold', fontSize: 30, marginBottom: 20}}>Encryptor</Text>
                        </View>

                        <View style={{flexDirection: 'row'}}>
                            <Animated.View style={{transform: [{translateX: this.offset}], width: width}}>
                                <PasswordComponent
                                    onSuccess={() => {this.transition()}}
                                    authenticationHelper={this.authenticationHelper}/>
                            </Animated.View>

                            <Animated.View style={{transform: [{translateX: this.offset}], width: width}}>
                                <BiometricsComponent
                                    onSuccess={() => {this.props.navigation.replace('Home');}}/>
                            </Animated.View>
                        </View>

                    </ScrollView>
                </SafeAreaView>
        );
    }
}

type PasswordState = {
    password: string,
    confirmation: string,
    errorMessage: string
}

type PasswordProps = {
    onSuccess: Function,
    authenticationHelper: AuthenticationHelper
}

class PasswordComponent extends React.Component<PasswordProps, PasswordState> {
    state = {
        password: '',
        confirmation: '',
        errorMessage: ''
    }
    private encryptionService: EncryptionService = EncryptionService.getInstance();

    async confirm() {
        if (this.state.password == '')
            this.setState({errorMessage: 'Password cannot be blank'});
        else if (this.state.password != this.state.confirmation)
            this.setState({errorMessage: 'The passwords do not match'});
        else  {
            let action = async () => {
                await this.encryptionService.setMasterPassword(this.state.password);
                this.props.onSuccess();
            };
            await this.props.authenticationHelper.execute(action, "Authenticate to change the password");
        }
    }

    render() {
        return (
            <View>

                <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>Welcome!</Text>
                <Text style={{textAlign: 'center', fontSize: 16, color: '#777', marginBottom: 20, paddingHorizontal: 10}}>Welcome! Please set an initial password to protect your secrets.</Text>
                
                <View style={{flexDirection: 'row', justifyContent: 'center', height: 35}}>
                    {this.state.errorMessage != '' ? <View style={{
                        borderWidth: 1,
                        borderRadius: 50,
                        borderColor: COLORS.danger,
                        padding: 15,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 40}}>
                            <Icon type="Feather" name='alert-circle' style={{color: COLORS.danger, fontSize: 20, marginRight: 10}}/>
                            <Text style={{color: COLORS.danger}}>{this.state.errorMessage}</Text>
                    </View>: <></>}
                </View>

                <View style={{flexDirection: 'column', paddingTop: 20}}>
                    <Text style={{fontSize: 14}}>Enter New Password</Text>
                    <TextInput 
                        secureTextEntry={true}
                        placeholderTextColor={'#ccc'} 
                        style={{borderColor: COLORS.dark, color: '#666', borderBottomWidth: 1, paddingVertical: 5, marginBottom: 30}} 
                        placeholder="Password"
                        value={this.state.password}
                        onChangeText={(text) => {this.setState({password: text})}}/>
                        
                    <Text style={{fontSize: 14}}>Confirm Password</Text>
                    <TextInput 
                        secureTextEntry={true}
                        placeholderTextColor={'#ccc'} 
                        style={{borderColor: COLORS.dark, color: '#666', borderBottomWidth: 1, paddingVertical: 5, marginBottom: 20}} 
                        placeholder="Password"
                        value={this.state.confirmation}
                        onChangeText={(text) => {this.setState({confirmation: text})}}/>

                    <OutlineButton 
                        title="CONFIRM" 
                        icon="check" 
                        color={COLORS.primary}
                        onPress={() => {this.confirm()}}></OutlineButton>
                </View>

            </View>
        )
    }
}

type BiometricsProps = {
    onSuccess: Function
}
type BiometricsState = {
    loading: boolean,
    biometryType: BiometryType
}

class BiometricsComponent extends React.Component<BiometricsProps, BiometricsState> {
    state = {
        loading: false,
        biometryType: BiometryType.Pending
    }
    private encryptionService: EncryptionService = EncryptionService.getInstance();
    private loginService: LoginService = LoginService.getInstance();

    constructor(props: BiometricsProps) {
        super(props);
        
        this.state.biometryType = this.loginService.getAvailableSensor();
        this.loginService.getAvailableBiometry().then((biometryType: BiometryType) => {
            if (this.state.biometryType !== biometryType)
                this.setState({biometryType: biometryType});
        })
    }

    async enableBiometrics() {
        try {
            this.setState({loading: true});
            await this.loginService.biometricAuthentication();
            await this.encryptionService.addBiometricProtectionToMasterToken();
            await this.loginService.setBiometicAuthentication(true);
            this.props.onSuccess();
        } catch (e) {}
        this.setState({loading: false});
    }

    cancel() {
        if (!this.state.loading)
            this.props.onSuccess();
    }

    getContent() {
        if (this.state.biometryType == BiometryType.Pending || this.state.biometryType == BiometryType.None) {
            return (
                <OutlineButton
                    style={{marginTop: 50}}
                    title="GET STARTED" 
                    icon="check" 
                    color={COLORS.primary}
                    onPress={() => {this.cancel()}}></OutlineButton>
            )
        }

        let icon, text;

        if (this.state.biometryType == BiometryType.Fingerprint) {
            icon = 'fingerprint';
            text = 'We also detected that your device has a fingerprint sensor. Do you want to use it for authentication in the future?';
        } else {
            icon = 'camera';
            text = 'We also detected that your device supports Face ID. Do you want to use it for authentication in the future?';
        }

        return (
            <>
                <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 30}}>
                    <View style={{flex: 1, flexDirection: 'column', paddingTop: 10}}>
                        <Icon type="Entypo" name={icon} style={{flex: 1, color: COLORS.primary, fontSize: 50}}/>
                    </View>
                    <View style={{flex: 5, flexDirection: 'column', justifyContent:"center", alignItems: 'center'}}>
                        <Text style={{textAlign: 'left', fontSize: 16, color: '#777', marginBottom: 20, paddingHorizontal: 10}}>
                            {text}
                        </Text>
                    </View>
                </View>

                <View style={{marginTop: 10}}>
                    <OutlineButton 
                        title="YES" 
                        icon="check" 
                        color={COLORS.primary}
                        loading={this.state.loading}
                        onPress={() => {this.enableBiometrics()}}></OutlineButton>
                    <OutlineButton
                        title="NO" 
                        icon="x" 
                        color="#333"
                        onPress={() => {this.cancel()}}></OutlineButton>
                </View>
            </>
        )
    }

    render() {
        return (
            <View>

                <View style={{alignItems: 'center'}}>
                    <Icon type="Feather" name="check" style={{color: COLORS.success, fontSize: 50}}/>
                </View>

                <Text style={{textAlign: 'center', fontSize: 18, fontWeight: 'bold'}}>Successfully set Password</Text>
                
                {this.getContent()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    contentLayout: {
        flexDirection: 'column',
        flex: 1
    }
});