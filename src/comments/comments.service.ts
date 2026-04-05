import { Injectable, NotFoundException, BadRequestException, UnprocessableEntityException, Inject, forwardRef } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Comment } from './interfaces/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class CommentsService {
  private comments: Comment[] = [];

  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  findByArticleId(articleId: string): Comment[] {
    this.validateUuid(articleId);
    return this.comments.filter(c => c.articleId === articleId);
  }

  findOne(id: string): Comment {
    this.validateUuid(id);
    const comment = this.comments.find(c => c.id === id);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return comment;
  }

  create(createCommentDto: CreateCommentDto): Comment {
    this.validateUuid(createCommentDto.articleId);
    
    try {
      this.articlesService.findOne(createCommentDto.articleId);
    } catch (error) {
      throw new UnprocessableEntityException(`Article with id ${createCommentDto.articleId} does not exist`);
    }

    if (createCommentDto.authorId) {
      this.validateUuid(createCommentDto.authorId);
    }

    const newComment: Comment = {
      id: randomUUID(),
      content: createCommentDto.content,
      articleId: createCommentDto.articleId,
      authorId: createCommentDto.authorId || null,
      createdAt: Date.now(),
    };
    
    this.comments.push(newComment);
    return newComment;
  }

  delete(id: string): void {
    this.validateUuid(id);
    const index = this.comments.findIndex(c => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    this.comments.splice(index, 1);
  }

  onArticleDelete(articleId: string): void {
    this.comments = this.comments.filter(c => c.articleId !== articleId);
  }

  onUserDelete(userId: string): void {
    this.comments = this.comments.filter(c => c.authorId !== userId);
  }

  private validateUuid(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
  }
}
