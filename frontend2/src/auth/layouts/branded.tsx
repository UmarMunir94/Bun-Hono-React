import { Outlet } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';

export function BrandedLayout() {
  return (
    <div className="flex justify-center items-center grow p-8 lg:p-10">
      <Card className="w-full max-w-[400px]">
        <CardContent className="p-6">
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
}
