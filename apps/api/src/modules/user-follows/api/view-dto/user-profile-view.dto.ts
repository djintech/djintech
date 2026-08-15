export class UserProfileViewDto {
  id!: number;
  userName!: string;
  firstName!: string | null;
  lastName!: string | null;
  city!: string | null;
  country!: string | null;
  dateOfBirth!: Date | null;
  aboutMe!: string | null;
  avatar!: string | null; 

  isFollowing!: boolean;
  isFollowedBy!: boolean;

  followingCount!: number;
  followersCount!: number;
  publicationsCount!: number;
}
