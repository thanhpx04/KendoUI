import Resolver from '@forge/resolver';
import {
    startsWith,
    storage,
    fetch
} from '@forge/api';
const resolver = new Resolver();

// get teams using basic authentication
resolver.define('getTeams', async ({ payload }) => {
    const response = await fetch('https://testteamplugin6.atlassian.net/rest/teams/1.0/teams/find', {body : JSON.stringify({
        "excludedIds": [],
        "maxResults": 10,
        "query": payload.title
    }),method:'POST', 
headers: {Accept: "*/*",
        "Content-Type": "application/json",
        'Authorization': 'Basic ' + Buffer.from('vanvuddh@gmail.com:ATATT3xFfGF0BnvB7NC8Le24V0Ubux3sbdr_iFQy-ruWxkb0OyFMLP4m3_8eZxcWm0mf62_zHwsNo6wfPyYtZvXk7EtBFXEE2w5bWLIUNAe5WZfYK0ObDZQFuTZwVjTyyXKeW6pNoN8tzqiV4wEMmFs647puDAlizeVk8elPErqRwrKgsnMwcHY=81AF7B01').toString('base64')}});
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

// put data to storage of forge storage api
resolver.define('setStorage', (req) => {
    storage.set(req.payload.key, req.payload.value)
})

// get data from storage of forge storage api
resolver.define('getStorage', async (req) => {
    let value = await storage.get(req.payload.key);
    return value;
})

// get saved filters from storage of forge storage api
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

// save saved filter to storage api
resolver.define('saveFilter', async (req) => {
    console.log(req.payload);
    await storage.set("filter_".concat(req.context.accountId).concat("_").concat(req.payload.filterName), req.payload);
})

// delete filter from storage api
resolver.define('deleteFilter', (req) => {
    storage.delete(req.payload.key)
})
export const handler = resolver.getDefinitions();