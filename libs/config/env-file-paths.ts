import { Environments } from './base-core.config';

export const getEnvFilePath = (env: Environments) => {
  const defaultEnvFilePath = [
    '.env.development.local',
    '.env.development',
    '.env',
  ];

  if (env === Environments.TESTING) {
    return ['.env.test', ...defaultEnvFilePath];
  }

  return defaultEnvFilePath;
};
