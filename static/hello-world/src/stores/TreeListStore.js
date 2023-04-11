import { createHook, createContainer, createStore } from "react-sweet-state";
import { GROUP_BY_TYPE } from "../constants/groupBy";
import { issueswithSprint, testData } from "../utils/group-utils";

const initialState = {
  data: [],
  expanded: {},
  inEdit: [],
  skip: 0,
  take: 20,
  total: 0,
  sort: [],
  groupBy: GROUP_BY_TYPE.NONE,
  isGrouping: false,
};

const actions = {
  setData:
    (data) =>
    ({ setState }) => {
      setState({ data });
    },
  setExpanded:
    (expanded) =>
    ({ setState }) => {
      setState({ expanded });
    },
  setInEdit:
    (inEdit) =>
    ({ setState }) => {
      setState({ inEdit });
    },
    setSkip:
    (skip) =>
    ({ setState }) => {
      setState({ skip });
    },
    setTake:
    (take) =>
    ({ setState }) => {
      setState({ take });
    },
    setTotal:
    (total) =>
    ({ setState }) => {
      setState({ total });
    },
    setSort:
    (sort) =>
    ({ setState }) => {
      setState({ sort });
    },
    setGroupBy:
    (groupBy) =>
    ({ setState }) => {
      setState({ groupBy });
    },
    setIsGrouping:
    (isGrouping) =>
    ({ setState }) => {
      setState({ isGrouping });
    },
};

const Store = createStore({
  initialState,
  actions,
  name: "TreeList",
});

export const useTreeListStore = createHook(Store);
