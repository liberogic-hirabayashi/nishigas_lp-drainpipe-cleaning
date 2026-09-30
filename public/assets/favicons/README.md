# faviconとtouch iconの作成方法

元画像はこの2サイズで作る  
- 260pxで背景透明のpng（favicon用、枠いっぱいに作成）  
- 180pxで背景ありのpng（apple-touch-icon用、余白を持って作成）  

## 作成手順
1. [https://realfavicongenerator.net/](https://realfavicongenerator.net/)で、260pxのfavicon画像を読み込む
1. iOSのセクションで180pxのapple-touch-iconを別途読み込む
1. AndroidのセクションでApp nameにサイト名を入れ、OptionsタブでBrowserを選択
1. Windows MetroとmacOS Safariは設定不要（使いたければ設定）
1. Favicon Generator Optionsのセクションでパスを`/assets/favicons`と入力
1. ボタンを押して生成
1. ファイルをダウンロードして、`site.webmanifest`を`manifest.json`にリネーム
1. browserconfig.xml、mstile-150x150.pngは使わないので削除
1. 以下7ファイルを`/public/assets/favicons/`にコピー
	- android-chrome-192x192.png
	- android-chrome-256x256.png
	- apple-touch-icon.png
	- favicon-16x16.png
	- favicon-32x32.png
	- favicon.ico
	- manifest.json

実際に使うコードはこちら
```
<link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16x16.png">
<link rel="manifest" href="/assets/favicons/manifest.json">
<link rel="shortcut icon" href="/assets/favicons/favicon.ico">
```