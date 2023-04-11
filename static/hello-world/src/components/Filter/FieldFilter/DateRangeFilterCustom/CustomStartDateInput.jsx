import * as React from "react";
import { DateInput } from "@progress/kendo-react-dateinputs";
const CustomStartDateInput = (props) => {
  return (
    <label>
      <span>Start</span> <br />
      <DateInput size="large" {...props} label={undefined} />
    </label>
  );
};
export default CustomStartDateInput;