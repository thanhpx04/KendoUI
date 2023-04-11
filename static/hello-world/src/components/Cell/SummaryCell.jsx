import { router } from "@forge/bridge";
import { Tooltip } from "@progress/kendo-react-tooltip";

const SummaryCell = (props) => {
  const { dataItem } = props;

  const openInNewTab = (e) => {
    e.preventDefault();
    router.open(`/browse/${dataItem.key}`);
  };

  const issueTypeComponent = (
    <span key={dataItem.key}>
      <a onClick={openInNewTab}>
        <Tooltip anchorElement="target" position="bottom">
          <div title={dataItem.summary} className="overflow">
            {dataItem.summary}
          </div>
        </Tooltip>
      </a>
    </span>
  );

  return <td>{issueTypeComponent}</td>;
};

export default SummaryCell;
