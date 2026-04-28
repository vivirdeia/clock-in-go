import type { Zone } from '@/types';
import { haversineDistance } from '@/types';

/**
 * Returns the active zone the coordinates belong to (within radius), considering
 * department assignment. Returns null if no matching zone — i.e. out of zone.
 */
export function findMatchingZone(lat: number, lng: number, zones: Zone[], departmentId?: string): Zone | null {
  const candidates = zones.filter(z => z.active && (z.assignedTo.includes('all') || (departmentId && z.assignedTo.includes(departmentId))));
  for (const z of candidates) {
    if (haversineDistance(lat, lng, z.lat, z.lng) <= z.radiusMeters) return z;
  }
  return null;
}

export function distanceToNearestZone(lat: number, lng: number, zones: Zone[]): { zone: Zone; distance: number } | null {
  const active = zones.filter(z => z.active);
  if (active.length === 0) return null;
  let best: { zone: Zone; distance: number } | null = null;
  for (const z of active) {
    const d = haversineDistance(lat, lng, z.lat, z.lng);
    if (!best || d < best.distance) best = { zone: z, distance: d };
  }
  return best;
}
