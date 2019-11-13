const Realm = require('realm');

const CollectionSchema = {
    name: 'Collection',
    primaryKey: 'id',
    properties: {
      id:  {type: 'int', default: 0},
      index: 'int',
      name: 'string',
      passwordId: {type: 'int', default: 0},
      encryptedKey: 'string',
      value: 'string'
    }
  };
const TokenSchema = {
    name: 'Token',
    primaryKey: 'id',
    properties: {
        id:  {type: 'int', default: 0},
        hash: 'string',
        passwordProtected: 'string',
        biometricallyProtected: 'string'
    }
};

class CollectionEntity {
    id: number = 0
    index: number = 0;
    name: string = ''
    passwordId: number = 0
    encryptedKey: string = '';
    value: string = '';

    constructor(name: string) {
        this.name = name;
    }
}
class Token {
    id: number = 0;
    hash: string;
    passwordProtected: string;
    biometricallyProtected: string;

    constructor(hash: string, passwordProtected: string, biometricallyProtected: string) {
        this.hash = hash;
        this.passwordProtected = passwordProtected;
        this.biometricallyProtected = biometricallyProtected;
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
            this.realm = await Realm.open({schema: [CollectionSchema, TokenSchema], schemaVersion: 7, migration: (oldRealm: any, newRealm: any) => {
                let tokens = newRealm.objects('Token');
                for (let token of tokens)
                    newRealm.delete(token);
            }});
        }
        return this.realm;
    }
}

export { Token, CollectionEntity, Attribute, Database };