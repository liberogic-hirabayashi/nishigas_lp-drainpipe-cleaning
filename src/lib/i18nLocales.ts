export const DEFAULT_LOCALE_SETTING: string = 'ja';

export const LOCALES_SETTING: LocaleSetting = {
  ja: {
    label: '日本語',
    lang: 'ja',
    oglocale: 'ja_JP',
    path: 'ja',
    // codes: ['ja', 'ja-JP'],
  },
  // en: {
  //   label: 'English',
  //   lang: 'en',
  //   oglocale: 'en_US',
  //   path: 'en',
  //   // codes: ['en', 'en-US', 'en-GB', 'en-AU'],
  // },
  // cn: {
  //   label: '簡体中文',
  //   lang: 'zh-CN',
  //   oglocale: 'zh_CN',
  //   path: 'zh-cn',
  //   // codes: ['zh', 'zh-CN', 'zh-Hans'],
  // },
};

interface LocaleSetting {
  [key: Lowercase<string>]: {
    label: string;
    lang: string;
    oglocale: string;
    dir?: 'rtl' | 'ltr';
    path: string;
    // codes?: string[]; // 言語に合わせてリダイレクトをしたい時に使うもの
  };
}
