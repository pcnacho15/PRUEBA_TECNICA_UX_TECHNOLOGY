import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SWAGGER_PATH, configureApp, setupSwagger } from './app.setup.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  configureApp(app);
  setupSwagger(app);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(
    `API en http://localhost:${port} · Swagger en http://localhost:${port}/${SWAGGER_PATH}`,
    'Bootstrap',
  );
}
await bootstrap();
