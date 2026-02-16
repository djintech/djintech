import { Global, Module } from "@nestjs/common";
import { CoreConfig } from "./config/core.config";

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [],
  exports: [CoreConfig],
  providers: [CoreConfig],
})
export class ApiCoreModule {}