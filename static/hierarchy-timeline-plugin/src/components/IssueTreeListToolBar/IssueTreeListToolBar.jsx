import {
  Button,
  DropDownButton,
  DropDownButtonItem,
} from "@progress/kendo-react-buttons";
import { getIdFromIssueTypeName, issueType } from "./issueType";
import SaveFilter from "../FilterManagement/SaveFilter";
import { TreeListToolbar } from "@progress/kendo-react-treelist";
import { invoke } from "@forge/bridge";
import React, { useState } from "react";
import {
  assigneeIssue,
  createIssue,
  getStorage,
  linkNewIssue,
  transitionIssue,
  updateIssue,
} from "../../services/service";
import * as idConfig from "../../configs/idConfig";
import { useTreeListStore } from "../../stores/TreeListStore";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import DynamicColumns from "./DynamicColumns";
import './toolbar.css'
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { groupFields, GROUP_BY_TYPE } from "../../constants/groupBy";
import { DEFAULT_TAKE_PAGINATION } from "../../constants/pagination";
import { showFlag } from '@forge/bridge';
import { showErrorFlag, showWarningFlag, showSuccessFlag } from "../../services/flag-service";
import log from 'loglevel';
import { SOMETHING_WENT_WRONG, SUMMARY_AND_TEAM_SELECT_ALL_ISSUE } from "../../constants/flag-message";
import { createNewItem } from "../../utils/common-utils";

const IssueTreeListToolBar = ({ setIsLoading, onQuery, columns }) => {
  const [{ data, inEdit, groupBy }, { setData, setInEdit, setGroupBy }] =
    useTreeListStore();

  const [{ projects, issueLinkType, dateRange, fixedVersions, issueKey, team, sprints, status }, {}] = useFilterOptionsStore();
  let allowSaveAll = false;

  const findDataItemByID = (id, dataSource) => {
    let result = undefined;
    if (dataSource === undefined) return undefined;
    else {
      for (const dataItem of dataSource) {
        if (dataItem.id === id) 
          {
            if(dataItem.hasOwnProperty("summary") && dataItem.hasOwnProperty("team") && dataItem.summary !== "" && dataItem.team !== null)
            {
              return dataItem;
            }
            else
            {
              showWarningFlag(SUMMARY_AND_TEAM_SELECT_ALL_ISSUE);
              return undefined;
            }
          }
        else 
          {
            if (dataItem.issues?.length > 0)
            result = findDataItemByID(id, dataItem.issues);
            if (result) return result;
          }
      }
    }
  };

  const addRecord = async (issueTypeName) => {
    const newRecord = createNewItem(projects, fixedVersions, team, sprints);
    newRecord.issueType = issueTypeName;
    setData([newRecord, ...data]);
    setInEdit([...inEdit, { ...newRecord }]);
  };

  const reload = () => {
    const skip = 0;
    const take = DEFAULT_TAKE_PAGINATION;
    setGroupBy("None");
    onQuery(
      projects,
      issueLinkType,
      issueKey,
      dateRange,
      fixedVersions,
      skip,
      take,
      undefined,
      team,
      sprints,
      status
    );
  };

  const debug = async () => {
    invoke("getAccountID").then(async (accountId) => {
      let value = await getStorage(accountId);
    });
  };

  const saveAll = async () => {
    setIsLoading(true);
    Promise.all(
      inEdit.map(async (itemEdit) => 
      {
        if(allowSaveAll === false)
        {
        let issue = findDataItemByID(itemEdit.id, data);
        if(issue === undefined)
        {
          allowSaveAll = true;
          return;
        }
        else{
        //Create new issue
        if (issue.isNew) {
          let body = {
            fields: {
              summary: issue.summary,
              project: {
                key: issue.project.key,
              },
              issuetype: {
                id: getIdFromIssueTypeName(issue.issueType),
              },
              assignee: {
                id: issue["assignee.displayName"]?.id || null,
              },
            },
          };

          if (issue.storyPoint) {
            body.fields[idConfig.STORY_POINT_CUSTOM_FIELD] = issue.storyPoint;
          }
          
          if (issue.sprint) {
            body.fields[idConfig.SPRINT_CUSTOM_FIELD] = issue.sprint.id
          }
          if (issue.team) {
            body.fields[idConfig.TEAM_CUSTOM_FIELD] = issue.team.externalId;
          }
          if (issue.fixVersions) {
            body.fields.fixVersions = [{id: issue.fixVersions.id}];
          }

          createIssue(JSON.stringify(body)).then((result) => {
            if (issue.parentKey) {
              linkNewIssue(result.key, issue.parentKey, issueLinkType);
            }
          }).catch((e)=>{
            showErrorFlag(SOMETHING_WENT_WRONG);
            log.error(e);
          });
        } else {
          let body = {
            fields: {
              summary: issue.summary,
            },
          };
          body.fields = {
            ...body.fields,
            ...(issue.storyPoint && {
              [idConfig.STORY_POINT_CUSTOM_FIELD]: issue.storyPoint,
            }),
          };
          if (issue["status.text"]) {
            issue["status"].text = issue["status.text"].text;
            await transitionIssue(issue.key, issue["status.text"].id);
          }
          if (issue["assignee.displayName"]) {
            issue.assignee = {
              displayName: issue["assignee.displayName"].text,
              accountId: issue["assignee.displayName"].id,
            };
            await assigneeIssue(issue.key, issue["assignee.displayName"].id);
          }
          await updateIssue(JSON.stringify(body), issue.key);
        }
        allowSaveAll = false;
      }
      }
    })
    ).then(async () => {
      if(!allowSaveAll)
      {
        setInEdit([]);
        await delay(500);
        reload();
      }
      setIsLoading(false);
    }).catch((e)=>{
      showErrorFlag(SOMETHING_WENT_WRONG);
      log.error(e);
    });
  };

  const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  const handleChangeGroupField = (e) => {
    setGroupBy(e.value);
  }

  return (
    <TreeListToolbar>
      <div className="treelist-toolbar-container">
        <div className="treelist-toolbar">
          <DropDownButton
            themeColor="info"
            text={"Add new"}
            onItemClick={(event) => addRecord(event.item.text)}
          >
            {issueType.map((value) => {
              if (value.id !== idConfig.SUB_TASK) {
                return (
                  <DropDownButtonItem
                    key={value.id}
                    imageUrl={value.icon}
                    text={value.type}
                    id={value.id}
                  ></DropDownButtonItem>
                );
              }
            })}
          </DropDownButton>
          <Button
            size={"medium"}
            themeColor={"base"}
            fillMode={"solid"}
            rounded={"medium"}
            onClick={reload}
          >
            Reload
          </Button>
          <span>Group by: </span>
          <DropDownList
            data={groupFields}
            value={groupBy}
            onChange={handleChangeGroupField}
          />&nbsp;
          {inEdit.length > 0 && (
            <button
              title="Save All"
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary"
              onClick={saveAll}
            >
              Save All
            </button>
          )}
        </div>
        <DynamicColumns columns={columns} />
      </div>
    </TreeListToolbar>
  );
};

export default IssueTreeListToolBar;
