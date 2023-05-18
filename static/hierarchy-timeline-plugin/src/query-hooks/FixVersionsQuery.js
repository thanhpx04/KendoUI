import { useQuery } from "@tanstack/react-query";
import { getProjectVersions, getTransition } from "../services/service";

const useGetFixVersions = ({issueKey}) => {

  return useQuery({
    queryKey: ["fixVersions", issueKey],
    queryFn: () => getProjectVersions(issueKey),
    staleTime: Infinity
  });
}

export default useGetFixVersions;
