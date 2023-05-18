import { createHook, createStore } from "react-sweet-state";

const initialState = {
    expandedState: [],
};

const actions = {
    setExpandedState:
    (expandedState) =>
    ({ setState }) => {
      setState({ expandedState });
    },
};

const Store = createStore({
  initialState,
  actions,
  name: "Gantt",
});

export const useGanttStore = createHook(Store);
