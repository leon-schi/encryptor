import React from 'react';
import { StyleSheet, PanResponder, Animated } from 'react-native'
import { H3 } from 'native-base';
import COLORS from '../Colors';

type Props = {
    scale: Animated.Value,
    offset: Animated.Value,

    onSelect: Function,
    onRelease: Function,
    onTerminate: Function,
    onLongPress: Function,
    onMove: Function,

    movingEnabled: boolean,
    height: number,
    style?: any
}

class ReorderableListItem extends React.Component<Props> {
    zIndex: Animated.Value = new Animated.Value(1);
    color: Animated.Value = new Animated.Value(0);
    timeout: any;

    private onFingerDown() {
        Animated.timing(this.color, {toValue: 1, duration: 800}).start();
    }

    private onFingerUp() {
        Animated.sequence([
            Animated.timing(this.color, {toValue: 2, duration: 100}),
            Animated.timing(this.color, {toValue: 0, duration: 200})
        ]).start();
    }

    private onAbort() {
        Animated.timing(this.color, {toValue: 0, duration: 100}).start();
    }

    private highlightSelected() {
        Animated.timing(this.color, {toValue: 1, duration: 100}).start();
    }

    private dehighlightSelected() {
        Animated.timing(this.color, {toValue: 0, duration: 100}).start();
    }
    
    panResponder = PanResponder.create({
        // Ask to be the responder:
        onStartShouldSetPanResponder: (evt, gestureState) => true,
        onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => true,
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

        onPanResponderGrant: (evt, gestureState) => {        
            if (this.props.movingEnabled) {
                this.highlightSelected();
                this.props.onSelect();
            } else {
                this.onFingerDown();
                this.timeout = setTimeout(() => {
                    this.props.onLongPress();
                    this.props.onSelect();
                }, 800);
            }
        },
        onPanResponderMove: (evt, gestureState) => {
            if (this.props.movingEnabled) {
                this.props.offset.setValue(gestureState.dy);
                this.props.onMove(gestureState);
            }
        },
        onPanResponderTerminationRequest: (evt, gestureState) => true,
        onPanResponderRelease: (evt, gestureState) => {
            if (this.props.movingEnabled) {
                this.dehighlightSelected();
            } else {
                this.onFingerUp();
            }
            clearTimeout(this.timeout);
            this.props.onRelease();
        },
        onPanResponderTerminate: (evt, gestureState) => {
            if (this.props.movingEnabled) {
                this.dehighlightSelected();
            } else {
                this.onAbort();
            }
            this.props.onTerminate();
            clearTimeout(this.timeout);
        },
        onShouldBlockNativeResponder: (evt, gestureState) => {
            if (this.props.movingEnabled)
                return true;
            else
                return false;
        },
    });

    render() {
        return (
            <Animated.View
                style={{
                    ...this.props.style,
                    transform: [{scale: this.props.scale}]
                }}
                {...this.panResponder.panHandlers}>
                    <Animated.View 
                        elevation={2}
                        style={{
                            ...styles.itemLayout,
                            height: this.props.height,
                            transform: [{translateY: this.props.offset}],
                            backgroundColor: this.color.interpolate({inputRange: [0, 1, 2], outputRange: ['#fff', '#eee', '#ddd']})}}>
                                {this.props.children}
                    </Animated.View>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    itemLayout: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1, 
        borderColor: '#dddddd',
        backgroundColor: '#fff',
        padding: 18
    }
});

export { ReorderableListItem };