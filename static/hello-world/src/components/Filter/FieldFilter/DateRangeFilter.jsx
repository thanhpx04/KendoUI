import { DateRangePicker } from "@progress/kendo-react-dateinputs";
import { useEffect, useState } from "react";
import CustomEndDateInput from "./DateRangeFilterCustom/CustomEndDateInput";
import CustomStartDateInput from "./DateRangeFilterCustom/CustomStartDateInput";
const DateRangeFilter = (props) => {
  let [show, setShow] = useState();
  let [value, setValue] = useState();
  useEffect(() => {
    if (props.value) {
      setValue({
        start: new Date(props.value.start),
        end: new Date(props.value.end),
      });
    } else {
      setValue({
        start: null,
        end: null
      });
    }
  }, [props]);
  const handleChange = (event) => {
    setValue(event.value);
    if (event.value.start && event.value.end) {
      setShow(false);
    }
    props.onChangeDateRange(event.value);
  };
  const onForcus = (event) => {
    setShow(true);
  };

  const onBlur = (event) => {
    setShow(false);
  };

  return (
    <>
    <DateRangePicker
      style={{width: "16vw"}}
      onFocus={onForcus}
      value={value}
      onChange={handleChange}
      show={show}
      onBlur={onBlur}
      startDateInput={CustomStartDateInput}
      endDateInput={CustomEndDateInput}
    />
    </>
  );
};
export default DateRangeFilter;
