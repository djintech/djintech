import { Environments } from "./base-core.config";

// if (!process.env.NODE_ENV) {
//   throw new Error('NODE_ENV is required');
// }

//  export const envFilePaths = [
//     process.env.ENV_FILE_PATH?.trim() || '',
//     `.env.${process.env.NODE_ENV}.local`,
//     `.env.${process.env.NODE_ENV}`,
//     '.env.production',
//   ];

export const getEnvFilePath = (env: Environments) => {
  const defaultEnvFilePath = [
    '.env.development.local',
    '.env.development',
    '.env',
  ];

  if (env === Environments.TESTING) {
    return [ '.env.test', ...defaultEnvFilePath];
  }

  return defaultEnvFilePath;
};
