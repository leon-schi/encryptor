import { CollectionService } from '../src/core/CollectionService'

async function insert() {
    let s = CollectionService.getInstance();
    await s.insertCollection('test', '[]');
    await s.insertCollection('test', '[]');
    let c : any = await s.getCollections();
    expect(c.length > 0).toBe(true);
}

it('should insert', insert);