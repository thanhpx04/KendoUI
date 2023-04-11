import { router } from '@forge/bridge';
const BlockerHyperlinkCell = (props) => {
    const { dataItem } = props;
    const field = props.field || "";
    const cellData = dataItem[field] || [];

    const openInNewTab = (e) => {
        e.preventDefault();
        const issueKey = e.target.innerText;
        router.open(`/browse/${issueKey}`);
    }

    const hyperlinkComponent = cellData.map((item, i) => {
            return (
            <span key={item.key}>
                {i > 0 && ", "}
                <a
                onClick={openInNewTab}
              >
                {item.key}
              </a>
              </span>
            );
    });

    return (
      <td>
        <span
        >
          {hyperlinkComponent}
        </span>
      </td>
    );
  };

export default BlockerHyperlinkCell