import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Article } from './interfaces/article.interface';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CommentsService } from '../comments/comments.service';

@Injectable()
export class ArticlesService {
  private articles: Article[] = [];

  constructor(
    @Inject(forwardRef(() => CommentsService))
    private readonly commentsService: CommentsService,
  ) {}

  findAll(status?: string, categoryId?: string, tag?: string): Article[] {
    let result = [...this.articles];

    if (status) {
      result = result.filter(article => article.status === status);
    }

    if (categoryId) {
      this.validateUuid(categoryId);
      result = result.filter(article => article.categoryId === categoryId);
    }

    if (tag) {
      result = result.filter(article => article.tags.includes(tag));
    }

    return result;
  }

  findOne(id: string): Article {
    this.validateUuid(id);
    const article = this.articles.find(a => a.id === id);
    if (!article) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    return article;
  }

  create(createArticleDto: CreateArticleDto, authorId?: string): Article {
    const newArticle: Article = {
      id: randomUUID(),
      title: createArticleDto.title,
      content: createArticleDto.content,
      status: createArticleDto.status || 'draft',
      authorId: authorId || null,
      categoryId: createArticleDto.categoryId || null,
      tags: createArticleDto.tags || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.articles.push(newArticle);
    return newArticle;
  }

  update(id: string, updateArticleDto: UpdateArticleDto): Article {
    this.validateUuid(id);
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }

    const article = this.articles[index];
    const updatedArticle = {
      ...article,
      ...updateArticleDto,
      updatedAt: Date.now(),
    };
    this.articles[index] = updatedArticle;
    return updatedArticle;
  }

  delete(id: string): void {
    this.validateUuid(id);
    const index = this.articles.findIndex(a => a.id === id);
    if (index === -1) {
      throw new NotFoundException(`Article with id ${id} not found`);
    }
    
    this.commentsService.onArticleDelete(id);
    
    this.articles.splice(index, 1);
  }

  onUserDelete(userId: string): void {
    this.articles.forEach(article => {
      if (article.authorId === userId) {
        article.authorId = null;
        article.updatedAt = Date.now();
      }
    });
  }

  onCategoryDelete(categoryId: string): void {
    this.articles.forEach(article => {
      if (article.categoryId === categoryId) {
        article.categoryId = null;
        article.updatedAt = Date.now();
      }
    });
  }

  private validateUuid(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
  }
}
