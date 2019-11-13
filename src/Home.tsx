import React from 'react';
import { StyleSheet, View, Switch, StatusBar, TouchableHighlight, TextInput, Dimensions, ActivityIndicator, Animated } from 'react-native';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState,
    NavigationEvents } from 'react-navigation';
import {
    Title,
    Body,
    H3,
    Icon,
    Text } from 'native-base';
import { IconicToolButton } from './components/IconicToolButton'
import { Popup } from './components/Dialog'
import { MessageBox } from './components/MessageBox'
import { ReorderableList } from './components/ReorderableList'
import { AnimatedFab } from './components/AnimatedFab'

import { CollectionService, CollectionInfo } from './core/CollectionService'
import { LoginService, } from './core/LoginService' 
import { AuthenticationHelper } from './core/AuthenticationHelper' 

import COLORS from './Colors';

/*
TODOS
- Logout time
- Reencrypt
- Introduction
- Dark Mode
*/

const itemHeight = 85;
type State = {
    modalVisible: boolean,
    settingsVisible: boolean,
    newCollectionName: string,
    collections: CollectionInfo[],
    searchText: string,
    loading: boolean,
    enableSelectionMode: boolean
}

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

const fabOffsetDistance = 80;

export default class HomeComponent extends React.Component<Props, State> {
    state: State = {
        modalVisible: false,
        settingsVisible: false,
        newCollectionName: '',
        collections: [],
        searchText: '',
        loading: true,
        enableSelectionMode: false,
    }
    collectionService = CollectionService.getInstance();
    loginService: LoginService = LoginService.getInstance();
    authenticationHelper: AuthenticationHelper = new AuthenticationHelper(this.props.navigation);
    width: number = Dimensions.get('window').width;
    listController: ReorderableList = null;
    
    leftOffset: Animated.Value = new Animated.Value(0);
    rightOffset: Animated.Value = new Animated.Value(0);
    fabOffset: Animated.Value = new Animated.Value(0);
    checkOffset: Animated.Value = new Animated.Value(fabOffsetDistance);

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {
        this.refreshCollections();
    }

    onWillFocus = () => {
        this.loginService.enforceTimeout();
        if (!this.loginService.isUserLoggedIn())
            this.logout();
        this.setState({collections: this.collectionService.getCollections()});
    }

    async refreshCollections() {
        await this.collectionService.readCollections();
        this.setState({
            loading: false,
            collections: this.collectionService.getCollections()
        })
    }

    getFilteredCollections(): CollectionInfo[] {
        let filteredCollections: CollectionInfo[] = [];
        for (let collection of this.state.collections) {
            if (collection.name.includes(this.state.searchText))
                filteredCollections.push(collection);
        }

        return filteredCollections;
    }

    openDetailsFor(collection: CollectionInfo) {
        this.props.navigation.navigate('Details', {id: collection.id, name: collection.name});
    }

    enableSelectionMode = () => {
        this.setState({enableSelectionMode: true});
    }

    async addItem() {
        let action = async () => {
            await this.collectionService.insertNewCollection(this.state.newCollectionName);
            await this.refreshCollections();
        };
        this.authenticationHelper.execute(action, "Authentication required to add Collection '" + this.state.newCollectionName + "'");
        this.hideDialog();
    }

    logout = () => {
        this.loginService.logout();
        this.props.navigation.navigate('Login');
    }

    showDialog = () => {
        this.state.newCollectionName = '';
        this.setState({modalVisible: true})
    }
    hideDialog = () => {this.setState({
        modalVisible: false, 
        settingsVisible: false
    })}

    startReorderMode() {
        let offset = 40;
        Animated.parallel([
            Animated.timing(this.leftOffset, {toValue: -offset, duration: 200}),
            Animated.timing(this.rightOffset, {toValue: offset, duration: 200}),
            Animated.sequence([
                Animated.timing(this.fabOffset, {toValue: fabOffsetDistance, duration: 200}),
                Animated.timing(this.checkOffset, {toValue: 0, duration: 200})        
            ])
        ]).start();
    }

    async endReorderMode() {
        Animated.parallel([
            Animated.timing(this.leftOffset, {toValue: 0, duration: 200}),
            Animated.timing(this.rightOffset, {toValue: 0, duration: 200}),
            Animated.sequence([
                Animated.timing(this.checkOffset, {toValue: fabOffsetDistance, duration: 200}),
                Animated.timing(this.fabOffset, {toValue: 0, duration: 200})
            ])
        ]).start();
        
        let collections: CollectionInfo[] = this.listController.getCopiedItems();
        if (collections != null) {
            await this.collectionService.reorderCollections(collections);
            this.setState({collections: this.collectionService.getCollections()})
            this.listController.disableMoving();
        }
    }

    render() {
        let messageBox = <></>;
        if (this.state.collections.length == 0)
            messageBox = <MessageBox 
                title="Nothing Here Yet!"
                message="You can add Attributes by clicking on the button on the bottom-right."/>

        let collections: CollectionInfo[] = this.getFilteredCollections();

        return (
            <>
                <NavigationEvents onWillFocus={this.onWillFocus}/>

                <Popup visible={this.state.loading} style={{marginHorizontal: 100, marginTop: 300}}>
                    <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <ActivityIndicator style={{flex: 1}} size="large" color="#000"/>
                        <Text style={{flex: 3, textAlign: 'center'}}>loading...</Text>
                    </View>
                </Popup>


                <View style={{marginTop: 0}}>
    
                    <View elevation={3} style={styles.headerLayout}>
                        <Body style={styles.headerBodyLayout}>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18}}>
                                <Animated.View style={{flex: 1, transform: [{translateX: this.leftOffset}]}}>
                                    <IconicToolButton 
                                        style={{flex: 1}} icon="lock"
                                        onPress={this.logout}></IconicToolButton>
                                </Animated.View>
                                <Title style={{flex: 7, fontSize: 24, color: 'black'}}>Encryptor</Title>
                                <Animated.View style={{flex: 1, transform: [{translateX: this.rightOffset}]}}>
                                    <IconicToolButton 
                                        style={{flex: 1}} icon="chevron-down"
                                        onPress={() => {this.props.navigation.navigate('Settings');}}></IconicToolButton>
                                </Animated.View>
                            </View>
                        </Body>
                    </View>

                    <StatusBar translucent={true} animated={true} backgroundColor="rgba(255,255, 255,0)" barStyle="dark-content" />

                    <View style={{flexDirection: 'column', backgroundColor: '#fff'}}>
                        <View elevation={2} style={{
                                height: 50,
                                backgroundColor: '#eee', 
                                marginHorizontal: 10, 
                                marginTop: 20, 
                                borderRadius: 50, 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                borderWidth: 0, 
                                paddingLeft: 10}}>
                            <Icon style={{flex: 1, color: '#666', marginLeft: 10}} name="search"></Icon>
                            <TextInput 
                                style={{flex: 7, fontSize: 18}} 
                                placeholder="Search" 
                                value={this.state.searchText}
                                onChangeText={(text) => {
                                    this.setState({searchText: text});
                                }}/>
                        </View>

                        <View>    
                            <View style={styles.itemContainerLayout}>
                                <Text style={{color: '#999', fontWeight: 'bold', marginBottom: 9}}>YOUR COLLECTIONS</Text>
                                
                                {messageBox}

                                <ReorderableList
                                    controller={this}
                                    ref={(view: ReorderableList) => {this.listController = view}}
                                    onPressItem={(item: CollectionInfo) => this.openDetailsFor(item)}
                                    items={collections} 
                                    renderItem={(item: CollectionInfo) => <></>}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                <AnimatedFab
                    onPress={this.showDialog}
                    color={COLORS.primary}
                    style={{
                        transform: [{translateY: this.fabOffset}]
                    }}>
                    <Icon name="plus" type="Feather" style={{color: '#fff'}}/>
                </AnimatedFab>

                <AnimatedFab
                    onPress={() => {this.endReorderMode()}}
                    color={COLORS.success}
                    style={{
                        transform: [{translateY: this.checkOffset}]
                    }}>
                    <Icon name="check" type="Feather" style={{color: '#fff'}}/>
                </AnimatedFab>

                {/* Dialog Window */}
                <Popup visible={this.state.modalVisible}>
                    <H3>Create a new Collection</H3>
                    <Text>Please Enter the name of the new Collection</Text>

                    <View style={{marginVertical: 30}}>
                        <TextInput 
                            placeholder="Name" 
                            style={{borderBottomWidth: 1, borderColor: '#ddd', padding: 1}}
                            value={this.state.newCollectionName}
                            onChangeText={(text) => {this.setState({newCollectionName: text})}}/>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor="#ccc"
                            style={{padding: 5, borderRadius: 2, marginRight: 10}}
                            onPress={this.hideDialog}>
                            <Text>CANCEL</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor="#ccc"
                            style={{padding: 5, borderRadius: 2}}
                            onPress={() => {this.addItem()}}>
                            <Text style={{color: COLORS.primary}}>OK</Text>
                        </TouchableHighlight>
                    </View>
                </Popup>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1, 
        borderColor: '#dddddd',
        padding: 18,
        height: itemHeight
    }
});