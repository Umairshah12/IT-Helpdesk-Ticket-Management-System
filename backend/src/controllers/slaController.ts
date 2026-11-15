import { Request, Response } from 'express';
import { dbStore } from '../data/store';
import { ApiResponse } from '../utils/apiResponse';
import { slaCalculator } from '../utils/slaCalculator';
import { v4 as uuidv4 } from 'uuid';

export const slaController = {
  async getPolicies(req: Request, res: Response) {
    return ApiResponse.success(res, dbStore.slaPolicies);
  },

  async createPolicy(req: Request, res: Response) {
    const actor = req.user!;
    const { name, priority, responseTimeMinutes, resolutionTimeMinutes, isBusinessHoursOnly, description } = req.body;

    const exists = dbStore.slaPolicies.some((p) => p.priority === priority);
    if (exists) {
      return ApiResponse.error(res, `An SLA policy for priority ${priority} already exists.`, 'DUPLICATE_PRIORITY', undefined, 400);
    }

    const newPolicy = {
      id: `sla-${uuidv4().substring(0, 8)}`,
      name,
      priority,
      responseTimeMinutes,
      resolutionTimeMinutes,
      isBusinessHoursOnly: isBusinessHoursOnly ?? true,
      description: description || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dbStore.slaPolicies.push(newPolicy);

    dbStore.logAudit({
      actorId: actor.id,
      action: 'SLA_POLICY_CREATED',
      entity: 'SLA_POLICY',
      entityId: newPolicy.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { name, priority, responseTimeMinutes, resolutionTimeMinutes },
    });

    return ApiResponse.success(res, newPolicy, 'SLA Policy created successfully', undefined, 201);
  },

  async updatePolicy(req: Request, res: Response) {
    const actor = req.user!;
    const { id } = req.params;
    const policy = dbStore.slaPolicies.find((p) => p.id === id);

    if (!policy) {
      return ApiResponse.error(res, 'SLA policy not found', 'NOT_FOUND', undefined, 404);
    }

    const { name, responseTimeMinutes, resolutionTimeMinutes, isBusinessHoursOnly, description, isActive } = req.body;
    if (name) policy.name = name;
    if (responseTimeMinutes !== undefined) policy.responseTimeMinutes = responseTimeMinutes;
    if (resolutionTimeMinutes !== undefined) policy.resolutionTimeMinutes = resolutionTimeMinutes;
    if (isBusinessHoursOnly !== undefined) policy.isBusinessHoursOnly = isBusinessHoursOnly;
    if (description !== undefined) policy.description = description;
    if (isActive !== undefined) policy.isActive = isActive;
    policy.updatedAt = new Date();

    dbStore.logAudit({
      actorId: actor.id,
      action: 'SLA_POLICY_UPDATED',
      entity: 'SLA_POLICY',
      entityId: policy.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { priority: policy.priority, resolutionTimeMinutes },
    });

    return ApiResponse.success(res, policy, 'SLA policy updated successfully');
  },

  async getSLACompliance(req: Request, res: Response) {
    const tickets = dbStore.tickets;
    let totalEvaluated = 0;
    let breachedCount = 0;
    let nearBreachCount = 0;

    const now = Date.now();

    tickets.forEach((t) => {
      if (!t.resolutionDueAt) return;
      totalEvaluated++;
      const isOverdue = slaCalculator.checkIsOverdue(t.resolutionDueAt, t.status);
      if (isOverdue) {
        breachedCount++;
      } else if (t.status !== 'RESOLVED' && t.status !== 'CLOSED') {
        const diffMins = (new Date(t.resolutionDueAt).getTime() - now) / (1000 * 60);
        if (diffMins <= 60 && diffMins > 0) {
          nearBreachCount++;
        }
      }
    });

    const complianceRate = totalEvaluated > 0 ? Math.round(((totalEvaluated - breachedCount) / totalEvaluated) * 100) : 100;

    return ApiResponse.success(res, {
      complianceRate,
      totalEvaluated,
      breachedCount,
      nearBreachCount,
    });
  },
};

