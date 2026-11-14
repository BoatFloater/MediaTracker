import { i18n } from '@lingui/core';
import { t } from '@lingui/core/macro';

import { logger } from 'src/logger';
import { GlobalConfiguration } from 'src/repository/globalSettings';

import { messages as da } from 'src/i18n/locales/da/translation';
import { messages as de } from 'src/i18n/locales/de/translation';
import { messages as en } from 'src/i18n/locales/en/translation';
import { messages as es } from 'src/i18n/locales/es/translation';
import { messages as fr } from 'src/i18n/locales/fr/translation';
import { messages as ko } from 'src/i18n/locales/ko/translation';
import { messages as pt } from 'src/i18n/locales/pt/translation';

// Migrations and early log messages can use translations before the
// server configuration is loaded.
i18n.load({ en: en });
i18n.activate('en');

export const setupI18n = (locale: string) => {
  i18n.load({ da: da, de: de, en: en, es: es, fr: fr, pt: pt, ko: ko });
  i18n.activate(locale);

  GlobalConfiguration.subscribe('serverLang', (lng) => {
    if (i18n.locale === lng || !lng) {
      return;
    }

    logger.info(t`Changing server language to ${lng}`);
    i18n.activate(lng);
  });
};
