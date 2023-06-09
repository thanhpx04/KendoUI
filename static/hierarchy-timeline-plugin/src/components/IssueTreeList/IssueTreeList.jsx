import { getter } from "@progress/kendo-react-common";
import {
  extendDataItem,
  getSelectedState,
  mapTree,
  modifySubItems,
  moveTreeItem, removeItems,
  TreeList,
  TreeListDraggableRow,
  TreeListSelectionCell,
  TreeListTextEditor
} from "@progress/kendo-react-treelist";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as idConfig from "../../configs/idConfig";
import { GROUP_BY_TYPE } from "../../constants/groupBy";
import { SUBTASK } from "../../constants/issueType";
import { ASSIGNEE, SPRINT } from "../../constants/tags";
import { findChildByJql, getIssueLinkChilds } from "../../services/fetchData";
import updateIssueLink, {
  assigneeIssue,
  createIssue, getIssue, linkNewIssue, transitionIssue,
  updateIssue
} from "../../services/service";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import { useTreeListStore } from "../../stores/TreeListStore";
import { arraysEqualUpToLast, createNewItem, getDepth, getElementById, getNodeFromIndexes, getParentIndexes, loadChild } from "../../utils/common-utils";
import { getAssigneeGroups, getIssuesGroupBySprint, getIssuesGroupByUser, getSprints } from "../../utils/group-utils";
import BlockerHyperlinkCell from "../Cell/BlockerHyperlinkCell";
import CommandCell from "../Cell/CommandCell";
import IssueKeyCell from "../Cell/IssueKeyCell";
import SummaryCell from "../Cell/SummaryCell";
import { AssigneeDropdown } from "../DropDown/AssigneeDropDown";
import FixVersionsDropDown from "../DropDown/FixVersionsDropDown";
import SprintDropDown from "../DropDown/SprintDropDown";
import { StoryPointDropDown } from "../DropDown/StoryPointDropDown";
import { ProjectDropDown } from "../DropDown/ProjectDropDown";
import TeamDropDown from "../DropDown/TeamDropDown";
import TransitionDropDown from "../DropDown/TransitionDropDown";
import IssueTreeListToolBar from "../IssueTreeListToolBar/IssueTreeListToolBar";
import { getIdFromIssueTypeName } from "../IssueTreeListToolBar/issueType";
import './issue-tree-list.css';
import { COL_WIDTH_SUMMARY } from "../../constants/table";
import { showErrorFlag, showWarningFlag, showSuccessFlag } from "../../services/flag-service";
import { MOVING_ISSUE_TO_NEW_ASSIGNEE, MOVING_SPRINT_ERROR, MOVING_SUBTASK_TO_ANOTHER_SPRINT, SAME_LEVEL_SELECT, SUMMARY_AND_TEAM_SELECT, SUMMARY_SELECT, TEAM_SELECT, UPDATE_SUCCESSFUL } from "../../constants/flag-message";
import log from 'loglevel';

const columns = [
  {
    field: "key",
    title: "Issue Key",
    expandable: true, //alow expand
    cell: IssueKeyCell,
    width: "10%",
  },
  {
    field: "summary",
    title: "Summary",
    width: COL_WIDTH_SUMMARY,
    editCell: (props) =>
      props.dataItem.isNew ? ProjectDropDown(props) : TreeListTextEditor(props),
    cell: SummaryCell
  },
  {
    field: "assignee.displayName",
    title: "Assignee",
    editCell: AssigneeDropdown,
  },
  {
    field: "status.text",
    title: "Status",
    editCell: (props) =>
      props.dataItem.isNew ? <td></td> : TransitionDropDown(props),
  },
  {
    field: "storyPoint",
    title: "Story Point",
    editCell: (props) =>
      props.dataItem.issueType === "Story" ? (
        StoryPointDropDown(props)
      ) : (
        <td></td>
      ),
    sortable: false
  },
  {
    field: "blockers",
    title: "Blocker",
    cell: BlockerHyperlinkCell,
    sortable: false
  },
  {
    field: "team.title",
    title: "Team",
    sortable: false,
    editCell: TeamDropDown,
  },
  {
    field: "sprint.name",
    title: "Sprint",
    sortable: false,
    editCell: SprintDropDown,
  },
  {
    field: "fixVersions.name",
    title: "Fix versions",
    sortable: false,
    editCell: FixVersionsDropDown
  },
];
const DATA_ITEM_KEY = "id";
const idGetter = getter(DATA_ITEM_KEY);
const subItemsField = "issues";
const expandField = "expanded";
const editField = "inEdit";

const IssueTreeList = ({ setIsLoading, setNewFilter, myFilters, onQuery }) => {

  let bundleSave = useRef({});
  const [{ data, expanded, inEdit, sort, groupBy, isGrouping, skip, take, total, status },
     { setData, setExpanded, setInEdit, setSkip, setTake, setSort, setIsGrouping, setTotal, setGroupBy }] =
    useTreeListStore();

  const [{ projects, issueLinkType, columnsState, dateRange, fixedVersions, sprints, team, issueKey },
     {setColumnsState, setFilterOptions}] = useFilterOptionsStore();

  const [selectedState, setSelectedState] = React.useState({});
  const [selectedIds, setSelectedIds] = React.useState([]);

  const onExpandChange = (event) => {
    const issueParent = event.dataItem;
    // sprint will have isIssue property set to false
    if (event.dataItem.hasOwnProperty("isIssue") && event.value === false) {
      const issueParent = event.dataItem; // this is sprint
      issueParent.issues.forEach((item) => {
        const child = getIssueLinkChilds(issueLinkType, item.issuelinks);
        // load reservation issue childs's childs (only id and key)
        loadChild(data, item.key, child);
      });
      setData(data);

      setExpandedGeneral(event);
      return;
    }
    // event.value === false: currently closed
    // only load childs if the issue is never expanded (issue only has one child)
    if (event.value === false && getDepth(issueParent) <= 2) {
        findChildByJql(
          projects,
          issueLinkType,
          issueParent
        ).then((childOfParent) => {
          // load current issue childs into tree list, not current issue
          loadChild(data, issueParent.key, childOfParent);
          // assign found childs to current issue
          issueParent.issues = childOfParent;
          issueParent.issues.forEach((item) => {
            const child = getIssueLinkChilds(issueLinkType, item.issuelinks);
            // load reservation issue childs's childs (only id and key)
            loadChild(data, item.key, child);
        });
          setData(data);
          setExpandedGeneral(event);
        });   
    }
    setExpandedGeneral(event);
  };

  function setExpandedGeneral(event) {
    setExpanded({
      ...expanded,
      [idGetter(event.dataItem)]: !event.value
  });
  }

  const onItemChange = (event) => {
    const field = event.field;
    setData(
      mapTree(data, subItemsField, (item) =>
        item.id === event.dataItem.id
          ? extendDataItem(item, subItemsField, {
              [field]: event.value,
            })
          : item
      )
    );
  };

  const extendData = (data, selectedState, expandedState) => {
    return mapTree(data, subItemsField, (item) =>
      extendDataItem(item, subItemsField, {
        [expandField]: expanded[idGetter(item)],
        [editField]: Boolean(inEdit.find((i) => i.id === item.id)),
        selected: selectedState[idGetter(item)]
      })
    );
  };

  const addChild = (dataItem, issueTypeName) => {
    const newRecord = createNewItem(projects, fixedVersions, team, sprints);
    newRecord.parentKey = dataItem.key;
    newRecord.issueType = issueTypeName;
    setInEdit([...inEdit, newRecord]);
    setExpanded({...expanded, [dataItem.id]: true});
    setData(
      modifySubItems(
        data,
        subItemsField,
        (item) => item.id === dataItem.id,
        (subItems) => [newRecord, ...subItems]
      )
    );
  };

  const enterEdit = (dataItem) => {
    setInEdit([...inEdit, extendDataItem(dataItem, subItemsField)]);
  };

  const save = (dataItem) => {
    //console.log("event in save:",event);
    if(dataItem.hasOwnProperty("summary") && dataItem.hasOwnProperty("team") && dataItem.summary !== "" && dataItem.team !== null)
    {
    //console.log('save init data', data);
    const { isNew, ...itemToSave } = dataItem;
    console.log(itemToSave)
    if (isNew === true) {
      let body = {
        fields: {
          summary: itemToSave.summary,
          project: {
            key: itemToSave.project.key,
          },
          issuetype: {
            id: getIdFromIssueTypeName(itemToSave.issueType)
          },
          assignee: {
            id:
              itemToSave["assignee.displayName"] !== undefined
                ? itemToSave["assignee.displayName"].id
                : null,
          },
        },
      };

      if (itemToSave.storyPoint) {
        body.fields[idConfig.STORY_POINT_CUSTOM_FIELD] = itemToSave.storyPoint;
      }
      
      if (itemToSave.sprint) {
        body.fields[idConfig.SPRINT_CUSTOM_FIELD] = itemToSave.sprint.id
      }
      if (itemToSave.team) {
        body.fields[idConfig.TEAM_CUSTOM_FIELD] = itemToSave.team.externalId;
      }
      if (itemToSave.fixVersions) {
        body.fields.fixVersions = [{id: itemToSave.fixVersions.id}];
      }
      createIssue(JSON.stringify(body)).then((result) => {
        getIssue(result.id).then((issue) => {
          itemToSave.status = {
            text: issue.fields.status.name,
          }
          itemToSave.key = result.key;

          console.log('save', mapTree(data, subItemsField, (item) =>
            item.id === itemToSave.id ? itemToSave : item));

          setData(
            mapTree(data, subItemsField, (item) =>
              item.id === itemToSave.id ? itemToSave : item
            )
          );
          if (dataItem.parentKey !== undefined) {
            linkNewIssue(result.key, dataItem.parentKey, issueLinkType);
          }
          if (itemToSave["assignee"]) {
            assigneeIssue(itemToSave.key, itemToSave.assignee.id);
          }
        });
        setInEdit(inEdit.filter((i) => i.id !== itemToSave.id));
      }).catch((e)=>{
        showErrorFlag(SOMETHING_WENT_WRONG);
        log.error(e);
      });
    } else {
      let body = {
        fields: {
          summary: itemToSave.summary,
          //sprint
          [idConfig.SPRINT_CUSTOM_FIELD]: itemToSave.sprint.id,
          [idConfig.TEAM_CUSTOM_FIELD]: itemToSave.team?.externalId
        },
      };

      if (itemToSave.storyPoint) {
        body.fields[idConfig.STORY_POINT_CUSTOM_FIELD] = itemToSave.storyPoint;
      }

      if (itemToSave["status.text"]) {
        if (!itemToSave["status"]) {
          itemToSave.status = {};
          itemToSave.status.text = itemToSave["status.text"].text;
        } else {
          itemToSave["status"].text = itemToSave["status.text"].text;
        }
        transitionIssue(itemToSave.key, itemToSave["status.text"].id);
      }
      if (itemToSave["assignee"]) {
        assigneeIssue(itemToSave.key, itemToSave.assignee.id);
      }
      if (itemToSave.fixVersions) {
        body.fields.fixVersions = [{id: itemToSave.fixVersions.id}];
      }
      updateIssue(JSON.stringify(body), itemToSave.key).then((result) => {
        setData(
          mapTree(data, subItemsField, (item) =>
            item.id === itemToSave.id ? itemToSave : item
          )
        );
      }).catch((e)=>{
        showErrorFlag(SOMETHING_WENT_WRONG);
        log.error(e);
      });
      setInEdit(inEdit.filter((i) => i.id !== itemToSave.id));
      showSuccessFlag(UPDATE_SUCCESSFUL);
    }
  }
  else
  {
    if(!dataItem.hasOwnProperty("summary") && !dataItem.hasOwnProperty("team") ||(dataItem.summary === "" && dataItem.team === null))
    {
      showWarningFlag(SUMMARY_AND_TEAM_SELECT);
    }
    else if(!dataItem.hasOwnProperty("summary") || dataItem.summary === "")
    {
      showWarningFlag(SUMMARY_SELECT);
    }
    else
    {
      showWarningFlag(TEAM_SELECT);
    }
  }
  };

  const cancel = (editedItem) => {
    if (editedItem.isNew) {
      return remove(editedItem);
    }
    setData(
      mapTree(data, subItemsField, (item) =>
        item.id === editedItem.id ? inEdit.find((i) => i.id === item.id) : item
      )
    );
    setInEdit(inEdit.filter((i) => i.id !== editedItem.id));
  };

  const remove = (dataItem) => {
    setData(removeItems(data, subItemsField, (i) => i.id === dataItem.id));
    setInEdit(inEdit.filter((i) => i.id !== dataItem.id));
  };

  const viewDetails = (dataItem) => {
    setData([dataItem]);
  };

  const commandCell = CommandCell(
    enterEdit,
    remove,
    save,
    cancel,
    addChild,
    editField,
    bundleSave,
    viewDetails
  );

  const onRowDrop = (event) => {
    // check not move sprint/user grouping
    if (event.draggedItem?.type === SPRINT || event.draggedItem?.type === ASSIGNEE) {
      showErrorFlag(MOVING_SPRINT_ERROR);
      return;
    }
    let destinationLevel = event.draggedOver;
    let moveToLv0 = false;

    // if there is no destination, move to level 0
    if (!destinationLevel) {
      moveToLv0 = true;
    }

    // get new and old parent index and items
    const newParentIndex = destinationLevel && [...destinationLevel];
    const newParent = destinationLevel && getItemByIndex(data, newParentIndex);
    const oldParentIndex = [...event.dragged].slice(0, -1);
    const oldParent = getItemByIndex(data, oldParentIndex);

    // prevent move issue to another assignee
    if (newParent?.type === ASSIGNEE) {
      showErrorFlag(MOVING_ISSUE_TO_NEW_ASSIGNEE);
      return;
    }

    if (selectedIds.length > 0) {
      // setIsLoading(true);
      // update issueLinks
      const selectedItems = selectedIds.map((id) => getElementById(data, id));

      for (let i = 0; i < selectedItems.length; i++) {
        // prevent move subtask 
        if (isMovedSubtask(selectedItems[i])) {
          break;
          return;
        }
      }

      (async () => {
        let updateList = [];
        // update sprint
        if (newParent?.type === SPRINT) {
          const updateSprintBody = {
            fields: { [idConfig.SPRINT_CUSTOM_FIELD]: newParent.id !== 0 ? newParent.id : null },
          };
          updateList = selectedItems.map((item) =>
            updateIssue(JSON.stringify(updateSprintBody), item.key)
          )
        } else {
          // update issue link
          updateList = selectedItems.map((item) =>
            updateIssueLink(newParent, oldParent, item, issueLinkType)
          )
        }

        Promise.all(
          updateList
        ).then(() => {
          // update data tree
          // get init ids of src and des ids
          const destinationItemId = moveToLv0 ? null : getNodeFromIndexes(data, destinationLevel).id;

          // move first node
          const initSourceLevel = getParentIndexes(data, selectedIds[0]);
          const initDestinationLevel = moveToLv0 ? null : destinationLevel;
          let newData = moveTreeItem(data, initSourceLevel, initDestinationLevel, subItemsField);

          for (let i = 1; i < selectedIds.length; i++) {
            // move from second node, need update level indexes after every move
            const srcLevel = getParentIndexes(newData, selectedIds[i]);
            const desLevel = moveToLv0 ? null : getParentIndexes(newData, destinationItemId);
            newData = moveTreeItem(data, srcLevel, desLevel, subItemsField);
          }

          // dragged item still apear with lv0, clear from newData
          newData = newData.filter((item) => !selectedIds.includes(item.id));
          if (moveToLv0) newData = newData.concat(selectedItems);

          setSelectedState({});
          setSelectedIds([]);
          setData(newData);
        }).catch((e)=>{
          showErrorFlag(SOMETHING_WENT_WRONG);
          log.error(e);
        });
      })();
    } else {
      if (isMovedSubtask(event.draggedItem)) return;
      // update sprint
      if (newParent?.type === SPRINT) {
        const updateSprintBody = {
          fields: { [idConfig.SPRINT_CUSTOM_FIELD]: newParent.id !== 0 ? newParent.id : null },
        };
        updateIssue(JSON.stringify(updateSprintBody), event.draggedItem.key)
      } else {
        // update issue link
        updateIssueLink(newParent, oldParent, event.draggedItem, issueLinkType);
      }
      setData(
        moveTreeItem(data, event.dragged, destinationLevel, subItemsField)
      );
    }
  };

  const isMovedSubtask = (issue) => {
    if (issue.issueType === SUBTASK) {
      showErrorFlag(MOVING_SUBTASK_TO_ANOTHER_SPRINT);
      return true;
    }
    return false;
  }

  const getItemByIndex = (data, draggedOver) => {
    if (draggedOver.length === 0) return null;
    if (draggedOver.length === 1) return data[draggedOver[0]];
    else {
      let childIndex = [...draggedOver];
      childIndex.shift();
      return getItemByIndex(data[draggedOver[0]].issues, childIndex);
    }
  };

  const onPageChange = (event) => {
    const { skip, take } = event;
    setSkip(skip);
    setTake(take);
  };

  // dynamic columns
  const computedColumns = useMemo(() => {
    let newColumns = [];

    columnsState.forEach((column) => {
     const exist = columns.find((col) => column.title === col.title);
      if (exist && !exist.title !== 'Actions') {
        newColumns.push(exist);
      }
    });

    return newColumns;
  },[columnsState]);

  const columnsSelected = columnsState.length;

  const handleSortChange = (event) => {
    setSort(event.sort);
  };

  const onSelectionChange = React.useCallback(
    (event) => {
      // check the same the level
      if (
        selectedIds.length > 0 &&
        !arraysEqualUpToLast(
          getParentIndexes(data, selectedIds[0]),
          event.level
        )
      ) {
        showWarningFlag(SAME_LEVEL_SELECT);
        return;
      }

      // add/ remove to track level of selected records
      const targetLevelStr = event.dataItem.id;
      const selectedLevelSet = new Set(selectedIds);

      if (selectedLevelSet.has(targetLevelStr)) {
        selectedLevelSet.delete(targetLevelStr);
      } else {
        selectedLevelSet.add(targetLevelStr);
      }

      const newSelectedLevel = Array.from(selectedLevelSet);
      setSelectedIds(newSelectedLevel);

      const newSelectedState = getSelectedState({
        event,
        selectedState: selectedState,
        dataItemKey: DATA_ITEM_KEY
      });
      setSelectedState(newSelectedState);
    },
    [selectedState, selectedIds, data]
  );

  const groupIssueBySprint = () => {
    const sprints = getSprints(data);
    const issueswithSprint = getIssuesGroupBySprint(sprints, data);
    setData(issueswithSprint);
  }

  const groupIssueByAssignee = () => {
    const assignees = getAssigneeGroups(data);
    const issueswithAssignee = getIssuesGroupByUser(assignees, data);
    setData(issueswithAssignee);
  }

  useEffect(() => {
    (async () => {
      // isGrouping:use this to notify user reload before use other group
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
  }, [groupBy, skip, take]);

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

  const rowRender = (row, props) => {

    const backgroundImage = props.dataItem.type 
    && 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(149,204,230,0.9472163865546218) 38%, rgba(255,255,255,1) 100%)';

    const height = props.dataItem.type && '50px';

    const backgroundColor = props.dataItem.type 
    ? '#eeeeee' : "#ffffff";

    return React.cloneElement(row, {
      style: {
        backgroundColor,
        height
      }
    });
  }

  return (
    <>
    <div className="treelist-wrapper">
      <TreeList
        onPageChange={onPageChange}
        // expand field
        expandField={expandField}
        // edit field
        editField={editField}
        //child field
        subItemsField={subItemsField}
        // lazy loading
        onExpandChange={onExpandChange}
        // not use
        onItemChange={onItemChange}
        //store data
        data={extendData(data, selectedState, expanded)}
        // define column
        columns={[
          {
            title: " ",
            field: "selected",
            cell: TreeListSelectionCell,
            width: "1%"
          },
          ...computedColumns,
          {
            title: "Actions",
            cell: commandCell,
            sortable: false,
            width: "150px",
          },
        ]}
        // columns={columns}
        // set link issue when drag and drop
        onRowDrop={onRowDrop}
        // allow drag and drop
        row={TreeListDraggableRow}
        // resize
        resizable={true}
        toolbar={
          <IssueTreeListToolBar
            setIsLoading={setIsLoading}
            setNewFilter={setNewFilter}
            myFilters={myFilters}
            onQuery={onQuery}
            columns={columns}
          />
        }
        sortable={true}
        sort={sort}
        onSortChange={handleSortChange}
        onSelectionChange={onSelectionChange}
        rowRender={rowRender}
      />
    </div>
    </>
  );

}

export default IssueTreeList;
