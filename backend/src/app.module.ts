import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '@/core/auth/auth.module';
import { UsersModule } from '@/core/users/users.module';
import { KnexModule } from 'nestjs-knex';
import { getConfig } from './config/ormconfig';
import { PostsModule } from './modules/posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [getConfig],
    }),
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          ...configService.get('database'),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}
