import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  constructor() {}
  getHello() {
    return 'ai'
  }
}
