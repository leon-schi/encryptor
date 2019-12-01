import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState,
    NavigationEvents } from 'react-navigation';
import { StyleSheet, View, BackHandler, TouchableHighlight, StatusBar, ActivityIndicator, Clipboard, ToastAndroid, TextInput } from 'react-native';
import { Container, Content, Text, Icon, ActionSheet, Root, H3, Col } from 'native-base';
import { Transition } from 'react-navigation-fluid-transitions'
import { flowTransition, fadeTransition, noneTransition } from './Transitions'

import { IconicToolButton } from './components/IconicToolButton'
import { CollectionTitle } from './components/CollectionTtile'
import { AttributeItem } from './components/AttributeItem'
import { OutlineButton } from './components/OutlineButton'
import { MessageBox } from './components/MessageBox'
import { AnimatedFab } from './components/AnimatedFab'
import { Popup } from './components/Dialog'

import { CollectionService, Collection } from './core/CollectionService'
import { AuthenticationHelper } from './core/AuthenticationHelper'
import { Attribute } from './core/db'
import COLORS from './Colors'

let itemHeight = 55;

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

type State = {
    showValues: boolean,
    collection: Collection,
    loading: boolean,
    deletionPopupVisible: boolean,
    renamePopupVisible: boolean,
    newName: string
}

export default class DetailsComponent extends React.Component<Props, State> {    
    state: State = {
        showValues: false,
        collection: Collection.emptyCollection(),
        loading: true,
        deletionPopupVisible: false,
        renamePopupVisible: false,
        newName: ''
    }
    private collectionService: CollectionService = CollectionService.getInstance();
    private authenticationHelper: AuthenticationHelper = new AuthenticationHelper(this.props.navigation);

    constructor(props: Props) {
        super(props);

        this.state.collection.id = this.props.navigation.getParam('id', null);
        this.state.collection.name = this.props.navigation.getParam('name', ''); 
    }

    onWillFocus = () => {
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.quit(); 
            return true;
        });
    }

    componentDidMount() {
        this.load();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => false);
    }

    async load() {
        let action = async () => {
            let collection: Collection = await this.collectionService.getCollectionById(this.state.collection.id);
            this.setState({collection: collection, loading: false});
            this.onWillFocus();
        }
        this.authenticationHelper.execute(action, "Authenticate to access collection '" + this.state.collection.name + "'");
    }

    quit = async () => {
        this.props.navigation.goBack();
    }

    async deleteCollectionAndQuit() {
        let action = async () => {
            await this.collectionService.deleteCollection(this.state.collection);
            this.quit();
        }
        this.authenticationHelper.execute(action, "Authenticate to delete collection '" + this.state.collection.name + "'");
    }

    private async saveAttributes(attributes: Attribute[]) {
        await this.collectionService.updateCollectionValue(this.state.collection, attributes);
        this.state.collection.attributes = attributes;
        this.forceUpdate();
    }

    async setAttribute(name: string, value: string, index: number) {
        this.state.collection.attributes[index] = new Attribute(name, value);
        await this.saveAttributes(this.state.collection.attributes);
    }

    async addAttribute(name: string, value: string) {
        let attributes: Attribute[] = [...this.state.collection.attributes];
        attributes.push(new Attribute(name, value));
        await this.saveAttributes(attributes);
    }

    async deleteAttribute(index: number) {
        this.state.collection.attributes.splice(index, 1);
        await this.saveAttributes(this.state.collection.attributes);
    }

    copyValue(attribute: Attribute) {
        Clipboard.setString(attribute.value);
        ToastAndroid.show("Copied value of '" + attribute.name + "' to clipboard", 50);
    }

    openModal(attribute: Attribute, index: number) {
        this.props.navigation.navigate('Modal', {
            name: attribute.name, 
            value: attribute.value, 
            index: index,
            creation: index == null, 
            controller: this})
    }
    
    openDeletionPopup = () => {
        this.setState({deletionPopupVisible: true});
    }
    hideDeletionPopup = () => {
        this.setState({deletionPopupVisible: false});
    }

    openRenamePopup = () => {
        this.setState({renamePopupVisible: true, newName: ''});
    }
    hideRenamePopup = () => {
        this.setState({renamePopupVisible: false});
    }

    async renameCollection() {
        let action = async () => {
            this.state.collection.name = this.state.newName;
            await this.collectionService.renameCollection(this.state.collection.id, this.state.newName);
            this.setState({collection: this.state.collection});
        }
        this.authenticationHelper.execute(action, "Authenticate to rename collection '" + this.state.collection.name + "'");
    }

    toggleValueVisibility = () => {this.setState({showValues: !this.state.showValues})}

    showActionSheet = () => {
        ActionSheet.show(
            {
                options: ['Rename Collection', 'Cancel'],
                cancelButtonIndex: 1,
                title: "Settings"
            },
            buttonIndex => {
                this.setState({});
            }
        )
    }

    renderPassword(password: string) {
        if (!this.state.showValues)
            return '●'.repeat(password.length)
        return password;
    }

    render() {
        let contentSection;
        if (this.state.loading) {
            contentSection = <View style={{padding: 70}}>
                <ActivityIndicator size="large" color={COLORS.primary}/>
                <Text style={{textAlign: 'center', color: COLORS.primary, marginTop: 10}}>Decrypting</Text>
            </View>
        }
        else if (this.state.collection.attributes.length > 0) {
            contentSection = 
                <View>
                    {/* Attributes List */}
                    <View style={{
                            ...styles.listLayout,
                            height: (this.state.collection.attributes.length) * itemHeight
                        }}>
                        
                        {this.state.collection.attributes.map((attribute, index) => 
                            <AttributeItem 
                                name={attribute.name}
                                value={this.renderPassword(attribute.value)}
                                onPress={() => this.openModal(attribute, index)}
                                onCopy={() => {this.copyValue(attribute)}}
                                itemHeight={itemHeight}
                                style={{}}
                                key={index}></AttributeItem>
                        
                        )}
                    </View>

                    <OutlineButton 
                        title={this.state.showValues ? 'HIDE VALUES' : 'SHOW VALUES'} 
                        icon={this.state.showValues ? 'eye-off' : 'eye'} 
                        color={COLORS.primary} 
                        onPress={this.toggleValueVisibility}></OutlineButton>
                    <OutlineButton 
                        title="DELETE COLLECTION" 
                        icon="trash-2" 
                        color={COLORS.danger}
                        onPress={this.openDeletionPopup}></OutlineButton>
                </View>;
        } else {
            contentSection = 
                <View style={{flex: 1}}>
                    <MessageBox
                        style={styles.listLayout} 
                        title="Nothing Here Yet!"
                        message="You can add Attributes by clicking on the button on the bottom-right."/>

                    <OutlineButton 
                        title="DELETE COLLECTION" 
                        icon="trash-2" 
                        color={COLORS.danger}
                        onPress={this.openDeletionPopup}></OutlineButton>
                </View>;
        }

        return (  
            <Root style={{backgroundColor: COLORS.background}}>
                <NavigationEvents onWillFocus={this.onWillFocus}/>

                <Popup visible={this.state.deletionPopupVisible} style={{backgroundColor: COLORS.popup}}>
                    <H3 style={{color: COLORS.fontPrimary}}>Confirm</H3>
                    <Text style={{color: COLORS.fontPrimary}}>Do you really want to delete the collection '{this.state.collection.name}'?</Text>

                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor={COLORS.highlight}
                            style={{padding: 5, borderRadius: 2, marginRight: 10}}
                            onPress={this.hideDeletionPopup}>
                            <Text style={{color: COLORS.fontPrimary}}>CANCEL</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor={COLORS.highlight}
                            style={{padding: 5, borderRadius: 2}}
                            onPress={() => {
                                this.hideDeletionPopup();
                                this.deleteCollectionAndQuit();
                            }}>
                            <Text style={{color: COLORS.danger}}>OK</Text>
                        </TouchableHighlight>
                    </View>
                </Popup>

                <Popup visible={this.state.renamePopupVisible} style={{backgroundColor: COLORS.popup}}>
                    <H3 style={{color: COLORS.fontPrimary}}>Rename Collection</H3>
                    <Text style={{color: COLORS.fontPrimary}}>Enter the new name for collection '{this.state.collection.name}'?</Text>

                    <View style={{marginVertical: 30}}>
                        <TextInput 
                            placeholder="New Name" 
                            placeholderTextColor={COLORS.strongHighlight}
                            style={{borderBottomWidth: 1, color: COLORS.fontPrimary, borderColor: COLORS.strongHighlight, padding: 1}}
                            value={this.state.newName}
                            onChangeText={(text) => {this.setState({newName: text})}}/>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor={COLORS.highlight}
                            style={{padding: 5, borderRadius: 2, marginRight: 10}}
                            onPress={this.hideRenamePopup}>
                            <Text style={{color: COLORS.fontPrimary}}>CANCEL</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            activeOpacity={0.5}
                            underlayColor={COLORS.highlight}
                            style={{padding: 5, borderRadius: 2}}
                            onPress={() => {
                                this.hideRenamePopup();
                                this.renameCollection();
                            }}>
                            <Text style={{color: COLORS.primary}}>OK</Text>
                        </TouchableHighlight>
                    </View>
                </Popup>

                <Container style={{flex: 1, backgroundColor: COLORS.background}}>
                    <View style={{backgroundColor: COLORS.background, height: 25}}/>

                    <Content style={{
                        ...styles.contentLayout,
                        backgroundColor: COLORS.background}}>
                        {/* Header Bar */}
                        <View style={styles.headLayout}>
                            {/* Back Button */}
                            <Transition appear='left'>
                                <IconicToolButton color={COLORS.fontPrimary} style={{flex: 1}} icon="arrow-left" onPress={this.quit}></IconicToolButton>
                            </Transition>
                            {/* Title */}
                            <Transition appear='top'>
                                <CollectionTitle textColor={COLORS.fontPrimary} style={{flex: 6}} name={this.state.collection.name}></CollectionTitle>
                            </Transition>
                            {/* Settings Button */}
                            <Transition appear='right'>
                                <IconicToolButton color={COLORS.fontPrimary} style={{flex: 1}} icon="edit" onPress={this.openRenamePopup}></IconicToolButton>
                            </Transition>
                        </View>

                        <StatusBar translucent={true} animated={true} backgroundColor="rgba(255,255, 255,0)" barStyle={COLORS.barStyle}/>

                        <Transition appear={flowTransition} disappear={fadeTransition}>
                            {contentSection}
                        </Transition>

                    </Content>
                </Container>

                {this.state.loading ? <></> : <AnimatedFab
                    onPress={() => this.openModal(new Attribute('New Attribute', ''), null)}
                    color={COLORS.primary}>
                    <Icon name="plus" type="Feather" style={{color: '#fff'}}/>
                </AnimatedFab>}
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
        //height: 55
    },
    contentLayout: {
        padding: 20,
        backgroundColor: COLORS.background
    },
    listLayout: {
        marginTop: 30,
        marginBottom: 30
    }
});