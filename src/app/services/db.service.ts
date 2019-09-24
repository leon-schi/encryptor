import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  db: SQLiteObject = null;
  constructor(private sqlite: SQLite, private platform: Platform) { }

  private async createTables() :Promise<any> {
    await this.db.sqlBatch([
      "CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(255), passwordId INTEGER, keySalt VARCHAR(10),  value BLOB)",
      "CREATE TABLE IF NOT EXISTS passwords (id INTEGER PRIMARY KEY AUTOINCREMENT, hash VARCHAR(255), salt VARCHAR(10))"
    ]);
  }

  public async getConnection() : Promise<SQLiteObject> {
    if (this.db === null) { 
      this.db = await this.sqlite.create({
        name: 'data.db',
        location: 'default'
      });
      await this.createTables();
    }

    console.log(this.db.openDBs);
    return this.db;
  }
}
