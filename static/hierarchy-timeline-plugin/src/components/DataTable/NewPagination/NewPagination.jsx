import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Pager } from '@progress/kendo-react-data-tools';
import { useTreeListStore } from '../../../stores/TreeListStore';

const pageSizes = [5, 10, 20];
const initialType = 'numeric';
const initialPageState = {
  skip: 0,
  take: 5,
  buttonCount: 5,
  type: initialType,
  info: true,
  pageSizes: true,
  previousNext: true,
  responsive: true
};
const NewPagination = () => {

    const [{ data, skip, take, total, sort }, 
        { setData, setSkip, setTake, setExpanded, setTotal, setGroupBy, setIsGrouping }
      ] = useTreeListStore();

  const [pageState, setPageState] = React.useState(initialPageState);

  // trigger when user change the page
  const handlePageChange = event => {
    const {
      skip,
      take
    } = event;
    setSkip(skip);
    setTake(take);
    console.log(`Page Change: skip ${skip}, take ${take}`);
  };
  return <React.Fragment>
        
        <Pager skip={skip} take={take} total={total} buttonCount={pageState.buttonCount} info={pageState.info} type={pageState.type} pageSizes={pageState.pageSizes ? pageSizes : undefined} previousNext={pageState.previousNext} onPageChange={handlePageChange} />
      </React.Fragment>;
};

export default NewPagination;