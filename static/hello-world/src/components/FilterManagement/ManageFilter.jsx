import React, { useEffect, useState } from "react";
import { deleteStorage, getAccountID, querryFilter } from "../../services/service";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-data-query";
import { Button } from "@progress/kendo-react-buttons";
import ShareFilter from "./ShareFilter/ShareFilter";
import "./filter.css"
import { elementClosedArray, notCloseDropdownClassList } from "../../constants/notCloseSharedFilterDropDownClassName";

const ManageFilter = (props) => {
  const [filters, setFilters] = useState([]);
  const [data, setData] = useState(filters.slice());
  const [selectedValue, setSelectedValue] = useState(null);
  const [isFilterOwner, setIsFilterOwner] = useState(false);
  const [loading, setLoading] = useState(false);

  // reload filters when new filter is added
  useEffect(() => {
    setLoading(true);
    fetchFilters().then(()=>{
      setLoading(false);
    });
  }, [props.newFilter]);

  useEffect(() => {
    setLoading(true);
    updateIsFilterOwner().then(()=>{
      setLoading(false);
      if (selectedValue) {
        query();
      }
    });
  }, [selectedValue]);

  const updateIsFilterOwner = async () => {
    let accountId = await getAccountID();
    if (accountId === selectedValue?.ownerId) {
      setIsFilterOwner(true);
    }
  }

  const refresh = () => {
    setLoading(true);
    fetchFilters().then(()=>{
      setLoading(false);
    });
  }

  const fetchFilters = async () => {
    let data = await querryFilter();
    let flatData = data.map((e) => {
      return {
        key: e.key,
        filterName: e.value.filterName,
        dateRange: e.value.dateRange,
        issueLinkType: e.value.issueLinkType,
        issueKey: e.value.issueKey,
        team: e.value.team,
        sprints: e.value.sprints,
        projects: e.value.projects,
        fixedVersions: e.value.fixedVersions,
        sharedUsers: e.value.sharedUsers,
        ownerId: e.value.ownerId
      };
    });

    // filter that user are owner or user is in sharedUsers list
    let accountId = await getAccountID();

    const ownerFilter = flatData
    .filter(filter=>filter.ownerId === accountId)

    const allowedFilter = flatData
    .filter(filter=>{
      const sharedUsers = filter.sharedUsers;
      if (!sharedUsers) return false;
      return sharedUsers.some(user=>user.id === accountId);
    });
    
    // add to final list
    const combineFilter = [...ownerFilter,...allowedFilter];
    // not add duplicate filter with same key ()
    let finalMap = new Map();
    combineFilter.forEach(filter => {
      finalMap.set(filter.key, filter);
    })

    const arr = Array.from(finalMap).map(([key, value]) => (
      value
    ));

    setData(arr);
    setFilters(arr);
  }

  const filterData = (filter) => {
    const data = filters.slice();
    return filterBy(data, filter);
  };
  const filterChange = (event) => {
    setData(filterData(event.filter));
  };
  const onChange = (event) => {
    setSelectedValue(event.value);
  };

  const query = () => {
    const skip = 0;
    const take = 20;
    props.onQuery(
      selectedValue.projects,
      selectedValue.issueLinkType,
      selectedValue.issueKey,
      selectedValue.dateRange,
      selectedValue.fixedVersions,
      skip,
      take,
      undefined,
      selectedValue.team,
      selectedValue.sprints,
    );
  };
  const deleteFilter = (item) => {
    let choice = confirm("Do you want to delete the filter?");
    if (choice == true) {
      deleteStorage(item.key);
      setFilters(filters.filter((e) => e.key !== item.key));
      setData(filters.filter((e) => e.key !== item.key));
      setSelectedValue(null);
    } 
  };

  const handleDelete = (e, item) => {
    e.stopPropagation();
    deleteFilter(item);
  }

  const itemRender = (li, itemProps) => {
    const index = itemProps.index;
    const itemChildren = (
      <div className="filter-item">
        <div className="item-text">
          {li.props.children}
        </div>
        <div className="item-action-wrapper">
          <ShareFilter
            selectedFilter={itemProps.dataItem}
            fetchFilters={fetchFilters}
            isFilterOwner={isFilterOwner}
          />
          <Button
            onClick={(event) => handleDelete(event, itemProps.dataItem)}
            className="delete-button"
            icon="delete"
          ></Button>
        </div>
      </div>
    );
    return React.cloneElement(li, li.props, itemChildren);
  };

  const [open, setOpen] = useState(false);
  const openFilterDropdown = () => {
    setOpen(!open);
  }

  const CloseButton = (
    <div>
      <hr></hr>
      <div className="filter-new-button">
        <Button icon="close" onClick={() => setOpen(false)}>
          Close
        </Button>
      </div>
    </div>
  );


  const isCloseDropDown = (event) => {
    const classNameArray = event.target.className;
    const offsetParentClassNameArray = event.target.offsetParent?.className;

    // not close when click save
    if (
      classNameArray.includes("share-to-btn") ||
      (offsetParentClassNameArray &&
        offsetParentClassNameArray.includes("share-to-btn")) ||
      classNameArray.includes("save-text")
    ) {
      return false;
    }

    for (const element of elementClosedArray) {
      if (
        classNameArray.includes(element.currentElement) &&
        offsetParentClassNameArray &&
        offsetParentClassNameArray.includes(element.parentElement)
      ) {
        return false;
      }
    }

    for (const notCloseClass of notCloseDropdownClassList) {
      if (classNameArray.includes(notCloseClass)) {
        return false;
      }
    }

    return true;
  };

  const handleOpen = (e) => {
      if (isCloseDropDown(e)) {
        setOpen(false);
      }
  }
 
  useEffect(() => {
    document.body.addEventListener("click",(e) => handleOpen(e));
    return () => {
      document.body.removeEventListener('click', (e) => handleOpen(e));
    };
  }, []);

  return (
    <>
      {open && <DropDownList
        style={{
          width: "15vw",
        }}
        data={data}
        textField="filterName"
        onChange={onChange}
        filterable={true}
        value={selectedValue}
        onFilterChange={filterChange}
        size="large"
        itemRender={itemRender}
        opened={open}
        // onClick={()=>setOpen(!open)}
        // footer={CloseButton}
      />}
      <Button size="large" icon="saturation" onClick={openFilterDropdown}>Saved filters</Button>
    </>
  );
};
export default ManageFilter;
