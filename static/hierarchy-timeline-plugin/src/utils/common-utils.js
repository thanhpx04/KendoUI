import { getValueMap } from "@progress/kendo-react-dropdowns";
import { FIX_VERSIONS, PROJECT, SPRINT, TEAM } from "../constants/tags";

// get filter id from  saved issue link type
export const getFilterIdFromIssueLinkTypeId = (filters, id) => {
  return filters.find((filter) => filter.name === id).id;
};

export const getStringBeforeHyphen = (str, projects) => {
  if (!str && projects && projects.length > 0) {
    return projects[0].key;
  }
  const hyphenIndex = str.indexOf("-");
  if (hyphenIndex === -1) {
    return str;
  } else {
    return str.substring(0, hyphenIndex);
  }
};

// compare two array except last element
export const arraysEqualUpToLast = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const arr1WithoutLast = arr1.slice(0, -1);
  const arr2WithoutLast = arr2.slice(0, -1);

  return JSON.stringify(arr1WithoutLast) === JSON.stringify(arr2WithoutLast);
};

export const getParentIndexes = (issues, id) => {
  const result = [];

  function findParentIndexes(node, targetId) {
    if (node.id === targetId) {
      return true;
    }

    if (node.issues) {
      for (let i = 0; i < node.issues.length; i++) {
        const childNode = node.issues[i];
        if (findParentIndexes(childNode, targetId)) {
          result.unshift(i);

          return true;
        }
      }
    }

    return false;
  }

  findParentIndexes({ issues }, id);
  return result;
};

export const getNodeFromIndexes = (issues, indexes) => {
  let node = { issues };
  for (let i = 0; i < indexes.length; i++) {
    const index = indexes[i];
    if (!node.issues || index >= node.issues.length) {
      // Invalid index or no children at current node
      return null;
    }
    node = node.issues[index];
  }
  return node;
}

export const getElementById = (issues, id) => {
  for (const issue of issues) {
    if (issue.id === id) {
      return issue;
    }
    if (issue.issues) {
      const nestedIssue = getElementById(issue.issues, id);
      if (nestedIssue) {
        return nestedIssue;
      }
    }
  }
  return null;
};

const getDisplayedTags = (value, maxLength, tagType) => {
  let displayedTags = "";
  switch (tagType) {
    case PROJECT:
      displayedTags = value.map((project) => project.projectName).toString();
      break;
    case FIX_VERSIONS:
      displayedTags = value.toString();
      break;
    case TEAM:
      displayedTags = value.map(team=>team.title).toString();
      break;
    case SPRINT:
      displayedTags = value.map(sprint=>sprint.name).toString();
      break;
  }

  if (displayedTags.length > maxLength) {
    displayedTags = displayedTags.substring(0, maxLength).concat("...");
  }
  return displayedTags;
};

export const getTags = (value, maxLength, tagType)=> {
 return value && value.length > 0 ? [{
    text: `${getDisplayedTags(value, maxLength, tagType)}`,
    data: [...value]
  }] : []
}

// assign childs to parent of the tree
export const loadChild = (source, parentKey, childIssues) => {
  source.forEach((element) => {
    if (element.key === parentKey) {
      element.issues = childIssues;
      return source;
    }
    if (element.issues !== undefined) {
      loadChild(element.issues, parentKey, childIssues);
    }
  });
};

// get dept of nested objects have issue is child
export const getDepth = (object) => {
  return 1 + Math.max(0, ...(object.issues || []).map(getDepth));
}