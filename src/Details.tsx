import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { StyleSheet, View, Text, StatusBar } from 'react-native';
import { Container, Content, Fab, Icon, ActionSheet, Root, H3 } from 'native-base';
import { Transition } from 'react-navigation-fluid-transitions'
import { flowTransition, fadeTransition, noneTransition } from './Transitions'

import { IconicToolButton } from './components/IconicToolButton'
import { CollectionTitle } from './components/CollectionTtile'
import { AttributeItem } from './components/AttributeItem'
import { OutlineButton } from './components/OutlineButton'
import { MessageBox } from './components/MessageBox'

import { CollectionService } from './core/CollectionService'
import { EncryptionService } from './core/EncryptionService'
import { Collection, Attribute } from './core/db'
import COLORS from './Colors'

let itemHeight = 55;

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

type State = {
    showValues: boolean,
    attributes: Attribute[],
    loading: boolean
}

export default class DetailsComponent extends React.Component<Props, State> {    
    state: State = {
        showValues: false,
        attributes: [],
        loading: true
    }
    private collectionService: CollectionService = CollectionService.getInstance();
    private encryptionService: EncryptionService = EncryptionService.getInstance();
    private collection: Collection = new Collection('', '[]');

    constructor(props: Props) {
        super(props);

        this.collection.id = this.props.navigation.getParam('id', null);
        this.collection.name = this.props.navigation.getParam('name', ''); 
    }

    componentDidMount() {
        this.load();
    }

    async load() {
        this.collection = await this.collectionService.getCollectionById(this.collection.id);
        let attributes: Attribute[] = this.encryptionService.decrypt(this.collection.value);
        this.setState({attributes: attributes, loading: false});
    }

    quit = () => {
        this.props.navigation.goBack();
    }

    async deleteCollectionAndQuit() {
        await this.collectionService.deleteCollection(this.collection);
        this.quit();
    }

    private async saveAttributes() {
        await this.collectionService.updateCollection(this.collection.id, this.state.attributes);
        this.forceUpdate();
    }

    async setAttribute(name: string, value: string, index: number) {
        this.state.attributes[index] = new Attribute(name, value);
        await this.saveAttributes();
    }

    async addAttribute(name: string, value: string) {
        this.state.attributes.push(new Attribute(name, value));
        await this.saveAttributes();
    }

    async deleteAttribute(index: number) {
        this.state.attributes.splice(index, 1);
        await this.saveAttributes();
    }

    openModal(attribute: Attribute, index: number) {
        this.props.navigation.navigate('Modal', {
            name: attribute.name, 
            value: attribute.value, 
            index: index,
            creation: index == null, 
            controller: this})
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
        if (this.state.attributes.length > 0) {
            contentSection = 
                <View>
                    {/* Attributes List */}
                    <View style={{
                            ...styles.listLayout,
                            height: (this.state.attributes.length) * itemHeight
                        }}>
                        
                        {this.state.attributes.map((attribute, index) => 
                            <AttributeItem 
                                name={attribute.name}
                                value={this.renderPassword(attribute.value)}
                                onPress={() => this.openModal(attribute, index)}
                                onCopy={() => {}}
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
                        onPress={() => {this.deleteCollectionAndQuit()}}></OutlineButton>
                </View>;
        } else {
            contentSection = 
                <View>
                    <MessageBox
                        style={styles.listLayout} 
                        title="Nothing Here Yet!"
                        message="You can add Attributes by clicking on the button on the bottom-right."/>

                    <OutlineButton 
                        title="DELETE COLLECTION" 
                        icon="trash-2" 
                        color={COLORS.danger}
                        onPress={() => {this.deleteCollectionAndQuit()}}></OutlineButton>
                </View>;
        }

        return (  
            <Root>
                <Container>

                    <Content style={styles.contentLayout}>
                        {/* Header Bar */}
                        <View style={styles.headLayout}>
                            {/* Back Button */}
                            <Transition appear='left'>
                                <IconicToolButton style={{flex: 1}} icon="arrow-left" onPress={this.quit}></IconicToolButton>
                            </Transition>
                            {/* Title */}
                            <Transition shared={String(this.collection.id)}>
                                <CollectionTitle style={{flex: 6}} name={this.collection.name}></CollectionTitle>
                            </Transition>
                            {/* Settings Button */}
                            <Transition appear='right'>
                                <IconicToolButton style={{flex: 1}} icon="settings" onPress={this.showActionSheet}></IconicToolButton>
                            </Transition>
                        </View>


                        <Transition appear={flowTransition} disappear={noneTransition}>
                            {contentSection}
                        </Transition>

                    </Content>
                    
                    <Fab
                        active={true}
                        style={{ backgroundColor: COLORS.primary }}
                        position="bottomRight"
                        onPress={() => this.openModal(new Attribute('New Attribute', ''), null)}>
                        <Icon name="add"/>
                    </Fab>
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
        padding: 20
    },
    listLayout: {
        marginTop: 30,
        marginBottom: 30
    }
});