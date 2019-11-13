import React from 'react';
import { KeyboardAvoidingView, Animated, Dimensions, Modal, View } from 'react-native';
import { transform } from '@babel/core';

type Props = {
    visible: boolean,
    style?: any
}

type State = {
    visible: boolean
}

class Popup extends React.Component<Props, State> {
    state: State = {
        visible: this.props.visible
    }
    width: number = Dimensions.get('window').width;
    height: number = Dimensions.get('window').height;
    
    opacity: Animated.Value = new Animated.Value(0);
    modalScale: Animated.Value = new Animated.Value(0.5);
    modalOpacity: Animated.Value = new Animated.Value(0);

    getSnapshotBeforeUpdate(prevProps: Props): any {
        if (!prevProps.visible && this.props.visible)
            this.startInAnimation();
        else if (prevProps.visible && !this.props.visible)
            this.startOutAnimation();
        return null
    }

    componentDidUpdate() {

    }

    startInAnimation() {
        this.setState({visible: true});
        Animated.parallel([
            Animated.timing(this.opacity, {toValue: 0.5, duration: 200}),
            Animated.timing(this.modalOpacity, {toValue: 1, duration: 200}),
            Animated.sequence([
                Animated.timing(this.modalScale, {toValue: 1.1, duration: 200}),
                Animated.timing(this.modalScale, {toValue: 1, duration: 100})
            ])
        ]).start();
    }

    startOutAnimation() {
        Animated.parallel([
            Animated.timing(this.opacity, {toValue: 0, duration: 200}),
            Animated.timing(this.modalOpacity, {toValue: 0, duration: 200}),
            Animated.sequence([
                Animated.timing(this.modalScale, {toValue: 1.1, duration: 50}),
                Animated.timing(this.modalScale, {toValue: 0.5, duration: 200})
            ])
        ]).start(() => {
            this.setState({visible: false});
        });
    }

    render() {
        return (
            <>
                { this.state.visible ? <Animated.View
                        elevation={8} 
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: this.width,
                            height: this.height,
                            backgroundColor: '#000',
                            opacity: this.opacity
                        }}/>: <></> }
                <KeyboardAvoidingView enabled behavior="padding">
                <Modal
                    animationType="none"
                    transparent={true}
                    visible={this.state.visible}>
                            <View style={{flexDirection: 'column', flex: 1}}>
                                <View style={{flex: 1}}/>
                                <Animated.View
                                    elevation={9}
                                    pointerEvents='auto'
                                    style={{
                                        marginHorizontal: 50,
                                        backgroundColor: '#fff',
                                        borderRadius: 7,
                                        padding: 20,
                                        opacity: this.modalOpacity,
                                        transform: [{scale: this.modalScale}]
                                    }}>
                                    {this.props.children}
                                </Animated.View>
                                <View style={{flex: 2}}/>
                            </View>
                </Modal>
                </KeyboardAvoidingView>
            </>
        );
    }
}

export { Popup };