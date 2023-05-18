import { MultiSelect } from "@progress/kendo-react-dropdowns";
import { useEffect, useState } from "react";
import { gerProjectVersions, getBoardSprints, getProjectBoards } from "../../../services/service";
import { useFilterOptionsStore } from "../../../stores/FilterOptionsStore";

const BoardFilter = (props) => {
  let [data, setData] = useState([]);
  const [
    { boards },
    { setBoards },
  ] = useFilterOptionsStore();

  const onChange = (event) => {
    setBoards(event.target.value);
  };

  useEffect(() => {
    (async () => {
      let result = [];
      Promise.all(
        props.projects.map(async (project) => {
          let versions = await getProjectBoards(project.key);
          versions.values.map((v) => result.push(v));
        })
      ).then(() => {
        setData(result);
        if (result.length === 0) {
          setBoards([]);
        }
      });
    })();
  }, [props.projects]);

  return (
    <MultiSelect
    label="Boards"
      disabled={data.length === 0}
      data={data}
      filterable={true}
      value={boards}
      onChange={onChange}
      textField="name"
    />
  );
};
export default BoardFilter;
