import { AsyncStorage } from 'react-native';
import { Database, PasswordEntry } from './db'
import { RSA } from 'react-native-rsa-native';

const sha256 = require('react-native-sha256')

class NotAuthenticatedException extends Error {}
class LoginFailedException extends Error {}

class LoginService {
    private passwords: any = {};
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

    public async encryptKeyWithPassword(passwordId: number, keySalt: string, key: string): Promise<string> {
        return '9';
    }

    public async decryptKeyBiometric(key: string): Promise<string> {
        return '9';
    }

    public async encryptKeyBiometric(key: string): Promise<string> {
        return '9';
    }

    private async verifyPassword(passwordEntry: PasswordEntry, password: string) {
        let hash = await sha256.sha256(password + passwordEntry.salt);
        if (hash !== passwordEntry.hash)
            throw new LoginFailedException('Password Verification Failed!');
    }

    public async setMasterPassword(password: string) {
        let passwordEntry = new PasswordEntry();
        passwordEntry.id = 0;
        passwordEntry.hash = await sha256.sha256(password + passwordEntry.salt);

        let realm = await this.getConnection();
        realm.write(() => {
            let objects = realm.objects('Password').filtered('id = 0');

            if (objects.length == 0)
                realm.create('Password', passwordEntry);
            else
                realm.create('Password', passwordEntry, true);
        });
    }

    public async masterPasswordLogin(password: string) {
        let passwordEntry: PasswordEntry = await this.getPasswordEntryForId(0);
        await this.verifyPassword(passwordEntry, password);
        this.passwords[0] = password;
        console.log(password);
    }

    private async verifyToken(token: string, payload: string) {
        await RSA.generateKeys(2048);
        console.log(token);
        let publicKey: string = await this.getPublicKey();
        console.log(publicKey);
        let decrypted = await RSA.decrypt(token, publicKey);
        console.log(decrypted); 
        if (decrypted != payload)
            throw new LoginFailedException('Failed to verify token');
    }

    public async LoginWithToken(token: string, payload: string) {
        let publicKey: string = await this.getPublicKey();
        console.log('pubkey:', publicKey);
        RSA.generateKeys(2048) // set key size
        .then(keys => {
            console.log('4096 private:', keys.private); // the private key
            console.log('type:', typeof keys.private);
            console.log('4096 public:', keys.public); // the public key
            RSA.encrypt("Andreas Polze", keys.public)
            .then(encodedMessage => {
                console.log(`the encoded message is ${encodedMessage}`);
                RSA.decrypt(encodedMessage, keys.private)
                .then(decryptedMessage => {
                    console.log(`The original message was ${decryptedMessage}`);
                });
            });
        });
        //await this.verifyToken(token, payload);
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

export { LoginService, LoginFailedException };