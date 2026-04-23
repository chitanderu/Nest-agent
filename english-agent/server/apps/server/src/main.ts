import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Config } from '@en/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(Config.ports.server);
}
bootstrap();
