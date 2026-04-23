import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';
import { Config } from '@en/config';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  await app.listen(Config.ports.ai);
}
bootstrap();
