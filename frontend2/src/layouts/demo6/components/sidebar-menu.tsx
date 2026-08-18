import { SidebarMenuPrimary } from './sidebar-menu-primary';

// import { SidebarMenuSecondary } from './sidebar-menu-secondary';

export function SidebarMenu() {
  return (
    <div className="flex-1 min-h-0 relative flex flex-col ps-2">
      <div className="overflow-y-auto scroll-smooth grow">
        <div className="pb-10 pe-2">
          <SidebarMenuPrimary />
          {/* <div className="border-b border-input my-4 mx-5"></div> */}
          {/* <SidebarMenuSecondary /> */}
        </div>
      </div>
    </div>
  );
}
