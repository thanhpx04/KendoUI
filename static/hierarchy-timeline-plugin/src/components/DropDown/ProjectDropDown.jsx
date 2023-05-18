import { ComboBox } from "@progress/kendo-react-dropdowns";
import { TextBox } from "@progress/kendo-react-inputs";
// import { useState, useCallback } from "react";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";

export const ProjectDropDown = (props) => {

  const [{ projects }] = useFilterOptionsStore();

  const handleProjectChange = (event) => {
    if (props.onChange) {
      let obj = {
        dataItem: props.dataItem,
        level: props.level,
        field: "project",
        syntheticEvent: event,
        value: event.value,
      };
      props.onChange(obj);
    }
  };

  const handleSummaryChange = (event) => {
    if (props.onChange) {
      let obj = {
        dataItem: props.dataItem,
        level: props.level,
        field: "summary",
        syntheticEvent: event,
        value: event.value,
      };
      props.onChange(obj);
    }
  };

  return (
    <td>
      <div className='summary-cell-create-new'>
        <div className='left'>
          <ComboBox
            placeholder="Select project"
            data={projects}
            textField="projectName"
            dataItemKey="key"
            value={props.dataItem.project}
            onChange={handleProjectChange}
          />
        </div>
        <div className='right'>
          <TextBox
            placeholder="Input Summary"
            value={props.dataItem.summary}
            onChange={handleSummaryChange}
          />
        </div>
      </div>
    </td>
  );
};