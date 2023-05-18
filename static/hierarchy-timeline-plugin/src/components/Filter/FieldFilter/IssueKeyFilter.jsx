import { FloatingLabel } from "@progress/kendo-react-labels";
import { useFilterOptionsStore } from "../../../stores/FilterOptionsStore";
import { AutoComplete } from "@progress/kendo-react-dropdowns";
import { searchIssueKey } from "../../../services/service";
import { useEffect, useState } from "react";
import { START_TYPING_MIN_3_CHARS, MINIUM_FILTER_CHARACTER_NUMBER } from "../message.constant";
import useDebounce from "../../../custom-hooks/useDebounce";
const IssueKeyFilter = (props) => {

  const [
    { issueKey },
    {},
  ] = useFilterOptionsStore();

  const [data, setData] = useState([]);
  const [currentValue, setCurrentValue] = useState("");
  const debouncedSearchTerm = useDebounce(currentValue, 500);

  const onChangeUser = (event) => {
    props.onChangeIssueKey(event.target.value);
    setCurrentValue(event.target.value);
  }

  useEffect(()=>{
    if (debouncedSearchTerm && debouncedSearchTerm.length >= MINIUM_FILTER_CHARACTER_NUMBER) {
      searchIssueKey(debouncedSearchTerm).then((issues) => {
        setData(issues);
      });
    }
  }, [debouncedSearchTerm])

  return (
    <FloatingLabel
          label={"Issue key"}
          editorId={"issue-id"}
          editorValue={issueKey}
        >
    <AutoComplete
    data={data}
    placeholder={START_TYPING_MIN_3_CHARS}
    onChange={onChangeUser}
    value={issueKey}
    textField='key'  
    className="input-shared-user"
    size="large"
  />
    </FloatingLabel>
  );
};
export default IssueKeyFilter;
