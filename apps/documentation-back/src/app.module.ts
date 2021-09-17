import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentationController } from './app/documentation/documentation.controller';
import { Documentation } from './app/documentation/documentation.entity';
import { DocumentationModule } from './app/documentation/documentation.module';
import { DocumentationService } from './app/documentation/documentation.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "root",
      database: "gencoveryDb",
      entities: [
        Documentation
      ],
      synchronize: true,
      logging: false,
      autoLoadEntities: true
    }),
    DocumentationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
