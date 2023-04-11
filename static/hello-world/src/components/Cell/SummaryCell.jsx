import { router } from "@forge/bridge";
const SummaryCell = (props) => {
  const { dataItem } = props;

  const openInNewTab = (e) => {
    e.preventDefault();
    router.open(`/browse/${dataItem.key}`);
  };

  const issueTypeComponent = (
    <span key={dataItem.key}>
      <a onClick={openInNewTab}>
        {dataItem.summary}
      </a>
    </span>
  );

  return <td>{issueTypeComponent}</td>;
};

export default SummaryCell;
