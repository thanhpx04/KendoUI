import { clone, getter, guid } from "@progress/kendo-react-common";
import {
  addDependency, addTask, extendDataItem, filterBy, Gantt, GanttDateFilter, GanttDayView, GanttForm, GanttMonthView, GanttRemoveDialog, GanttTextFilter, GanttWeekView, GanttYearView, mapTree, orderBy, removeTask, updateTask
} from "@progress/kendo-react-gantt";
import React, { useEffect, useState } from "react";
import { findChildByJql, getIssueLinkChilds } from "../../services/fetchData";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import { useTreeListStore } from "../../stores/TreeListStore";
import { getDepth, loadChild } from "../../utils/common-utils";
import Pagination from "../DataTable/Pagination/Pagination";


const ganttStyle = {
  height: "100%",
  width: "100%",
};
const taskModelFields = {
  id: "key",
  start: "start",
  end: "end",
  title: "summary",
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
    title: "KEY",
    width: 120,
  },
  {
    field: taskModelFields.title,
    title: "Title",
    expandable: true,
    width: 200,
    filter: GanttTextFilter,
  },
  {
    field: taskModelFields.start,
    title: "Start",
    width: 120,
    format: "{0:MM/dd/yyyy}",
    filter: GanttDateFilter,
  },
  {
    field: taskModelFields.end,
    title: "End",
    width: 120,
    format: "{0:MM/dd/yyyy}",
    filter: GanttDateFilter,
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
  const [{ data: taskData }, 
    { setData: setTaskData }
  ] = useTreeListStore();
  const [{ projects, issueLinkType, columnsState }, {setColumnsState}] = useFilterOptionsStore();

  // critical path
  const idList = taskData.map(data=>data.key);
  const criticalIds = ["GT-8","GT-7","GT-6","GT-5"];

  const notCriticalIds = idList.filter(
    (id) => !criticalIds.includes(id)
  );

  const [isShowCriticalPath, setIsShowCriticalPath] = useState(false);
  
  const setCriticalElementColor = (elementSelector) => {
    document.querySelectorAll(elementSelector).forEach((taskDiv) => {
      if (taskDiv) {
        taskDiv.style.backgroundColor = 'red';
      }
    });
  }

  const setNonCriticalElement = (elementSelector) => {
    document.querySelectorAll(elementSelector).forEach((taskDiv) => {
      if (taskDiv) {
        taskDiv.style.opacity = '0.4';
      }
    });
  }

  const setDefaultCriticalPath = (elementSelector) => {
    document.querySelectorAll(elementSelector).forEach((taskDiv) => {
      if (taskDiv) {
        taskDiv.style.opacity = '1';
        taskDiv.style.backgroundColor = '#606060'
      }
    });
  }

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

  const disableCriticalPath = () => {
    idList.forEach((d) => {
      setDefaultCriticalPath(`[data-task-id="${d}"]`);
      setDefaultCriticalPath(`[data-task-id="${d}"] .k-task-complete`);
    });
  }

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
  const [expandedState, setExpandedState] = useState([7, 11, 12, 13]);
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
  const onEdit = React.useCallback(
    (event) => setEditItem(clone(event.dataItem)),
    [setEditItem]
  );
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
  const onFormSubmit = React.useCallback(
    (event) => {
      const newData = updateTask({
        updatedDataItem: event.dataItem,
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
        filter={dataState.filter}
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
      <Pagination isLoading={isLoading} onQuery={onQuery}/>
    </React.Fragment>
  );
}

export default IssueGantt;
