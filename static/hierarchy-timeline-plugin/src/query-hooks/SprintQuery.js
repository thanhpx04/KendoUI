import { useQuery } from "@tanstack/react-query";
import { getBoards, getBoardSprints } from "../services/service";
import { useMemo } from 'react';

const useGetSprint = () => {
  // Get the board
  const { data: boards } = useQuery({
    queryKey: ["boards"],
    queryFn: getBoards,
    staleTime: Infinity
  });

// Get sprints from boards
const getSprints = async (boards) => {
  const resultSprints = [];
  for (let i = 0; i < boards.length; i++) {
    try {
      let sprints = await getBoardSprints(boards[i].id);
      resultSprints.push(sprints);
    } catch (error) {
      console.error(`Error fetching sprints for board ${boards[i].id}`);
    }
  }
  const originalSprints = resultSprints.flat();
  const notDuplidatedSprints = [];

  originalSprints.forEach((obj) => {
    if (!notDuplidatedSprints.some((item) => item.id === obj.id)) {
      notDuplidatedSprints.push(obj);
    }
  });

  return notDuplidatedSprints;
};

  const isSprintsQueryEnabled = (boards = []) => boards.length > 0;

  return useQuery({
    queryKey: ["sprints", boards],
    queryFn: () => getSprints(boards),
    enabled: isSprintsQueryEnabled(boards),
    staleTime: Infinity
  });
}

export default useGetSprint;
