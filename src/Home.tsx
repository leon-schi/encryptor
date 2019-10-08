import React from 'react';
import { StyleSheet, View, Animated, StatusBar, TouchableNativeFeedback, ScrollView, TextInput, Dimensions } from 'react-native';
import { Transition } from 'react-navigation-fluid-transitions'
import { 
    NavigationEvents, 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { 
    Container, 
    Header, 
    Right,
    Title,
    Body,
    Content,
    Fab,
    Form,
    Item,
    Input,
    Icon,
    Text } from 'native-base';
import { CollectionTitle } from './components/CollectionTtile'
import { IconicToolButton } from './components/IconicToolButton'

import { CollectionService } from './core/CollectionService'
import { Collection } from './core/db'
import { fadeTransition } from './Transitions'

import Dialog from "react-native-dialog";
import COLORS from './Colors';


type State = {
    opacity: Animated.Value,
    selectedItemId: number,
    dialogVisible: boolean,
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
        dialogVisible: false,
        newCollectionName: '',
        collections: [],
        loading: true
    }
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
        Animated.timing(this.state.opacity, {toValue: 0.1, duration: 300}).start();
        this.props.navigation.navigate('Details', {id: collection.id, name: collection.name});
    }

    onWillFocus = () => {
        Animated.sequence([
            Animated.delay(200),
            Animated.timing(this.state.opacity, {toValue: 1, duration: 300})    
         ]).start();
        this.setState({selectedItemId: -1});
    }

    async addItem(name: string) {
        await this.collectionService.insertCollection(name, '[]');
        await this.refreshCollections();
        this.hideDialog()
    }

    showDialog = () => {this.setState({dialogVisible: true})}
    hideDialog = () => {this.setState({dialogVisible: false})}

    render() {
        return (
            <>
                {/* Dialog Window */}
                <Dialog.Container visible={this.state.dialogVisible}>
                    <Dialog.Title>Create New Collection</Dialog.Title>
                    <Dialog.Description>
                        Please enter the name of the new Collection!
                    </Dialog.Description>
                    <Dialog.Input 
                        onChangeText={(text: string) => {this.setState({newCollectionName: text})}} 
                        value={this.state.newCollectionName} 
                        label="Collection Name"
                        wrapperStyle={{borderBottomWidth: 1, borderColor: COLORS.highlight}}></Dialog.Input>
                    <Dialog.Button label="Cancel" onPress={this.hideDialog}/>
                    <Dialog.Button label="Create" onPress={() => {this.addItem(this.state.newCollectionName)}}/>
                </Dialog.Container>

                <NavigationEvents
                    onWillFocus={this.onWillFocus}></NavigationEvents>

                <Container>

                    {/* Header Bar */}
                    <Header style={styles.headerLayout}>
                        {/* Title */}
                        <Body style={styles.headerBodyLayout}>
                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                <Title style={{flex: 7, fontFamily: 'sans-serif-thin', fontSize: 24}}>ENCRYPTOR</Title>
                                <IconicToolButton style={{flex: 1}} color="white" icon="chevron-down" onPress={() => {}}></IconicToolButton>
                            </View>
                        </Body>
                    </Header>
                    <StatusBar animated={true} backgroundColor={COLORS.statusBar} barStyle="light-content" />

                    <Content>
                        {/* Search Bar */}
                        {/*<Form>
                            <View style={{backgroundColor: '#eee', margin: 5, marginVertical: 10, borderRadius: 5}}>
                                <Item style={{borderWidth: 0}}>
                                    <Icon name="search"></Icon>
                                    <TextInput style={{borderWidth: 0}} placeholder="Search"/>
                                </Item>
                            </View>
                        </Form> */}

                        <View style={{flexDirection: 'column', height: this.height}}>
                                <View elevation={2} style={{flex: 1, marginHorizontal: 10, marginTop: 20, borderRadius: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 0, paddingLeft: 10}}>
                                    <Icon style={{flex: 1}} name="search"></Icon>
                                    <TextInput style={{flex: 7}} placeholder="Search"/>
                                </View>
                            
                            {/* Collections List */}
                            <View style={{flex: 10}}>
                                <ScrollView style={styles.itemContainerLayout}>
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
        backgroundColor: COLORS.primary,
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