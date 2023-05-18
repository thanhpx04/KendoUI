import { requestJira } from "@forge/bridge";
import { useEffect, useState } from "react";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { findFilter } from "../../../services/fetchData";
import "../filter-data.css"
const getIssueLinkType = async (props) => {
  const response = await requestJira(`/rest/api/3/issueLinkType`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let result = await response.json();
  return result.issueLinkTypes;
};

const createFilter = async (filterName, inward) => {
  let bodyData = {
    jql: `issueLinkType ="${inward}"`,
    name: filterName,
    sharePermissions: [{ type: "authenticated" }],
  };
  const response = await requestJira(`/rest/api/3/filter`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
};
const checkFilter = async (linktypes) => {
  linktypes.map(async (element) => {
    let exist = await findFilter(element.id);
    if (exist === undefined) {
      await createFilter(element.id, element.inward);
    }
  });
};
const LinkedIssueType = (props) => {
  let [data, setData] = useState([]);
  useEffect(() => {
    (async () => {
      let linktypes = await getIssueLinkType();
      setData(
        linktypes.map((ele) => {
          ele.text = `${ele.inward}\\${ele.outward}`;
          return ele;
        })
      );
      checkFilter(linktypes);
    })();
  }, []);
  return (
    <span className="link-issue-type-wrapper">
      <DropDownList
        size="large"
        label="Link issue type"
        value={props.value}
        data={data}
        textField="text"
        dataItemKey="id"
        onChange={(e) => {
          props.onChangeLinkIssueType(e.target.value);
        }}
      />
    </span>
  );
};
export default LinkedIssueType;
