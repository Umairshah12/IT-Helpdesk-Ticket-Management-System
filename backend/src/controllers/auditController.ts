import { Request, Response } from 'express';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';

export const auditController = {
  async getAuditLogs(req: Request, res: Response) {
    const { action, entity, search, page = 1, limit = 25 } = req.query as any;

    let logs = [...dbStore.auditLogs];

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    }
    if (entity) {
      logs = logs.filter((l) => l.entity.toLowerCase() === entity.toLowerCase());
    }
    if (search) {
      const term = search.toLowerCase();
      logs = logs.filter((l) => l.action.toLowerCase().includes(term) || l.entity.toLowerCase().includes(term));
    }

    logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = logs.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const paginated = logs.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const hydrated = paginated.map((l) => {
      const actor = dbStore.users.find((u) => u.id === l.actorId);
      return {
        ...l,
        actor: actor ? { id: actor.id, fullName: actor.fullName, email: actor.email, role: actor.role } : null,
      };
    });

    return ApiResponse.success(res, hydrated, undefined, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  },
};
