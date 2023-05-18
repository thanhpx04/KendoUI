import { ASSIGNEE, SPRINT } from "../constants/tags";

// get list of sprint from issue list, also add sprint 'No sprint assigned' with id 0 
// for issue that dont have any sprint assigned
export const getSprints = (issues) => {
    if (issues.length === 0) return [];
    let sprintSet = [];
    issues.forEach((issue) => {
        if (!sprintSet.some(sprint => sprint.id === issue.sprint.id) && issue.sprint) {
            sprintSet.push({id: issue.sprint.id, key: issue.sprint.name, type: SPRINT, isIssue: false});
        }
    });
    sprintSet.push({id: 0, key: 'No sprint assigned', type: SPRINT, isIssue: false});
    return sprintSet;
}

// get issue group by sprint
export const getIssuesGroupBySprint = (sprints, issues) => {
  if (sprints.length === 0) return issues;
  const sprintWithIssues = [];
  sprints.forEach((sprint) => {
    if (sprint.id === 0) {
      const issueWithoutSprint = issues.filter((issue) => !issue.sprint);
      const noSprint = sprints.find((sprint) => sprint.id === 0);
      noSprint.issues = issueWithoutSprint;
      sprintWithIssues.push(noSprint);
    } else {
      const sprintIssues = issues.filter(
        (issue) => issue.sprint.id === sprint.id
      );
      sprint.issues = sprintIssues;
      sprintWithIssues.push(sprint);
    }
  });

  return sprintWithIssues;
};

// get list of assginee from issue list, also add sprint 'No assignee assigned' with id 0 
// for issue that dont have any asignee assigned
export const getAssigneeGroups = (issues) => {
    if (issues.length === 0) return [];
    let assigneeSet = [];
    issues.forEach((issue) => {
        if (issue.assignee && !assigneeSet.some(assignee => assignee.accountId === issue.assignee.accountId) && issue.assignee) {
            assigneeSet.push({accountId: issue.assignee.accountId, key: issue.assignee.displayName,
                 isIssue: false, type: ASSIGNEE, id: issue.assignee.accountId});
        }
    });
    assigneeSet.push({accountId: 0, key: 'No assignee assigned',
        isIssue: false, type: ASSIGNEE, id: 0});
    return assigneeSet;
}

// get issue group by assignee
export const getIssuesGroupByUser = (assignees, issues) => {
    const assigneeWithIssues = [];
    assignees.forEach(assignee => {
        if (assignee.id === 0) {
            const issueWithoutAssignee = issues.filter((issue) => !issue.assignee);
            const noAssignee = assignees.find((assignee)=> assignee.accountId === 0);
            noAssignee.issues = issueWithoutAssignee;
            assigneeWithIssues.push(noAssignee);
        } else {
            const assigneeIssues = issues.filter(issue => issue.assignee?.accountId === assignee.accountId);
            assignee.issues = assigneeIssues;
            assigneeWithIssues.push(assignee);
        }
    });
    return assigneeWithIssues;
};