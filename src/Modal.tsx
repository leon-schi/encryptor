import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState,
    NavigationEvents } from 'react-navigation';
import { StyleSheet, TouchableHighlight, View, BackHandler } from 'react-native';
import { Text, Container, H1, H3, Form, Item, Label, Input, Content, Root } from 'native-base';
import { Transition } from 'react-navigation-fluid-transitions'

import COLORS from './Colors'
import { IconicToolButton } from './components/IconicToolButton'
import { OutlineButton } from './components/OutlineButton' 
import { AuthenticationHelper } from './core/AuthenticationHelper';
import { flowTransition } from './Transitions'
import { Popup } from './components/Dialog';

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

type State = {
    name: string,
    value: string,
    deletionPopupVisible: boolean
}

export default class Modal extends React.Component<Props, State> {
    state: State = {
        name: '',
        value: '',
        deletionPopupVisible: false
    }
    controller: any = null;
    creation: boolean = false;
    index: number = null;
    private authenticationHelper: AuthenticationHelper = new AuthenticationHelper(this.props.navigation);

    constructor(props: Props) {
        super(props);
        this.controller = this.props.navigation.getParam('controller', null);
        this.creation = this.props.navigation.getParam('creation', null);
        this.index = this.props.navigation.getParam('index', null);
        this.state.name = this.props.navigation.getParam('name', '');
        this.state.value = this.props.navigation.getParam('value', '');    
    }

    onWillFocus = () => {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.cancel()
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => false);
    }

    async save() {
        let action = async () => {
            if (this.creation)
                await this.controller.addAttribute(this.state.name, this.state.value)
            else
                await this.controller.setAttribute(this.state.name, this.state.value, this.index)
            await this.cancel();
        }
        this.authenticationHelper.execute(action, "Authenticate to save attribute '" + this.state.name + "'");
    }

    async delete() {
        if (!this.creation)
            await this.controller.deleteAttribute(this.index)
        await this.cancel();
    }

    cancel = async () => {
        this.props.navigation.goBack();
    }

    openDeletionPopup = () => {
        this.setState({deletionPopupVisible: true});
    }

    hideDeletionPopup = () => {
        this.setState({deletionPopupVisible: false});
    }

    render() {

        let firstButton = <OutlineButton 
                                title="SAVE" 
                                icon="save" 
                                color={COLORS.primary}
                                onPress={() => {this.save()}}></OutlineButton>

        let secondButton;
        if (!this.creation) {
            secondButton = <OutlineButton 
                                title="DELETE ATTRIBUTE" 
                                icon="trash-2" 
                                color={COLORS.danger}
                                onPress={this.openDeletionPopup}></OutlineButton>
        } else {
            secondButton = <OutlineButton 
                                title="CANCEL" 
                                icon="x" 
                                color={COLORS.dark}
                                onPress={this.cancel}></OutlineButton>
        }

        return (
            <Root>
                <NavigationEvents onWillFocus={this.onWillFocus}/>
                
                <Popup visible={this.state.deletionPopupVisible}>
                    <H3>Confirm</H3>
                    <Text>Do you really want to delete this attribute?</Text>

                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor="#ccc"
                            style={{padding: 5, borderRadius: 2, marginRight: 10}}
                            onPress={this.hideDeletionPopup}>
                            <Text>CANCEL</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor="#ccc"
                            style={{padding: 5, borderRadius: 2}}
                            onPress={() => {
                                this.hideDeletionPopup();
                                this.delete();
                            }}>
                            <Text style={{color: COLORS.danger}}>OK</Text>
                        </TouchableHighlight>
                    </View>
                </Popup>

                <Container style={{flex: 1, marginTop: 25}}>

                    <Content style={styles.contentLayout}>

                        <Transition appear={flowTransition}>
                            <View style={{backgroundColor: COLORS.background}}>    
                                <View style={styles.headLayout}>
                                    <IconicToolButton style={{flex: 1}} icon="arrow-left" onPress={this.cancel}></IconicToolButton>
                                    <View style={{flex: 6, paddingLeft: 30, height: 50}}>
                                        <View style={{height: 20}}>
                                            <Text style={{fontSize: 12}}>ATTRIBUTE</Text>
                                        </View>
                                        <View style={{flex: 40}}>
                                            <H1>{this.state.name}</H1>
                                        </View>
                                    </View>
                                </View>

                                <Form style={styles.formLayout}>
                                    <Item fixedLabel style={{flexDirection: 'row'}}>
                                        <Label style={{flex: 1, fontWeight: 'bold'}}>Name</Label>
                                        <Input style={{flex: 4}} value={this.state.name} onChangeText={(text) => {this.setState({name: text})}}/>
                                    </Item>
                                    <Item fixedLabel last style={{flexDirection: 'row'}}>
                                        <Label style={{flex: 1, fontWeight: 'bold'}}>Value</Label>
                                        <Input style={{flex: 4}} value={this.state.value} onChangeText={(text) => {this.setState({value: text})}} />
                                    </Item>
                                </Form>

                                {firstButton}
                                {secondButton}
                            </View>
                        </Transition>
                    </Content>
                </Container>
            </Root>
        );
    }
}

const styles = StyleSheet.create({
    headLayout: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    headItemLayout: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 55
    },
    contentLayout: {
        flexDirection: 'column',
        padding: 20
    },
    formLayout: {
        marginTop: 30,
        marginBottom: 30
    },
    listItemLayout: {
        flexDirection: 'row',
        height: 55,
        borderBottomWidth: 1,
        borderColor: '#cccccc',
        alignItems: 'center',
        justifyContent: 'center'
    },
    listTextLayout: {
        flex: 8,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    listTitleLayout: {
        color: COLORS.primary,
        fontWeight: 'bold'
    }
});
