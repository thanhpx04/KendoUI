import * as React from "react";
import { DateInput } from "@progress/kendo-react-dateinputs";
import { formatPlaceholder } from "../../../../configs/dateRangePickerPlaceholderFormat";
const CustomStartDateInput = (props) => {
  return (
    <label>
      <span>Start</span> <br />
      <DateInput formatPlaceholder={formatPlaceholder} size="large" {...props} label={undefined} />
    </label>
  );
};
export default CustomStartDateInput;