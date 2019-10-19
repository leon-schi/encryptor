const Realm = require('realm');

const CollectionSchema = {
    name: 'Collection',
    primaryKey: 'id',
    properties: {
      id:  {type: 'int', default: 0},
      index: 'int',
      name: 'string',
      passwordId: {type: 'int', default: 0},
      keySalt: 'string',
      value: 'string'
    }
  };
const PasswordsSchema = {
    name: 'Password',
    primaryKey: 'id',
    properties: {
        id:  {type: 'int', default: 0},
        hash: 'string',
        salt: 'string'
    }
};

class PasswordEntry {
    id: number = 0;
    hash: string = null;
    salt: string = '1234567';
}

class Collection {
    id: number = 0
    index: number = 0;
    name: string = ''
    passwordId: number = 0
    keySalt: string = '1234567890'
    value: string = ''

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }

    static copy(collection: Collection): Collection {
        let newCollection = new Collection(collection.name, collection.value);
        newCollection.id = collection.id;
        newCollection.index = collection.index;
        newCollection.passwordId = collection.passwordId;
        newCollection.keySalt = collection.keySalt;
        return collection;
    }
}

class Attribute {
    name: string = ''
    value: string = ''

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }
}

class Database {
    private static instance: Database;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new Database();
        }
        return this.instance;
    }

    private realm: any = null;
    public async getConnection() {
        if (this.realm === null) { 
            this.realm = await Realm.open({schema: [CollectionSchema, PasswordsSchema], schemaVersion: 2});
        }
        return this.realm;
    }
}

export { PasswordEntry, Collection, Attribute, Database };