import { FC } from "react";
import { User } from "next-auth";

interface UserAccountsNavProps {
  user: Pick<User, "name" | "image" | "email">;
}

const UserAccountsNav: FC<UserAccountsNavProps> = ({ user }) => {
  return <div>UserAccountsNav</div>;
};

export default UserAccountsNav;
