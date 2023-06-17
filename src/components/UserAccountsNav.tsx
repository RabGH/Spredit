import { FC } from "react";
import { User } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import UserAvatar from "./UserAvatar";

interface UserAccountsNavProps {
  user: Pick<User, "name" | "image" | "email">;
}

const UserAccountsNav: FC<UserAccountsNavProps> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
          className=""
        />
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
};

export default UserAccountsNav;
