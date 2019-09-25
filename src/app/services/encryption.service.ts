import { Injectable } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite/ngx';
import { DbService } from './db.service'
import { Collection, Password, Service, NotAuthenticatedError } from './model'

import aesjs from 'aes-js'
import { sha256 } from 'js-sha256'

@Injectable({
  providedIn: 'root'
})
export class EncryptionService extends Service {
  private masterPasswordId: number = 0;
  private passwords: object = {};

  constructor(private dbService: DbService) {
    super();
  }

  private async reencryptCollections(passwordId: number, newPassword: string) {
    let db: SQLiteObject = await this.dbService.getConnection();
    let rs = await db.executeSql('SELECT * FROM collections WHERE passwordId = ?', [passwordId]);
    let collections: Collection[] = this.rsToArray(rs);

    for (let collection of collections) {
      let decrypted = this.decryptCollection(collection);
      let newlyEncrypted = this.encypt(decrypted, this.getKeyFromPassword(newPassword, collection.keySalt));
      await db.executeSql('UPDATE collections SET value = ? WHERE id = ?', 
        [newlyEncrypted, collection.id]);
    }
  }

  public generateSalt(): string {
    return Math.random().toString(36).substring(2, 12);
  }

  public async isMasterPasswordSet(): Promise<boolean> {
    let db: SQLiteObject = await this.dbService.getConnection();
    let rs = await db.executeSql('SELECT * FROM passwords WHERE id = ?;', [this.masterPasswordId]);
    return rs.rows.length > 0;
  }2

  public async setMasterPassword(password: string) {
    let db: SQLiteObject = await this.dbService.getConnection();
    let salt: string = this.generateSalt();
    let hash: string = sha256(password + salt);

    // TODO: put all this into a transaction

    if (await this.isMasterPasswordSet()) {
      await this.reencryptCollections(this.masterPasswordId, password);
      await db.executeSql('UPDATE passwords SET hash = ?, salt = ? WHERE id = ?', [hash, salt, this.masterPasswordId]);
    } else
      await db.executeSql('INSERT INTO passwords VALUES (?, ?, ?)', [this.masterPasswordId, hash, salt]);

    if (!await this.logIn(password)) 
      throw new NotAuthenticatedError('Could not Log In with the new password', this.masterPasswordId);
  }

  public async verifyPassword(password: string, passwordId: number): Promise<boolean> {
    let db: SQLiteObject = await this.dbService.getConnection();
    let rs = await db.executeSql('SELECT * FROM passwords WHERE id = ?', [passwordId]);
    
    let results: Password[] = this.rsToArray(rs);
    if (results.length === 0) return false;

    let result: Password = results[0];
    return result.hash === sha256(password + result.salt);
  }

  public async logIn(password: string): Promise<boolean> {
    let authenticated: boolean = await this.verifyPassword(password, this.masterPasswordId);
    if (authenticated)
      this.passwords[this.masterPasswordId] = password;
    return authenticated;
  }

  public isAuthenticated() {
    return this.passwords[this.masterPasswordId] !== undefined;
  }

  public canDecrypt(collection: Collection): boolean {
    return this.passwords[collection.passwordId] !== undefined;
  }

  private getKeyFromPassword(password: string, salt: string) {
    return sha256(password + salt);
  }

  private getKeyForCollection(collection: Collection): string {
    let password = this.passwords[collection.passwordId];
    if (password === undefined) throw new NotAuthenticatedError('Not authenticated', collection.passwordId);

    return this.getKeyFromPassword(password, collection.keySalt);
  }

  public encryptCollection(collection: Collection): string {
    return this.encypt(collection.value, this.getKeyForCollection(collection))
  }

  public decryptCollection(collection: Collection): string {
    return this.decrypt(collection.value, this.getKeyForCollection(collection))
  }

  private encypt(value, key) {
    key = aesjs.utils.hex.toBytes(key);
    let valueBytes = aesjs.utils.utf8.toBytes(value);
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(valueBytes);
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private decrypt(value, key) {
    key = aesjs.utils.hex.toBytes(key);
    let encryptedBytes = aesjs.utils.hex.toBytes(value);
    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let decryptedBytes = aesCtr.decrypt(encryptedBytes);
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  test() {
    let collection = new Collection('Collection', 'Das ist Text.')

    this.encryptCollection(collection);
    console.log(collection.value);

    this.decryptCollection(collection);
    console.log(collection.value);
  }
}
