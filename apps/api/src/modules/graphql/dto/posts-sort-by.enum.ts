import { registerEnumType } from '@nestjs/graphql';

export enum PostsSortBy {
  USERNAME = 'username',
  CREATED_AT = 'createdAt', 
}

registerEnumType(PostsSortBy, {
  name: 'PostsSortBy',
});
