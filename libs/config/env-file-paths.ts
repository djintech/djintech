import { join } from 'path';

if (!process.env.NODE_ENV) {
  throw new Error('NODE_ENV is required');
}

 export const envFilePaths = [
    process.env.ENV_FILE_PATH?.trim() || '',
    `.env.${process.env.NODE_ENV}.local`,
    `.env.${process.env.NODE_ENV}`,
    '.env.production',
  ];

  
  