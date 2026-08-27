import { FollowUser } from "@src/modules/user-follows/infrastructure/query/user-follow.query.repository";

export type LikesResult = {
  pageSize: number;
  prevCursor: number;
  nextCursor: number | null;
  items: FollowUser[];
};
