import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  private comments: any[] = [];

  addComment(comment: any) {
    this.comments.push(comment);
  }

  getComments() {
    return this.comments;
  }
}
