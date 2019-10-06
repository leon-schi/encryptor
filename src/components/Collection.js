import React from 'react';
import { StyleSheet, View, Animated, Dimensions, TouchableNativeFeedback } from 'react-native';
import { Text, Icon } from 'native-base';
import COLORS from '../Colors'


export default class Collection extends React.Component {
    
    onPress() {
        if (this.props.onPress)
            this.props.onPress();
    }

    onRef(view) {
        if (this.props.view)
            this.props.view(view);
    }

    render() {
        return (
            <TouchableNativeFeedback onPress={() => {this.onPress()}}>
                <View  elevation={0} style={{
                        ...styles.itemLayout,
                        ...this.props.style
                    }} ref={(view) => {this.onRef(view)}}>
                    <Icon type="Feather" name='key' style={{flex: 1, color: COLORS.primary}}/>
                    <View style={{flex: 5, flexDirection: 'column'}}>
                        <Text style={{fontSize: 12}}>COLLECTION</Text>
                        <Text style={{fontSize: 22}}>{this.props.name}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        );
    }
}

const styles = StyleSheet.create({
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