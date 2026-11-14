const translate = (descriptor: unknown) => {
  if (typeof descriptor === 'string') {
    return descriptor;
  }

  const value = descriptor as { message?: string; id?: string } | undefined;
  return value?.message ?? value?.id ?? '';
};

export const i18n = {
  _: jest.fn(translate),
  t: jest.fn(translate),
  load: jest.fn(),
  loadAndActivate: jest.fn(),
  activate: jest.fn(),
  locale: 'en',
  locales: ['en'],
  date: jest.fn(),
  number: jest.fn(),
};

export const setupI18n = jest.fn(() => i18n);
export const I18n = jest.fn(() => i18n);
export const formats = {};
