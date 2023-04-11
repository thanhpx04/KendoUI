import { ComboBox } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import useDebounce from "../../custom-hooks/useDebounce";
import { getTeams } from "../../services/service";
import { MINIUM_FILTER_CHARACTER_NUMBER } from "../Filter/message.constant";

export const TeamDropDown = (props) => {
  const [team, setTeam] = useState([]);
  const [currentValue, setCurrentValue] = useState([]);
  const debouncedSearchTerm = useDebounce(currentValue, 500);

  const onChange = (event) => {
    if (props.onChange) {
      let obj = {
        dataItem: props.dataItem,
        level: props.level,
        field: "team",
        syntheticEvent: event,
        value: event.value,
      };
      props.onChange(obj);
    }
  };

  const filterChange = (event) => {
    setCurrentValue(event.filter.value);
  };

  useEffect(()=>{
    if (debouncedSearchTerm && debouncedSearchTerm.length >= MINIUM_FILTER_CHARACTER_NUMBER) {
      getTeams(debouncedSearchTerm).then((result) => {
        setTeam(result);
      });
    }
  }, [debouncedSearchTerm])

  return (
    <td>
      <ComboBox
        data={team}
        onChange={onChange}
        textField={"title"}
        dataItemKey={"id"}
        filterable={true}
        value={props.dataItem.team}
        onFilterChange={filterChange}
      />
    </td>
  );
};
export default TeamDropDown;
