import { registerEnumType } from '@nestjs/graphql';

export enum UserStatusFilter {
  ALL = 'all',
  BLOCKED = 'blocked',
  UNBLOCKED = 'unblocked',
}

registerEnumType(UserStatusFilter, {
  name: 'UserStatusFilter',
});
