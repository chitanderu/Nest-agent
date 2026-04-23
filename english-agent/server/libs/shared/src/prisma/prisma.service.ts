import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService {
  getTest(): string {
    return 'This is a test from PrismaService';
  }
}
