import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return this.prisma.getTest();
  }
}
