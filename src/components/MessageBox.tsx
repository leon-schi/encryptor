import React from 'react';
import { View, Text } from 'react-native'
import { H3 } from 'native-base';
import COLORS from '../Colors';

type Props = {
    title: string,
    message: string,
    elevation?: number,
    style?: any
}

class MessageBox extends React.Component<Props> {
    elevation() {
        if (this.props.elevation == undefined)
            return 0;
        return this.props.elevation;
    }

    render() {
        return (
            <View elevation={this.elevation()} style={{
                alignItems: 'center',
                backgroundColor: '#eeeeee',
                padding: 20,
                borderRadius: 5,
                ...this.props.style
            }}>
                <H3 style={{marginBottom: 10}}>{this.props.title}</H3>
                <Text style={{color: '#999', textAlign: 'center'}}>{this.props.message}</Text>
            </View>
        );
    }
}

export { MessageBox };