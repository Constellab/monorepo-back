import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documentation } from './app/documentation/dn-documentation.entity';
import { DocumentationModule } from './app/documentation/dn-documentation.module';
import { Version } from './app/version/dn-version.entity';
import { VersionModule } from './app/version/dn-version.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'gencoveryDb',
      entities: [
        Documentation,
        Version
      ],
      synchronize: true,
      logging: false,
      autoLoadEntities: true
    }),
    DocumentationModule,
    VersionModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
