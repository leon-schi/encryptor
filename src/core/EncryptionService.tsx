import AsyncStorage from '@react-native-community/async-storage';
import { Attribute, CollectionEntity, Token, Database } from './db'
import { LoginService, NotAuthenticatedException } from './LoginService';
import { generateRandomHex } from './Keygen'

const aesjs = require('aes-js');
const sha256 = require('react-native-sha256')
const keyLength = 256;

function encryptValue(text: string, key: string): string {
    var keyBytes = aesjs.utils.hex.toBytes(key);
    var textBytes = aesjs.utils.utf8.toBytes(text);
    var aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
    var encryptedBytes = aesCtr.encrypt(textBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
}

function decryptValue(text: string, key: string): string {
    var keyBytes = aesjs.utils.hex.toBytes(key);
    var encryptedBytes = aesjs.utils.hex.toBytes(text);
    var aesCtr = new aesjs.ModeOfOperation.ctr(keyBytes, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
}

class EncryptionService {
    private static instance: EncryptionService;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new EncryptionService();
        }
        return this.instance;
    }

    private loginService: LoginService = LoginService.getInstance();
    private masterToken: string = null;
    private async getConnection(): Promise<any> {
        return await Database.getInstance().getConnection()
    }

    public async isMasterTokenSet() {
        let realm = await this.getConnection();
        let tokens = realm.objects('Token').filtered('id = 0');
        return tokens.length > 0;   
    }

    public async isMasterTokenWithBiometrySet() {
        let realm = await this.getConnection();
        let tokens = realm.objects('Token').filtered('id = 0');
        if (tokens.length > 0) {
            return tokens[0].biometricallyProtected != '';
        }
        return false;
    }

    private async createMasterToken() {
        // generate master token, encrypt it and store it; the user needs to be password authenticated for this
        let realm = await this.getConnection();
        let tokens = realm.objects('Token').filtered('id = 0');
        if (tokens.length == 0) { 
            let token = generateRandomHex(keyLength);
            let masterPasswordHash = this.loginService.getMasterPasswordHash();
            let masterToken: Token = new Token(
                await sha256.sha256(token),
                encryptValue(token, masterPasswordHash),
                ''
            );
            await realm.write(() => {
                realm.create('Token', masterToken)
                this.masterToken = token;
            }); 
        }
    }

    private async getMasterToken(): Promise<string> {
        if (this.masterToken !== null)
            return this.masterToken;
        
        // get the tokenEntity from realm; if no token is set yet, set one
        let realm = await this.getConnection();
        let tokens = realm.objects('Token').filtered('id = 0');
        if (tokens.length == 0) await this.createMasterToken();
        let token: Token = realm.objects('Token').filtered('id = 0')[0];

        // try to decrypt it with the password 
        try {
            let masterPasswordHash = this.loginService.getMasterPasswordHash();
            this.masterToken = decryptValue(token.passwordProtected, masterPasswordHash);
            return this.masterToken;
        } catch (e) {if (!(e instanceof NotAuthenticatedException)) throw e}

        // user is not password authenticated, use biometric authentication
        if (token.biometricallyProtected != '') {
            try { 
                console.log('jooooooooooooooooooooo');
                let biometricToken = this.loginService.getBiometricToken();
                console.log(token.biometricallyProtected);
                console.log(biometricToken);
                this.masterToken = decryptValue(token.biometricallyProtected, biometricToken);
                console.log(this.masterToken);
                return this.masterToken; 
            } catch (e) {
                // The user is not authenticated, but can authenticate in any way
                if (e instanceof NotAuthenticatedException)
                    throw new NotAuthenticatedException('Not Authenticated', 'any')    
            }
        } else {
            // biometric token is not available, password is required
            throw new NotAuthenticatedException('Password Authentication required', 'password')
        }
    }

    public async addBiometricProtectionToMasterToken() {
        let biometricToken = this.loginService.getBiometricToken();
        let masterToken = await this.getMasterToken();
        let realm = await this.getConnection();
        await realm.write(() => {
            let token = realm.objects('Token').filtered('id = 0')[0];
            token.biometricallyProtected = encryptValue(masterToken, biometricToken);
            realm.create('Token', token, true);
        }); 
    }

    public async newCollectionEntity(name: string): Promise<CollectionEntity> {
        let collectionEntity = new CollectionEntity(name);

        // generate key and encrypt it with the master Token
        let key = generateRandomHex(keyLength);
        let masterToken;
        masterToken = await this.getMasterToken();

        collectionEntity.encryptedKey = encryptValue(key, masterToken);
        collectionEntity.value = await this.encrypt([], collectionEntity);
        return collectionEntity;
    }

    public async decrypt(collectionEntity: CollectionEntity): Promise<Attribute[]> {
        let masterToken = await this.getMasterToken();
        let key = decryptValue(collectionEntity.encryptedKey, masterToken);
        let decryptedJson = decryptValue(collectionEntity.value, key);
        return JSON.parse(decryptedJson);
    } 

    public async encrypt(attributes: Attribute[], collectionEntity: CollectionEntity): Promise<string> {
        let json = JSON.stringify(attributes);
        let masterToken = await this.getMasterToken();    
        let key = decryptValue(collectionEntity.encryptedKey, masterToken);
        return encryptValue(json, key);
    } 
}

export { EncryptionService };