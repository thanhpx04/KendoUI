import { Button } from "@progress/kendo-react-buttons";
import { useEffect, useRef, useState } from "react";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import ManageFilter from "../FilterManagement/ManageFilter";
import SaveFilter from "../FilterManagement/SaveFilter";
import DateRangeFilter from "./FieldFilter/DateRangeFilter";
import FixedVersionFilter from "./FieldFilter/FixedVersionFilter";
import IssueKeyFilter from "./FieldFilter/IssueKeyFilter";
import LinkedIssueType from "./FieldFilter/LinkedIssueTypeFilter";
import ProjectFilter from "./FieldFilter/ProjectFilter";
import SprintFilter from "./FieldFilter/SprintFilter";
import TeamFilter from "./FieldFilter/TeamFilter";
import './filter-data.css';
import { DEFAULT_TAKE_PAGINATION } from "../../constants/pagination";
import { useTreeListStore } from "../../stores/TreeListStore";
import StatusFilter from "./FieldFilter/StatusFilter";

const FilterData = ({onQuery}) => {
  const [
    { projects, issueLinkType, dateRange, fixedVersions, issueKey, team, sprints, status },
    { setFilterOptions, setBoards, setSprints },
  ] = useFilterOptionsStore();

  const [{}, { setInitialState }] = useTreeListStore();

  useEffect(() => {
    setFilterOptions(projects, issueLinkType, dateRange, fixedVersions, issueKey, status );
  }, [projects, issueLinkType, dateRange, fixedVersions, issueKey, status ]);
  const onChangeProject = (value) => {
    setFilterOptions(value, issueLinkType, dateRange, fixedVersions, issueKey, status );
  };
  const onChangeLinkIssueType = (value) => {
    setFilterOptions(projects, value, dateRange, fixedVersions, issueKey, status );
  };
  const onChangeStatus = (value) => {
    setFilterOptions(projects, issueLinkType, dateRange, fixedVersions, issueKey, value );
  };
  const onChangeIssueKey = (value) => {
    setFilterOptions(projects, issueLinkType, dateRange, fixedVersions, value, status );
  };
  const onChangeDateRange = (value) => {
    setFilterOptions(projects, issueLinkType, value, fixedVersions, issueKey, status );
  };
  const onChangeFixedVersion = (value) => {
    setFilterOptions(projects, issueLinkType, dateRange, value, issueKey, status );
  };

  // search button 
  const search = () => {
    const skip = 0;
    const take = DEFAULT_TAKE_PAGINATION;
    onQuery(projects, issueLinkType, issueKey, dateRange, fixedVersions, skip, take, undefined, team, sprints, status);
  };

  // reset al filter options
  const reset = () => {
    setFilterOptions([], "", undefined, undefined, "");
    setBoards([]);
    setSprints([]);
    setInitialState();
  };

  // refresh filter list after adding new filter
  const refreshFilterList = () => {
    manageFilterRef.current.refresh();
  }

  const manageFilterRef = useRef();

  return (
    <div>
      <div className="project">
        <div className="project-box">
          <span className="reset-button">
            <Button themeColor={"light"} onClick={reset} icon="reset">
              Reset
            </Button>
          </span>
          <ProjectFilter value={projects} onChangeProject={onChangeProject} />
          <span className="manage-filter">
            <ManageFilter ref={manageFilterRef}
              onQuery={onQuery}
            ></ManageFilter>
          </span>
        </div>
        <span className="search-button">
          <Button size="large" themeColor={"info"} onClick={search}>
            Search
          </Button>
        </span>
        <span className="search-button">
          <SaveFilter refreshFilterList={refreshFilterList}></SaveFilter>
        </span>
      </div>
      <div className="others-filter-container">
        <div class="item">
          <LinkedIssueType
            value={issueLinkType}
            onChangeLinkIssueType={onChangeLinkIssueType}
          />
        </div>
        <div class="item">
          <IssueKeyFilter value={issueKey} onChangeIssueKey={onChangeIssueKey} />
        </div>
        <div class="item">
          <FixedVersionFilter
            projects={projects}
            value={fixedVersions}
            onChangeFixedVersion={onChangeFixedVersion}
          ></FixedVersionFilter>
        </div>
        <div class="item">
          <TeamFilter></TeamFilter>
        </div>
        <div class="item">
          <SprintFilter />
        </div>
        <div class="item">
          <StatusFilter value={status} onChangeStatus={onChangeStatus} />
        </div>
        <div class="item">
          <DateRangeFilter
            value={dateRange}
            onChangeDateRange={onChangeDateRange}
          ></DateRangeFilter>
        </div>
      </div>
    </div>
  );
};
export default FilterData;
