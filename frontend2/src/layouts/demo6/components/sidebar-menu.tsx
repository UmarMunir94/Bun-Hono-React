import { SidebarMenuPrimary } from './sidebar-menu-primary';
import { SidebarMenuSecondary } from './sidebar-menu-secondary';

export function SidebarMenu() {
  return (
    <div className="flex-1 min-h-0 relative flex flex-col ps-2">
      <div className="overflow-y-auto grow scroll-smooth [scrollbar-width:thin] [scrollbar-color:var(--color-zinc-400)_transparent] dark:[scrollbar-color:var(--color-zinc-600)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-zinc-400/50 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600/50 [&::-webkit-scrollbar-thumb]:rounded-full">
        <div className="pb-10 pe-2">
          <SidebarMenuPrimary />
          <div className="border-b border-input my-4 mx-5"></div>
          <SidebarMenuSecondary />
        </div>
      </div>
    </div>
  );
}
