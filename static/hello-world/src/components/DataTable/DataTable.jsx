import "./styles.css";

import { useEffect, useState } from "react";

import getLevel0Issues, { getMyFilter } from "../../services/fetchData";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import { useTreeListStore } from "../../stores/TreeListStore";
import { getFilterIdFromIssueLinkTypeId } from "../../utils/common-utils";
import FilterData from "../Filter/FilterData";
import ManageFilter from "../FilterManagement/ManageFilter";
import IssueTreeList from "../IssueTreeList/IssueTreeList";
import LoadingPanel from "../UI/LoadingPanel";
import { Button } from "@progress/kendo-react-buttons";
import { PanelBar, PanelBarItem } from "@progress/kendo-react-layout";
import { TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import IssueGantt from "../Gantt/App";
import Pagination from "./Pagination/Pagination";
import { GROUP_BY_TYPE } from "../../constants/groupBy";

function DataTable() {
  const [{ data, skip, take, total, sort }, 
    { setData, setSkip, setTake, setExpanded, setTotal, setGroupBy, setIsGrouping }
  ] = useTreeListStore();

  const [
    { projects, issueLinkType, dateRange, fixedVersions, sprints, team, issueKey },
    { setFilterOptions, setTeam, setSprints },
  ] = useFilterOptionsStore();

  let [isLoading, setIsLoading] = useState(false);
  let [newFilter, setNewFilter] = useState();
  const [myFilters, setMyFilter] = useState({});

  useEffect(() => {
    getMyFilter().then((filters) => {
      setMyFilter(filters);
    });
  }, []);

  // reset pagination when update filter options
  useEffect(()=>{
    setSkip(0);
    setTake(20);
  },[projects, issueLinkType, dateRange, fixedVersions]);

  useEffect(()=>{
    if (projects.length > 0 && issueLinkType) {
      onQuery(projects, issueLinkType, issueKey, dateRange, fixedVersions, skip, take, undefined, team, sprints);
    }
  },[sort]);

  const isValidQueryParams = (projects, issueLinkType) => {
    if (projects.length === 0) {
      alert("Please select at least one project");
      setIsLoading(false);
      return false;
    }
    if (issueLinkType === "") {
      alert("Please select link type of issue");
      setIsLoading(false);
      return false;
    }
    return true;
  };

  const onQuery = async (
    projects,
    issueLinkType,
    issueKey,
    dateRange,
    fixedVersions,
    skip,
    take,
    groupFetching,
    team,
    sprints
  ) => {
    //valiate
    setIsLoading(true);
    setExpanded([]);

    if (!isValidQueryParams(projects, issueLinkType)) {
      return;
    }

    const updatedIssueLinkType = {
      ...issueLinkType,
      id: getFilterIdFromIssueLinkTypeId(myFilters, issueLinkType.id),
    };

    setFilterOptions(projects, issueLinkType, dateRange, fixedVersions, issueKey);
    setSkip(skip);
    setTake(take);
    setSprints(sprints);
    setTeam(team);

    if (!groupFetching) {
      setGroupBy(GROUP_BY_TYPE.NONE);
    }
    
    setIsGrouping(false);

    // get issue data
    await getLevel0Issues(
      projects,
      updatedIssueLinkType,
      issueKey,
      dateRange,
      fixedVersions,
      skip,
      take,
      sprints,
      sort,
      team,
      groupFetching
    ).then((value) => {
      if (value.error) {
        alert(value.error);
        setIsLoading(false);
      } else {
        setData(value.issues);
        setTotal(value.total);
        setIsLoading(false);
      }
    });
  };

  const [selected, setSelected] = useState(0);
  const handleSelect = (e) => {
    setSelected(e.selected);
  };

  return (
    <>
      {isLoading && <LoadingPanel/>}
      <PanelBar>
        <PanelBarItem expanded={true} title="Search Filters">
          <FilterData 
          onQuery={onQuery} 
          newFilter={newFilter}
          setNewFilter={setNewFilter}
          />
        </PanelBarItem>
      </PanelBar>
      <TabStrip selected={selected} onSelect={handleSelect}>
       <TabStripTab title="Hierarchy"> 
      {data.length !== 0 && (
      <div>
        <IssueTreeList
         style={{width: "100vw"}}
          setIsLoading={setIsLoading}
          myFilters={myFilters}
          onQuery={onQuery}
        />
      <Pagination isLoading={isLoading} onQuery={onQuery}/>
      </div>
      )}    
        </TabStripTab>  
        <TabStripTab title="Timeline">
          <IssueGantt isLoading={isLoading} onQuery={onQuery}/>
        </TabStripTab> 
      </TabStrip>
    </>
  );
}

export default DataTable;
