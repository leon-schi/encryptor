import AsyncStorage from '@react-native-community/async-storage';
import Biometrics from 'react-native-biometrics'

import { Database, PasswordEntry } from './db'

const sha256 = require('react-native-sha256')
const masterPasswordId = 0;
const salt = '38askjdbc87473h';

class NotAuthenticatedException extends Error {
    requiredType: 'biometric' | 'password' | 'any';

    constructor(message: string, type: 'biometric' | 'password' | 'any'='any') {
        super(message);
        this.requiredType = type;
    }
}
class LoginFailedException extends Error {}

enum BiometryType {
    Pending, 
    None,
    Fingerprint,
    FaceID
}

class LoginService {
    private biometricToken: string;
    private masterPasswordHash: string;
    
    private static biometryType: BiometryType = null;
    private static instance: LoginService;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new LoginService();
        }
        return this.instance;
    }

    constructor() {
        this.getAvailableSensor();
        this.createKeys();
    }

    public getMasterPasswordHash(): string {
        if (this.masterPasswordHash !== undefined)
            return this.masterPasswordHash;
        throw new NotAuthenticatedException('No master password provided', 'password');
    }

    public getBiometricToken(): string {
        if (this.biometricToken !== undefined)
            return this.biometricToken;
        throw new NotAuthenticatedException('Biometric authentication required', 'biometric');
    }

    public isUserBiometricallyLoggedIn() {
        return this.biometricToken != null;
    }

    private async getConnection(): Promise<any> {
        return await Database.getInstance().getConnection()
    }

    private async getPasswordEntryForId(id: number): Promise<PasswordEntry> {
        let realm = await this.getConnection();
        return realm.objects('Password').filtered('id = ' + id)[0];
    }

    private async verifyPassword(passwordEntry: PasswordEntry, password: string) {
        let hash = await sha256.sha256(password + passwordEntry.salt);
        if (hash !== passwordEntry.hash)
            throw new LoginFailedException('Password Verification Failed!');
    }

    public async setMasterPassword(password: string) {
        let passwordEntry = new PasswordEntry();
        passwordEntry.id = masterPasswordId;
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
        let passwordEntry: PasswordEntry = await this.getPasswordEntryForId(masterPasswordId);
        await this.verifyPassword(passwordEntry, password);
        this.masterPasswordHash = await sha256.sha256(password + salt);
    }

    private async verifyToken(token: string, payload: string) {
        
    }

    public async loginWithToken(token: string, payload: string) {
        await this.verifyToken(token, payload);
        // we need to hash the token in order to ensure a suitable and constant length
        this.biometricToken = await sha256.sha256(token);
    }
    
    public async biometricAuthentication() {
        this.createKeys();
        let payload = 'this is a funny payload that will be encrypted with the private key if the user authenticates';
        let token = await Biometrics.createSignature('Sign in', payload);
        await this.loginWithToken(token, payload);
    }
        

    public async setPublicKey(publicKey: string) {
        await AsyncStorage.setItem('publicKey', publicKey);
    }

    private async getPublicKey(): Promise<string> {
        return await AsyncStorage.getItem('publicKey');
    }

    public async createKeys() {
        let pubkey: string = await this.getPublicKey();
        if (pubkey == null) {
            pubkey = await Biometrics.createKeys();
            this.setPublicKey(pubkey);
        }
    }

    public async setBiometicAuthentication(enabled: boolean) {
        try {
            await AsyncStorage.setItem('biometryEnabled', String(enabled))
        } catch (e) {
            console.log('error saving biometry authentication to ' + enabled);
        }
    }
    
    public async isBiometicAuthenticaionSet(): Promise<boolean> {
        let biometryType: BiometryType = await this.getAvailableBiometry();
        if (biometryType == BiometryType.None) return false;

        try {
            const value = await AsyncStorage.getItem('biometryEnabled');
            if (value !== null) {
                return value == 'true';
            }
        } catch(e) {
            return false;
        }
    }

    public async getAvailableBiometry() {
        let sensor = await Biometrics.isSensorAvailable();
        if (sensor == Biometrics.FaceID)
            return BiometryType.FaceID;
        else if (sensor == Biometrics.TouchID)
            return BiometryType.Fingerprint;
        else
            return BiometryType.None;
    }

    public getAvailableSensor(): BiometryType {
        if (LoginService.biometryType === null) {
            LoginService.biometryType = BiometryType.Pending;
            this.getAvailableBiometry().then((biometryType: BiometryType) => {
                LoginService.biometryType = biometryType;
            });
        }
        return LoginService.biometryType;
    }
}

export { LoginService, LoginFailedException, NotAuthenticatedException, BiometryType};