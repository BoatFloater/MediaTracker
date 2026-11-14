import { formatter } from '@lingui/format-json';

export default {
  locales: ['da', 'de', 'en', 'es', 'fr', 'ko', 'pt'],
  catalogs: [
    {
      path: 'src/i18n/locales/{locale}/translation',
      include: ['src'],
    },
  ],
  fallbackLocales: {
    default: 'en',
  },
  sourceLocale: 'en',
  format: formatter({ style: 'minimal' }),
  compileNamespace: 'ts',
};
