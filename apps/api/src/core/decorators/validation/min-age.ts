import { registerDecorator, ValidationArguments, ValidationOptions, } from 'class-validator';

export function MinAge(minAge: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'MinAge',
      target: object.constructor,
      propertyName,
      constraints: [minAge],
      options: validationOptions,
      validator: {
        validate(value: Date) {
          if (!value) return true; // if optional

          if (!(value instanceof Date) || isNaN(value.getTime())) {
            return false;
          }

          const today = new Date();
          let age = today.getFullYear() - value.getFullYear();
          const m = today.getMonth() - value.getMonth();

          if (m < 0 || (m === 0 && today.getDate() < value.getDate())) {
            age--;
          }

          return age >= minAge;
        },

        defaultMessage(args: ValidationArguments) {
          return `User must be at least ${minAge} years old`;
        },
      },
    });
  };
}