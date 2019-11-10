import { NotAuthenticatedException } from './LoginService'
import { 
    NavigationParams,
    NavigationScreenProp,
    NavigationState } from 'react-navigation';

class AuthenticationHelper {
    private navigation: NavigationScreenProp<NavigationState, NavigationParams>

    constructor(navigation: NavigationScreenProp<NavigationState, NavigationParams>) {
        this.navigation = navigation;
    }

    async execute(action: Function, message: string = '') {
        action().catch((e: any) => {
            if (e instanceof NotAuthenticatedException)
                this.navigation.navigate('Login', {mode: e.requiredType, onLoginSuccess: action, message: message});
            else throw e;
        });
    }
}

export { AuthenticationHelper };