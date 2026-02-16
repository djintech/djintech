import { ConfigModule } from "@nestjs/config";
import configuration, { ServiceName } from "./configuration";
import { Environments } from "./base-core.config";
import { getEnvFilePath } from "./env-file-paths";

//console.log('Loading env files from:', envFilePaths);
// must import this const in the head of your app.module.ts
export const configModule = (serviceName: ServiceName) =>
  ConfigModule.forRoot({
  isGlobal: true, //isGlobal делает модуль глобальным (автоматически регистрируется в каждый модуле)  
  ignoreEnvFile:
      process.env.NODE_ENV !== Environments.DEVELOPMENT && process.env.NODE_ENV !== Environments.TESTING,
  envFilePath: getEnvFilePath(process.env.NODE_ENV as Environments),//envFilePaths,
  load: [() => configuration(serviceName)],
});
