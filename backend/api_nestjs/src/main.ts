// api_nestjs/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ← AGREGAR CORS
    app.enableCors({
        origin: '*', // Permite todos los orígenes
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // Validación global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.listen(3000);
    console.log('🚀 NestJS API corriendo en http://localhost:3000');
}
bootstrap();