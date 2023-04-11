import { Button } from '@progress/kendo-react-buttons';
import { useFilterOptionsStore } from '../../../stores/FilterOptionsStore';
import { useTreeListStore } from '../../../stores/TreeListStore';

function Pagination({ isLoading, onQuery }) {


const [{ skip, take, total, groupBy }, 
    {}
    ] = useTreeListStore();
    
const [
{ projects, issueLinkType, dateRange, fixedVersions, issueKey, team, sprints},
{ },
] = useFilterOptionsStore();


const next = () => {
    const newSkip = skip + take;
    onQuery(
        projects,
        issueLinkType,
        issueKey,
        dateRange,
        fixedVersions,
        newSkip,
        take,
        { type: groupBy },
        team,
        sprints,
    );
}

const prev = () => {
if (skip > 0) {
    const newSkip = skip - take;
    onQuery(
    projects,
    issueLinkType,
    issueKey,
    dateRange,
    fixedVersions,
    newSkip,
    take,
    { type: groupBy },
    team,
    sprints
    );
}
}

  return (
    <div>
      <span>{skip + 1}-{skip + take > total ? total : skip + take} of {total} </span> 
      <Button
        size={"medium"}
        themeColor={"info"}
        fillMode={"solid"}
        rounded={"medium"}
        disabled={skip === 0 || isLoading}
        onClick={prev}
      >
        Previous
      </Button>
      <Button
        size={"medium"}
        themeColor={"info"}
        fillMode={"solid"}
        rounded={"medium"}
        disabled={skip + take >= total || isLoading}
        onClick={next}
      >
        Next
      </Button>
    </div>
  );
}

export default Pagination;
