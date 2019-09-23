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

  private createTables() : Promise<any> {
    return this.db.sqlBatch([
      "CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), value BLOB)",
    ])
    
    
    .then(() => {
      this.db.executeSql("INSERT INTO collections VALUES (NULL, 'Amazon', ?)", [mock]);
    });   
  }

  private readCollections() : Promise<any> {
    return this.db.executeSql('SELECT id, name FROM collections').then((rs) => { this.collections = this.rsToArray(rs); });
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

  public initDatabase() : Promise<any> {
    return new Promise((resolve, reject) => {
      
      this.sqlite.create({
        name: 'data.db',
        location: 'default'
      }).then((db: SQLiteObject) => { 
        this.db = db;
        
        this.createTables().then(() => {
          this.readCollections().then(() => { resolve('success') })
            .catch((e) => {reject(e)});
        }).catch((e) => {reject(e)});
      }).catch((e) => {reject(e)});
    
    })
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

  public getCollecionById(id: number) : Promise<any> {
    this.checkDb();
    return this.db.executeSql('SELECT * FROM collections WHERE id = ?', [id]).then((rs) => { return this.rsToArray(rs)[0] });
  }
}
