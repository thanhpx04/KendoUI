import * as React from "react";
import {
  DropDownButton,
  DropDownButtonItem,
} from "@progress/kendo-react-buttons";
import { issueType } from "../IssueTreeListToolBar/issueType";
import { SUB_TASK } from "../../configs/idConfig";
export default function CommandCell(
  enterEdit,
  remove,
  save,
  cancel,
  addChild,
  editField,
  bundleSave,
  viewDetails
) {
  // eslint-disable-next-line react/display-name
  return class extends React.Component {
    render() {
      const { dataItem } = this.props;
      if (dataItem.type === "SPRINT") {
        return <td key={dataItem.key}></td>;
      }
      return dataItem[editField] ? (
        <td>
          <button
            id={dataItem.key}
            ref={(ele) => (bundleSave.current[dataItem.key] = ele)}
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
            onClick={() => save(dataItem)}
          >
            {<span className="k-icon k-i-check"></span>}
          </button>
          <button
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
            onClick={() => cancel(dataItem)}
          >
            <span className="k-icon k-i-cancel-outline"></span>
          </button>
        </td>
      ) : (
        <td>
          <DropDownButton
            themeColor="info"
            icon={"k-icon k-i-plus"}
            onItemClick={(event) => addChild(dataItem, event.item.text)}
          >
            {issueType.map((value) => {
              if (value.id !== SUB_TASK) {
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
          <button
            className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
            onClick={() => enterEdit(dataItem)}
          >
            <span className="k-icon k-i-edit"></span>
          </button>
          {dataItem.issues !== undefined && (
            <button
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
              onClick={() => viewDetails(dataItem)}
            >
              <span className="k-icon k-i-preview"></span>
            </button>
          )}
        </td>
      );
    }
  };
}
