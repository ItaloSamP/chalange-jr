import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const url = new URL(process.env['DATABASE_URL'] ?? 'postgresql://postgres:senha@localhost:5432/clientes');
    const adapter = new PrismaPg({
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      user: url.username || 'postgres',
      password: url.password || 'senha',
      database: url.pathname.replace('/', ''),
    });
    super({ adapter } as any);
  }

  async onModuleInit() {
    await this.$connect();
  }
}