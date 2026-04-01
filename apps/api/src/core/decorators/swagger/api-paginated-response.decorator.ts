import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedViewDto } from '@src/core/dto/base.paginated.view-dto';

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel, description = 'Success') => {
  return applyDecorators(
    ApiExtraModels(PaginatedViewDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedViewDto) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
