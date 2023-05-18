import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { filterBy } from "@progress/kendo-data-query";
import { useEffect, useState } from "react";
import { requestJira } from "@forge/bridge";
import { getTags } from "../../../utils/common-utils";
import { PROJECT } from "../../../constants/tags";
import "../filter-data.css"
const ProjectFilter = ({value, onChangeProject}) => {
  let [data, setData] = useState([]);
  let [staticData, setStaticData] = useState([]);

  useEffect(() => {
    (async () => {
      let listProject = await getAllProject();
      let projects = listProject.map((element) => {
        return { key: element.key, projectName: element.name };
      });
      setData(projects);
      setStaticData(projects);
    })()
  },[]);

  let filterChange = (event) => {
    setData(filterBy(staticData, event.filter));
  };

  return (
    <div className="project-filter">
    <MultiSelect
      size="large"
      data={data}
      filterable={true}
      textField="projectName"
      dataItemKey="key"
      value={value}
      onFilterChange={filterChange}
      onChange={(e) => {
        onChangeProject(e.target.value);
      }}
      label="Projects"
      tags={getTags(value, 30, PROJECT)} 
    />
    </div>
  );
};
const getAllProject = async () => {
  const response = await requestJira(`/rest/api/3/project/search`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  let result = await response.json();
  return result.values;
};
export default ProjectFilter;
