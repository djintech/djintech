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

          const dob = new Date(value);

          if (isNaN(dob.getTime())) return false;

          const today = new Date();
          if (dob > today) return false;

          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();

          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
          }

          return age >= minAge;
          
          // if (!value) return true; 

          // if (!(value instanceof Date) || isNaN(value.getTime())) {
          //   return false;
          // }

          // const dob = new Date(value);
          // const today = new Date();
          // if (dob > today) return false;

          // let age = today.getFullYear() - dob.getFullYear();
          // const m = today.getMonth() - dob.getMonth();

          // if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          //   age--;
          // }

          // return age >= minAge;
        },

        defaultMessage(args: ValidationArguments) {
          return `User must be at least ${minAge} years old. And correct data format.`;
        },
      },
    });
  };
}