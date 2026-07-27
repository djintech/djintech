import { registerEnumType } from '@nestjs/graphql';

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

registerEnumType(SortDirection, {
  name: 'SortDirection',
});
