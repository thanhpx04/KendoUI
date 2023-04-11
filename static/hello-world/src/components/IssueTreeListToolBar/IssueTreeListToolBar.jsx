import {
  Button,
  DropDownButton,
  DropDownButtonItem,
} from "@progress/kendo-react-buttons";
import { issueType } from "./issueType";
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

const IssueTreeListToolBar = ({ setIsLoading, onQuery, columns }) => {
  const [{ data, inEdit, groupBy }, { setData, setInEdit, setGroupBy }] =
    useTreeListStore();

  const [{ projects, issueLinkType, dateRange, fixedVersions, issueKey, team, sprints }, {}] = useFilterOptionsStore();

  const createNewItem = () => {
    const timestamp = new Date().getTime();
    return {
      id: timestamp,
      isNew: true,
    };
  };

  const findDataItemByID = (id, dataSource) => {
    let result = undefined;
    if (dataSource === undefined) return undefined;
    else {
      for (const dataItem of dataSource) {
        if (dataItem.id === id) return dataItem;
        else {
          if (dataItem.issues?.length > 0)
            result = findDataItemByID(id, dataItem.issues);
          if (result) return result;
        }
      }
    }
  };

  const addRecord = (issueTypeName) => {
    const newRecord = createNewItem();
    newRecord.issueType = issueTypeName;
    setData([newRecord, ...data]);
    setInEdit([...inEdit, { ...newRecord }]);
  };

  const reload = () => {
    const skip = 0;
    const take = 20;
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
      sprints
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
      inEdit.map(async (itemEdit) => {
        let issue = findDataItemByID(itemEdit.id, data);

        //Create new issue
        if (issue.isNew) {
          let body = {
            fields: {
              summary: issue.summary,
              project: {
                key: projects[0].key,
              },
              issuetype: {
                id: issue.issueType,
              },
              assignee: {
                id: issue["assignee.displayName"].id || null,
              },
            },
          };
          createIssue(JSON.stringify(body)).then((result) => {
            if (issue.parentKey) {
              linkNewIssue(result.key, issue.parentKey, issueLinkType);
            }
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
      })
    ).then(async () => {
      await delay(500);
      reload();
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
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
            style={{
              width: "10vw",
            }}
          />
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
