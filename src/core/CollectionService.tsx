import { Database, Collection, Attribute } from './db'
import { EncryptionService } from './EncryptionService'

// TODO: don't call readCollections everywhere (for performance reasons)

class CollectionInfo {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
    }
}

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

    public async readCollections(): Promise<void> {
        let realm = await this.getConnection();
        let collections = realm.objects('Collection').sorted('index');

        this.collectionInfos = [];
        for (let i = 0; i < collections.length; i++) {
            this.collectionInfos.push(new CollectionInfo(
                collections[i].id,
                collections[i].name
            ));
        }
    }

    private collectionInfos: CollectionInfo[] | null = null
    public getCollections(): CollectionInfo[] | null {
        return this.collectionInfos;
    }

    public async getCollectionById(id: number): Promise<Collection> {
        let realm = await this.getConnection();
        let collection = realm.objects('Collection').filtered('id = ' + id)[0];
        return Collection.copy(collection);
    }

    public async insertCollection(name: string, value: string) {
        let collection = new Collection(name, value);
        let realm = await this.getConnection();
        
        let id = 0;
        let index = 0;
        try { 
            id = realm.objects('Collection').max('id') + 1
            index = realm.objects('Collection').max('index') + 1
            if (Number.isNaN(id)) id = 0;
            if (Number.isNaN(index)) index = 0;
        } catch (e) {}
        collection.id = id;
        collection.index = index;

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

    public async reorderCollections(collections: CollectionInfo[]) {
        let realm = await this.getConnection();
        await realm.write(() => {
            for (let i = 0; i < collections.length; i++) {
                let collection = realm.objects('Collection').filtered('id = ' + collections[i].id)[0];
                collection.index = i;
            }
        });
        await this.readCollections();
    }
}

export { CollectionService, CollectionInfo };