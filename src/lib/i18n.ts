import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages } from 'next-intl';
import en from '@/locale/en.json';
import es from '@/locale/es.json';
import ja from '@/locale/ja.json';

const defaultLocale = process.env.NEXT_DEFAULT_LOCALE || 'en';
const supportedLocales = process.env.NEXT_SUPPORTED_LOCALES?.split(',') || [defaultLocale];
const localeDir = process.env.NEXT_LOCALE_DIR || '@locale';

export default getRequestConfig(async ({ locale = defaultLocale }) => {
  const validatedLocale = supportedLocales.includes(locale) ? locale : defaultLocale;

  return {
    locale: validatedLocale,
    messages: (await import(`${localeDir}/${validatedLocale}.json`)) as AbstractIntlMessages,
    timeZone: 'UTC'
  };
});

export type Translations = {
  search: {
    placeholder: string;
    button: string;
  };
  beatmap: {
    download: string;
    difficulty: string;
  };
};

type NestedTranslation = {
  [key: string]: string | NestedTranslation;
};

const translations: Record<string, NestedTranslation> = {
  en,
  es,
  ja,
};

export function getTranslations(locale: string) {
  return translations[locale] || translations.en;
}

export function t(locale: string, key: string): string {
  const translation = getTranslations(locale);
  // Handle nested keys like "search.placeholder"
  const parts = key.split('.');
  let result: any = translation;
  
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      return key; // Key not found, return the key itself
    }
  }
  
  return typeof result === 'string' ? result : key;
}