import { useEffect } from 'react';
import { Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useBodyClass } from '@/hooks/use-body-class';
import { useMenu } from '@/hooks/use-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Navbar } from './components/navbar';
import { Sidebar } from './components/sidebar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

export function Demo3Layout() {
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);
  const { setOption } = useSettings();
  const isMobileMode = useIsMobile();

  useBodyClass(`
    [--header-height:58px] 
    [--sidebar-width:58px] 
    [--navbar-height:56px] 
    bg-muted!
  `);

  useEffect(() => {
    setOption('layout', 'demo3');
    setOption('container', 'fluid');
  }, [setOption]);

  return (
    <>
      <Helmet>
        <title>{item?.title}</title>
      </Helmet>
      <div className="flex grow">
        <Header />

        <div className="flex flex-col lg:flex-row grow pt-(--header-height)">
          {!isMobileMode && <Sidebar />}

          <Navbar />

          <div className="flex flex-col grow lg:ms-(--sidebar-width) lg:mt-(--navbar-height) m-5">
            <main
              className="flex flex-col grow rounded-b-xl bg-background border-x border-b border-border"
              role="content"
            >
              <div className="flex flex-col grow pt-7">
                {pathname !== '/' && (
                  <Toolbar>
                    <ToolbarHeading />
                    <ToolbarActions>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={'/account/home/get-started'}>
                          <Download />
                          Export
                        </Link>
                      </Button>
                    </ToolbarActions>
                  </Toolbar>
                )}
                <Outlet />
              </div>
              <Footer />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

