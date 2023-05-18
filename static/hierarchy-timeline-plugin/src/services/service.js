import { invoke, requestJira } from "@forge/bridge";
import { showErrorFlag } from "./flag-service";
import { SOMETHING_WENT_WRONG } from "../constants/flag-message";
import log from 'loglevel';
import { DELETE_METHOD, GET_METHOD, HEADERS, HEADERS_GET_ISSUE, POST_METHOD, PUT_METHOD, REST_API_BOARD, REST_API_ISSUE, REST_API_ISSUE_LINK, REST_API_PROJECT } from "../constants/api-constants";

const deleteIssueLink = async (issueLinkID) => {
  const response = await requestJira(`${REST_API_ISSUE_LINK}/${issueLinkID}`, {
    method: DELETE_METHOD,
    headers: HEADERS,
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
};
export const linkNewIssue = async (outwardKey, inwardKey, issueLinkType) => {
  let body = {
    outwardIssue: {
      key: outwardKey,
    },
    inwardIssue: {
      key: inwardKey,
    },
    type: {
      name: issueLinkType.name,
    },
  };
  const response = await requestJira(`${REST_API_ISSUE_LINK}`, {
    method: POST_METHOD,
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
};
const updateIssueLink = async (newParent, oldParent, child, issueLinkType) => {
  if (oldParent !== null) {
    const response = await requestJira(
      `${REST_API_ISSUE}/${child.key}?fields=issuelinks`
    );
    const data = await response.json();
    const oldIssueLinksChild = await data.fields.issuelinks;
    const oldIssueLink = await oldIssueLinksChild.find(
      (element) =>
        element.inwardIssue !== undefined &&
        element.type.id === issueLinkType.id &&
        element.inwardIssue.id === oldParent.id
    );
    //delete old issue link
    deleteIssueLink(oldIssueLink.id);
  }
  //add new link issue
  newParent && linkNewIssue(child.key, newParent.key, issueLinkType);
};
export const updateIssue = async (body, issueIdOrKey) => {
  const response = await requestJira(`${REST_API_ISSUE}/${issueIdOrKey}`, {
    method: PUT_METHOD,
    headers: HEADERS,
    body: body,
  }).catch((e)=>{
    showErrorFlag(SOMETHING_WENT_WRONG);
    log.error(e);
  });
  return response.status;
};
export const transitionIssue = async (issueIdOrKey, transitionID) => {
  let body = {
    transition: {
      id: transitionID,
    },
  };
  const response = await requestJira(
    `${REST_API_ISSUE}/${issueIdOrKey}/transitions`,
    {
      method: POST_METHOD,
      headers: HEADERS,
      body: JSON.stringify(body),
    }
  );
  console.log(`Response: ${response.status} ${response.statusText}`);
};
export const assigneeIssue = async (issueIdOrKey, accountID) => {
  let body = {
    accountId: accountID,
  };
  const response = await requestJira(
    `${REST_API_ISSUE}/${issueIdOrKey}/assignee`,
    {
      method: PUT_METHOD,
      headers: HEADERS,
      body: JSON.stringify(body),
    }
  );
  console.log(`Response: ${response.status} ${response.statusText}`);
};
export const createIssue = async (body) => {
  const response = await requestJira(`${REST_API_ISSUE}`, {
    method: POST_METHOD,
    headers: HEADERS,
    body: body,
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
  return await response.json();
};

export const getIssue = async (issueIdOrKey) => {
  const response = await requestJira(`${REST_API_ISSUE}/${issueIdOrKey}`, {
    method: GET_METHOD,
    headers: HEADERS_GET_ISSUE
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
  return await response.json();
};

export const bulkCreateIssue = async (bulkIssue, projectKey) => {
  let body = {
    issueUpdates: [],
  };
  for (const issue of bulkIssue) {
    if (issue.summary) {
      body.issueUpdates.push({
        update: {},
        fields: {
          summary: issue.summary,
          issuetype: {
            id: issue.issueType,
          },
          project: {
            key: projectKey,
          },
          assignee: {
            id: issue["assignee.displayName"].id || null,
          },
        },
      });
    }
  }
  const response = await requestJira(`${REST_API_ISSUE}/bulk`, {
    method: POST_METHOD,
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
  return await response.json();
};
export const getProjectVersions = async (projectIdOrKey) => {
  const response = await requestJira(
    `${REST_API_PROJECT}/${projectIdOrKey}/versions`,
    {
      method: GET_METHOD,
      headers: HEADERS,
    }
  );
  console.log(`Response: ${response.status} ${response.statusText}`);
  return await response.json();
};

export const getProjectBoards = async (projectIdOrKey) => {
  const response = await requestJira(
    `${REST_API_BOARD}?projectKeyOrId=${projectIdOrKey}`,
    {
      method: GET_METHOD,
      headers: HEADERS,
    }
  );
  console.log(`Response: ${response.status} ${response.statusText}`);
  return await response.json();
};

export const getBoardSprints = async (boardId) => {
  const response = await requestJira(
    `${REST_API_BOARD}/${boardId}/sprint`,
    {
      method: GET_METHOD,
      headers: HEADERS,
    }
  );
  console.log(`getBoardSprints Response: ${response.status} ${response.statusText}`);
  const jsonResponse = await response.json();
  return jsonResponse.values.filter(sprint => sprint.state==="active");
};

export const getBoards = async () => {
  const response = await requestJira(
    `${REST_API_BOARD}`,
    {
      method: GET_METHOD,
      headers: HEADERS,
    }
  );
  const result = await response.json();
  console.log(`getBoards Response: ${response.status} ${response.statusText}`);
  return result.values;
};

export const setStorage = (key, value) => {
  invoke("setStorage", {
    key: key,
    value: value,
  });
};
export const getStorage = async (key) => {
  return await invoke("getStorage", {
    key: key,
  });
};
export const saveOption = (projects, issueLink) => {
  invoke("getAccountID").then((accountId) => {
    setStorage(accountId, {
      projects: projects,
      issueLink: issueLink,
    });
  });
};
export const saveFilter = async (data) => {
  invoke("saveFilter", data);
};
export const querryFilter = async () => {
  let listFilter = await invoke("querryFilter");
  return listFilter;
};
export const deleteStorage = async (key) => {
  await invoke("deleteFilter", {
    key: key,
  });
};
export const getAccountID = async () => {
  const accountId = await invoke("getAccountID");
  return accountId;
};

export const getTeams = async (title) => {
  const rs = await invoke("getTeams", {title: title});
  return rs.teams;
};

export const getTransition = async (issueKey) => {
  const response = await requestJira(
    `${REST_API_ISSUE}/${issueKey}/transitions`,
    {
      method: GET_METHOD,
      headers: HEADERS,
    }
  );
  const result = await response.json();
  return result.transitions;
};

export const searchIssueKey = async (query) => {
  const response = await requestJira(
    `${REST_API_ISSUE}/picker?query=${query}&currentJQL=`,
    {
      method: GET_METHOD,
      headers: HEADERS,
    }
  );
  const result = await response.json();
  return result.sections.find(section => section.id === "cs").issues;
};


export default updateIssueLink;
