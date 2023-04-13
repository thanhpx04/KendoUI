import * as React from 'react';
import { useInternationalization } from '@progress/kendo-react-intl';
import { classNames, Keys } from '@progress/kendo-react-common';

import { useTableKeyboardNavigation } from '@progress/kendo-react-data-tools';
import { getNestedValue, TreeListCell } from '@progress/kendo-react-treelist';
import { router } from '@forge/bridge';
import { Tooltip } from '@progress/kendo-react-tooltip';
import { getIconFromIssueTypeName } from '../IssueTreeListToolBar/issueType';
import './issueKeyCell.css'

export const IssueKeyCell = (props) => {
    const { hasChildren, level = [0], expanded, dataItem, format, id, ariaColumnIndex } = props;
    const data = getNestedValue(props.field, dataItem);
    const intl = useInternationalization();
    const navigationAttributes = useTableKeyboardNavigation(id);
    let dataAsString = '';

    const onKeyDownHandler = React.useCallback(
        (event) => {
            if (event.isDefaultPrevented()) { return; }

            if (event.keyCode === Keys.enter && props.expandable) {
                event.preventDefault();
                props.onExpandChange(event, dataItem, level);
            }
        },
        [props.expandable, dataItem, level]
    );

    if (data !== undefined && data !== null) {
        dataAsString = format ?
            intl.format(format, data) :
            data.toString();
    }

    const icons = [];
    if (props.expandable) {
        icons.push(...level.slice(1).map((_x, i) => (<span className="k-icon k-i-none" key={i} />)));
        if (hasChildren) {
            icons.push(
              <span
                className={`k-icon k-i-${expanded ? 'collapse' : 'expand'}`}
                key="expand-collapse"
                onClick={event => props.onExpandChange(event, dataItem, level)}
                />
            );
        } else {
            icons.push(<span className="k-icon k-i-none" key={icons.length} />);
        }
    }

    const openInNewTab = (event, issueKey) => {
      event.preventDefault();
      router.open(`/browse/${issueKey}`);
    }

    const IssueTypeIcon = () => (
      <span className='issue-type-icon'>
      <Tooltip anchorElement="target" position="bottom">
        <img
          title={dataItem.issueType}
          src={getIconFromIssueTypeName(dataItem.issueType)}
        />
      </Tooltip>
      </span>
    );

    const defaultRendering = (
      <td
        style={props.style}
        className={classNames(props.className, {
          ["k-text-nowrap"]: props.expandable,
        })}
        colSpan={props.colSpan}
        aria-colindex={ariaColumnIndex}
        role={"gridcell"}
        onKeyDown={onKeyDownHandler}
        {...navigationAttributes}
      >
        {icons}
        <IssueTypeIcon/>&nbsp;
        <a onClick={(event)=>openInNewTab(event, dataAsString)}>{dataAsString}</a>
      </td>
    );

    return props.render ?
        props.render.call(undefined, defaultRendering, props) :
        defaultRendering;
};

export default IssueKeyCell