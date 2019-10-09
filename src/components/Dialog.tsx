import React from 'react';
import { View, Animated, Modal, Dimensions } from 'react-native';

type Props = {
    visible: boolean,
    style?: any
}


class Popup extends React.Component<Props> {
    modalScale: Animated.Value = new Animated.Value(0.5);
    width: number = Dimensions.get('window').width;
    height: number = Dimensions.get('window').height;
    visibleOld: boolean = false;

    componentWillUpdate(nextProps: Props) {
        if (nextProps.visible && !this.props.visible)
            this.startInAnimation();
    }

    startInAnimation() {
        this.modalScale.setValue(0.2);
        Animated.sequence([
            Animated.timing(this.modalScale, {toValue: 1.1, duration: 300}),
            Animated.timing(this.modalScale, {toValue: 1, duration: 100}),
        ]).start();
    }

    render() {
        if (!this.visibleOld && this.props.visible) {
            this.visibleOld = this.props.visible;
            this.startInAnimation();
        }

        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={this.props.visible}
                onRequestClose={() => {}}>
                    <View style={{backgroundColor: 'black', opacity: 0.5, position: 'absolute', width: this.width, height: this.height}}></View>
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
        );
    }
}

export { Popup };