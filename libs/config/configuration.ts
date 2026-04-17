import apiDatabaseConfig from './db/api.db.config';
import paymentsDatabaseConfig from './db/payments.db.config';

export enum ServiceName {
  API = 'api',
  FILES='files',
  PAYMENTS='payments'
}

export default (serviceName: string) => {
  switch (serviceName) {
    case ServiceName.API:
      return apiDatabaseConfig();
    case ServiceName.PAYMENTS:
      return paymentsDatabaseConfig();
    default:
      return {};
  }
};
