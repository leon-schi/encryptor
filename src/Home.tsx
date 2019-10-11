import React from 'react';
import { StyleSheet, View, Animated, StatusBar, TouchableNativeFeedback, TouchableHighlight, ScrollView, TextInput, Dimensions, ActivityIndicator, Easing } from 'react-native';
import { Transition } from 'react-navigation-fluid-transitions'
import { 
    NavigationEvents, 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { 
    Container, 
    Header,
    Title,
    Body,
    Content,
    Fab,
    H3,
    Icon,
    Text } from 'native-base';
import { CollectionTitle } from './components/CollectionTtile'
import { IconicToolButton } from './components/IconicToolButton'
import { Popup } from './components/Dialog'
import { MessageBox } from './components/MessageBox'

import { CollectionService } from './core/CollectionService'
import { Collection } from './core/db'
import { fadeTransition } from './Transitions'

import COLORS from './Colors';

type State = {
    opacity: Animated.Value,
    selectedItemId: number,
    modalVisible: boolean,
    newCollectionName: string,
    collections: Collection[],
    loading: boolean
}

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

export default class HomeComponent extends React.Component<Props, State> {
    state: State = {
        opacity: new Animated.Value(1),
        selectedItemId: -1,
        modalVisible: false,
        newCollectionName: '',
        collections: [],
        loading: true
    }
    modalScale: Animated.Value = new Animated.Value(1)
    collectionService = CollectionService.getInstance();
    height: number = Dimensions.get('window').height - 90;

    componentDidMount() {
        this.refreshCollections(); 
    }

    async refreshCollections() {
        let collections = await this.collectionService.getCollections();    
        this.setState({
            loading: false,
            collections: (collections == null) ? [] : collections
        })
    }

    openDetailsFor(collection: Collection) {
        this.state.selectedItemId = collection.id;
        Animated.timing(this.state.opacity, {toValue: 0.1, duration: 800, easing: Easing.inOut(Easing.exp)}).start();
        this.props.navigation.navigate('Details', {id: collection.id, name: collection.name});
    }

    onWillFocus = () => {
        Animated.sequence([
            Animated.delay(200),
            Animated.timing(this.state.opacity, {toValue: 1, duration: 600, easing: Easing.inOut(Easing.exp)})    
        ]).start();
        this.setState({selectedItemId: -1});
    }

    async addItem() {
        await this.collectionService.insertCollection(this.state.newCollectionName, '[]');
        await this.refreshCollections();
        this.hideDialog()
    }

    showDialog = () => {
        this.state.newCollectionName = '';
        this.setState({modalVisible: true})
    }
    hideDialog = () => {this.setState({
        modalVisible: false
    })}

    render() {
        let messageBox = <></>;
        if (this.state.collections.length == 0)
            messageBox = <MessageBox 
                title="Nothing Here Yet!"
                message="You can add Attributes by clicking on the button on the bottom-right."/>

        return (
            <>
                {/* Dialog Window */}
                <Popup visible={this.state.modalVisible}>
                        <H3>Create a new Collection</H3>
                        <Text>Please Enter the name of the new Colection</Text>

                        <View style={{marginVertical: 30}}>
                            <TextInput 
                                placeholder="Name" 
                                style={{borderBottomWidth: 1, borderColor: '#ddd', padding: 1}}
                                value={this.state.newCollectionName}
                                onChangeText={(text) => {this.setState({newCollectionName: text})}}/>
                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <TouchableHighlight
                                style={{padding: 5}}
                                onPress={this.hideDialog}>
                                <Text>CANCEL</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                style={{padding: 5}}
                                onPress={() => {this.addItem()}}>
                                <Text style={{color: COLORS.primary}}>OK</Text>
                            </TouchableHighlight>
                        </View>
                </Popup>

                <Popup visible={this.state.loading} style={{marginHorizontal: 100, marginTop: 300}}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator style={{flex: 1}} size="large" color="#000"/>
                        <Text style={{flex: 3, textAlign: 'center'}}>loading...</Text>
                    </View>
                </Popup>

                <NavigationEvents
                    onWillFocus={this.onWillFocus}></NavigationEvents>

                <Container>

                    {/* Header Bar */}
                    <Header style={styles.headerLayout}>
                        {/* Title */}
                        <Body style={styles.headerBodyLayout}>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                <IconicToolButton style={{flex: 1}} icon="lock" onPress={() => {this.props.navigation.navigate('Login');}}></IconicToolButton>
                                <Title style={{flex: 7, fontSize: 24, color: 'black'}}>Encryptor</Title>
                                <IconicToolButton style={{flex: 1}} icon="chevron-down" onPress={() => {}}></IconicToolButton>
                            </View>
                        </Body>
                    </Header>
                    <StatusBar animated={true} backgroundColor={COLORS.statusBar} barStyle="dark-content" />

                    <Content>
                        {/* Search Bar */}
                        <View style={{flexDirection: 'column', height: this.height}}>
                            <View elevation={2} style={{flex: 1, marginHorizontal: 10, marginTop: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 0, paddingLeft: 10}}>
                                <Icon style={{flex: 1, color: '#999', marginLeft: 10}} name="search"></Icon>
                                <TextInput style={{flex: 7, fontSize: 18}} placeholder="Search"/>
                            </View>
                            
                            {/* Collections List */}
                            <View style={{flex: 10}}>    
                                <ScrollView style={styles.itemContainerLayout}>
                                    <Text style={{color: '#999', fontWeight: 'bold', marginBottom: 9}}>YOUR COLLECTIONS</Text>
                                    
                                    {messageBox}
                                    
                                    {this.state.collections.map(item => 
                                            <TouchableNativeFeedback key={item.id} onPress={() => {this.openDetailsFor(item)}}>
                                                <Animated.View style={{
                                                        ...styles.itemLayout,
                                                        opacity: (item.id == this.state.selectedItemId) ? 1 : this.state.opacity
                                                    }}>
                                                    <Icon type="Feather" name='key' style={{flex: 1, color: COLORS.primary}}/>
                                                    
                                                    <Transition shared={String(item.id)}>
                                                        <CollectionTitle style={{flex: 6}} name={item.name}></CollectionTitle>
                                                    </Transition>

                                                </Animated.View>
                                            </TouchableNativeFeedback>
                                    )}
                                </ScrollView>
                            </View>
                        </View>
                        
                    </Content>

                    <Fab
                        active={true}
                        style={{ backgroundColor: COLORS.primary }}
                        position="bottomRight"
                        onPress={this.showDialog}>
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
    headerBodyLayout: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemContainerLayout: {
        padding: 15,
        flexDirection: 'column'
    },
    itemLayout: {
        height: 80,
        borderBottomWidth: 1,
        borderColor: '#dddddd',
        backgroundColor: '#ffffff',
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center'
    }
});