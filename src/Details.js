import React from 'react';
import { StyleSheet, View, Animated, Easing, TouchableHighlight } from 'react-native';
import { Container, Content, H1, Text, Icon, ActionSheet, Root } from 'native-base';

import OutlineButton from './components/OutlineButton'
import COLORS from './Colors'

export default class DetailsComponent extends React.Component {    
    state = {
        showValues: false
    }
    items = []
    initialized = false
    buttonValues = {
        showButton: {
            opacity: new Animated.Value(0),
            yOffset: new Animated.Value(20)
        },
        deleteButton: {
            opacity: new Animated.Value(0),
            yOffset: new Animated.Value(20)
        }
    }

    createItemAnimation(opacity, yOffset, delay, duration) {
        let easing = Easing.inOut(Easing.quad);
        return Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(opacity, {toValue: 1, duration: duration, easing: easing, useNativeDriver: true}),
                Animated.timing(yOffset, {toValue: 0, duration: duration, easing: easing, useNativeDriver: true})
            ])
        ])
    }

    showActionSheet() {
        ActionSheet.show(
            {
              options: ["Option 0", "Option 1", "Option 2", "Delete", "Cancel"],
              cancelButtonIndex: 3,
              destructiveButtonIndex: 4,
              title: "Testing ActionSheet"
            },
            buttonIndex => {
              this.setState({});
            }
        )
    }

    animate() {
        if (!this.initialized) {
            this.initialized = true;
            this.items = [];

            this.items.push({
                name: 'Andreas Polze',
                value: 'jksdhgkfa',
                opacity: new Animated.Value(0),
                yOffset: new Animated.Value(20)
            });
            this.items.push({
                name: 'Holger Giese',
                value: 'jasjkd78236gbdak',
                opacity: new Animated.Value(0),
                yOffset: new Animated.Value(20)
            });
            this.items.push({
                name: 'Christoph Meinel',
                value: 'sdkjf893b2',
                opacity: new Animated.Value(0),
                yOffset: new Animated.Value(20)
            });

            let duration = 100;
            let delay = 50;

            let animations = [];
            let i = 1;
            for (let item of this.items) {
                animations.push(this.createItemAnimation(item.opacity, item.yOffset, delay*++i, duration))
            }

            animations.push(this.createItemAnimation(this.buttonValues.showButton.opacity, this.buttonValues.showButton.yOffset, delay*++i, duration))
            animations.push(this.createItemAnimation(this.buttonValues.deleteButton.opacity, this.buttonValues.deleteButton.yOffset, delay*++i, duration))

            Animated.parallel(animations).start();
        }
    }

    renderPassword(password) {
        if (!this.state.showValues)
            return '●'.repeat(password.length)
        return password;
    }

    render() {
        this.animate();

        return (
            <Root>
                <Container>
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
                                <Text style={{fontSize: 12}}>COLLECTION</Text>
                                <H1>{this.props.navigation.getParam('name', '')}</H1>
                            </View>
                            <View style={{flex: 1}}>
                                <TouchableHighlight underlayColor="#dddddd" activeOpacity={0.4} style={{borderRadius: 40}} onPress={() => {
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
                                }}>
                                    <View style={styles.headItemLayout}>
                                        <Icon type="Feather" name="settings"></Icon>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>

                        <View style={{
                                ...styles.listLayout,
                                height: (this.items.length + 1) * 40
                            }}>
                            {this.items.map(item => 
                                <Animated.View key={item.name} style={{
                                    opacity: item.opacity,
                                    transform: [{translateY: item.yOffset}],
                                    flexDirection: 'row',
                                    borderBottomWidth: 1,
                                    borderColor: '#cccccc',
                                    alignItems: 'center',
                                }}>
                            
                                    <View style={{
                                        flex: 6
                                    }}>
                                        <TouchableHighlight underlayColor="#dddddd" onPress={() => {this.props.navigation.navigate('Modal', {name: item.name, value: item.value})}}>
                                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', height: 55}}>
                                                <View style={{flex: 1, paddingHorizontal: 5}}>
                                                    <Text style={styles.listTitleLayout}>{item.name}</Text>
                                                </View>
                                                <View style={{flex: 1}}>
                                                    <Text>{this.renderPassword(item.value)}</Text>
                                                </View>    
                                            </View>
                                        </TouchableHighlight>
                                    </View>
                                    <View style={{
                                        flex: 1
                                    }}>
                                        <TouchableHighlight underlayColor="#dddddd">
                                            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 55}}>
                                                <Icon type="Feather" name="copy" style={{color: '#999999'}}></Icon>
                                            </View>
                                        </TouchableHighlight>
                                    </View>

                                </Animated.View>
                            )}
                        </View>

                        <Animated.View style={{
                                    opacity: this.buttonValues.showButton.opacity,
                                    transform: [{translateY: this.buttonValues.showButton.yOffset}]
                                }}>
                            <OutlineButton 
                                title={this.state.showValues ? 'HIDE VALUES' : 'SHOW VALUES'} 
                                icon={this.state.showValues ? 'eye-off' : 'eye'} 
                                color={COLORS.primary} 
                                onPress={() => {this.setState({showValues: !this.state.showValues})}}></OutlineButton>
                        </Animated.View>

                        <Animated.View style={{
                                    opacity: this.buttonValues.deleteButton.opacity,
                                    transform: [{translateY: this.buttonValues.deleteButton.yOffset}]
                                }}>
                            <OutlineButton title="DELETE COLLECTION" icon="trash-2" color={COLORS.danger}></OutlineButton>
                        </Animated.View>

                    </Content>
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