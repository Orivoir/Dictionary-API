import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiModule } from './api/api.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({
      envFilePath: '.env.local',
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
