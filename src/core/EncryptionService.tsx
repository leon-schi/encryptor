import { Attribute, Database } from './db'

class EncryptionService {
    private static instance: EncryptionService;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new EncryptionService();
        }
        return this.instance;
    }

    private async getConnection(): Promise<any> {
        return await Database.getInstance().getConnection()
    }

    

    public decrypt(value: string): Attribute[] {
        return JSON.parse(value);
    } 

    public encrypt(attributes: Attribute[]): string {
        return JSON.stringify(attributes);
    } 
}

export { EncryptionService };