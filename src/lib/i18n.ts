// import { getRelativeLocaleUrl } from 'astro:i18n';
import { DEFAULT_LOCALE_SETTING, LOCALES_SETTING } from '@/lib/i18nLocales';

/**
 * User-defined locales list
 * @constant @readonly
 */
export const LOCALES = LOCALES_SETTING as Record<string, LocaleConfig>;
type LocaleConfig = {
  readonly label: string;
  readonly lang: string;
  readonly oglocale: string;
  readonly dir?: 'ltr' | 'rtl';
  readonly path: string;
};

/**
 * Type for the language code
 * @example
 * "en" | "ja" | ...
 */
export type Lang = keyof typeof LOCALES;

/**
 * Default locale code
 * @constant @readonly
 */
export const DEFAULT_LOCALE = DEFAULT_LOCALE_SETTING as Lang;

/**
 * Type for the multilingual object
 * @example
 * { en: "Hello", ja: "こんにちは", ... }
 */
export type Multilingual = { [key in Lang]?: string };

/**
 * Helper to get the translation function
 * @param - The current language
 * @returns - The translation function
 */
export function useTranslations(lang: Lang) {
  return function t(multilingual: Multilingual | string): string {
    if (typeof multilingual === 'string') {
      return multilingual;
    } else {
      return multilingual[lang] || multilingual[DEFAULT_LOCALE] || '';
    }
  };
}

/**
 * Helper to get corresponding path list for all locales
 * @param url - The current URL object
 * @returns - The list of locale paths
 */
// 各言語TOPに遷移する場合
// export function getLocalePaths(): LocalePath[] {
//   return Object.keys(LOCALES).map((key) => ({
//     lang: key as Lang,
//     // getRelativeLocaleUrlに渡す引数を、LOCALES_SETTINGのキーに合わせる
//     path: getRelativeLocaleUrl(key),
//   }));
// }
// 各言語の同一ページに遷移する場合
export function getLocalePaths(url: URL): LocalePath[] {
  const basePath = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;

  // 既存の言語プレフィックスを取り除く
  let pathWithoutLang = basePath;
  Object.values(LOCALES).forEach((locale) => {
    const prefix = `/${locale.path}/`;
    if (pathWithoutLang.startsWith(prefix)) {
      pathWithoutLang = `/${pathWithoutLang.slice(prefix.length)}`;
    }
  });

  // 言語ごとにURLを生成
  return Object.entries(LOCALES).map(([key, locale]) => {
    const finalPath = key === DEFAULT_LOCALE ? pathWithoutLang : `/${locale.path}${pathWithoutLang}`;
    return {
      lang: key as Lang,
      path: finalPath.endsWith('/') ? finalPath : `${finalPath}/`,
    };
  });
}

type LocalePath = {
  lang: Lang;
  path: string;
};

/**
 * Helper to get locale parms for Astro's `getStaticPaths` function
 * @returns - The list of locale params
 * @see https://docs.astro.build/en/guides/routing/#dynamic-routes
 */
export const localeParams = Object.keys(LOCALES).map((lang) => ({
  params: { lang },
}));
