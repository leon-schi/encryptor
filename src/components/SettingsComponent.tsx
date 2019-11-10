import React from 'react';
import { View, TouchableHighlight, Switch, ActivityIndicator } from 'react-native'
import { Text, H3,  } from 'native-base';

import { Popup } from './Dialog'
import COLORS from '../Colors'
import { BiometryType, LoginService, NotAuthenticatedException } from '../core/LoginService';
import { EncryptionService } from '../core/EncryptionService';
import { AuthenticationHelper } from '../core/AuthenticationHelper';

type State = {
    biometryEnabled: boolean,
    biometryType: BiometryType,
    loading: boolean
}

type Props = {
    visible: boolean,
    onDismiss: any,
    authenticationHelper: AuthenticationHelper
}

class SettingsComponent extends React.Component<Props, State> {
    state: State = {
        biometryEnabled: false,
        biometryType: BiometryType.Pending,
        loading: false
    }
    private loginService: LoginService = LoginService.getInstance();
    private encryptionService: EncryptionService = EncryptionService.getInstance();

    constructor(props: Props) {
        super(props);
        this.state.biometryType = this.loginService.getAvailableSensor();
        this.loginService.getAvailableBiometry().then((biometryType: BiometryType) => {
            if (this.state.biometryType !== biometryType)
                this.setState({biometryType: biometryType});
        })
        this.loginService.isBiometicAuthenticaionSet().then((value) => {
            this.setState({biometryEnabled: value});
        });
    }

    async toggleBiometryAuthentication() {
        if (!this.state.loading) {
            this.setState({loading: true});
            let desiredValue = !this.state.biometryEnabled;
            
            let action = async () => {
                try {
                    if (desiredValue) {
                        if (!(await this.encryptionService.isMasterTokenWithBiometrySet())) {
                            // require Biometric Authentication to make the biometric token available
                            if (this.loginService.isUserBiometricallyLoggedIn())
                                await this.loginService.biometricAuthentication();
                            await this.encryptionService.addBiometricProtectionToMasterToken();
                        }
                    }
                    await this.loginService.setBiometicAuthentication(desiredValue);
                } catch (e) { 
                    if (e instanceof NotAuthenticatedException) throw e;
                    this.setState({loading: false});
                }
                this.setState({biometryEnabled: desiredValue, loading: false});
            }
            this.props.authenticationHelper.execute(action, 'Confirm Password');
        }
    }

    biometryOption() {
        let switchComponent = <Switch 
            style={{flex: 1}} 
            disabled={true}
            trackColor={{true: COLORS.secondary, false: '#ccc'}} 
            thumbColor={COLORS.primary} 
            value={this.state.biometryEnabled} 
            onValueChange={() => {this.toggleBiometryAuthentication()}}></Switch>; 
        if (this.state.biometryType == BiometryType.Fingerprint) {
            return (
                <SettingsItem loading={this.state.loading} title="Enable Fingerprint" onPress={() => {this.toggleBiometryAuthentication()}}>
                    {switchComponent}
                </SettingsItem>
            )
        } else if (this.state.biometryType == BiometryType.FaceID) {
            return (
                <SettingsItem loading={this.state.loading} title="Enable Face-ID" onPress={() => {}}>
                    {switchComponent}
                </SettingsItem>
            )
        }
        return <></>
    }

    render() {
        return (
            <Popup visible={this.props.visible}>
                <H3>Settings</H3>

                <View style={{marginTop: 20}}>
                    <SettingsItem loading={false} title="Change Password" onPress={() => {}}/>
                    {this.biometryOption()}       
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20}}>
                    <TouchableHighlight
                        activeOpacity={0.5}
                        underlayColor="#ccc"
                        style={{padding: 5, borderRadius: 2}}
                        onPress={this.props.onDismiss}>
                        <Text style={{color: COLORS.primary}}>CLOSE</Text>
                    </TouchableHighlight>
                </View>
            </Popup>
        );
    }
}

type SettingsProps = {
    title: string,
    onPress: any,
    loading: boolean
}

class SettingsItem extends React.Component<SettingsProps> {
    render() {
        return (
            <TouchableHighlight
                activeOpacity={0.5}
                underlayColor="#ccc"
                style={{
                    padding: 5, 
                    paddingVertical: 15,
                    borderBottomWidth: 1,
                    borderColor: '#ccc'}}
                onPress={this.props.onPress}>
                <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 5, paddingLeft: 10}}>{this.props.title}</Text>
                    <ActivityIndicator style={{flex: 1, paddingRight: 5}} size="small" animating={this.props.loading} color="#000" />
                    <View style={{flex: 1}}>
                        {this.props.children}
                    </View>
                </View>
            </TouchableHighlight>
        )
    }
}

export {SettingsComponent};