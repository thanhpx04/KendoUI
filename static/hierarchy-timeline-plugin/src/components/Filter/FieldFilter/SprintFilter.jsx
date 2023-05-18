import { filterBy } from "@progress/kendo-data-query";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import { SPRINT } from "../../../constants/tags";
import useGetSprint from "../../../query-hooks/SprintQuery";
import { useFilterOptionsStore } from "../../../stores/FilterOptionsStore";
import { getTags } from "../../../utils/common-utils";
import { MINIUM_FILTER_CHARACTER_NUMBER, START_TYPING_MIN_3_CHARS } from "../message.constant";

const SprintFilter = () => {
  const [data, setData] = useState([]);
  const [staticData, setStaticData] = useState([]);

  const { data: mySprints } = useGetSprint();

  const [
    { sprints },
    { setSprints },
  ] = useFilterOptionsStore();

  useEffect(() => {
    setStaticData(mySprints)
  },[mySprints])

  const onChange = (event) => {
    setSprints(event.target.value);
  };

  const filterChange = (event) => {
    if (event.filter.value && event.filter.value.length >= MINIUM_FILTER_CHARACTER_NUMBER) {
      setData(filterBy(staticData, event.filter));
    } 
  };

  return (
    <MultiSelect
      placeholder={START_TYPING_MIN_3_CHARS}
      size="large"
      data={data}
      filterable={true}
      value={sprints}
      label="Sprints"
      onChange={onChange}
      textField="name"
      onFilterChange={filterChange}
      tags={getTags(sprints, 7, SPRINT)} 
    />
  );
};
export default SprintFilter;
