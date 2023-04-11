import { useQuery } from "@tanstack/react-query";
import { getTransition } from "../services/service";

const useGetTransition = ({issueKey}) => {

  return useQuery({
    queryKey: ["transition", issueKey],
    queryFn: () => getTransition(issueKey),
    staleTime: Infinity
  });
}

export default useGetTransition;
