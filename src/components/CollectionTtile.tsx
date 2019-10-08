import React from 'react';
import { View } from 'react-native'
import { Text } from 'native-base';

type Props = {
    name: string,
    style: any
}

class CollectionTitle extends React.Component<Props> {

    render() {
        return (
            <View style={{
                ...this.props.style,
                flexDirection: 'column', 
                paddingLeft: 30
            }}>
                <Text style={{fontSize: 12}}>COLLECTION</Text>
                <Text style={{fontSize: 22}}>{this.props.name}</Text>
            </View>
        );
    }
}

export {CollectionTitle};