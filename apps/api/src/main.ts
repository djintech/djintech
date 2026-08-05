import { NestFactory } from '@nestjs/core';
import { CoreConfig } from './core/config/core.config';
import { appSetup } from './setup/api.setup';
import cookieParser from 'cookie-parser';
import { initAppModule } from './init-app-module';
import { Transport } from '@nestjs/microservices';
import { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE_SUBSCRIPTION_ACTIVATED, RABBITMQ_QUEUE_SUBSCRIPTION_EXPIRED } from '@libs/constants/rabbitmq';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import { GraphQLSchemaHost } from '@nestjs/graphql';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  const app = await NestFactory.create(DynamicAppModule, { rawBody: true });
  const coreConfig = app.get<CoreConfig>(CoreConfig);

   app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [coreConfig.rabbitmqUrl],
      exchange: RABBITMQ_EXCHANGE,
      exchangeType: 'topic',
      queue: RABBITMQ_QUEUE_SUBSCRIPTION_ACTIVATED,
      queueOptions: { durable: true },
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [coreConfig.rabbitmqUrl],
      exchange: RABBITMQ_EXCHANGE,
      exchangeType: 'topic',
      queue: RABBITMQ_QUEUE_SUBSCRIPTION_EXPIRED,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  
  app.setGlobalPrefix('api/v1');
  appSetup(app, coreConfig.isSwaggerEnabled); //global settings

  app.use(cookieParser());

  app.enableCors({
    origin: coreConfig.corsOrigin.split(','), 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true, // for cookier (example refreshToken)
  });

  const port = coreConfig.port;
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });

  const httpServer = app.getHttpServer();
  const { schema } = app.get(GraphQLSchemaHost);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/api/v1/graphql',
    handleProtocols: (protocols) => {
      if (protocols.has('graphql-transport-ws')) {
        return 'graphql-transport-ws';
      }
      return false;
    },
  });

  useServer(
    {
      schema,

      onConnect: () => {
        console.log('GraphQL WS connected');
      },

      onDisconnect: () => {
        console.log('GraphQL WS disconnected');
      },
    },
    wsServer,
  );
}
bootstrap();
