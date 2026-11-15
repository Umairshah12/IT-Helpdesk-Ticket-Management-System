import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTimeAgo,
  getStatusBadgeConfig,
  getPriorityBadgeConfig,
  getSLAStatus,
} from '../utils/formatters';

describe('Frontend Formatters & Utility Suite', () => {
  it('formatDate formats ISO dates properly', () => {
    const formatted = formatDate('2026-11-15T10:00:00Z', 'yyyy-MM-dd');
    expect(formatted).toBe('2026-11-15');
  });

  it('formatDate handles empty or null gracefully', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
  });

  it('getStatusBadgeConfig returns distinct styling for all ticket statuses', () => {
    const openCfg = getStatusBadgeConfig('OPEN');
    expect(openCfg.label).toBe('Open');
    expect(openCfg.bg).toContain('blue');

    const inProgressCfg = getStatusBadgeConfig('IN_PROGRESS');
    expect(inProgressCfg.label).toBe('In Progress');
    expect(inProgressCfg.bg).toContain('amber');

    const resolvedCfg = getStatusBadgeConfig('RESOLVED');
    expect(resolvedCfg.label).toBe('Resolved');
    expect(resolvedCfg.bg).toContain('emerald');

    const closedCfg = getStatusBadgeConfig('CLOSED');
    expect(closedCfg.label).toBe('Closed');
  });

  it('getPriorityBadgeConfig returns correct badges and color dots', () => {
    const critical = getPriorityBadgeConfig('CRITICAL');
    expect(critical.label).toBe('Critical');
    expect(critical.dot).toBe('bg-red-500');

    const high = getPriorityBadgeConfig('HIGH');
    expect(high.label).toBe('High');
    expect(high.dot).toBe('bg-orange-500');

    const medium = getPriorityBadgeConfig('MEDIUM');
    expect(medium.label).toBe('Medium');
    expect(medium.dot).toBe('bg-amber-500');

    const low = getPriorityBadgeConfig('LOW');
    expect(low.label).toBe('Low');
    expect(low.dot).toBe('bg-emerald-500');
  });

  it('getSLAStatus identifies breached, near breach, and resolved statuses', () => {
    // 1. Resolved / Closed
    const resolvedResult = getSLAStatus('2026-11-15T10:00:00Z', true);
    expect(resolvedResult.label).toBe('Closed');
    expect(resolvedResult.breached).toBe(false);

    // 2. Past due date (breached)
    const pastDate = new Date(Date.now() - 3600 * 1000).toISOString();
    const breachedResult = getSLAStatus(pastDate, false);
    expect(breachedResult.breached).toBe(true);
    expect(breachedResult.label).toBe('Breached');

    // 3. Near breach (< 60 minutes)
    const nearDate = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const nearResult = getSLAStatus(nearDate, false);
    expect(nearResult.breached).toBe(false);
    expect(nearResult.nearBreach).toBe(true);
    expect(nearResult.label).toBe('Near Breach');

    // 4. On Track (> 60 minutes)
    const futureDate = new Date(Date.now() + 5 * 3600 * 1000).toISOString();
    const futureResult = getSLAStatus(futureDate, false);
    expect(futureResult.breached).toBe(false);
    expect(futureResult.nearBreach).toBe(false);
    expect(futureResult.label).toBe('On Track');
  });
});
