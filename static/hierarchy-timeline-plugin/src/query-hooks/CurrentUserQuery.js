import { useQuery } from "@tanstack/react-query";
import { getAccountID } from "../services/service";

const useGetCurrentUser = () => {
  const getUser = async () => {
    const acocuntId = await getAccountID()
    return acocuntId;
  };

  return useQuery({
    queryKey: ["currentUserId"],
    queryFn: getUser,
    staleTime: Infinity,
  });
};

export default useGetCurrentUser;
