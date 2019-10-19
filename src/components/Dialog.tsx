import React from 'react';
import { View, Animated, Dimensions, PanResponder, TouchableHighlight } from 'react-native';
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
        let modal;
        if (this.state.visible) {
            modal = <>
                <Animated.View
                    elevation={8} 
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: this.width,
                        height: this.height,
                        backgroundColor: '#000',
                        opacity: this.opacity
                    }}/>
                <Animated.View
                    elevation={9} 
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: this.width,
                        height: this.height,
                        opacity: this.modalOpacity
                }}>
                    <Animated.View
                        pointerEvents='auto' 
                        style={{
                            marginTop: 100,
                            marginHorizontal: 50,
                            opacity: 1,
                            backgroundColor: '#fff',
                            borderRadius: 7,
                            padding: 20,
                            transform: [{scale: this.modalScale}]
                        }}>
                        {this.props.children}
                    </Animated.View>
                </Animated.View>
            </>
        } else modal = <></>

        return (
            <>
            {modal}
            </>
        );
    }
}

export { Popup };

{/*
<Modal
    animationType="fade"
    transparent={true}
    visible={this.props.visible}
    onRequestClose={() => {}}>
        <View style={{backgroundColor: 'black', opacity: 0.5, position: 'absolute', width: this.width, height: this.height, transform: [{translateY: -18}]}}></View>
        <Animated.View style={{
            marginTop: 100, 
            backgroundColor: 'white', 
            borderRadius: 10,
            padding: 20,
            marginHorizontal: 40, 
            flexDirection: 'column',
            transform: [{scale: this.modalScale}],
            ...this.props.style}}>
                {this.props.children}
        </Animated.View>
</Modal>
*/}