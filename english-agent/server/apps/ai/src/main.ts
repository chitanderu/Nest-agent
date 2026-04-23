import { NestFactory } from '@nestjs/core';
import { AiModule } from './ai.module';

async function bootstrap() {
  const app = await NestFactory.create(AiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
