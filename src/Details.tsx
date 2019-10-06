import React from 'react';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';
import { StyleSheet, View, Animated, Easing, TouchableNativeFeedback, TouchableHighlight, Dimensions } from 'react-native';
import { Container, Content, Fab, Text, Icon, ActionSheet, Root } from 'native-base';
import { Transition } from 'react-navigation-fluid-transitions'
import { flowTransition } from './Transitions'

import { CollectionService } from './core/CollectionService'
import { EncryptionService } from './core/EncryptionService'
import { Collection, Attribute } from './core/db'
import OutlineButton from './components/OutlineButton'
import COLORS from './Colors'

let itemHeight = 55;

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

type State = {
    showValues: boolean,
    attributes: Attribute[]
}

export default class DetailsComponent extends React.Component<Props, State> {    
    state: State = {
        showValues: false,
        attributes: []
    }
    private opacity: Animated.Value = new Animated.Value(0);
    private translateY: Animated.Value = new Animated.Value(40);
    private collectionService: CollectionService = CollectionService.getInstance();
    private encryptionService: EncryptionService = EncryptionService.getInstance();
    private collection: Collection = new Collection('', '[]');

    constructor(props: Props) {
        super(props);
        this.collection = this.props.navigation.getParam('collection', new Collection('', '[]'));
        this.createItemAnimation(this.opacity, this.translateY, 500, 300).start();
        this.load();
    }

    async load() {
        let attributes: Attribute[] = this.encryptionService.decrypt(this.collection.value);
        console.log(attributes);
        this.state.attributes = attributes;
    }

    async deleteCollectionAndQuit() {
        await this.collectionService.deleteCollection(this.collection);
        this.props.navigation.goBack();
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

    createItemAnimation(opacity: Animated.Value, yOffset: Animated.Value, delay: number, duration: number) {
        let easing = Easing.inOut(Easing.quad);
        return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, {toValue: 1, duration: duration, easing: easing, useNativeDriver: true}),
                Animated.timing(yOffset, {toValue: 0, duration: duration, easing: easing, useNativeDriver: true})
            ])
        ])
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
        return (  
            <Root>
                <Container>
                    <Content style={styles.contentLayout}>
                        {/* Header Bar */}
                        <View style={styles.headLayout}>
                            {/* Back Button */}
                            <Transition appear='left'>
                                <View style={{flex: 1}}>
                                    <TouchableHighlight underlayColor={COLORS.highlight} activeOpacity={0.4} style={{borderRadius: 40}} onPress={() => {this.props.navigation.goBack()}}>
                                        <View style={styles.headItemLayout}><Icon type="Feather" name="arrow-left"></Icon></View>
                                    </TouchableHighlight>
                                </View>
                            </Transition>
                            {/* Title */}
                            <Transition shared={String(this.collection.id)}>
                                <View style={{flex: 6, flexDirection: 'column', paddingLeft: 30}}>
                                    <Text style={{fontSize: 12}}>COLLECTION</Text>
                                    <Text style={{fontSize: 22}}>{this.collection.name}</Text>
                                </View>
                            </Transition>

                            {/* Settings Button */}
                            <Transition appear='right'>
                                <View style={{flex: 1}}>
                                    <TouchableHighlight underlayColor={COLORS.highlight} activeOpacity={0.4} style={{borderRadius: 40}} onPress={this.showActionSheet}>
                                        <View style={styles.headItemLayout}>
                                            <Icon type="Feather" name="settings"></Icon>
                                        </View>
                                    </TouchableHighlight>
                                </View>
                            </Transition>
                        </View>

                        
                        <Animated.View style={{
                            opacity: this.opacity,
                            transform: [{translateY: this.translateY}]
                        }}>
                        {/* Attributes List */}
                        <View style={{
                                ...styles.listLayout,
                                height: (this.state.attributes.length) * itemHeight
                            }}>
                            
                            {this.state.attributes.map((attribute, index) => 
                                <View style={styles.listItemLayout} key={index}>
                                    <View style={{flex: 6}}>
                                        <TouchableNativeFeedback underlayColor={COLORS.highlight} onPress={() => this.openModal(attribute, index)}>
                                            <View style={styles.listItemAttributeLayout}>
                                                <View style={{flex: 1, paddingHorizontal: 5}}>
                                                    <Text style={styles.listTitleLayout}>{attribute.name}</Text>
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text>{this.renderPassword(attribute.value)}</Text>
                                                </View>    
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                    <View style={{flex: 1}}>
                                        <TouchableNativeFeedback underlayColor={COLORS.highlight}>
                                            <View style={styles.listItemCopyButtonLayout}>
                                                <Icon type="Feather" name="copy" style={{color: '#999999'}}></Icon>
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                </View>
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
                        </Animated.View>

                    </Content>
                    <Fab
                        active={true}
                        style={{ backgroundColor: COLORS.primary }}
                        position="bottomRight"
                        onPress={() => this.openModal(new Attribute('', ''), null)}>
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
    },
    listItemLayout: {
        flexDirection: 'row',
        height: itemHeight,
        borderBottomWidth: 1,
        borderColor: COLORS.highlight,
        alignItems: 'center',
        justifyContent: 'center'
    },
    listItemAttributeLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 55
    },
    listItemCopyButtonLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 55
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