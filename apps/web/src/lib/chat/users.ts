import type { User } from "@doora/database";

export type PublicChatUser = {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  avatarId: string | null;
  status: string;
  statusMessage: string;
};

export function toPublicUser(user: Pick<
  User,
  "id" | "name" | "username" | "avatarColor" | "avatarId" | "status" | "statusMessage"
>): PublicChatUser {
  return {
    id: user.id,
    username: user.username ?? user.id.slice(0, 8),
    displayName: user.name,
    avatarColor: user.avatarColor,
    avatarId: user.avatarId,
    status: user.status,
    statusMessage: user.statusMessage,
  };
}
