export class UserFollowViewDto {
  id!: number;
  userId!: number;
  userName!: string;
  createdAt!: Date;
  avatar!: string | null;

  isFollowing!: boolean;
  isFollowedBy!: boolean;
}
