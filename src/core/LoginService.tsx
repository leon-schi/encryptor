import { AsyncStorage } from 'react-native';
import { Database, PasswordEntry } from './db'

//let sha256 = require('react-native-sha256')

class NotAuthenticatedException {}
class LoginFailedException {}

class LoginService {
    private passwords: object;
    private token: string;
    
    private static instance: LoginService;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new LoginService();
        }
        return this.instance;
    }
    private async getConnection(): Promise<any> {
        return await Database.getInstance().getConnection()
    }

    private async getPasswordEntryForId(id: number): Promise<PasswordEntry> {
        let realm = await this.getConnection();
        return realm.objects('Password').filtered('id = ' + id)[0];
    }

    public async decryptKeyWithPassword(passwordId: number, keySalt: string, key: string): Promise<string> {
        return '9';
    }

    public async decryptKeyBiometric(key: string): Promise<string> {
        return '9';
    }

    private verifyPassword(passwordEntry: PasswordEntry, password: string) {

    }

    public async masterPasswordLogin(password: string) {
        let passwordEntry: PasswordEntry = await this.getPasswordEntryForId(0);
        
    }

    public async LoginWithToken() {
        let publicKey: string = await this.getPublicKey();
    }

    public async setPublicKey(publicKey: string) {
        await AsyncStorage.setItem('publicKey', publicKey);
    }

    private async getPublicKey(): Promise<string> {
        return await AsyncStorage.getItem('publicKey');
    }

    public async isBiometricAuthenticationEnabled(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem('biometricAuthenticationEnabled');
            if (value !== null)
                return value == 'true';
        } catch (error) {
            return false;
        }
        return false;
    }
}

export { LoginService };