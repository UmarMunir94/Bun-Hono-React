import { ReactNode } from 'react';
import { I18nProvider } from './i18n-provider';
import { SettingsProvider } from './settings-provider';
import { TooltipsProvider } from './tooltips-provider';

export function ProvidersWrapper({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <SettingsProvider>
        <TooltipsProvider>
          {children}
        </TooltipsProvider>
      </SettingsProvider>
    </I18nProvider>
  );
}
