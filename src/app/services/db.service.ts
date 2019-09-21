import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Collection } from './model'

@Injectable({
  providedIn: 'root'
})
export class DbService {
  sqlite: SQLite;
  db: SQLiteObject = null;
  constructor(sqlite: SQLite) {
    this.sqlite = sqlite;
  }

  private createTables() : Promise<any> {
    return this.db.sqlBatch([
      "CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), value BLOB)",
      "INSERT INTO collections VALUES (NULL, 'Google', '99999')"
    ]);   
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
          resolve('success');  
        }).catch((e) => {reject(e)});
      }).catch((e) => {reject(e)});
    
    })
  }

  public getCollecionNames() : Promise<Collection[]> {
    this.checkDb();
    return this.db.executeSql('SELECT * FROM collections').then((rs) => { return this.rsToArray(rs) });
  }
}
