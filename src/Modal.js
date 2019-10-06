import React from 'react';
import { NavigationEvents } from 'react-navigation'
import { StyleSheet, Animated, View, TouchableHighlight } from 'react-native';
import { Text, Container, H1, Form, Item, Label, Input, Content, Icon } from 'native-base';
import COLORS from './Colors'
import OutlineButton from './components/OutlineButton'


export default class Modal extends React.Component {
    state = {
        name: '',
        value: ''
    }

    onWillFocus() {
        this.setState({
            name: this.props.navigation.getParam('name', ''),
            value: this.props.navigation.getParam('value', '')    
        })
    }

    render() {
        return (
            <Container>
                <NavigationEvents
                    onWillFocus={payload => this.onWillFocus()}
                />
                
                <Content style={styles.contentLayout}>
                    
                <View style={styles.headLayout}>
                        <View style={{flex: 1}}>
                            <TouchableHighlight underlayColor="#dddddd" activeOpacity={0.4} style={{borderRadius: 40}} onPress={() => {this.props.navigation.goBack()}}>
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

                    <OutlineButton 
                        title="SAVE" 
                        icon="save" 
                        color={COLORS.primary}></OutlineButton>
                    <OutlineButton title="DELETE ATTRIBUTE" icon="trash-2" color={COLORS.danger}></OutlineButton>
                    

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
