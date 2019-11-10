import React from 'react';
import { View, Animated, Dimensions, TouchableOpacity, KeyboardAvoidingView } from 'react-native'
import { H3 } from 'native-base';

type Props = {
    color: string,
    onPress: Function,
    style?: any
}

let { width, height } = Dimensions.get('window');
let fabWidth = 55;
let fabHeight = 55;
let padding = 20;

class AnimatedFab extends React.Component<Props> {
    render() {
        return (
            
                <Animated.View 
                    pointerEvents='auto'
                    elevation={3} 
                    style={{
                        position: 'absolute',
                        width: fabWidth,
                        height: fabHeight,
                        left: width - fabWidth - padding,
                        top: height - fabHeight - padding,
                        ...this.props.style
                }}>
                    <TouchableOpacity onPress={() => {this.props.onPress()}}>
                        <View
                            pointerEvents='auto'  
                            elevation={4}
                            style={{
                            width: fabWidth,
                            height: fabHeight,
                            backgroundColor: this.props.color,
                            borderRadius: 30,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {this.props.children}
                        </View>
                    </TouchableOpacity>
                </Animated.View>
        );
    }
}

export { AnimatedFab };