import React from 'react';
import { StyleSheet, View, TouchableNativeFeedback, ActivityIndicator } from 'react-native';
import { Text, Icon } from 'native-base';
import COLORS from '../Colors'

type Props = {
    onPress: Function,
    color: string,
    icon: string,
    title: string,
    iconType ?: string,
    style?: any,
    loading?: boolean
}

class OutlineButton extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    onPress() {
        if (this.props.onPress)
            this.props.onPress();
    }
    
    loading() {
        if (this.props.loading == undefined)
            return false;
        return this.props.loading;
    }

    render() {
        let type;
        if (this.props.iconType !== undefined)
            type = this.props.iconType;
        else
            type = 'Feather';

        return (
            <TouchableNativeFeedback style={styles.buttonLayoutContainer} onPress={() => {this.onPress()}}>
                <View style={{
                        ...this.props.style,
                        ...styles.buttonLayout,
                        borderColor: this.props.color
                    }}>
                    <View style={{flex: 2, justifyContent: 'center', flexDirection: 'row'}}>
                        <Icon type={type} name={this.props.icon} style={{color: this.props.color}}></Icon>
                    </View>
                    <View style={{flex: 6}}>
                        <Text style={{color: this.props.color, fontWeight: 'bold'}}>{this.props.title}</Text>
                    </View>
                    <View style={{flex: 1}}>
                        <ActivityIndicator style={{paddingHorizontal: 5}} size="small" animating={this.loading()} color="#000"/>
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

export { OutlineButton };