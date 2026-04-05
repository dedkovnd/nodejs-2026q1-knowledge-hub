import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  const config = new DocumentBuilder()
    .setTitle('Knowledge Hub API')
    .setDescription('REST API for Knowledge Hub platform with articles, categories, comments and users')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addTag('articles', 'Article management endpoints with filtering')
    .addTag('categories', 'Category management endpoints')
    .addTag('comments', 'Comment management endpoints')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);
  
  await app.listen(4000);
  console.log(`Application is running on: http://localhost:4000`);
  console.log(`Swagger documentation: http://localhost:4000/doc`);
}
bootstrap();
