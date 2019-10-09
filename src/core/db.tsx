const Realm = require('realm');

const CollectionSchema = {
    name: 'Collection',
    primaryKey: 'id',
    properties: {
      id:  {type: 'int', default: 0},
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
    salt: string = null;
}

class Collection {
    id: number = 0
    name: string = ''
    passwordId: number = 0
    keySalt: string = '1234567890'
    value: string = ''

    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
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
            this.realm = await Realm.open({schema: [CollectionSchema, PasswordsSchema], schemaVersion: 1});

            /*this.realm.write(() => {
                let objects = this.realm.objects('Password').filtered('id = 0');
                if (objects.length == 0) {
                    this.realm.create('Password', {
                        id: 0,

                    })
                }
            });*/
        }
        return this.realm;
    }
}

export { PasswordEntry, Collection, Attribute, Database };