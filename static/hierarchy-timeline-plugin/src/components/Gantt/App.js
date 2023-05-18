import { showFlag } from '@forge/bridge';
import { clone, getter, guid } from "@progress/kendo-react-common";
import {
  Gantt,
  GanttDayView, GanttForm, GanttMonthView, GanttRemoveDialog,
  GanttWeekView, GanttYearView,
  addDependency, addTask, extendDataItem, filterBy,
  mapTree, orderBy, removeTask, updateTask
} from "@progress/kendo-react-gantt";
import React, { useEffect, useState } from "react";
import { GROUP_BY_TYPE } from "../../constants/groupBy";
import { findChildByJql, getIssueLinkChilds } from "../../services/fetchData";
import { updateIssue } from "../../services/service";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import { useGanttStore } from "../../stores/GanttStore";
import { useTreeListStore } from "../../stores/TreeListStore";
import { getDepth, loadChild } from "../../utils/common-utils";
import { getAssigneeGroups, getIssuesGroupBySprint, getIssuesGroupByUser, getSprints } from "../../utils/group-utils";
import './gantt.css';
import { showSuccessFlag } from '../../services/flag-service';
import { UPDATE_SUCCESSFUL } from '../../constants/flag-message';

const ganttStyle = {
  height: "100%",
  width: "100%"
};
const taskModelFields = {
  id: "key",
  start: "start",
  end: "end",
  title: "title",
  percentComplete: "percentComplete",
  isRollup: "isRollup",
  isExpanded: "isExpanded",
  isInEdit: "isInEdit",
  children: "issues",
  isSelected: "isSelected",
};
const dependencyModelFields = {
  id: "key",
  fromId: "fromId",
  toId: "toId",
  type: "type",
};

export const exampleDependencyData = [
  {
      'key': 1,
      'fromId': "GT-7",
      'toId': "GT-6",
      'type': 1
  },
  {
    'key': 2,
    'fromId': "GT-6",
    'toId': "GT-5",
    'type': 1
},
{
  'key': 3,
  'fromId': "GT-4",
  'toId': "GT-3",
  'type': 1
}
];

const getTaskId = getter(taskModelFields.id);
const columns = [
  {
    field: taskModelFields.id,
    title: "Issue Key",
    width: 120,
    className: "custom-issue-key-column",
  },
  {
    field: taskModelFields.title,
    title: "Summary",
    expandable: true,
    width: 200,
    // filter: GanttTextFilter,
  },
  {
    field: taskModelFields.start,
    title: "Start",
    width: 120,
    format: "{0:MM/dd/yyyy}",
    // filter: GanttDateFilter,
  },
  {
    field: taskModelFields.end,
    title: "End",
    width: 120,
    format: "{0:MM/dd/yyyy}",
    // filter: GanttDateFilter,
  },
];
const loadingPanel = (
  <div className="k-loading-mask">
    <span className="k-loading-text">Loading</span>
    <div className="k-loading-image"></div>
    <div className="k-loading-color"></div>
  </div>
);
// if this issue key not available in the tree => add to tree
const existIssue = async (source, key) => {
  // source: array of lvl 0
  // key issuekey of lvl 0 child
  for (const item of source) {
    if (item.key === key) return true;
    // Item not returned yet. Search its children by recursive call.
    if (item.issues !== undefined) {
      let subresult = await existIssue(item.issues, key);
      // If the item was found in the subchildren, return it.
      if (subresult) return true;
    }
  }
  // Nothing found yet? return false.
  return false;
};

function IssueGantt({ isLoading, onQuery }) {
  const [{ data: taskData , groupBy, isGrouping, skip, take, status}, 
    { setData: setTaskData, setIsGrouping }
  ] = useTreeListStore();

  const [{ projects, issueLinkType, dateRange, fixedVersions, sprints, team, issueKey }, {setColumnsState}] 
  = useFilterOptionsStore();

  // critical path
  const idList = taskData.map(data=>data.key);
  const criticalIds = ["GT-8","GT-7","GT-6","GT-5"];

  const notCriticalIds = idList.filter(
    (id) => !criticalIds.includes(id)
  );

  const [isShowCriticalPath, setIsShowCriticalPath] = useState(false);
  
  // set critical color for element
  const setCriticalElementColor = (elementSelector) => {
    document.querySelectorAll(elementSelector).forEach((taskDiv) => {
      if (taskDiv) {
        taskDiv.style.backgroundColor = 'red';
      }
    });
  }

  // set non critical style of elements
  const setNonCriticalElement = (elementSelector) => {
    document.querySelectorAll(elementSelector).forEach((taskDiv) => {
      if (taskDiv) {
        taskDiv.style.opacity = '0.4';
      }
    });
  }

  // set default style for element
  const setDefaultCriticalPath = (elementSelector) => {
    document.querySelectorAll(elementSelector).forEach((taskDiv) => {
      if (taskDiv) {
        taskDiv.style.opacity = '1';
        taskDiv.style.backgroundColor = '#606060'
      }
    });
  }

  // highlight the critical path with specific element class
  const showCriticalPath = () => {
    criticalIds.forEach((d) => {
      setCriticalElementColor(`[data-task-id="${d}"]`);
      setCriticalElementColor(`[data-task-id="${d}"] .k-task-complete`);
    });
    notCriticalIds.forEach((d) => {
      setNonCriticalElement(`[data-task-id="${d}"]`); 
      setNonCriticalElement(`[data-task-id="${d}"] .k-task-complete`);
    });
  }

  // disable critical path, reset to original style
  const disableCriticalPath = () => {
    idList.forEach((d) => {
      setDefaultCriticalPath(`[data-task-id="${d}"]`);
      setDefaultCriticalPath(`[data-task-id="${d}"] .k-task-complete`);
    });
  }

  // show critical path when isShowCriticalPath is true
  useEffect(()=>{
    if (isShowCriticalPath) {
      showCriticalPath();
    } else {
      disableCriticalPath();
    }
  },[isShowCriticalPath])

  // const [{ taskData }, { setTaskData }] = useTaskDataStore();
  const [loading, setLoading] = useState(true);
  const [dependencyData, setDependencyData] = useState(exampleDependencyData);
  const [{expandedState}, {setExpandedState}] = useGanttStore();
  const [selectedIdState, setSelectedIdState] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [removeItem, setRemoveItem] = useState(null);
  const [dataState, setDataState] = useState({
    sort: [],
    filter: [],
  });

  const onDataStateChange = React.useCallback(
    (event) => setDataState(event.dataState),
    [setDataState]
  );

  // handle when user click to expand the issue that has childs
  const onExpandChange = React.useCallback(
    (event) => {
      // sprint will have isIssue property set to false
      if (event.dataItem.hasOwnProperty("isIssue")) {
        const issueParent = event.dataItem; // this is sprint
        if (event.value === false) {
          issueParent.issues.forEach((item) => {
            const child = getIssueLinkChilds(issueLinkType, item.issuelinks);
            // load reservation issue childs's childs (only id and key)
            loadChild(taskData, item.key, child);
          });
          setTaskData(taskData);
        }
      } else {
        const issueParent = event.dataItem; // level 0
        if (event.value === false && getDepth(issueParent) <= 2) {
          setLoading(true);
          const updatedTaskData = [...taskData];

          findChildByJql(projects, issueLinkType, issueParent).then(
            (childOfParent) => {
              loadChild(updatedTaskData, issueParent.key, childOfParent);

              issueParent.issues = childOfParent;
              issueParent.issues.forEach((item) => {
                const child = getIssueLinkChilds(issueLinkType, item.issuelinks);
                // load reservation issue childs's childs (only id and key)
                loadChild(updatedTaskData, item.key, child);
              });

              setTaskData(updatedTaskData);
            }
          );
        }
    }
      const id = getTaskId(event.dataItem);
      const newExpandedState = event.value
        ? expandedState.filter((currentId) => currentId !== id)
        : [...expandedState, id];
      setExpandedState(newExpandedState);
    },
    [expandedState, taskData]
  );

  const onSelect = React.useCallback(
    (event) => setSelectedIdState(getTaskId(event.dataItem)),
    [setSelectedIdState]
  );

  const onEdit =
    (event) =>{ 
      setEditItem(clone(event.dataItem))
    };

  const onAdd = React.useCallback(
    (event) => {
      const { syntheticEvent, nativeEvent, target, ...others } = event;
      const newData = addTask({
        ...others,
        taskModelFields: taskModelFields,
        dataTree: taskData,
        defaultDataItem: {
          [taskModelFields.title]: "New task",
          [taskModelFields.id]: guid(),
          [taskModelFields.percentComplete]: 0,
        },
      });
      setTaskData(newData);
    },
    [taskData]
  );

  // handle when user double click on row and click submit to update
  const onFormSubmit = React.useCallback(
    (event) => {
      // update to jira
      const newIssueData = event.dataItem;
      const startDate = newIssueData.start.toISOString().substr(0, 10);
      const endDate = newIssueData.end.toISOString().substr(0, 10);

      let body = {
        fields: {
          summary: newIssueData.title,
          customfield_10015: startDate,
          duedate: endDate,
        },
      };
      updateIssue(JSON.stringify(body), newIssueData.key).then(() => {
        showSuccessFlag(UPDATE_SUCCESSFUL);
      });

      const newData = updateTask({
        updatedDataItem: newIssueData,
        taskModelFields: taskModelFields,
        dataTree: taskData,
      });
      setEditItem(null);
      setTaskData(newData);
    },
    [taskData, setTaskData, setEditItem]
  );
  const onFormCancel = React.useCallback(
    () => setEditItem(null),
    [setEditItem]
  );
  const onRemove = React.useCallback(
    (event) => setRemoveItem(event.dataItem),
    [setRemoveItem]
  );
  const onRemoveConfirm = React.useCallback(
    (event) => {
      const newData = removeTask({
        removedDataItem: event.dataItem,
        taskModelFields: taskModelFields,
        dataTree: taskData,
      });
      setRemoveItem(null);
      setTaskData(newData);
    },
    [taskData, setTaskData, setRemoveItem]
  );
  const onRemoveCancel = React.useCallback(
    () => setRemoveItem(null),
    [setRemoveItem]
  );
  const onDependencyCreate = React.useCallback(
    (event) => {
      const newData = addDependency({
        dependencyData,
        fromId: event.fromId,
        toId: event.toId,
        type: event.type,
        dependencyModelFields,
        defaultDataItem: {
          [dependencyModelFields.id]: guid(),
        },
      });
      setDependencyData(newData);
    },
    [setDependencyData, dependencyData]
  );

  // process data from library
  const processedData = React.useMemo(() => {
    const filteredData = filterBy(
      taskData,
      dataState.filter,
      taskModelFields.children
    );
    const sortedData = orderBy(
      filteredData,
      dataState.sort,
      taskModelFields.children
    );
    return mapTree(sortedData, taskModelFields.children, (task) =>
      extendDataItem(task, taskModelFields.children, {
        [taskModelFields.isExpanded]: expandedState.includes(getTaskId(task)),
        [taskModelFields.isSelected]: selectedIdState === getTaskId(task),
      })
    );
  }, [taskData, dataState, expandedState, selectedIdState]);

  // grouping features
  
  // fetch issue with ordered (issue has grouped fields first), so we can see it in the first page
  const fetchOrderedIssueForGrouping = async (groupFetching) => {
    await onQuery(
      projects,
      issueLinkType,
      issueKey,
      dateRange,
      fixedVersions,
      skip,
      take,
      groupFetching,
      team,
      sprints,
      status
    );
  };

  // get list of sprint from issue array and add issues as child of it
  const groupIssueBySprint = () => {
    const sprints = getSprints(taskData);
    const issueswithSprint = getIssuesGroupBySprint(sprints, taskData);
    setTaskData(issueswithSprint);
  }

  // get list of assignee from issue array and add assignees as child of it
  const groupIssueByAssignee = () => {
    const assignees = getAssigneeGroups(taskData);
    const issueswithAssignee = getIssuesGroupByUser(assignees, taskData);
    setTaskData(issueswithAssignee);
  }

  // execute grouping when user change grouping type or change the page when grouping is actived
  useEffect(() => {
    (async () => {
      if (!isGrouping && groupBy === GROUP_BY_TYPE.SPRINT) {
        const groupType = { type: GROUP_BY_TYPE.SPRINT };
        await fetchOrderedIssueForGrouping(groupType);
        setIsGrouping(true);
      }
      if (!isGrouping &&groupBy === GROUP_BY_TYPE.USER) {
        const groupType = { type: GROUP_BY_TYPE.USER };
        await fetchOrderedIssueForGrouping(groupType);
        setIsGrouping(true);
      }
      if (!isGrouping &&groupBy === GROUP_BY_TYPE.NONE) {
        await fetchOrderedIssueForGrouping(undefined);
      }
    })();
  }, [groupBy, skip]);

  // when isGrouping change, execute grouping
  useEffect(()=>{
    if (isGrouping && groupBy === GROUP_BY_TYPE.SPRINT) {
      groupIssueBySprint();
      setIsGrouping(false);
    }
    if (isGrouping && groupBy === GROUP_BY_TYPE.USER) {
      groupIssueByAssignee();
      setIsGrouping(false);
    }
  }, [isGrouping])

   // end grouping features

  return (
    <React.Fragment>
      {/* <Button onClick={()=>setIsShowCriticalPath(!isShowCriticalPath)}>Show/Hide Critical Path</Button> */}
      <Gantt
        style={ganttStyle}
        taskData={processedData}
        taskModelFields={taskModelFields}
        dependencyData={dependencyData}
        dependencyModelFields={dependencyModelFields}
        columns={columns}
        reorderable={true}
        sortable={true}
        sort={dataState.sort}
        // filter={dataState.filter}
        navigatable={true}
        onExpandChange={onExpandChange}
        onDataStateChange={onDataStateChange}
        // toolbar={{
        //   addTaskButton: true,
        // }}
        onAddClick={onAdd}
        onTaskClick={onSelect}
        onRowClick={onSelect}
        onTaskDoubleClick={onEdit}
        onRowDoubleClick={onEdit}
        onTaskRemoveClick={onRemove}
        onDependencyCreate={onDependencyCreate}
      >
        <GanttWeekView />
        <GanttDayView />
        <GanttMonthView />
        <GanttYearView />
      </Gantt>
      {editItem && (
        <GanttForm
          dataItem={editItem}
          onSubmit={onFormSubmit}
          onCancel={onFormCancel}
          onClose={onFormCancel}
        />
      )}
      {removeItem && (
        <GanttRemoveDialog
          dataItem={removeItem}
          onConfirm={onRemoveConfirm}
          onCancel={onRemoveCancel}
          onClose={onRemoveCancel}
        />
      )}
    </React.Fragment>
  );
}

export default IssueGantt;
