import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Category } from './interfaces/category.interface';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ArticlesService } from '../articles/articles.service';

@Injectable()
export class CategoriesService {
  private categories: Category[] = [];

  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  findAll(): Category[] {
    return [...this.categories];
  }

  findOne(id: string): Category {
    this.validateUuid(id);
    const category = this.categories.find(c => c.id === id);
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  create(createCategoryDto: CreateCategoryDto): Category {
    const newCategory: Category = {
      id: randomUUID(),
      name: createCategoryDto.name,
      description: createCategoryDto.description,
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  update(id: string, updateCategoryDto: UpdateCategoryDto): Category {
    this.validateUuid(id);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    const category = this.categories[index];
    const updatedCategory = {
      ...category,
      ...updateCategoryDto,
    };
    this.categories[index] = updatedCategory;
    return updatedCategory;
  }

  delete(id: string): void {
    this.validateUuid(id);
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    
    this.articlesService.onCategoryDelete(id);
    
    this.categories.splice(index, 1);
  }

  private validateUuid(id: string): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
  }
}
