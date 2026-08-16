import { registerEnumType } from '@nestjs/graphql';

export enum FollowersSortBy {
  USERNAME = 'username',
  CREATED_AT = 'createdAt', 
}

registerEnumType(FollowersSortBy, {
  name: 'FollowersSortBy',
});
