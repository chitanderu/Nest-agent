import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { WordBookModule } from './word-book/word-book.module';
import { SharedModule } from '@libs/shared';

@Module({
  imports: [SharedModule, UserModule, WordBookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
