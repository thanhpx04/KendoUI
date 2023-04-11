import { ComboBox } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import useGetSprint from "../../query-hooks/SprintQuery";
import { filterBy } from "@progress/kendo-data-query";

export const SprintDropDown = (props) => {
  const [data, setData] = useState([]);
  const [staticData, setStaticData] = useState([]);

  const { data: mySprints } = useGetSprint();

  useEffect(() => {
    setStaticData(mySprints);
  }, [mySprints]);

  const onChange = (event) => {
    if (props.onChange) {
      let obj = {
        dataItem: props.dataItem,
        level: props.level,
        field: "sprint",
        syntheticEvent: event,
        value: event.value,
      };
      props.onChange(obj);
    }
  };

  const filterChange = (event) => {
    event.filter.value && setData(filterBy(staticData, event.filter));
  };

  return (
    <td>
      <ComboBox
        data={data}
        onChange={onChange}
        textField={"name"}
        dataItemKey={"id"}
        value={props.dataItem.sprint}
        filterable={true}
        onFilterChange={filterChange}
      />
    </td>
  );
};
export default SprintDropDown;
