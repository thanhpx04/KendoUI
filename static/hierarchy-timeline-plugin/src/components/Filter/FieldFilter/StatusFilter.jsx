import { requestJira } from "@forge/bridge";
import { useEffect, useState } from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { findFilter } from "../../../services/fetchData";

const getAllWorkflowStatus = async (props) => {
  const response = await requestJira(`/rest/api/3/status`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let result = await response.json();
  return result;
};

const StatusFilter = (props) => {
  let [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      let workflowStatusList = await getAllWorkflowStatus();
      setData(workflowStatusList);
    })();
  }, []);

  return (
    <span className="link-issue-type-wrapper">
      <DropDownList
        size="large"
        label="Status"
        value={props.value}
        data={data}
        textField="name"
        dataItemKey="id"
        onChange={(e) => {
          props.onChangeStatus(e.target.value);
        }}
      />
    </span>
  );
};
export default StatusFilter;
