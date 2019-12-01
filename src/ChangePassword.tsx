
import React from 'react';
import { StyleSheet, View, StatusBar, ScrollView, TextInput, BackHandler, TouchableHighlight } from 'react-native';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState,
    NavigationEvents } from 'react-navigation';
import {
    Title,
    Body, 
    Text,
    Icon,
    Label,
    Input, 
    Root} from 'native-base';
import { IconicToolButton } from './components/IconicToolButton'
import { OutlineButton } from './components/OutlineButton'

import { MessageBox } from './components/MessageBox'
import { LoginService } from './core/LoginService';
import { flowTransition } from './Transitions'
import { Transition } from 'react-navigation-fluid-transitions'
import { Popup } from './components/Dialog'

import COLORS from './Colors';

type State = {
    newPassword: string,
    confirmation: string,
    errorMessage: string,
    successMessageVisible: boolean
}

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

const fabOffsetDistance = 80;

export default class ChangePasswordComponent extends React.Component<Props, State> {
    state: State = {
        newPassword: '',
        confirmation: '',
        errorMessage: '',
        successMessageVisible: false
    }
    private loginService: LoginService = LoginService.getInstance();

    onWillFocus = () => {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.quit(); 
            return true;
        });
    }

    quit() {
        this.props.navigation.goBack();
    }

    reset() {
        this.setState({newPassword: '', confirmation: ''});
    }

    confirm () {
        if (this.state.newPassword == '') {
            this.setState({errorMessage: 'Password cannot be blank'});
            this.reset();
        }
        else if (this.state.newPassword != this.state.confirmation) { 
            this.setState({errorMessage: 'The passwords do not match'})
            this.reset();
        }
        else {
            this.loginService.setMasterPassword(this.state.newPassword);
            this.setState({successMessageVisible: true});
        }
    }

    render() {
        return (
            <>
                <Popup visible={this.state.successMessageVisible} style={{backgroundColor: COLORS.popup}}>
                    <View style={{
                        padding: 15,
                        flexDirection: 'row',
                        alignItems: 'center'}}>
                            <Icon type="Feather" name='check' style={{color: COLORS.success, fontSize: 30, marginRight: 10}}/>
                            <Text style={{fontSize: 18, paddingRight: 20, color: COLORS.fontPrimary}}>Successfully changed Password</Text>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor={COLORS.highlight}
                            style={{padding: 5, borderRadius: 2}}
                            onPress={() => {this.setState({successMessageVisible: false}); this.quit()}}>
                            <Text style={{color: COLORS.primary}}>OK</Text>
                        </TouchableHighlight>
                    </View>
                </Popup>

                <View style={{flex: 1, backgroundColor: COLORS.background}}>
                    <Transition appear={flowTransition}>
                        <View style={{marginTop: 0, backgroundColor: COLORS.background, flex: 1}}>
                            <NavigationEvents onWillFocus={this.onWillFocus}/>
                            <View elevation={3} style={{...styles.headerLayout, backgroundColor: COLORS.header}}>
                                <Body style={styles.headerBodyLayout}>
                                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18}}>
                                        <View style={{flex: 1}}>
                                            <IconicToolButton color={COLORS.fontPrimary} style={{flex: 1}} icon="arrow-left" onPress={() => {this.quit()}}></IconicToolButton>
                                        </View>
                                        <Title style={{flex: 7, fontSize: 24, color: COLORS.fontPrimary}}>Configure</Title>
                                        <View style={{flex: 1}}></View>
                                    </View>
                                </Body>
                            </View>

                            <StatusBar translucent={true} animated={true} backgroundColor="rgba(255,255, 255,0)" barStyle={COLORS.barStyle} />

                            <ScrollView style={{flexDirection: 'column', backgroundColor: COLORS.background}}>
                                
                                <View style={{margin: 20}}>
                                    <MessageBox
                                        title="Change the Master Password" message="Here you can change the master password. Remember it well as you will lose access to this app as you loose it."></MessageBox>
                                    
                                    <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20, height: 35}}>
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
                                        <Text style={{fontSize: 14, color: COLORS.fontPrimary}}>Enter New Password</Text>
                                        <TextInput 
                                            secureTextEntry={true}
                                            placeholderTextColor={COLORS.highlight} 
                                            style={{borderColor: COLORS.highlight, color: COLORS.fontPrimary, borderBottomWidth: 1, paddingVertical: 5, marginBottom: 30}} 
                                            placeholder="Password"
                                            value={this.state.newPassword}
                                            onChangeText={(text) => {this.setState({newPassword: text})}}/>
                                            
                                        <Text style={{fontSize: 14, color: COLORS.fontPrimary}}>Confirm Password</Text>
                                        <TextInput 
                                            secureTextEntry={true}
                                            placeholderTextColor={COLORS.highlight} 
                                            style={{borderColor: COLORS.highlight, color: COLORS.fontPrimary, borderBottomWidth: 1, paddingVertical: 5, marginBottom: 50}} 
                                            placeholder="Password"
                                            value={this.state.confirmation}
                                            onChangeText={(text) => {this.setState({confirmation: text})}}/>

                                        <OutlineButton 
                                            title="CONFIRM" 
                                            icon="check" 
                                            color={COLORS.primary}
                                            onPress={() => {this.confirm()}}></OutlineButton>
                                        <OutlineButton 
                                            title="CANCEL" 
                                            icon="x" 
                                            color={COLORS.dark}
                                            onPress={() => {this.quit()}}></OutlineButton>
                                    </View>
                                </View>                        
                            </ScrollView>
                        </View>
                    </Transition>
                </View>
            </>
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