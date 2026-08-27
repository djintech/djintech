import { ApiProperty } from "@nestjs/swagger";

export class UserProfileViewDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  userName!: string;

  @ApiProperty({ type: String, nullable: true })
  firstName!: string | null;

  @ApiProperty({ type: String, nullable: true })
  lastName!: string | null;

  @ApiProperty({ type: String, nullable: true })
  city!: string | null;

  @ApiProperty({ type: String, nullable: true })
  country!: string | null;

  @ApiProperty({ type: Date, nullable: true })
  dateOfBirth!: Date | null;

  @ApiProperty({ type: String, nullable: true })
  aboutMe!: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatar!: string | null; 

  @ApiProperty()
  isFollowing!: boolean;

  @ApiProperty()
  isFollowedBy!: boolean;

  @ApiProperty()
  followingCount!: number;

  @ApiProperty()
  followersCount!: number;

  @ApiProperty()
  publicationsCount!: number;
}
