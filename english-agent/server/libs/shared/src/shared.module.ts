import { Module, Global } from '@nestjs/common';
import { SharedService } from './shared.service';
import { PrismaModule } from './prisma/prisma.module';

@Global()
@Module({
  providers: [SharedService],
  exports: [SharedService, PrismaModule],
  imports: [PrismaModule],
})
export class SharedModule {}
