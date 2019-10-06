import { Attribute } from './db'

class EncryptionService {
    private static instance: EncryptionService;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new EncryptionService();
        }
        return this.instance;
    }

    public decrypt(value: string): Attribute[] {
        return JSON.parse(value);
    } 

    public encrypt(attributes: Attribute[]): string {
        return JSON.stringify(attributes);
    } 
}

export { EncryptionService };