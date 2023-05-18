import { useQuery } from "@tanstack/react-query";
import { getListUser } from "../services/fetchData";

const useGetUsers = () => {
  const getUsers = async () => {
    const users = await getListUser();
    const atlassianAccount = users.filter(
      (e) => e.accountType === "atlassian" && e.active === true
    );
    const usersWithNameAndId = atlassianAccount.map((e) => {
      return { name: e.displayName, id: e.accountId };
    });
    return usersWithNameAndId;
  };

  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    staleTime: Infinity,
  });
};

export default useGetUsers;
