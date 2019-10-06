import React from 'react';
import { StyleSheet, View, Animated, Dimensions, TouchableHighlight, ScrollView } from 'react-native';
import { NavigationEvents } from 'react-navigation'
import Dialog from "react-native-dialog";
import { 
    Container, 
    Header, 
    Right,
    Left,
    Title,
    Text,
    Body,
    Content,
    Fab,
    Form,
    Item,
    Input,
    Icon
 } from 'native-base';

import Collection from './components/Collection'
import COLORS from './Colors'

export default class HomeComponent extends React.Component {
    state = {
        height: new Animated.Value(0),
        width: new Animated.Value(0),
        left: new Animated.Value(0),
        top: new Animated.Value(0),
        borderRadius: new Animated.Value(0),
        color: new Animated.Value(0),
        dialogVisible: false,
        newCollectionName: ''
    }
    items = [
        {
            id: 0,
            name: 'Amazon',
            view: null
        }, {
            id: 1,
            name: 'Google',
            view: null
        }, {
            id: 2,
            name: 'Netflix',
            view: null
        },
    ];
    nextId = 3;

    setAnimationValues(left, top, height, width, color) {
        this.state.left.setValue(left);
        this.state.top.setValue(top);
        this.state.height.setValue(height);
        this.state.width.setValue(width);
        this.state.color.setValue(color);
    }

    startAnimation(item) {
        item.view.measure((ox, oy, width, height, px, py) => {
            this.setAnimationValues(px, py, height, width, 0);
            let duration = 200;

            let useNative = false;
            Animated.parallel([
                Animated.timing(this.state.height, { toValue: Dimensions.get('window').height - 24, duration: duration, useNativeDriver: useNative}),
                Animated.timing(this.state.width, { toValue: Dimensions.get('window').width, duration: duration, useNativeDriver: useNative}),
                Animated.timing(this.state.left, { toValue: 0, duration: duration, useNativeDriver: useNative}),
                Animated.timing(this.state.top, { toValue: 0, duration: duration, useNativeDriver: useNative}),
                Animated.timing(this.state.borderRadius, { toValue: 0, duration: duration, useNativeDriver: useNative}),
                Animated.timing(this.state.color, { toValue: 1, duration: duration, useNativeDriver: useNative}),
            ]).start(() => {
                this.props.navigation.navigate('Details', {name: item.name});
            });
        });
    }

    onWillFocus() {
        this.setAnimationValues(0, 0, 0, 0, 0);
    }
    
    addItem(name) {
        this.items.push({
            id: this.nextId,
            name: name,
            item: null
        });
        this.nextId++;
        
        this.setState({dialogVisible: false})
    }

    render() {
        return (
            <>
                <Dialog.Container visible={this.state.dialogVisible}>
                    <Dialog.Title>Create New Collection</Dialog.Title>
                    <Dialog.Description>
                        Please enter the name of the new Collection!
                    </Dialog.Description>
                    <Dialog.Input 
                        onChangeText={(text) => {this.setState({newCollectionName: text})}} 
                        value={this.state.newCollectionName} 
                        label="Collection Name"
                        wrapperStyle={{borderBottomWidth: 1, borderColor: '#dddddd'}}></Dialog.Input>
                    <Dialog.Button label="Cancel" onPress={() => {this.setState({dialogVisible: false})}}/>
                    <Dialog.Button label="Create" onPress={() => {this.addItem(this.state.newCollectionName)}}/>
                </Dialog.Container>

                <NavigationEvents
                    onWillFocus={payload => this.onWillFocus()}
                />
                <Animated.View elevation={1} style={{
                        left: this.state.left,
                        top: this.state.top,
                        width: this.state.width,
                        height: this.state.height,
                        borderRadius: this.state.borderRadius,
                        position: 'absolute',
                        backgroundColor: this.state.color.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['#cccccc', '#ffffff'],
                        })
                    }}>
                </Animated.View>

                <Container>
                    <Header style={styles.headerLayout} androidStatusBarColor={COLORS.statusBar}>
                        <Body style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Title style={{fontSize: 20, fontFamily: 'sans-serif'}}>ENCRYPTOR</Title>
                        </Body>
                        <Right>
                            <TouchableHighlight underlayColor="#555" activeOpacity={0.4} style={{borderRadius: 40}} onPress={() => {}}>
                                <View style={{padding: 10}}>
                                    <Icon type="Feather" name="settings" style={{color: 'white'}}></Icon>
                                </View>
                            </TouchableHighlight>
                        </Right>
                    </Header>
                    <Content>

                        <Form>
                            <Item>
                                <Icon name="search"></Icon>
                                <Input placeholder="Search"/>
                            </Item>
                        </Form> 
                        
                        <ScrollView style={styles.itemContainerLayout} >
                            {this.items.map(item => 
                                <Collection 
                                    name={item.name} 
                                    key={item.id} 
                                    view={(view) => {item.view = view}} 
                                    onPress={() => {this.startAnimation(item)}}
                                ></Collection>
                            )}
                        </ScrollView>
                    </Content>

                    <Fab
                        active={true}
                        style={{ backgroundColor: '#5067FF' }}
                        position="bottomRight"
                        onPress={() => {this.setState({dialogVisible: true})}}>
                        <Icon name="add"/>
                    </Fab>
                </Container>
            </>
        )
    }
}

const styles = StyleSheet.create({
    headerLayout: {
        backgroundColor: COLORS.header,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemContainerLayout: {
        padding: 15,
        flexDirection: 'column'
    }
});