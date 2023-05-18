import { filterBy } from "@progress/kendo-data-query";
import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import { FIX_VERSIONS } from "../../../constants/tags";
import { getProjectVersions } from "../../../services/service";
import { getTags } from "../../../utils/common-utils";
import { MINIUM_FILTER_CHARACTER_NUMBER, START_TYPING_MIN_3_CHARS } from "../message.constant";

const FixedVersionFilter = (props) => {
  let [data, setData] = useState([]);
  let [value, setValue] = useState(props.value);
  const [staticData, setStaticData] = useState([]);


  useEffect(() => {
    (async () => {
      let result = [];
      Promise.all(
        props.projects.map(async (project) => {
          let versions = await getProjectVersions(project.key);
          versions.map((v) => result.push(v));
        })
      ).then(() => {
        setStaticData(result);
        if (result.length === 0) {
          setValue([]);
        }
      });
    })();
  }, [props.projects]);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const filterChange = (event) => {
    if (event.filter.value && event.filter.value.length >= MINIUM_FILTER_CHARACTER_NUMBER) {
      setData(filterBy(staticData, event.filter));
    }
  };

  return (
    <MultiSelect
      placeholder={START_TYPING_MIN_3_CHARS}
      size="large"
      data={data}
      filterable={true}
      value={value}
      onFilterChange={filterChange}
      label="Fix Versions"
      textField="name"
      onChange={(e) => {
        props.onChangeFixedVersion(e.target.value);
        setValue(e.target.value);
      }}
      tags={getTags(value, 7, FIX_VERSIONS)}
    />
  );
};
export default FixedVersionFilter;
