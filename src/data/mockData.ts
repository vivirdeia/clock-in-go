// ============================================================
// Backwards-compatibility re-export.
// Real domain types live in `src/types.ts`, demo data lives in
// `src/store/seedData.ts`, and runtime state is owned by the
// `DataStoreProvider` (see `src/store/dataStore.tsx`).
// ============================================================

export type { Employee, Department, Shift, ClockRecord, Zone, Alert } from '@/types';
export { getInitials, formatTime, formatDate, formatShortDate, haversineDistance } from '@/types';
