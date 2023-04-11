import { requestJira } from "@forge/bridge";
import { ComboBox } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import useDebounce from "../../custom-hooks/useDebounce";
import { MINIUM_FILTER_CHARACTER_NUMBER } from "../Filter/message.constant";

export const AssigneeDropdown = (props) => {
  let [data, setData] = useState([]);
  const [currentValue, setCurrentValue] = useState([]);
  const debouncedSearchTerm = useDebounce(currentValue, 500);

  const getUsers = async (name) => {
    const users = await getListUser(name);
    const atlassianAccount = users.filter(
      (e) => e.accountType === "atlassian" && e.active === true
    );
    const displayUsers = atlassianAccount.map((e) => {
      return { displayName: e.displayName, id: e.accountId };
    });
    return displayUsers;
  }

  const onChange = (event) => {
    if (props.onChange) {
      let obj = {
        dataItem: props.dataItem,
        level: props.level,
        field: "assignee",
        syntheticEvent: event,
        value: event.value,
      };
      props.onChange(obj);
    }
  };

  const filterChange = (event) => {
    setCurrentValue(event.filter.value);
  };

  const getAssigneeProp = () => {
    const assigneeProp = props.dataItem.assignee;
    return { displayName: assigneeProp?.displayName, id: assigneeProp?.accountId };
  }


  useEffect(()=>{
    if (debouncedSearchTerm && debouncedSearchTerm.length >= MINIUM_FILTER_CHARACTER_NUMBER) {
      getUsers(debouncedSearchTerm).then((result) => {
        setData(result);
      });
    }
  }, [debouncedSearchTerm])

  return (
    <td>
      <ComboBox
        data={data}
        onChange={onChange}
        textField={"displayName"}
        dataItemKey={"id"}
        filterable={true}
        value={getAssigneeProp()}
        onFilterChange={filterChange}
      />
    </td>
  );
};
const getListUser = async (name) => {
  const response = await requestJira(`/rest/api/2/user/search?query=${name}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  console.log(`Response: ${response.status} ${response.statusText}`);
  const result = await response.json();
  return result;
};
