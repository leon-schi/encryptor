import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Collection } from './model'

let mock = '[{"name": "Username","value": "3214ijnn"}, {"name": "Password","value": "kjasd99238//&%§"}, {"name": "Andreas", "value": "Polze"}, {"name": "Holger", "value": "Giese"}]'

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private sqlite: SQLite;
  private db: SQLiteObject = null;
  
  private collections: Collection[] = null;
  constructor(sqlite: SQLite) {
    this.sqlite = sqlite;
  }

  private async createTables() : Promise<any> {
    await this.db.sqlBatch([
      "CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), value BLOB)",
    ]);
  }

  private async readCollections() : Promise<any> {
    let rs = await this.db.executeSql('SELECT id, name FROM collections');
    this.collections = this.rsToArray(rs);
  }

  private checkDb() {
    if (this.db === null) throw 'Error: Dabase has not been initialized yet';
  }

  private rsToArray<T>(rs) : T[] {
    let result = [];
    for (let i = 0; i < rs.rows.length; i++)
      result.push(rs.rows.item(i));

    return result;
  }

  public async initDatabase() : Promise<any> {
    let db: SQLiteObject = await this.sqlite.create({
      name: 'data.db',
      location: 'default'
    });

    this.db = db;
    await this.createTables();
    await this.readCollections();
  }

  public getCollectionNames() : Collection[] {
    return this.collections;
  }

  public getCollectionNameById(id : number) : Collection {
    if (this.collections == null) return null;
    
    for (let i = 0; i < this.collections.length; i++) {
      if (this.collections[i].id == id) return this.collections[i];
    }
    return null;
  }

  public async getCollecionById(id: number) : Promise<any> {
    this.checkDb();
    let rs = await this.db.executeSql('SELECT * FROM collections WHERE id = ?', [id]);
    return this.rsToArray(rs)[0];
  }

  public async insertCollection(name: string, value: string) {
    this.checkDb();
    await this.db.executeSql('INSERT INTO collections VALUES (NULL, ?, ?)', [name, value]);
    await this.readCollections();
  }

  public async updateCollection(id: number, name: string, value: string) {
    this.checkDb();
    await this.db.executeSql('UPDATE collections SET name = ?, value = ? WHERE id = ?', [name, value, id]);
    await this.readCollections();
  }

  public async deleteCollection(id: number) {
    this.checkDb();
    await this.db.executeSql('DELETE FROM collections WHERE id = ?', [id]);
    await this.readCollections();
  }
}