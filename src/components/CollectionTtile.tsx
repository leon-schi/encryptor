import React from 'react';
import { View } from 'react-native'
import { Text } from 'native-base';

type Props = {
    name: string,
    style: any,
    textColor?: string
}

class CollectionTitle extends React.Component<Props> {

    render() {
        return (
            <View style={{
                ...this.props.style,
                flexDirection: 'column', 
                paddingLeft: 30
            }}>
                <Text style={{fontSize: 12, color: this.props.textColor}}>COLLECTION</Text>
                <Text style={{fontSize: 22, color: this.props.textColor}}>{this.props.name}</Text>
            </View>
        );
    }
}

export {CollectionTitle};