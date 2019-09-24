import { Injectable } from '@angular/core';
import { DbService } from './db.service'
import { Collection } from './model'
import aesjs from 'aes-js'
import { sha256 } from 'js-sha256'

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private passwords: object = {
    0: 'veryGoodPassword'
  };

  constructor(private dbService: DbService) { }

  private getKeyForCollection(collection: Collection): string {
    let password = this.passwords[collection.passwordId];
    if (password === undefined) throw 'Error: not authenticated';

    return sha256(password + collection.keySalt);
  }

  public encryptCollection(collection: Collection): void {
    let key = aesjs.utils.hex.toBytes(this.getKeyForCollection(collection));
    let valueBytes = aesjs.utils.utf8.toBytes(collection.value);

    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let encryptedBytes = aesCtr.encrypt(valueBytes);
    collection.value = aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  public decryptCollection(collection: Collection): void {
    let key = aesjs.utils.hex.toBytes(this.getKeyForCollection(collection));
    let encryptedBytes = aesjs.utils.hex.toBytes(collection.value);

    let aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    let decryptedBytes = aesCtr.decrypt(encryptedBytes);
    collection.value = aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  public canDecrypt(collection: Collection): boolean {
    return this.passwords[collection.passwordId] !== undefined;
  }

  test() {
    let collection = new Collection('Collection', 'Das ist Text.')

    this.encryptCollection(collection);
    console.log(collection.value);

    this.decryptCollection(collection);
    console.log(collection.value);
  }
}
