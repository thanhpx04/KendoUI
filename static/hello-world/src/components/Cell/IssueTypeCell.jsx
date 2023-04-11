import { router } from '@forge/bridge';
import { getIconFromIssueTypeName } from '../IssueTreeListToolBar/issueType';
import { Tooltip } from "@progress/kendo-react-tooltip";

const IssueTypeCell = (props) => {
  const { dataItem } = props;

  const openInNewTab = (e) => {
    e.preventDefault();
    router.open(`/browse/${``}`);
  };

  const issueTypeComponent = (
    <span key={dataItem.key}>
      <a onClick={openInNewTab}>
        <Tooltip anchorElement="target" position="bottom">
          <img
            title={dataItem.issueType}
            src={getIconFromIssueTypeName(dataItem.issueType)}
          />
        </Tooltip>
      </a>
    </span>
  );

  return <td>{issueTypeComponent}</td>;
};

export default IssueTypeCell