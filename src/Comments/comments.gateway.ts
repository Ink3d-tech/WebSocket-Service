import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { CommentsService } from './comments.service';
  
  @WebSocketGateway({ cors: { origin: '*' } })
  export class CommentsGateway {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly commentsService: CommentsService) {}
  
    @SubscribeMessage('newComment')
    handleNewComment(@MessageBody() comment: any, @ConnectedSocket() socket: Socket) {
      this.commentsService.addComment(comment);
      this.server.emit('updateComments', this.commentsService.getComments());
    }
  }
  