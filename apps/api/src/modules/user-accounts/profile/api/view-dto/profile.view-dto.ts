import { ApiProperty } from "@nestjs/swagger";
import { ProfileFullInfo } from "../../infrastructure/query/profile.query.repository";

export class ProfileViewDto {
  @ApiProperty({example: 'user1'})
  userName!: string;
  @ApiProperty( {type: 'string', nullable: true, example: 'John'} )
  firstName!: string | null;
  @ApiProperty( {type: 'string', nullable: true, example: 'Doe'} )
  lastName!: string | null;
  @ApiProperty( {type: 'string', nullable: true, example: '1888-04-10T00:00:00.000Z'} )
  dateOfBirth!: Date | null;
  @ApiProperty( {type: 'string', nullable: true, example: 'About me'} )
  aboutMe!: string | null;
  @ApiProperty( {type: 'string', nullable: true, example: 'USA'} )
  country!: string | null;
  @ApiProperty( {type: 'string', nullable: true, example: 'New York'} )
  city!: string | null;
  @ApiProperty( {type: 'string', nullable: true, example: 'https://example.com/image.jpg'} )
  avatar!: string | null;
  @ApiProperty({ example: '2026-04-02T19:36:31.129Z' })
  createdAt!: Date ;

  static mapToView( profile: ProfileFullInfo, buildUrl: (key: string) => string ) {
    const dto = new this();

    dto.userName = profile.user.username;
    dto.firstName = profile.firstName;
    dto.lastName = profile.lastName;
    dto.dateOfBirth = profile.dateOfBirth;
    dto.aboutMe = profile.aboutMe;
    dto.city = profile.city;
    dto.country = profile.country;
    dto.avatar = profile.avatar?.key ? buildUrl(profile.avatar.key) : null;
    dto.createdAt = profile.createdAt;

    return dto;
  }
}