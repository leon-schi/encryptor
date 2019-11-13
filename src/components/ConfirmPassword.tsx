import React from 'react';
import { View, TouchableHighlight, TextInput } from 'react-native'
import { Text, H3, Icon } from 'native-base';

import { Popup } from './Dialog'
import { LoginService, LoginFailedException } from '../core/LoginService'
import COLORS from '../Colors';

type State = {
    password: string,
    errorMessage: string
}

type Props = {
    onSuccess: Function,
    onCancel: Function,
    visible: boolean
}

let initialState = {
    password: '',
    errorMessage: ''
}

class ConfirmPassword extends React.Component<Props, State> {
    state = initialState;
    private loginService: LoginService = LoginService.getInstance();

    async confirm() {
        try {
            await this.loginService.masterPasswordLogin(this.state.password);
            this.props.onSuccess();
            this.cancel();
        } catch (e) {
            if (e instanceof LoginFailedException) {
                this.setState({password: '', errorMessage: 'wrong password'});
            }
        }
    }

    cancel() {
        this.props.onCancel();
        this.setState(initialState);
    }

    render() {
        return (
            <Popup visible={this.props.visible}>
                <H3>Confirm Password</H3>
                <Text>Please enter the master password to proceed</Text>

                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 5, height: 20}}>
                    {this.state.errorMessage != '' ? <View style={{
                        borderWidth: 1,
                        borderRadius: 50,
                        borderColor: COLORS.danger,
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 20}}>
                            <Icon type="Feather" name='alert-circle' style={{fontSize: 12, color: COLORS.danger, marginRight: 10}}/>
                            <Text style={{fontSize: 12, color: COLORS.danger}}>{this.state.errorMessage}</Text>
                    </View>: <></>}
                </View>

                <View style={{marginVertical: 30}}>
                    <TextInput 
                        secureTextEntry={true}
                        placeholder="Password" 
                        style={{borderBottomWidth: 1, borderColor: '#ddd', padding: 1}}
                        value={this.state.password}
                        onChangeText={(text) => {this.setState({password: text})}}/>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <TouchableHighlight
                        activeOpacity={0.5}
                        underlayColor="#ccc"
                        style={{padding: 5, borderRadius: 2, marginRight: 10}}
                        onPress={() => {this.cancel()}}>
                        <Text>CANCEL</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        activeOpacity={0.5}
                        underlayColor="#ccc"
                        style={{padding: 5, borderRadius: 2}}
                        onPress={() => {this.confirm()}}>
                        <Text style={{color: COLORS.primary}}>CONFIRM</Text>
                    </TouchableHighlight>
                </View>
            </Popup>
        );
    }
}

export { ConfirmPassword };