import apiDatabaseConfig from './db/api.db.config';

export enum ServiceName {
  API = 'api',
}

export default (serviceName: string) => {
  switch (serviceName) {
    case ServiceName.API:
      return apiDatabaseConfig();
    default:
      return {};
  }
};