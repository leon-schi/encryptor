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
    private biometryEnabled: boolean = false;
    private masterToken: string = null;
    constructor() {
        this.isMasterTokenWithBiometrySet().then((result: boolean) => {
            this.biometryEnabled = result;
        })
    }

    private async getConnection(): Promise<any> {
        return await Database.getInstance().getConnection()
    }

    public logout() {
        this.masterToken = null;
    }

    private async getTokenFromDatabase(): Promise<Token> {
        let realm = await this.getConnection();
        let tokens = realm.objects('Token').filtered('id = 0');
        if (tokens.length > 0)
            return tokens[0];
        return null;
    }

    public async isMasterTokenSet() {
        let token = await this.getTokenFromDatabase();
        return token != null;   
    }

    public async isMasterTokenWithBiometrySet() {
        let token = await this.getTokenFromDatabase();
        if (token != null) {
            return token.biometricallyProtected != '';
        }
        return false;
    }

    public isBiometryEnabled(): boolean {
        return this.biometryEnabled;
    }

    private async createMasterToken() {
        // generate master token, encrypt it and store it; the user needs to be password authenticated for this
        let token = await this.getTokenFromDatabase();
        if (token == null) { 
            let tokenValue = generateRandomHex(keyLength);
            let masterPasswordHash = this.loginService.getMasterPasswordHash();
            let masterToken: Token = new Token(
                await sha256.sha256(tokenValue),
                encryptValue(tokenValue, masterPasswordHash),
                ''
            );
            let realm = await this.getConnection();
            await realm.write(() => {
                realm.create('Token', masterToken)
                this.masterToken = tokenValue;
            }); 
        }
    }

    private async getMasterToken(): Promise<string> {
        if (this.masterToken !== null)
            return this.masterToken;
        
        // get the tokenEntity from realm; if no token is set yet, set one
        let token: Token = await this.getTokenFromDatabase();
        if (token == null) {
            await this.createMasterToken();
            token =  await this.getTokenFromDatabase();
        }

        // try to decrypt it with the password 
        try {
            let masterPasswordHash = this.loginService.getMasterPasswordHash();
            this.masterToken = decryptValue(token.passwordProtected, masterPasswordHash);
            return this.masterToken;
        } catch (e) {if (!(e instanceof NotAuthenticatedException)) throw e}

        // user is not password authenticated, use biometric authentication
        if (token.biometricallyProtected != '') {
            try { 
                let biometricToken = this.loginService.getBiometricToken();
                this.masterToken = decryptValue(token.biometricallyProtected, biometricToken);
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
        let masterToken = await this.getMasterToken();
        let biometricToken = this.loginService.getBiometricToken();
        let realm = await this.getConnection();
        await realm.write(() => {
            let token = realm.objects('Token').filtered('id = 0')[0];
            token.biometricallyProtected = encryptValue(masterToken, biometricToken);
            realm.create('Token', token, true);
        });
        this.biometryEnabled = true;
    }

    public async setMasterPassword(password: string) {
        let token = await this.getTokenFromDatabase();
        if (token == null) {
            // no token created yet; just create one
            await this.loginService.useMasterPassword(password);
            await this.createMasterToken();
        } else {
            // we need to reecrypt the password protected master token
            console.log('hoooooo', password, token);
            let masterToken = await this.getMasterToken();
            await this.loginService.useMasterPassword(password);
            let passwordHash = await this.loginService.getMasterPasswordHash();
            let realm = await this.getConnection();
            realm.write(() => {
                token.passwordProtected = encryptValue(masterToken, passwordHash);
                console.log(token.passwordProtected);
                realm.create('Token', token, true);
            })
        }
    }

    public async verifyMasterPassword(passwordHash: string) {
        let token: Token = await this.getTokenFromDatabase();
        let decrypted = decryptValue(token.passwordProtected, passwordHash);
        let hash = await sha256.sha256(decrypted);
        return hash == token.hash;
    }

    public async verifyBiometricToken(biometricToken: string) {
        let token: Token = await this.getTokenFromDatabase();
        let decrypted = decryptValue(token.biometricallyProtected, biometricToken);
        let hash = await sha256.sha256(decrypted);
        return hash == token.hash;
    }

    public async newCollectionEntity(name: string): Promise<CollectionEntity> {
        let collectionEntity = new CollectionEntity(name);

        // generate key and encrypt it with the master Token
        let key = generateRandomHex(keyLength);
        let masterToken = await this.getMasterToken();

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

EncryptionService.getInstance();

export { EncryptionService };