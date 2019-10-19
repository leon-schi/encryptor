import React from 'react';
import { View, Animated, Vibration, Dimensions } from 'react-native'
import { Icon } from 'native-base'
import { Transition } from 'react-navigation-fluid-transitions'
import { ReorderableListItem } from './ReorderableListItem';
import { ScrollView } from 'react-native-gesture-handler';

import { CollectionTitle } from './CollectionTtile'
import COLORS from '../Colors'


let {max, ceil, floor, min} = Math;

type Props = {
    items: any[],
    renderItem: Function,
    onPressItem: Function,
    controller: any,
    ref: Function,
    style?: any
}

type State = {
    movingEnabled: boolean,
    listHeight: number
}

class ItemProps {
    offset: Animated.Value;
    zIndex: Animated.Value;
    moved: boolean;

    constructor() {
        this.offset = new Animated.Value(0);
        this.zIndex = new Animated.Value(9);
        this.moved = true;
    }
}

const itemHeightValue = 85;
const itemHeight = itemHeightValue + 4;

class ReorderableList extends React.Component<Props, State> {
    state: State = {
        movingEnabled: false,
        listHeight: 10
    }
    itemProps: { [id: number] : ItemProps; } = {}
    itemScale: Animated.Value = new Animated.Value(1);
    offset: Animated.Value = new Animated.Value(0);

    constructor(props: Props) {
        super(props);
        if (this.props.ref !== undefined) 
            this.props.ref(this);
    }

    getPropForItem(item: any) {
        if (this.itemProps[item.id] == undefined)
            this.itemProps[item.id] = new ItemProps();
        return this.itemProps[item.id];
    }

    copiedItems: any[] = null;
    getCopiedItems(): any[] {
        return this.copiedItems;
    }

    enableMoving = () => {
        this.props.controller.startReorderMode();

        this.copiedItems = [];
        for (let item of this.props.items) this.copiedItems.push(item);

        Vibration.vibrate(50);
        Animated.timing(this.itemScale, {toValue: 0.95, duration: 200}).start();
        this.setState({movingEnabled: true});
    }
    
    disableMoving = () => {
        this.copiedItems = null;
        Animated.timing(this.itemScale, {toValue: 1, duration: 200}).start();
        this.setState({movingEnabled: false});
    }

    onRelease(item: any) {
        if (this.state.movingEnabled) {
            this.deselectItem();
        } else {
            this.props.onPressItem(item)
        }
    }

    selectedItem: any = null;
    newIndex: number;
    selectItem(item: any) {
        this.getPropForItem(item).zIndex.setValue(99999999);
        this.selectedItem = item;
        this.newIndex = this.copiedItems.indexOf(item);
    }

    moveSelectedItem(gestureState: any) {
        let offset = gestureState.dy;
        let index = this.copiedItems.indexOf(this.selectedItem);
        let numItems = this.copiedItems.length;

        let indexOffset;
        if (offset < 0)
            indexOffset = ceil((offset - 20) / itemHeight);
        else
            indexOffset = floor((offset + 20) / itemHeight);
        
        let resetTopUntil = min(index, max(0, index + indexOffset));
        let moveUpUntil = max(index, min(index + indexOffset, numItems-1));

        this.newIndex = max(0, min(index + indexOffset, numItems));

        // reset items at  the top
        for (let i = 0; i < resetTopUntil; i++) {
            let itemProps: ItemProps = this.getPropForItem(this.copiedItems[i]);
            if (itemProps.moved) {
                itemProps.moved = false;
                Animated.timing(itemProps.offset, {toValue: 0, duration: 200}).start();
            }
        }
        // move down items until the selected element
        for (let i = resetTopUntil; i < index; i++) {
            let itemProps: ItemProps = this.getPropForItem(this.copiedItems[i]);
            if (!itemProps.moved) {
                itemProps.moved = true;
                Animated.timing(itemProps.offset, {toValue: itemHeight, duration: 200}).start();
            }
        }
        // move up items below the selected element
        for (let i = index+1; i <= moveUpUntil; i++) {
            let itemProps: ItemProps = this.getPropForItem(this.copiedItems[i]);
            if (!itemProps.moved) {
                itemProps.moved = true;
                Animated.timing(itemProps.offset, {toValue: -itemHeight, duration: 200}).start();
            }
        }
        // reset items at the bottom
        for (let i = moveUpUntil+1; i < numItems; i++) {
            let itemProps: ItemProps = this.getPropForItem(this.copiedItems[i]);
            if (itemProps.moved) {
                itemProps.moved = false;
                Animated.timing(itemProps.offset, {toValue: 0, duration: 200}).start();
            }
        }
    }

    deselectItem() {
        if (this.selectedItem != null) {
            let itemProps = this.getPropForItem(this.selectedItem);
            let selectedItem = this.selectedItem;
            let index = this.copiedItems.indexOf(this.selectedItem);

            Animated.timing(itemProps.offset, {toValue: (this.newIndex - index) * itemHeight, duration: 200}).start(() => {
                itemProps.zIndex.setValue(9);

                this.copiedItems.splice(index, 1);
                this.copiedItems.splice(this.newIndex, 0, selectedItem);

                for (let listItem of this.copiedItems) {
                    this.getPropForItem(listItem).offset.setValue(0);
                }

                this.forceUpdate();
            });
        }
        
        this.selectedItem = null;
    }

    view: View = null;
    measureList = (view: any) => {
        this.view.measure((x, y, w, h, px, py) => {
            let screenHeight = Dimensions.get('window').height;
            this.setState({listHeight: screenHeight - py});
        });
    }

    render() {
        let items = this.props.items;
        if (this.state.movingEnabled)
            items = this.copiedItems;

        return (
            <View
                ref={(view) => {this.view = view}}
                onLayout={this.measureList}
                style={{
                    height: this.state.listHeight
                }}>
                <ScrollView>
                    {items.map((item: any, index: number) => 
                        <ReorderableListItem 
                            key={index}
                            scale={this.itemScale}
                            offset={this.getPropForItem(item).offset}

                            onSelect={() => {this.selectItem(item)}}
                            onRelease={() => {this.onRelease(item)}}
                            onTerminate={() => {this.deselectItem()}}
                            onMove={(g: any) => {this.moveSelectedItem(g)}}
                            onLongPress={this.enableMoving}
                            
                            movingEnabled={this.state.movingEnabled}
                            height={itemHeightValue}
                            style={{
                                zIndex: this.getPropForItem(item).zIndex
                            }}>
                                <Icon type="Feather" name='key' style={{flex: 1, color: COLORS.primary}}/>
                                                
                                <Transition shared={String(item.id)}>
                                    <CollectionTitle style={{flex: 6}} name={item.name}></CollectionTitle>
                                </Transition>
                        </ReorderableListItem>    
                    )}
                </ScrollView>
            </View>
        );
    }
}

export { ReorderableList };