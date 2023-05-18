import * as React from "react";
import { DateInput } from "@progress/kendo-react-dateinputs";
import { formatPlaceholder } from "../../../../configs/dateRangePickerPlaceholderFormat";
const CustomEndDateInput = (props) => {
  return (
    <label>
      <span>End</span> <br />
      <DateInput formatPlaceholder={formatPlaceholder} size="large" {...props} label={undefined} />
    </label>
  );
};
export default CustomEndDateInput;