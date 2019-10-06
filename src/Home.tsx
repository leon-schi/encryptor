import React from 'react';
import Biometrics from 'react-native-biometrics'
import { StyleSheet, View, Animated, TouchableHighlight, TouchableNativeFeedback, ScrollView } from 'react-native';
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

import { CollectionService } from './core/CollectionService'
import { Collection } from './core/db'

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

    constructor(props: Props) {
        super(props);
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
        this.props.navigation.navigate('Details', {collection: collection});
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
                    <Header style={styles.headerLayout} androidStatusBarColor={COLORS.statusBar}>
                        {/* Title */}
                        <Body style={styles.headerBodyLayout}>
                            <Title style={{fontSize: 20, fontFamily: 'sans-serif'}}>Encryptor</Title>
                        </Body>
                        {/* Settings Button */}
                        <Right>
                            <TouchableHighlight underlayColor="#555" activeOpacity={0.4} style={{borderRadius: 40}} onPress={() => {}}>
                                <View style={{padding: 10}}><Icon type="Feather" name="settings" style={{color: 'white'}}></Icon></View>
                            </TouchableHighlight>
                        </Right>
                    </Header>

                    <Content>
                        {/* Search Bar */}
                        <Form>
                            <Item>
                                <Icon name="search"></Icon>
                                <Input placeholder="Search"/>
                            </Item>
                        </Form> 
                        
                        {/* Collections List */}
                        <ScrollView style={styles.itemContainerLayout} >
                            {this.state.collections.map(item => 
                                    <TouchableNativeFeedback key={item.id} onPress={() => {this.openDetailsFor(item)}}>
                                        <Animated.View style={{
                                                ...styles.itemLayout,
                                                opacity: (item.id == this.state.selectedItemId) ? 1 : this.state.opacity
                                            }}>
                                            <Icon type="Feather" name='key' style={{flex: 1, color: COLORS.primary}}/>
                                            
                                            <Transition shared={String(item.id)}>
                                                <View style={{flex: 6, flexDirection: 'column', paddingLeft: 30}}>
                                                    <Text style={{fontSize: 12}}>COLLECTION</Text>
                                                    <Text style={{fontSize: 22}}>{item.name}</Text>
                                                </View>
                                            </Transition>

                                        </Animated.View>
                                    </TouchableNativeFeedback>
                            )}
                        </ScrollView>
                        
                        
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