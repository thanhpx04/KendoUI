import { ComboBox } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import useGetTransition from "../../query-hooks/TransitionQuery";

// this dropdown is used when updating status in the table
export const TransitionDropdown = (props) => {
  const [transition, setTransition] = useState([]);
  const { data } = useGetTransition({issueKey: props.dataItem.key});

  useEffect(() => {
    if (data && data.length > 0) {
      let name = data.map((e) => {
        return { text: e.to.name, id: e.id };
      });
      setTransition(name);
    }
  }, [data]);

  const onChange = (event) => {
    if (props.onChange) {
      props.onChange({
        dataItem: props.dataItem,
        level: props.level,
        field: props.field,
        syntheticEvent: event,
        value: event.target.value,
      });
    }
  };
  return (
    <td>
      <ComboBox
        data={transition}
        onChange={onChange}
        textField={"text"}
        dataItemKey={"id"}
        value={
          props.dataItem["status.text"] === undefined
            ? props.dataItem.status
            : props.dataItem["status.text"]
        }
      />
    </td>
  );
};
export default TransitionDropdown;
