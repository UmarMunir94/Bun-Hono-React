import { useEffect, useState } from 'react';
import { StoreClientTopbar } from '@/pages/store-client/components/common/topbar';
import { addDays, format } from 'date-fns';
import { CalendarDays, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Helmet } from 'react-helmet-async';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useBodyClass } from '@/hooks/use-body-class';
import { useMenu } from '@/hooks/use-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

const Demo6Layout = () => {
  const isMobile = useIsMobile();
  const { setOption } = useSettings();
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  useBodyClass(`
    [--header-height:60px]
    [--header-height-mobile:54px]
    [--sidebar-width:270px]
    bg-muted!
  `);

  useEffect(() => {
    setOption('layout', 'demo6');
  }, [setOption]);

  return (
    <>
      <Helmet>
        <title>{item?.title}</title>
      </Helmet>

      <div className="flex grow">
        {!isMobile && <Sidebar />}

        {isMobile && <Header />}

        <div className="flex flex-col grow min-w-0 pt-(--header-height-mobile) lg:pt-0 lg:ms-(--sidebar-width)">
          <main
            className="flex flex-col grow min-w-0 items-stretch rounded-xl bg-background border border-input mt-2 sm:mt-[15px] mx-2 sm:mx-3.5 mb-2 sm:mb-[15px]"
            role="content"
          >
            <div className="flex flex-col grow pt-5">
              <Toolbar>
                <ToolbarHeading />

                <ToolbarActions>
                  <>
                    {pathname.startsWith('/store-client') ? (
                      <StoreClientTopbar />
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link to={'/account/home/get-started'}>
                            <Download />
                            Export
                          </Link>
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button id="date" variant="outline">
                              <CalendarDays />
                              {date?.from ? (
                                date.to ? (
                                  <span>
                                    {format(date.from, 'LLL dd, y')} -{' '}
                                    {format(date.to, 'LLL dd, y')}
                                  </span>
                                ) : (
                                  format(date.from, 'LLL dd, y')
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="range"
                              defaultMonth={date?.from}
                              selected={date}
                              onSelect={setDate}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  </>
                </ToolbarActions>
              </Toolbar>

              <Outlet />
            </div>

            <Footer />
          </main>
        </div>
      </div>
    </>
  );
};

export { Demo6Layout };

