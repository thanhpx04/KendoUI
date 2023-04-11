import { Button } from "@progress/kendo-react-buttons";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
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

const FilterData = ({onQuery, newFilter, setNewFilter}) => {
  const [
    { projects, issueLinkType, dateRange, fixedVersions, issueKey, team, sprints },
    { setFilterOptions, setBoards, setSprints },
  ] = useFilterOptionsStore();

  useEffect(() => {
    setFilterOptions(projects, issueLinkType, dateRange, fixedVersions, issueKey );
  }, [projects, issueLinkType, dateRange, fixedVersions, issueKey ]);
  const onChangeProject = (value) => {
    setFilterOptions(value, issueLinkType, dateRange, fixedVersions, issueKey );
  };
  const onChangeLinkIssueType = (value) => {
    setFilterOptions(projects, value, dateRange, fixedVersions, issueKey );
  };
  const onChangeIssueKey = (value) => {
    setFilterOptions(projects, issueLinkType, dateRange, fixedVersions, value );
  };
  const onChangeDateRange = (value) => {
    setFilterOptions(projects, issueLinkType, value, fixedVersions, issueKey );
  };
  const onChangeFixedVersion = (value) => {
    setFilterOptions(projects, issueLinkType, dateRange, value, issueKey );
  };
  const search = () => {
    const skip = 0;
    const take = 20;
    onQuery(projects, issueLinkType, issueKey, dateRange, fixedVersions, skip, take, undefined, team, sprints);
  };

  const reset = () => {
    setFilterOptions([], "", undefined, undefined, "");
    setBoards([]);
    setSprints([]);
  };

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
            <ManageFilter
              newFilter={newFilter}
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
          <SaveFilter onSaveNewFilter={setNewFilter}></SaveFilter>
        </span>
      </div>
      <div className="oneline-filter">
        <LinkedIssueType
          value={issueLinkType}
          onChangeLinkIssueType={onChangeLinkIssueType}
        />
        <IssueKeyFilter value={issueKey} onChangeIssueKey={onChangeIssueKey} />
        <FixedVersionFilter
          projects={projects}
          value={fixedVersions}
          onChangeFixedVersion={onChangeFixedVersion}
        ></FixedVersionFilter>
        <TeamFilter></TeamFilter>
        <SprintFilter />
        <DateRangeFilter
          value={dateRange}
          onChangeDateRange={onChangeDateRange}
        ></DateRangeFilter>
      </div>
    </div>
  );
};
export default FilterData;
