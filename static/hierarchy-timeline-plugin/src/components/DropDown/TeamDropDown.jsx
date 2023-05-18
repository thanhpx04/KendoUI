import { ComboBox } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import useDebounce from "../../custom-hooks/useDebounce";
import { getTeams } from "../../services/service";
import { MINIUM_FILTER_CHARACTER_NUMBER, START_TYPING_MIN_3_CHARS } from "../Filter/message.constant";

// this dropdown is used when updating team in the table
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

  // only call api to search team when number of characters equals or greater than MINIUM_FILTER_CHARACTER_NUMBER
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
        placeholder={START_TYPING_MIN_3_CHARS}
      />
    </td>
  );
};
export default TeamDropDown;
