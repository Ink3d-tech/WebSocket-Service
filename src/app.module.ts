import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Chatbot } from './chatbot.gateway'; 

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, Chatbot],
})
export class AppModule {}
