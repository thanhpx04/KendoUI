import * as React from "react";
import { DateInput } from "@progress/kendo-react-dateinputs";
const CustomEndDateInput = (props) => {
  return (
    <label>
      <span>End</span> <br />
      <DateInput size="large" {...props} label={undefined} />
    </label>
  );
};
export default CustomEndDateInput;