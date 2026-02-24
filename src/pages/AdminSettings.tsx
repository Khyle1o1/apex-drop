import { AdminLayout } from '@/components/layout/AdminLayout';
import { useSettingsStore } from '@/lib/settings-store';
import { useState } from 'react';

export default function AdminSettings() {
  const { pickupLocation, pickupSchedule, systemBanner, update } = useSettingsStore();
  const [location, setLocation] = useState(pickupLocation);
  const [schedule, setSchedule] = useState(pickupSchedule);
  const [banner, setBanner] = useState(systemBanner);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    update({
      pickupLocation: location,
      pickupSchedule: schedule,
      systemBanner: banner,
    });
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Configure pickup details and the system-wide announcement banner."
    >
      <form
        onSubmit={handleSave}
        className="max-w-2xl border border-border rounded-xl bg-background p-4 md:p-6 space-y-4"
      >
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="pickupLocation">
            Pickup Location
          </label>
          <input
            id="pickupLocation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            This text appears on order instructions and in admin views.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="pickupSchedule">
            Pickup Schedule
          </label>
          <input
            id="pickupSchedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Displayed wherever pickup schedule information is needed.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="systemBanner">
            System Banner Message
          </label>
          <textarea
            id="systemBanner"
            value={banner}
            onChange={(e) => setBanner(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background min-h-[80px]"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            This appears at the very top of the site for both customers and admins.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-secondary transition-colors"
        >
          Save Settings
        </button>
      </form>
    </AdminLayout>
  );
}

