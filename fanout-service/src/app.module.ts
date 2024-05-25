import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { CacheService } from './services/cache.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          url: process.env.USERS_GRPC_URL,
          package: 'users',
          protoPath: join(__dirname, 'users.proto'),
        },
      },
    ]),
  ],
  controllers: [],
  providers: [AppService, CacheService],
})
export class AppModule {}
