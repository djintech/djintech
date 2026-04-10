import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectCleaner {
  cleanFromUndefined<T extends object>(obj: T): Partial<T> {
    const result: Partial<T> = {};

    for (const key in obj) {
      const value = obj[key];

      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }
}
