import './toolbar.css'
import { Button } from "@progress/kendo-react-buttons";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import React, { useEffect } from "react";
import { defaultColumns } from "../../configs/defaultColumns";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";

const DynamicColumns = ({ columns }) => {
  const [{ columnsState }, { setColumnsState },] = useFilterOptionsStore();

  const getDefaultColumns = () => {
    return columns.filter(column => defaultColumns.includes(column.title));
  }

  const onChangeCheckbox = event => {
    let value = event.value;
    setColumnsState(value);
  }

  const showAllColumns = () => {
    setColumnsState(getDefaultColumns());
  }

  useEffect(() => {
    setColumnsState(getDefaultColumns());
  }, []);

  const itemRender = (li, itemProps) => {
    const itemChildren = (
      <span>
        <input
          type="checkbox"
          name={itemProps.dataItem}
          checked={itemProps.selected}
          onChange={(e) => itemProps.onClick(itemProps.index, e)}
        />
        &nbsp;{li.props.children}
      </span>
    );
    return React.cloneElement(li, li.props, itemChildren);
  };

  const columnsSelected = columnsState.length;

  return (
    <>
      <div className='display-center'>
        <MultiSelect 
          itemRender={itemRender}
          data={columns}
          filterable={true}
          value={columnsState}
          autoClose={false}
          placeholder="Select columns"
          style={{
            width: "auto",
          }}
          onChange={onChangeCheckbox}
          textField="title"
          tags={columnsSelected > 0 ? [{
            text: `${columnsSelected} columns selected`,
            data: [...columnsState]
          }] : []}
        />
       <Button
        size={"medium"}
        themeColor={"base"}
        fillMode={"solid"}
        rounded={"medium"}
        onClick={showAllColumns}
      >Restore default</Button>
      </div>
    </>
  );
};

export default DynamicColumns;
