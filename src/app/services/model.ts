export class Collection {
    id: number;
    name: string;
    passwordId: number;
    keySalt: string;
    value: string;

    constructor(name: string, value: string, passwordId = 0) {
        this.id = 0;
        this.name = name;
        this.value = value;

        this.passwordId = passwordId;
        this.keySalt = '0123456789';
    }
}

export class Password {
    id: number;
    hash: string;
    salt: string;
}

export class Service {
    protected rsToArray<T>(rs) : T[] {
        let result = [];
        for (let i = 0; i < rs.rows.length; i++)
            result.push(rs.rows.item(i));

        return result;
    }
}

export class NotAuthenticatedError extends Error {
    passwordId: number;

    constructor(message: string, passwordId: number) {
        super(message);
        this.passwordId = passwordId;
    }
}

export class AuthenticationHelper {
    constructor(private presentModal) {}

    public async authenticateOnError(action) {
        try {
            await action();
        } catch (e) {
            if (e instanceof NotAuthenticatedError) {
                await this.presentModal();
                await action();
            }
        }
    }
}