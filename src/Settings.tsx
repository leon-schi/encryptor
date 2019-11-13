import React from 'react';
import { StyleSheet, View, Switch, StatusBar, TouchableHighlight, TextInput, TouchableNativeFeedback, BackHandler, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState,
    NavigationEvents } from 'react-navigation';
import {
    Title,
    Body, 
    Text,
    H3 } from 'native-base';
import { IconicToolButton } from './components/IconicToolButton'

import { BiometryType, LoginService, NotAuthenticatedException } from './core/LoginService';
import { EncryptionService } from './core/EncryptionService';
import { AuthenticationHelper } from './core/AuthenticationHelper';
import { flowTransition, fadeTransition } from './Transitions'
import { Transition } from 'react-navigation-fluid-transitions'
import { ConfirmPassword } from './components/ConfirmPassword'

import COLORS from './Colors';

type State = {
    biometryEnabled: boolean,
    biometryType: BiometryType,
    biometryLoading: boolean,
    passwordConfirmVisible: boolean
}

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

const fabOffsetDistance = 80;

export default class SettingsComponent extends React.Component<Props, State> {
    state: State = {
        biometryEnabled: false,
        biometryType: BiometryType.Pending,
        biometryLoading: false,
        passwordConfirmVisible: false
    }
    private loginService: LoginService = LoginService.getInstance();
    private encryptionService: EncryptionService = EncryptionService.getInstance();
    private authenticationHelper: AuthenticationHelper = new AuthenticationHelper(this.props.navigation);

    constructor(props: Props) {
        super(props);
        this.state.biometryType = this.loginService.getAvailableSensor();
        this.loginService.getAvailableBiometry().then((biometryType: BiometryType) => {
            if (this.state.biometryType !== biometryType)
                this.setState({biometryType: biometryType});
        })
        this.loginService.isBiometicAuthenticaionSet().then((value: boolean) => {
            this.setState({biometryEnabled: value});
        });
    }

    onWillFocus = () => {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.quit(); 
            return true;
        });
    }

    quit() {
        this.props.navigation.goBack();
    }

    async toggleBiometryAuthentication() {
        if (!this.state.biometryLoading) {
            this.setState({biometryLoading: true});
            let desiredValue = !this.state.biometryEnabled;
            
            let action = async () => {
                try {
                    if (desiredValue) {
                        if (!(await this.encryptionService.isMasterTokenWithBiometrySet())) {
                            // require Biometric Authentication to make the biometric token available
                            if (!this.loginService.isUserBiometricallyLoggedIn())
                                await this.loginService.biometricAuthentication();
                            await this.encryptionService.addBiometricProtectionToMasterToken();
                        }
                    }
                    await this.loginService.setBiometicAuthentication(desiredValue);
                    this.setState({biometryEnabled: desiredValue, biometryLoading: false});
                } catch (e) { 
                    if (e instanceof NotAuthenticatedException) throw e;
                    this.setState({biometryLoading: false});
                }
            }
            this.authenticationHelper.execute(action, 'Confirm Password');
        }
    }

    confirmPassword() {
        this.setState({passwordConfirmVisible: true});
    }

    changePassword() {
        this.props.navigation.navigate('ChangePassword');
    } 

    biometryOption() {
        if (this.state.biometryType == BiometryType.Fingerprint) {
            return (
                <SettingsItem 
                    showSwitch={true}
                    switchState={this.state.biometryEnabled}
                    loading={this.state.biometryLoading} 
                    title="Enable Fingerprint" 
                    onPress={() => {this.toggleBiometryAuthentication()}}></SettingsItem>
            )
        } else if (this.state.biometryType == BiometryType.FaceID) {
            return (
                <SettingsItem 
                    showSwitch={true}
                    switchState={this.state.biometryEnabled}
                    loading={this.state.biometryLoading} 
                    title="Enable Face-ID" 
                    onPress={() => {}}></SettingsItem>
            )
        }
        return <></>
    }

    render() {
        return (
            <>
                <Transition appear={flowTransition} disappear={fadeTransition}>                
                    <View style={{marginTop: 0, backgroundColor: '#fff'}}>
                        <NavigationEvents onWillFocus={this.onWillFocus}/>

                        <View elevation={3} style={styles.headerLayout}>
                            <Body style={styles.headerBodyLayout}>
                                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18}}>
                                    <View style={{flex: 1}}>
                                        <IconicToolButton style={{flex: 1}} icon="arrow-left" onPress={() => {this.quit()}}></IconicToolButton>
                                    </View>
                                    <Title style={{flex: 7, fontSize: 24, color: 'black'}}>Settings</Title>
                                    <View style={{flex: 1}}></View>
                                </View>
                            </Body>
                        </View>

                        <StatusBar translucent={true} animated={true} backgroundColor="rgba(255,255, 255,0)" barStyle="dark-content" />

                        <View style={{flexDirection: 'column', backgroundColor: '#fff'}}>
                            <SettingsItem 
                                showSwitch={false}
                                switchState={true}
                                loading={false} 
                                title="Change Password" 
                                onPress={() => {this.confirmPassword()}}/>
                            {this.biometryOption()}
                            <SettingsItem 
                                showSwitch={false}
                                switchState={true}
                                loading={false} 
                                title="Re-Encrypt Everything" 
                                onPress={() => {}}/>
                            <SettingsItem 
                                showSwitch={true}
                                switchState={false}
                                loading={false} 
                                title="Dark Mode" 
                                onPress={() => {}}/>
                            <SettingsItem 
                                showSwitch={false}
                                switchState={true}
                                loading={false} 
                                title="Rate This App" 
                                onPress={() => {}}/>
                        </View>
                    </View>
                </Transition>

                <ConfirmPassword 
                    visible={this.state.passwordConfirmVisible} 
                    onCancel={() => {this.setState({passwordConfirmVisible: false})}}
                    onSuccess={() => {this.changePassword()}}></ConfirmPassword>
            </>
        )
    }
}

type SettingsProps = {
    title: string,
    onPress: any,
    loading: boolean,
    switchState: boolean,
    showSwitch: boolean
}

class SettingsItem extends React.Component<SettingsProps> {
    render() {
        return (
            <TouchableNativeFeedback
                onPress={this.props.onPress}>
                <View style={{
                    padding: 10, 
                    paddingVertical: 20,
                    borderBottomWidth: 1,
                    borderColor: '#ccc',
                    flexDirection: 'row'}}>
                    <Text style={{flex: 5, paddingLeft: 10}}>{this.props.title}</Text>
                    <ActivityIndicator style={{flex: 1, paddingRight: 5}} size="small" animating={this.props.loading} color="#000" />
                    <View style={{flex: 1}}>
                        {this.props.showSwitch ? <Switch 
                            style={{flex: 1}} 
                            disabled={true}
                            trackColor={{true: COLORS.secondary, false: '#ccc'}} 
                            thumbColor={COLORS.primary} 
                            value={this.props.switchState} 
                            onValueChange={() => {}}></Switch> : <></>}
                    </View>
                </View>
            </TouchableNativeFeedback>
        )
    }
}

const styles = StyleSheet.create({
    toolbar: {
        backgroundColor: '#2196F3',
        height: 56,
        alignSelf: 'stretch',
        textAlign: 'center',
    }, 
    headerLayout: {
        height: 80,
        backgroundColor: COLORS.header,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerBodyLayout: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    }
});