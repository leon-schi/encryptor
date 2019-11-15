import AsyncStorage from '@react-native-community/async-storage';
import Biometrics from 'react-native-biometrics'

import { EncryptionService } from './EncryptionService'

const defaultTimeoutMinutes = 10;
const sha256 = require('react-native-sha256')
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
    private loginTimestamp: Date = null;
    
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

    private encryptionService(): EncryptionService {
        return EncryptionService.getInstance();
    }

    public async isMasterPasswordSet(): Promise<boolean> {
        return await EncryptionService.getInstance().isMasterPasswordSet();
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
        return this.biometricToken != undefined;
    }

    public isUserPasswordLoggedIn() {
        return this.masterPasswordHash != undefined;
    }

    public isUserLoggedIn() {
        return this.isUserBiometricallyLoggedIn() || this.isUserPasswordLoggedIn();
    }

    private async initTimeout() {
        this.loginTimestamp = new Date();
    }

    public enforceTimeout() {
        if (this.loginTimestamp != null) {
            let timediff = new Date().valueOf() - this.loginTimestamp.valueOf();
            if (new Date(timediff).getSeconds() > defaultTimeoutMinutes) {
                this.logout()
            }
        }
    }
    
    public async setMasterPassword(password: string) {
        await this.encryptionService().setMasterPassword(password);
    }

    public async hashPassword(password: string) {
        return await sha256.sha256(password + salt);
    }

    public async masterPasswordLogin(password: string) {
        let result = await this.encryptionService().verifyMasterPassword(await this.hashPassword(password));
        if (result)
            await this.useMasterPassword(password);
        else
            throw new LoginFailedException('Password Verification Failed!');
    }

    public async useMasterPassword(password: string) {
        this.masterPasswordHash = await this.hashPassword(password);
        await this.initTimeout();
    }

    public async loginWithToken(token: string) {
        // we need to hash the token in order to ensure a suitable and constant length
        let biometricToken = await sha256.sha256(token);
        let result: boolean = await this.encryptionService().verifyBiometricToken(biometricToken);
        if (result)
            this.biometricToken = biometricToken;
        else
            throw new LoginFailedException('Biometic Token Verification Failed!');
    }

    public async useToken(token: string) {
        this.biometricToken = await sha256.sha256(token);
        await this.initTimeout();
    }
    
    public logout() {
        this.biometricToken = undefined;
        this.masterPasswordHash = undefined;
        this.encryptionService().logout();
    }

    public async biometricAuthentication() {
        this.createKeys();
        let payload = 'this is a funny payload that will be encrypted with the private key if the user authenticates';
        let token = await Biometrics.createSignature('Sign in', payload);
        await this.useToken(token);
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