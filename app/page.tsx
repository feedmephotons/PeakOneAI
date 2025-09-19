import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';

export default function Home() {
  return (
    <ResponsiveLayout>
      <DashboardWidgets />
    </ResponsiveLayout>
  );
}