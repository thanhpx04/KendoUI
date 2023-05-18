import { createHook, createStore } from "react-sweet-state";

const initialState = {
  projects: [],
  issueLinkType: "",
  dateRange: undefined,
  fixedVersions: undefined,
  issueKey: "",
  boards: [],
  sprints: [],
  status: "",
  columnsState: [],
  team: []
};

const actions = {
  setFilterOptions:
    (projects, issueLinkType, dateRange, fixedVersions, issueKey, status) =>
      ({ setState }) => {
        setState({ projects, issueLinkType, dateRange, fixedVersions, issueKey, status});
      },
  setBoards: (boards) => ({ setState }) => {
    setState({ boards });
  },
  setSprints: (sprints) => ({ setState }) => {
    setState({ sprints });
  },
  setColumnsState: (columnsState) => ({ setState }) => {
    setState({ columnsState });
  },
  setTeam: (team) => ({ setState }) => {
    setState({ team });
  },
};

const Store = createStore({
  initialState,
  actions,
  name: "TreeList",
});

export const useFilterOptionsStore = createHook(Store);
