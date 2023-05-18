import "./styles.css";

import { useEffect, useState } from "react";
import { PanelBar, PanelBarItem, TabStrip, TabStripTab } from "@progress/kendo-react-layout";
import { GROUP_BY_TYPE } from "../../constants/groupBy";
import getLevel0Issues, { getMyFilter } from "../../services/fetchData";
import { useFilterOptionsStore } from "../../stores/FilterOptionsStore";
import { useGanttStore } from "../../stores/GanttStore";
import { useTreeListStore } from "../../stores/TreeListStore";
import { getFilterIdFromIssueLinkTypeId } from "../../utils/common-utils";
import FilterData from "../Filter/FilterData";
import IssueGantt from "../Gantt/App";
import IssueTreeList from "../IssueTreeList/IssueTreeList";
import LoadingPanel from "../UI/LoadingPanel";
import NewPagination from "./NewPagination/NewPagination";
import { showErrorFlag, showWarningFlag, showSuccessFlag } from "../../services/flag-service";
import { SOMETHING_WENT_WRONG, PROJECT_SELECT, LINK_ISSUE_TYPE_SELECT } from "../../constants/flag-message";
import log from 'loglevel';

// the main component
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
  const [{}, {setExpandedState}] = useGanttStore();
  const [selected, setSelected] = useState(0);

  // get saved filers list when open the app
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

  // get new data based on sort options
  useEffect(()=>{
    if (projects.length > 0 && issueLinkType) {
      onQuery(projects, issueLinkType, issueKey, dateRange, fixedVersions, skip, take, undefined, team, sprints, status);
    }
  },[sort]);

  // check query parameters, projects and issue link type should be selected
  const isValidQueryParams = (projects, issueLinkType) => {
    if (projects.length === 0) {
      showWarningFlag(PROJECT_SELECT);
      setIsLoading(false);
      return false;
    }
    if (issueLinkType === "") {
      showWarningFlag(LINK_ISSUE_TYPE_SELECT)
      setIsLoading(false);
      return false;
    }
    return true;
  };

  // call api to query data and put it into the table by params
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
    sprints,
    status
  ) => {
    //valiate
    setIsLoading(true);
    setExpanded([]);
    setExpandedState([]);

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
      groupFetching,
      status
    ).then((value) => {
      if (value.error) {
        //alert(value.error);
        showErrorFlag(SOMETHING_WENT_WRONG);
        log.error(e);
        setIsLoading(false);
      } else {
        setData(value.issues);
        setTotal(value.total);
        setIsLoading(false);
      }
    }).catch((e)=>{
      showErrorFlag(SOMETHING_WENT_WRONG);
      log.error(e);
      setIsLoading(false);
    });
  };

  // handle timeline/gantt tab selectoin
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

      <div>
        <div className="full-width">
        <IssueTreeList
          setIsLoading={setIsLoading}
          myFilters={myFilters}
          onQuery={onQuery}
        />
        </div>
      <NewPagination/>
      </div>
   
        </TabStripTab>  
        <TabStripTab title="Timeline">
        {data.length !== 0 && (
          <>
          <IssueGantt isLoading={isLoading} onQuery={onQuery}/>
          <NewPagination/>
          </>
        )}
        </TabStripTab> 
      </TabStrip>
    </>
  );
}

export default DataTable;
