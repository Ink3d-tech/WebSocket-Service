import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';
import * as dotenv from 'dotenv';

dotenv.config();

class WebSocketAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = new Server(port, {
      cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'],
        credentials: true,
      },
    });
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useWebSocketAdapter(new WebSocketAdapter(app)); 

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT);
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
}

bootstrap();
