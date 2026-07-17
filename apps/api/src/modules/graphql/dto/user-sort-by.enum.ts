import { registerEnumType } from '@nestjs/graphql';

export enum UserSortBy {
  USERNAME = 'username',
  CREATED_AT = 'createdAt',
}

registerEnumType(UserSortBy, {
  name: 'UserSortBy',
});
