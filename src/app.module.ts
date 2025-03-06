import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Chatbot } from './ChatBot/chatbot.gateway'; 
import { EventsGateway } from './events.gateway';
import { CommentsModule } from './Comments/comments.module';


@Module({
  imports: [CommentsModule],
  controllers: [AppController],
  providers: [AppService, Chatbot, EventsGateway],
})


export class AppModule {} 
