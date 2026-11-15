import { Request, Response } from 'express';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';

export const settingController = {
  async getSettings(req: Request, res: Response) {
    return ApiResponse.success(res, dbStore.systemSettings);
  },

  async updateSettings(req: Request, res: Response) {
    const actor = req.user!;
    const settings = req.body;

    Object.assign(dbStore.systemSettings, settings);

    dbStore.logAudit({
      actorId: actor.id,
      action: 'SYSTEM_SETTINGS_UPDATED',
      entity: 'SYSTEM',
      entityId: 'SETTINGS',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: settings,
    });

    return ApiResponse.success(res, dbStore.systemSettings, 'System settings updated');
  },
};

