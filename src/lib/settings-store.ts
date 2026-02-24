import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SettingsState {
  pickupLocation: string;
  pickupSchedule: string;
  systemBanner: string;
  update: (partial: Partial<Pick<SettingsState, 'pickupLocation' | 'pickupSchedule' | 'systemBanner'>>) => void;
}

const DEFAULT_PICKUP_LOCATION = 'University Economic Enterprise Unit';
const DEFAULT_PICKUP_SCHEDULE = 'Weekdays 8:00 AM – 4:00 PM (excluding holidays)';
const DEFAULT_SYSTEM_BANNER =
  'Pickup Only — University Economic Enterprise Unit • Payment is done at the University Cashier.';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pickupLocation: DEFAULT_PICKUP_LOCATION,
      pickupSchedule: DEFAULT_PICKUP_SCHEDULE,
      systemBanner: DEFAULT_SYSTEM_BANNER,
      update: (partial) => set((state) => ({ ...state, ...partial })),
    }),
    {
      name: 'apex-settings',
    },
  ),
);

