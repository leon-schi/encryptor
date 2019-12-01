import React from 'react';
import { SafeAreaView, Image,StatusBar } from 'react-native'
import { Text } from 'native-base';
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';

import { EncryptionService } from './core/EncryptionService'
import { CollectionService } from './core/CollectionService'
import COLORS from './Colors';
import { applySavedMode } from './Colors';

type Props = {
    navigation: NavigationScreenProp<NavigationState, NavigationParams>
}

export default class Loader extends React.Component<Props> {
    encryptionService: EncryptionService = EncryptionService.getInstance();

    componentDidMount() {
        let action = async () => {
            await applySavedMode();

            if (!(await this.encryptionService.isMasterPasswordSet())) {
                this.props.navigation.replace('Start');
            } else {
                this.props.navigation.replace('Home');
            }
        }

        setTimeout(action, 500); 
    }

    render() {
        return (
            <SafeAreaView style={{
                flex: 1,
                padding: 100,
                paddingTop: 200,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start'
            }}>
                <StatusBar translucent={true} backgroundColor="rgba(255,255, 255,0)" animated={true} barStyle="dark-content" />
                <Image 
                    style={{width: 100, height: 100}}
                    source={require('../assets/outlinelogo.png')}/>
                <Text style={{color: COLORS.primary, fontWeight: 'bold', fontSize: 26, marginBottom: 20}}>Encryptor</Text>
            </SafeAreaView>
        );
    }
}