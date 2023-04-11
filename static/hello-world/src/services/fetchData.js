import { requestJira } from "@forge/bridge";
import * as idConfig from "../configs/idConfig";
import { GROUP_BY_TYPE } from "../constants/groupBy";

const searchIssuesByJQL = async (projects, linkType, issueKey, dateRange, fixedVersions, 
                                  skip, take, sprints, sort, team, groupFetching) => {
  let listProject = projects.map((element) => JSON.stringify(element.key));
  let params =
    issueKey === ""
      ? `project in (${listProject}) AND (filter != ${linkType.id})`
      : `project in (${listProject}) AND (filter != ${linkType.id}) AND issue =${issueKey}`;

  if (linkType.inward === linkType.outward) {
    params =
      issueKey === ""
        ? `project in (${listProject}) AND (filter = ${linkType.id})`
        : `project in (${listProject}) AND (filter = ${linkType.id}) AND issue =${issueKey}`;
  }
      
  if (dateRange) {
    params = params.concat(
      ` AND created >=${formatDate(dateRange.start)} AND created <=${formatDate(
        dateRange.end
      )}`
    );
  }
  if (fixedVersions && fixedVersions.length > 0) {
    params = params.concat(
      ` AND fixVersion in ("${fixedVersions.join('","')}")`
    );
  }

  if (sprints && sprints.length > 0) {
    const sprintIds = sprints.map((element) => element.id);
    params = params.concat(
      ` AND sprint in (${sprintIds.join(',')})`
    );
  }

  if (team && team.length > 0) {
    const teamIds = team.map((element) => element.id);
    params = params.concat(
      ` AND team in (${teamIds.join(',')})`
    );
  }

  if (groupFetching && groupFetching.type) {
    params = addSortGroupParams(groupFetching, params);
  } else {
    params = addSortParams(sort, params);
  }

  const fullQuery = `/rest/api/2/search?jql= ${params}&maxResults=${take}&startAt=${skip}`;

  const response = await requestJira(fullQuery);

  console.log('full query: '+ fullQuery);
  return response.json();
};

export const formatDate = (date) => {
  let d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// start build tree data
// build lv 0
const getLevel0Issues = async (
  projects,
  issueLinkType,
  issueKey,
  dateRange,
  fixedVersions,
  skip,
  take,
  sprints,
  sort,
  team,
  groupFetching
) => {
  const result = await searchIssuesByJQL(
    projects,
    issueLinkType,
    issueKey,
    dateRange,
    fixedVersions,
    skip,
    take,
    sprints,
    sort,
    team,
    groupFetching
  );
  if (result.errorMessages) {
    return {
      error: result.errorMessages,
    };
  }
  let issues = [];

  result.issues.forEach((element) => {
    const issueRow = buildIssueRow(element);
    issueRow.issues = getIssueLinkChilds(issueLinkType, element.fields.issuelinks);
    issues.push(issueRow);
  });

  // const resultWithTotal = {total: result.total ,issues: issues.sort((a, b) => b.id - a.id)}
  const resultWithTotal = {total: result.total ,issues: issues}

  return resultWithTotal;
};

// build lv 0 child
export const findChildByJql = async (projects, linkType, issue) => {
  let listProject = projects.map((element) => JSON.stringify(element.key));
  let jqlFindChildByID = `project in (${listProject}) and issue in linkedIssues("${issue.key}", "${linkType.outward}")`;
  let url = `/rest/api/2/search?jql=${jqlFindChildByID}`;
  const response = await requestJira(url);
  const data = await response.json();
  let listChildren = [];
  await data.issues.forEach((element) => {
    let item = buildIssueRow(element);
    listChildren.push(item);
  });
  return listChildren;
};

const getNameFromArray = (fieldArray) => {
  if (!fieldArray) return '';
  return fieldArray[0];
}

// end build treedata

const getBlockersString = (issue) => {
  const INWARD_IS_BLOCKED_BY = "is blocked by";
  if (!issue.fields.issuelinks) return '';
  let blockerToView = [];
  issue.fields.issuelinks.forEach(link => {
    if (link.type.inward === INWARD_IS_BLOCKED_BY && link.inwardIssue) {
      if (!link.inwardIssue) return '';
      blockerToView.push(
        { key: link.inwardIssue.key }
      );
    }
  });
  return blockerToView;
}

export default getLevel0Issues;

export const findFilter = async (filterName) => {
  const response = await requestJira(
    `/rest/api/3/filter/search?filterName=${filterName}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
  let result = await response.json();
  return result.values.find((element) => element.name === filterName);
};

export const getMyFilter = async () => {
  const response = await requestJira(`/rest/api/3/filter/search`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let result = await response.json();
  return result.values;
};

export const getListUser = async () => {
  const response = await requestJira(`/rest/api/3/users/search`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
  const result = await response.json();
  return result;
};

const getSprintFromArray = (fieldArray) => {
  if (!fieldArray) return '';
  return fieldArray[0];
}

export const getIssueLinkChilds = (issueLinkType, issuelinks) => {
  const childs = [];
  if (!issuelinks) return childs;
  // not get child of linkType has inward = outward
  if (issueLinkType.inward !== issueLinkType.outward) {
    const outwardChild = issuelinks.filter((issuelink) => issuelink.type.outward === issueLinkType.outward);
    outwardChild.forEach((outwardChildElement) => {
      if (!outwardChildElement.outwardIssue)
        return;
      const child = {
        id: outwardChildElement.outwardIssue.id,
        key: outwardChildElement.outwardIssue.key,
      };
      childs.push(child);
    });
  }
  return childs;
}

function buildIssueRow(element) {
  return {
    id: element.id,
    key: element.key,
    summary: element.fields.summary,
    assignee: element.fields.assignee,
    status: {
      text: element.fields.status.name,
    },
    storyPoint: element.fields[idConfig.STORY_POINT_CUSTOM_FIELD],
    issueType: element.fields.issuetype.name,
    blockers: getBlockersString(element),
    issuelinks: element.fields.issuelinks,
    sprint: getSprintFromArray(element.fields.customfield_10020),
    fixVersions: element.fields.fixVersions?.[0],
    team: element.fields[idConfig.TEAM_CUSTOM_FIELD],
    start: element.fields.customfield_10015 ? new Date(element.fields.customfield_10015): new Date(),
    end: element.fields.duedate ? new Date(element.fields.duedate) : new Date(),
  };
}

function addSortParams(sort, params) {
  if (sort.length > 0) {
    let sortField = sort[0].field;
    let sortDirection = sort[0].dir;

    if (sortField === 'assignee.displayName') {
      sortField = 'assignee';
    }

    if (sortField === 'status.text') {
      sortField = 'status';
    }

    params = params.concat(
      ` order by ${sortField} ${sortDirection}`
    );
  }
  return params;
}

function addSortGroupParams(groupFetching, params) {
    let sortField = groupFetching.type;

    if (sortField === GROUP_BY_TYPE.NONE) {
      return params;
    }

    if (sortField === GROUP_BY_TYPE.SPRINT) {
      sortField = 'SPRINT';
    }

    if (sortField === GROUP_BY_TYPE.USER) {
      sortField = 'ASSIGNEE';
    }

    params = params.concat(
      ` order by ${sortField} ASC `
    );
  return params;
}
