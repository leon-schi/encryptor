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
    H3, 
    Icon} from 'native-base';
import { IconicToolButton } from './components/IconicToolButton'

import { BiometryType, LoginService, NotAuthenticatedException } from './core/LoginService';
import { EncryptionService } from './core/EncryptionService';
import { AuthenticationHelper } from './core/AuthenticationHelper';
import { flowTransition, fadeTransition } from './Transitions'
import { Transition } from 'react-navigation-fluid-transitions'
import { ConfirmPassword } from './components/ConfirmPassword'
import { Popup } from './components/Dialog'

import COLORS from './Colors';
import { toggleMode, getMode } from './Colors';
import { ScrollView } from 'react-native-gesture-handler';

type State = {
    biometryEnabled: boolean,
    biometryType: BiometryType,
    biometryLoading: boolean,
    passwordConfirmVisible: boolean,
    darkmodeEnabled: boolean,
    timeSelectorVisible: boolean,
    logoutTime: number
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
        passwordConfirmVisible: false,
        darkmodeEnabled: false,
        timeSelectorVisible: false,
        logoutTime: null
    }
    private loginService: LoginService = LoginService.getInstance();
    private encryptionService: EncryptionService = EncryptionService.getInstance();
    private authenticationHelper: AuthenticationHelper = new AuthenticationHelper(this.props.navigation);

    private availableTimes: number[] = [5, 10, 20, 30, 60, 120];

    constructor(props: Props) {
        super(props);

        this.state.darkmodeEnabled = getMode() == 'dark';

        this.state.biometryType = this.loginService.getAvailableSensor();
        this.loginService.getAvailableBiometry().then((biometryType: BiometryType) => {
            if (this.state.biometryType !== biometryType)
                this.setState({biometryType: biometryType});
        })
        this.loginService.isBiometicAuthenticaionSet().then((value: boolean) => {
            this.setState({biometryEnabled: value});
        });

        this.loginService.getTimeoutInMinutes().then((timeout: number) => {this.setState({logoutTime: timeout})});
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

    async toggleMode() {
        await toggleMode();
        this.setState({darkmodeEnabled: getMode() == 'dark'});
        StatusBar.setBarStyle(COLORS.barStyle)
    }

    async setLogoutTime(value: number) {
        await this.loginService.setTimeoutInMinutes(value);
        this.setState({logoutTime: await this.loginService.getTimeoutInMinutes()});
    }

    biometryOption() {
        if (this.state.biometryType == BiometryType.Fingerprint) {
            return (
                <SettingsItem 
                    showSwitch={true}
                    switchState={this.state.biometryEnabled}
                    loading={this.state.biometryLoading} 
                    title="Enable Fingerprint" 
                    description="Use Fingerprint to authenticate"
                    onPress={() => {this.toggleBiometryAuthentication()}}></SettingsItem>
            )
        } else if (this.state.biometryType == BiometryType.FaceID) {
            return (
                <SettingsItem 
                    showSwitch={true}
                    switchState={this.state.biometryEnabled}
                    loading={this.state.biometryLoading} 
                    title="Enable Face-ID" 
                    description="Use Face-ID to authenticate in the future"
                    onPress={() => {}}></SettingsItem>
            )
        }
        return <></>
    }

    render() {
        return (
            <>
                <ConfirmPassword 
                    visible={this.state.passwordConfirmVisible} 
                    onCancel={() => {this.setState({passwordConfirmVisible: false})}}
                    onSuccess={() => {this.changePassword()}}></ConfirmPassword>
    
                <Popup visible={this.state.timeSelectorVisible} style={{backgroundColor: COLORS.popup}}>
                    <Text style={{color: COLORS.fontPrimary, fontSize: 18}}>Auto-Logout Time</Text>

                    <ScrollView style={{height: 150, marginHorizontal: 20, marginVertical: 20}}>
                        {this.availableTimes.map((time: number) => 
                            <TouchableNativeFeedback onPress={() => {this.setLogoutTime(time)}} key={time}>
                                <View style={{flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.highlight, padding: 5}}>
                                    <Icon style={{flex: 1, paddingLeft: 10, color: (this.state.logoutTime == time) ? COLORS.primary : COLORS.popup, fontSize: 20}} type="Feather" name="check"></Icon>
                                    <Text style={{flex: 4, color: COLORS.fontPrimary}}>{time} min</Text>
                                </View>
                            </TouchableNativeFeedback>
                        )}
                    </ScrollView>

                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor={COLORS.highlight}
                            style={{padding: 5, borderRadius: 2}}
                            onPress={() => {this.setState({timeSelectorVisible: false})}}>
                            <Text style={{color: COLORS.primary}}>OK</Text>
                        </TouchableHighlight>
                    </View>
                </Popup>

                <View style={{flex: 1, backgroundColor: COLORS.background}}>
                    <Transition appear={flowTransition} disappear={fadeTransition}>                
                        <View style={{marginTop: 0, backgroundColor: COLORS.background}}>
                            <NavigationEvents onWillFocus={this.onWillFocus}/>

                            <View elevation={3} style={{
                                    ...styles.headerLayout,
                                    backgroundColor: COLORS.header
                                }}>
                                <Body style={styles.headerBodyLayout}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18}}>
                                        <View style={{flex: 1}}>
                                            <IconicToolButton color={COLORS.fontPrimary} style={{flex: 1}} icon="arrow-left" onPress={() => {this.quit()}}></IconicToolButton>
                                        </View>
                                        <Title style={{flex: 7, fontSize: 24, color: COLORS.fontPrimary}}>Settings</Title>
                                        <View style={{flex: 1}}></View>
                                    </View>
                                </Body>
                            </View>

                            <StatusBar translucent={true} animated={true} backgroundColor="rgba(255,255, 255,0)" barStyle={COLORS.barStyle} />

                            <View style={{flexDirection: 'column', backgroundColor: COLORS.background}}>
                                <SettingsItem 
                                    showSwitch={false}
                                    switchState={true}
                                    loading={false} 
                                    title="Change Password"
                                    description="Change the master password"
                                    onPress={() => {this.confirmPassword()}}/>
                                {this.biometryOption()}
                                {/*<SettingsItem 
                                    showSwitch={false}
                                    switchState={true}
                                    loading={false} 
                                    title="Re-Encrypt Everything" 
                                    onPress={() => {}}/>*/}
                                <SettingsItem 
                                    showSwitch={true}
                                    switchState={this.state.darkmodeEnabled}
                                    loading={false} 
                                    title="Dark Mode"
                                    description="Switch between light and dark mode"
                                    onPress={() => {this.toggleMode()}}/>
                                <SettingsItem 
                                    showSwitch={false}
                                    switchState={false}
                                    loading={false} 
                                    title={'Auto-Logout Time: ' + this.state.logoutTime + ' minutes'}
                                    description="Tap to adjust"
                                    onPress={() => {this.setState({timeSelectorVisible: true})}}/>
                                {/*<SettingsItem 
                                    showSwitch={false}
                                    switchState={true}
                                    loading={false} 
                                    title="Rate This App"
                                    onPress={() => {}}/>*/}
                            </View>
                        </View>
                    </Transition>
                </View>
            </>
        )
    }
}

type SettingsProps = {
    title: string,
    description: string,
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
                <View>
                    <View style={{
                        padding: 10, 
                        paddingVertical: 15,
                        borderBottomWidth: 1,
                        borderColor: COLORS.highlight,
                        flexDirection: 'row'}}>
                        <View style={{flex: 5, paddingLeft: 10}}>
                            <Text style={{color: COLORS.fontPrimary}}>{this.props.title}</Text>
                            <Text style={{color: COLORS.fontSecondary, fontSize: 14}}>{this.props.description}</Text>
                        </View>
                        <ActivityIndicator style={{flex: 1, paddingRight: 5}} size="small" animating={this.props.loading} color={COLORS.fontPrimary} />
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