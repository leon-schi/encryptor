import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { StyleSheet, Dimensions, View, TouchableHighlight } from 'react-native';
import { Text, Container, H1, Form, Item, Label, Input, Content, Icon } from 'native-base';
import { Transition } from 'react-navigation-fluid-transitions'

import COLORS from './Colors'
import OutlineButton from './components/OutlineButton' 
import { Attribute } from './core/db';

let transition = (transitionInfo: any) => {
    const { progress, start, end } = transitionInfo;
    const y = progress.interpolate({
      inputRange: [start, end],
      outputRange: [100, 0],
    });
    const opacity = progress.interpolate({
        inputRange: [start, end],
        outputRange: [0, 1],
      });
    return { transform: [{ translateY: y }], opacity: opacity };
}

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

export default class Modal extends React.Component<Props, Attribute> {
    state: Attribute = {
        name: '',
        value: ''
    }
    controller: any = null;
    creation: boolean = false;
    index: number = null;

    constructor(props: Props) {
        super(props);
        this.controller = this.props.navigation.getParam('controller', null);
        this.creation = this.props.navigation.getParam('creation', null);
        this.index = this.props.navigation.getParam('index', null);
        this.state.name = this.props.navigation.getParam('name', '');
        this.state.value = this.props.navigation.getParam('value', '');    
    }

    async save() {
        if (this.creation)
            await this.controller.addAttribute(this.state.name, this.state.value)
        else
            await this.controller.setAttribute(this.state.name, this.state.value, this.index)
        this.cancel();
    }

    async delete() {
        if (!this.creation)
            await this.controller.deleteAttribute(this.index)
        this.cancel();
    }

    cancel = () => {
        this.props.navigation.goBack();
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
                                onPress={() => {this.delete()}}></OutlineButton>
        } else {
            secondButton = <OutlineButton 
                                title="CANCEL" 
                                icon="x" 
                                color={COLORS.dark}
                                onPress={this.cancel}></OutlineButton>
        }

        return (
            <Container>
                <Content style={styles.contentLayout}>

                    <Transition appear={transition}>
                        <View style={{
                            backgroundColor: COLORS.background,
                            height: Dimensions.get('window').height
                        }}>    
                            <View style={styles.headLayout}>
                                <View style={{flex: 1}}>
                                    <TouchableHighlight underlayColor="#dddddd" activeOpacity={0.4} style={{borderRadius: 40}} onPress={this.cancel}>
                                        <View style={styles.headItemLayout}>
                                            <Icon type="Feather" name="arrow-left"></Icon>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                                <View style={{flex: 6, paddingLeft: 30}}>
                                    <Text style={{fontSize: 12}}>ATTRIBUTE</Text>
                                    <H1>{this.state.name}</H1>
                                </View>
                            </View>

                            <Form style={styles.formLayout}>
                                <Item fixedLabel>
                                    <Label style={{fontWeight: 'bold'}}>Name</Label>
                                    <Input value={this.state.name} onChangeText={(text) => {this.setState({name: text})}}/>
                                </Item>
                                <Item fixedLabel last>
                                    <Label style={{fontWeight: 'bold'}}>Value</Label>
                                    <Input value={this.state.value} onChangeText={(text) => {this.setState({value: text})}} />
                                </Item>
                            </Form>

                            {firstButton}
                            {secondButton}
                        </View>
                    </Transition>
                </Content>
            </Container>
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
