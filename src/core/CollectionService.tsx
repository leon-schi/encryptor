import { Database, Collection, Attribute } from './db'
import { EncryptionService } from './EncryptionService'

// TODO: don't call readCollections everywhere (for performance reasons)

class CollectionService {
    private static instance: CollectionService;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new CollectionService();
        }
        return this.instance;
    }
    
    private async getConnection(): Promise<any> {
        return await Database.getInstance().getConnection()
    }

    private async readCollections(): Promise<void> {
        let realm = await this.getConnection();
        this.collections = realm.objects('Collection');
    }

    private collections: Collection[] | null = null
    public async getCollections(): Promise<Collection[] | null> {
        if (this.collections === null) 
            await this.readCollections();
        return this.collections;
    }

    public async insertCollection(name: string, value: string) {
        let collection = new Collection(name, value);
        let realm = await this.getConnection();
        
        let id = 0;
        try { id = realm.objects('Collection').max('id') + 1 } 
        catch (e) {}
        collection.id = id;

        await realm.write(() => {realm.create('Collection', collection)});
        await this.readCollections();
    }

    private async update(object: any) {
        let realm = await this.getConnection();
        await realm.write(() => {
            realm.create('Collection', object, true)
        });
    }

    public async updateCollection(id: number, attrinutes: Attribute[]) {
        await this.update({id: id, value: EncryptionService.getInstance().encrypt(attrinutes)});
        await this.readCollections();
    }

    public async renameCollection(id: number, name: string) {
        await this.update({id: id, name: name});
        await this.readCollections();
    }

    public async deleteCollection(collection: Collection) {
        let realm = await this.getConnection();
        await realm.write(() => {realm.delete(collection)});
        await this.readCollections();
    }
}

export {CollectionService};