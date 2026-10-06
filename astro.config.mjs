import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import htmlBeautifier from 'astro-html-beautifier';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import { DEFAULT_LOCALE_SETTING, LOCALES_SETTING } from './src/lib/i18nLocales';

const url = 'https://www.nichigas.co.jp/';
const base = '/drainpipe-cleaning';

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
const beautifierOption = {
  eol: '\n',
  indent_char: ' ',
  indent_size: 2,
  indent_with_tabs: false,
  brace_style: 'collapse',
  end_with_newline: true,
  indent_handlebars: true,
  indent_inner_html: false,
  indent_scripts: 'normal',
  preserve_newlines: true,
  max_preserve_newlines: 0,
  wrap_line_length: 0,
  unformatted: ['code', 'pre', 'textarea', 'sub', 'sup', 'em', 'strong', 'b', 'i', 'u', 'strike', 'ruby'],
  content_unformatted: ['script', 'title'],
  allowed_file_extensions: ['htm', 'html', 'xhtml', 'shtml', 'xml', 'svg'],
};

export default defineConfig({
  prefetch: {
    prefetchAll: true,
  },
  i18n: {
    defaultLocale: DEFAULT_LOCALE_SETTING,
    locales: Object.entries(LOCALES_SETTING).map(([key, value]) => {
      return {
        path: value.path ?? key,
        codes: value.codes ?? [key],
      };
    }),
    routing: {
      prefixDefaultLocale: false,
    },
  },
  site: url,
  base, // https://www.nichigas.co.jp/drainpipe-cleaning/ に設置する
  compressHTML: false, // HTMLを圧縮する場合 'jsx' にする
  integrations: [
    sitemap({
      // sitemap.xmlから除外するページを指定
      filter: (page) => {
        const isExcluded = page === `${url}/[directory]/` || page.includes('/preview/') || page.endsWith('/404.html');
        return !isExcluded;
      },
    }),
    htmlBeautifier(beautifierOption),
  ],
  server: {
    host: true,
    open: '/drainpipe-cleaning/',
  },
  build: {
    // format: 'preserve', // pagesの構造のまま出力（ファイル名.htmlを使いたい時）
    assets: 'assets/js', // Astroが出力するJSの出力先（既定は _astro。画像・CSSは下の assetFileNames で振り分け）
  },
  experimental: {
    // incrementalBuild: true, // getStaticPaths + cacheKey を返す動的ルートが多い場合に有効化（CIでは node_modules/.astro の保持設定が必要）
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 0, // 常にアセットファイルとして出力
       cssCodeSplit: false, // falseでcssを分割しないで出力
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split('.')[1];
            if (/ttf|otf|eot|woff|woff2/i.test(extType)) {
              extType = 'fonts';
            }
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(extType)) {
              extType = 'img';
            }
            // if (extType === 'css') {
            //   return `assets/css/[name].[hash].css`;
            // }
            // if (extType === 'css') {
            //   return `assets/css/style.css`;
            // }
            if (extType === 'css') {
              return `assets/css/style.[hash].css`;
            }
            return `assets/${extType}/[name].[hash][extname]`;
          },
          entryFileNames: `assets/js/[name].js`,
          // chunkFileNames: `assets/js/chunk/[name].[hash].js`
        },
      },
    },
    resolve: {
      alias: {
        '@/': `${path.resolve(_dirname, 'src')}/`,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          importers: [
            {
              // `@use '@/...'` のエイリアスを src/ に解決
              findFileUrl(url) {
                if (url.startsWith('@/')) {
                  return new URL(`./src/${url.slice(2)}`, import.meta.url);
                }
                return null;
              },
            },
          ],
        },
      },
    },
    server: {
      // cloudflared quick tunnel（公開前チェック用）越しのアクセスを許可する。
      // 使い方: cloudflared tunnel --url http://localhost:4321
      //   → 発行された https://xxxx.trycloudflare.com にアクセス（毎回ランダム、Ctrl+Cで失効）
      // DNS は Cloudflare 管理下でリバインディング不能のため、恒久設定でも安全
      allowedHosts: ['.trycloudflare.com'],
    },
  },
});
