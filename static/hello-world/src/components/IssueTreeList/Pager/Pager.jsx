import * as React from "react";
import { Pager } from "@progress/kendo-react-data-tools";
export const TreeListPager = (props) => {
  return (
    <Pager
      {...props}
      previousNext={true}
      buttonCount={8}
      total={18}
      // Configure the Pager props here.
      // See example: https://www.telerik.com/kendo-react-ui/components/datatools/pager/
    />
  );
};