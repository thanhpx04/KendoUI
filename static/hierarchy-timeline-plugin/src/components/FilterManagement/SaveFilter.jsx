import { TextBox } from "@progress/kendo-react-inputs";
import { Popup } from "@progress/kendo-react-popup";
import { useEffect, useRef, useState } from "react";
import { getAccountID, saveFilter } from "../../services/service";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import "./filter.css";
import { showErrorFlag } from "../../services/flag-service";
import log from 'loglevel';
import { SOMETHING_WENT_WRONG } from "../../constants/flag-message";

const SaveFilter = (props) => {
  const anchor = useRef();
  const [show, setShow] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [accountId, setAccountId] = useState("");

  const [
    { projects, issueLinkType, dateRange, fixedVersions, issueKey, team, sprints },
    {},
  ] = useFilterOptionsStore();

  // set account id when create this component
  useEffect(() => {
    let isMounted = true;
  
    getAccountID().then((id) => {
      if (isMounted) {
        setAccountId(id);
      }
    });
  
    return () => {
      isMounted = false;
    };
  }, []);

  // save new filter to forge store
  const save = () => {
    if (filterName.trim().length === 0) {
      alert("Please enter filter name");
      return;
    }
    if (projects.length === 0) {
      alert("Please select at least one project");
      return;
    }
    if (issueLinkType === "") {
      alert("Please select link type of issue");
      return;
    }

    const data = {
      filterName: filterName,
      projects: projects,
      issueLinkType: issueLinkType,
      issueKey: issueKey,
      team: team,
      sprints: sprints,
      dateRange: dateRange,
      fixedVersions: fixedVersions,
      ownerId: accountId,
      sharedUsers: []
    };
    saveFilter(data).then(()=> {
      alert(`Filter "${filterName}" has been created`);
      setShow(!show);
      setFilterName("");
      props.refreshFilterList();
    }).catch((e)=>{
      showErrorFlag(SOMETHING_WENT_WRONG);
      log.error(e);
    });
  };

  // hide popup
  const contentRef = useRef(null);
  const blurTimeoutRef = useRef(null);

  // event trigger when clicking on Save filter button
  const onClick = () => {
    setShow(!show);
  };

  // focus on popup content when popup is opened
  useEffect(() => {
    if (show) {
      contentRef.current.focus();
    }
  },[show]);

  const  onFocus = () => {
    // the user is still inside the content
    clearTimeout(blurTimeoutRef.current);
  };

  const  onBlurTimeout = () => {
    // the user is now outside the popup
    setShow(false);
  };

  const  onBlur = () => {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = setTimeout(onBlurTimeout, 200);
  };

  // end hide popup


  return (
    <>
      <button
        className="k-button k-button-lg k-button-solid k-button-solid-light k-rounded-md k-icon-button icon-padding"
        onClick={onClick}
        ref={anchor}
      >
        <span className="k-icon k-i-save"></span>
      </button>
      <Popup anchor={anchor.current} show={show} popupClass={"popup-content"}>
        <div ref={contentRef} tabIndex={0} onFocus={onFocus} onBlur={onBlur}>
          <div className="filter-new-textbox">
            <TextBox
              value={filterName}
              placeholder="Filter name"
              onChange={(e) => {
                setFilterName(e.value);
              }}
            ></TextBox>
          </div>
          <div className="filter-new-button">
            <button
              title="Save"
              className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-base"
              onClick={save}
            >
              Save Filter
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
};
export default SaveFilter;
