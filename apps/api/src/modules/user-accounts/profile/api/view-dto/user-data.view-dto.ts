import { UserFullInfo } from '@modules/user-accounts/profile/infrastructure/query/profiles.query.repository';
import { AvatarViewDto } from '@modules/user-accounts/profile/api/view-dto/avatar.view-dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserDataViewDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  userName: string | null;
  @ApiProperty()
  firstName: string | null;
  @ApiProperty()
  lastName: string | null;
  @ApiProperty()
  dateOfBirth: Date | null;
  @ApiProperty()
  aboutMe: string | null;
  @ApiProperty()
  country: string | null;
  @ApiProperty()
  city: string | null;
  @ApiProperty()
  avatar: string | null;
  @ApiProperty()
  createdAt: Date | null;

  static mapToView(userDto: UserFullInfo, avatarDto?: AvatarViewDto) {
    const profileData = new this();

    profileData.id = userDto.userId;
    profileData.userName = userDto.user.username;
    profileData.firstName = userDto.firstName;
    profileData.lastName = userDto.lastName;
    profileData.dateOfBirth = userDto.dateOfBirth;
    profileData.aboutMe = userDto.aboutMe;
    profileData.city = userDto.city;
    profileData.country = userDto.country;
    profileData.createdAt = userDto.createdAt;
    profileData.avatar = avatarDto ? avatarDto.url : null;

    return profileData;
  }
}
