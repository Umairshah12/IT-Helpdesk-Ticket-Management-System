import { Request, Response } from 'express';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';
import { v4 as uuidv4 } from 'uuid';

export const categoryController = {
  async getCategories(req: Request, res: Response) {
    return ApiResponse.success(res, dbStore.categories);
  },

  async createCategory(req: Request, res: Response) {
    const actor = req.user!;
    const { name, code, description, defaultPriority } = req.body;

    const exists = dbStore.categories.some((c) => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return ApiResponse.error(res, 'Category with this name already exists.', 'DUPLICATE_CATEGORY', undefined, 400);
    }

    const newCat = {
      id: `cat-${uuidv4().substring(0, 8)}`,
      name,
      code: code.toUpperCase(),
      description: description || null,
      defaultPriority,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.categories.push(newCat);

    dbStore.logAudit({
      actorId: actor.id,
      action: 'CATEGORY_CREATED',
      entity: 'CATEGORY',
      entityId: newCat.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { name },
    });

    return ApiResponse.success(res, newCat, 'Category created successfully', undefined, 201);
  },

  async updateCategory(req: Request, res: Response) {
    const actor = req.user!;
    const { id } = req.params;
    const cat = dbStore.categories.find((c) => c.id === id);

    if (!cat) {
      return ApiResponse.error(res, 'Category not found', 'NOT_FOUND', undefined, 404);
    }

    const { name, code, description, defaultPriority, isActive } = req.body;
    if (name) cat.name = name;
    if (code) cat.code = code.toUpperCase();
    if (description !== undefined) cat.description = description;
    if (defaultPriority) cat.defaultPriority = defaultPriority;
    if (isActive !== undefined) cat.isActive = isActive;
    cat.updatedAt = new Date();

    return ApiResponse.success(res, cat, 'Category updated successfully');
  },

  async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;
    const cat = dbStore.categories.find((c) => c.id === id);

    if (!cat) {
      return ApiResponse.error(res, 'Category not found', 'NOT_FOUND', undefined, 404);
    }

    cat.isActive = false;
    cat.updatedAt = new Date();

    return ApiResponse.success(res, null, 'Category deactivated');
  },
};

