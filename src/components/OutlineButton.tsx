import React from 'react';
import { StyleSheet, View, TouchableNativeFeedback } from 'react-native';
import { Text, Icon } from 'native-base';
import COLORS from '../Colors'

type Props = {
    onPress: Function,
    color: string,
    icon: string,
    title: string,
}

export default class OutlineButton extends React.Component<Props> {
    onPress() {
        if (this.props.onPress)
            this.props.onPress();
    }
    
    render() {
        return (
            <TouchableNativeFeedback style={styles.buttonLayoutContainer} onPress={() => {this.onPress()}}>
                <View style={{
                        ...styles.buttonLayout,
                        borderColor: this.props.color
                    }}>
                    <View style={{flex: 2, justifyContent: 'center', flexDirection: 'row'}}>
                        <Icon type="Feather" name={this.props.icon} style={{color: this.props.color}}></Icon>
                    </View>
                    <View style={{flex: 6}}>
                        <Text style={{color: this.props.color, fontWeight: 'bold'}}>{this.props.title}</Text>
                    </View>
                </View>
            </TouchableNativeFeedback>
        );
    }
}

const styles = StyleSheet.create({
    buttonLayoutContainer: {
        flex: 1,
    },
    buttonLayout: {
        height: 45,
        marginBottom: 10,
        borderRadius: 5,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center'
    }
});