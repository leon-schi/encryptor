export class Collection {
    id: number;
    name: string;
    passwordId: number;
    keySalt: string;
    value: string;

    constructor(name: string, value: string) {
        this.id = 0;
        this.name = name;
        this.value = value;

        this.passwordId = 0;
        this.keySalt = '0123456789';
    }
}