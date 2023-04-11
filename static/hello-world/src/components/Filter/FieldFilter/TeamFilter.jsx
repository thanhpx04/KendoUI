import { filterBy } from "@progress/kendo-data-query";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import { TEAM } from "../../../constants/tags";
import useDebounce from "../../../custom-hooks/useDebounce";
import { getTeams } from "../../../services/service";
import { useFilterOptionsStore } from "../../../stores/FilterOptionsStore";
import { getTags } from "../../../utils/common-utils";
import { MINIUM_FILTER_CHARACTER_NUMBER, START_TYPING_MIN_3_CHARS } from "../message.constant";

const TeamFilter = () => {
  let [data, setData] = useState([]);
  const [currentValue, setCurrentValue] = useState([]);
  const debouncedSearchTerm = useDebounce(currentValue, 500);

  const [
    { team },
    { setTeam },
  ] = useFilterOptionsStore();

  const onChange = (event) => {
    setTeam(event.target.value);
  };

  let filterChange = (event) => {
    setCurrentValue(event.filter.value);
  };

  useEffect(()=>{
    if (debouncedSearchTerm && debouncedSearchTerm.length >= MINIUM_FILTER_CHARACTER_NUMBER) {
      getTeams(debouncedSearchTerm).then((result) => {
        setData(result);
      });
    }
  }, [debouncedSearchTerm])

  return (
    <MultiSelect
      placeholder={START_TYPING_MIN_3_CHARS}
      size="large"
      data={data}
      filterable={true}
      value={team}
      label="Team"
      onChange={onChange}
      textField="title"
      onFilterChange={filterChange}
      tags={getTags(team, 7, TEAM)} 
    />
  );
};
export default TeamFilter;
