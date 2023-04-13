import Resolver from '@forge/resolver';
import {
    startsWith,
    storage,
    fetch
} from '@forge/api';
const resolver = new Resolver();


resolver.define('getTeams', async ({ payload }) => {
    const response = await fetch('https://testteamplugin.atlassian.net/rest/teams/1.0/teams/find', {body : JSON.stringify({
        "excludedIds": [],
        "maxResults": 10,
        "query": payload.title
    }),method:'POST', 
headers: {Accept: "*/*",
        "Content-Type": "application/json",
        'Authorization': 'Basic ' + Buffer.from('vanvuddh@gmail.com:1lmcJpCt5UNaw3GdcnMfC275').toString('base64')}});
        const data = await response.json();
      return data;
});


resolver.define('getText', (req) => {
    return 'Hello world!';
});
resolver.define('getAccountID', (req) => {
    const accountID = req.context.accountId;
    return accountID;
})
resolver.define('setStorage', (req) => {
    storage.set(req.payload.key, req.payload.value)
})
resolver.define('getStorage', async (req) => {
    let value = await storage.get(req.payload.key);
    return value;
})
resolver.define("querryFilter", async (req) => {
  let allRecords = [];
  let nextCursor = undefined;

  while (true) {
    const { results, nextCursor: cursor } = await storage
      .query()
      .where("key", startsWith("filter_"))
      .cursor(nextCursor)
      .limit(20)
      .getMany();

    allRecords = allRecords.concat(results);
    nextCursor = cursor;

    if (!nextCursor) {
      // We have fetched all available records
      break;
    }
  }
  return allRecords;
});

resolver.define('saveFilter', async (req) => {
    console.log(req.payload);
    await storage.set("filter_".concat(req.context.accountId).concat("_").concat(req.payload.filterName), req.payload);
})
resolver.define('deleteFilter', (req) => {
    storage.delete(req.payload.key)
})
export const handler = resolver.getDefinitions();