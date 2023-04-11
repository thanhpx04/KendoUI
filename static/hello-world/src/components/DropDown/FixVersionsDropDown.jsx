import { ComboBox } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import useGetFixVersions from "../../query-hooks/FixVersionsQuery";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import { getStringBeforeHyphen } from "../../utils/common-utils";

export const FixVersionsDropDown = (props) => {
  const [dataArray, setDataArray] = useState([]);
  const [{ projects },{}] = useFilterOptionsStore();
  const { data } = useGetFixVersions({issueKey: getStringBeforeHyphen(props.dataItem.key, projects)});

  useEffect(() => {
    if (data && data.length > 0) {
      let name = data.map((e) => {
        return { name: e.name, id: e.id };
      });
      setDataArray(name);
    }
  }, [data]);

  const onChange = (event) => {
    if (props.onChange) {
      props.onChange({
        dataItem: props.dataItem,
        level: props.level,
        field: 'fixVersions',
        syntheticEvent: event,
        value: event.target.value,
      });
    }
  };
  return (
    <td>
      <ComboBox
        data={dataArray}
        onChange={onChange}
        textField={"name"}
        dataItemKey={"id"}
        value={
          props.dataItem.fixVersions           
        }
      />
    </td>
  );
};
export default FixVersionsDropDown;
