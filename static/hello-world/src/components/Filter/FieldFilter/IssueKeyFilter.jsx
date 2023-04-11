import { TextBox } from "@progress/kendo-react-inputs";
import { FloatingLabel } from "@progress/kendo-react-labels";
import { useFilterOptionsStore } from "../../../stores/FilterOptionsStore";
const IssueKeyFilter = (props) => {

  const [
    { issueKey },
    {},
  ] = useFilterOptionsStore();

  return (
    <FloatingLabel
          label={"Issue key"}
          editorId={"issue-id"}
          editorValue={issueKey}
        >
    <TextBox
      id={"issue-id"}
      onChange={(e) => props.onChangeIssueKey(e.target.value)}
      value={issueKey}
      size="large"
    />
    </FloatingLabel>
  );
};
export default IssueKeyFilter;
