import React from 'react';
import { View, TouchableNativeFeedback, StyleSheet } from 'react-native'
import { Icon } from 'native-base';
import COLORS from '../Colors';

type Props = {
    icon: string,
    onPress: any,
    style: any,
    color?: string
}

class IconicToolButton extends React.Component<Props> {

    render() {
        return (
            <View style={this.props.style}>
                <TouchableNativeFeedback 
                    background={TouchableNativeFeedback.Ripple(COLORS.highlight, false)}
                    onPress={this.props.onPress}>
                    <View style={styles.headItemLayout}>
                        <Icon style={{color: this.props.color}} type="Feather" name={this.props.icon}></Icon>
                    </View>
                </TouchableNativeFeedback>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    headItemLayout: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 55
    }
});

export { IconicToolButton };