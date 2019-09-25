import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Collection, Service } from './model'
import { EncryptionService } from './encryption.service'
import { DbService } from './db.service'

@Injectable({
  providedIn: 'root'
})
export class CollectionService extends Service {
  private collections: Collection[] = null;
  constructor(
    private dbService: DbService,
    private encryptor: EncryptionService) {
      super();
    }

  private async readCollections() : Promise<any> {
    let db: SQLiteObject = await this.dbService.getConnection();
    let rs = await db.executeSql('SELECT id, name, passwordId, keySalt FROM collections');
    this.collections = this.rsToArray(rs);
  }

  public async init() : Promise<any> {
    await this.readCollections();
  }

  public getCollectionNames() : Collection[] {
    return this.collections;
  }

  public getCollectionNameById(id : number) : Collection {
    if (this.collections == null) return new Collection('', '[]');
    
    for (let i = 0; i < this.collections.length; i++) {
      if (this.collections[i].id == id) return this.collections[i];
    }
    return null;
  }

  public async getCollecionById(id: number) : Promise<any> {
    let db: SQLiteObject = await this.dbService.getConnection();
    let rs = await db.executeSql('SELECT * FROM collections WHERE id = ?', [id]);
    let collection: Collection = <Collection>this.rsToArray(rs)[0];
    collection.value = this.encryptor.decryptCollection(collection);

    return collection;
  }

  public async insertCollection(name: string, value: string) {
    let db: SQLiteObject = await this.dbService.getConnection();
    let collection = new Collection(name, value);
    collection.value = this.encryptor.encryptCollection(collection);

    await db.executeSql('INSERT INTO collections VALUES (NULL, ?, ?, ?, ?)', 
      [
        collection.name,
        collection.passwordId,
        collection.keySalt, 
        collection.value
      ]);
    await this.readCollections();
  }

  public async updateCollection(id: number, value: string) {
    let db: SQLiteObject = await this.dbService.getConnection();
    
    let collection: Collection = await this.getCollecionById(id);
    collection.value = value;
    collection.value = this.encryptor.encryptCollection(collection);

    await db.executeSql('UPDATE collections SET value = ? WHERE id = ?', [collection.value, collection.id]);
  }

  public async renameCollection(id: number, name: string) {
    let db: SQLiteObject = await this.dbService.getConnection();
    await db.executeSql('UPDATE collections SET name = ? WHERE id = ?', [name, id]);
    await this.readCollections();
  }

  public async deleteCollection(id: number) {
    let db: SQLiteObject = await this.dbService.getConnection();
    await db.executeSql('DELETE FROM collections WHERE id = ?', [id]);
    await this.readCollections();
  }
}