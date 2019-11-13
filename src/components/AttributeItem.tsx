import React from 'react';
import { View, TouchableNativeFeedback, StyleSheet } from 'react-native'
import { Text, Icon } from 'native-base';

import COLORS from '../Colors'

type Props = {
    name: string,
    value: string,

    onPress: any,
    onCopy: any,

    itemHeight: number,
    style: any
}

class AttributeItem extends React.Component<Props> {
    private itemHeight: number;

    constructor(props: Props) {
        super(props);
        this.itemHeight = this.props.itemHeight;
        if (this.itemHeight == undefined) this.itemHeight = 55;
    }

    render() {
        return (
            <View style={{
                height: this.itemHeight,
                ...styles.listItemLayout,
                ...this.props.style
            }}>
                <View style={{flex: 6}}>
                    <TouchableNativeFeedback underlayColor={COLORS.highlight} onPress={this.props.onPress}>
                        <View style={styles.listItemAttributeLayout}>
                            <View style={{flex: 1, paddingHorizontal: 5}}>
                                <Text numberOfLines={1} style={styles.listTitleLayout}>{this.props.name}</Text>
                            </View>
                            <View style={{flex: 1}}>
                                <Text numberOfLines={1}>{this.props.value}</Text>
                            </View>    
                        </View>
                    </TouchableNativeFeedback>
                </View>
                <View style={{flex: 1}}>
                    <TouchableNativeFeedback underlayColor={COLORS.highlight} onPress={this.props.onCopy}>
                        <View style={styles.listItemCopyButtonLayout}>
                            <Icon type="Feather" name="copy" style={{color: COLORS.dark}}></Icon>
                        </View>
                    </TouchableNativeFeedback>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    listItemLayout: {
        flexDirection: 'row',
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
    listTitleLayout: {
        color: COLORS.primary,
        fontWeight: 'bold'
    }
});

export {AttributeItem};