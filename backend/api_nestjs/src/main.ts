// api_nestjs/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Importar

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // --- 2. Añadir esta línea ---
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Ignora campos que NO estén en el DTO
            forbidNonWhitelisted: true, // Lanza error si hay campos no permitidos
            transform: true, // Transforma el payload al tipo del DTO
        }),
    );
    // --------------------------

    await app.listen(3000); // Puedes cambiar el puerto si lo deseas
}
bootstrap();