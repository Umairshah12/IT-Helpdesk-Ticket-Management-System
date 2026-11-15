import { ENV } from '../config/env';

export interface SLACalculationInput {
  createdAt?: Date;
  responseTimeMinutes: number;
  resolutionTimeMinutes: number;
  isBusinessHoursOnly?: boolean;
}

export const slaCalculator = {
  calculateDeadlines({
    createdAt = new Date(),
    responseTimeMinutes,
    resolutionTimeMinutes,
    isBusinessHoursOnly = true,
  }: SLACalculationInput): { responseDueAt: Date; resolutionDueAt: Date } {
    if (!isBusinessHoursOnly) {
      const responseDueAt = new Date(createdAt.getTime() + responseTimeMinutes * 60 * 1000);
      const resolutionDueAt = new Date(createdAt.getTime() + resolutionTimeMinutes * 60 * 1000);
      return { responseDueAt, resolutionDueAt };
    }

    // Business hours calculation (Monday to Friday, 09:00 - 18:00 UTC)
    const [startHour, startMin] = (ENV.BUSINESS_HOURS_START || '09:00').split(':').map(Number);
    const [endHour, endMin] = (ENV.BUSINESS_HOURS_END || '18:00').split(':').map(Number);
    const dailyMinutes = (endHour - startHour) * 60 + (endMin - startMin);

    const addBusinessMinutes = (startDate: Date, minutesToAdd: number): Date => {
      let current = new Date(startDate.getTime());
      let remaining = minutesToAdd;

      while (remaining > 0) {
        const day = current.getUTCDay(); // 0 is Sunday, 6 is Saturday
        if (day === 0) {
          // Advance to Monday 09:00
          current.setUTCDate(current.getUTCDate() + 1);
          current.setUTCHours(startHour, startMin, 0, 0);
          continue;
        }
        if (day === 6) {
          // Advance to Monday 09:00
          current.setUTCDate(current.getUTCDate() + 2);
          current.setUTCHours(startHour, startMin, 0, 0);
          continue;
        }

        const currentHour = current.getUTCHours();
        const currentMin = current.getUTCMinutes();
        const currentMinutesInDay = currentHour * 60 + currentMin;
        const workDayStartMinutes = startHour * 60 + startMin;
        const workDayEndMinutes = endHour * 60 + endMin;

        // If before working hours, jump to start
        if (currentMinutesInDay < workDayStartMinutes) {
          current.setUTCHours(startHour, startMin, 0, 0);
          continue;
        }

        // If after working hours, jump to next day start
        if (currentMinutesInDay >= workDayEndMinutes) {
          current.setUTCDate(current.getUTCDate() + 1);
          current.setUTCHours(startHour, startMin, 0, 0);
          continue;
        }

        const availableToday = workDayEndMinutes - currentMinutesInDay;
        if (remaining <= availableToday) {
          current = new Date(current.getTime() + remaining * 60 * 1000);
          remaining = 0;
        } else {
          remaining -= availableToday;
          current.setUTCDate(current.getUTCDate() + 1);
          current.setUTCHours(startHour, startMin, 0, 0);
        }
      }

      return current;
    };

    const responseDueAt = addBusinessMinutes(createdAt, responseTimeMinutes);
    const resolutionDueAt = addBusinessMinutes(createdAt, resolutionTimeMinutes);

    return { responseDueAt, resolutionDueAt };
  },

  checkIsOverdue(resolutionDueAt?: Date | null, status?: string): boolean {
    if (!resolutionDueAt) return false;
    if (status === 'RESOLVED' || status === 'CLOSED') return false;
    return new Date() > new Date(resolutionDueAt);
  },
};

