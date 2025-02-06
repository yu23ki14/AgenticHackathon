# Setup for devenv

## Set env vars

```
$ pwd
$ client
$ cp .env.example .env
```

以下のように.envを設定してください。
- NEXT_PUBLIC_API_URL: 多分空欄でもOK？（私は`http://localhost:3001`で設定）
- NEXT_PUBLIC_TELEGRAM_BOT_NAME: 多分空欄でもOK？（設定する場合は、自分のbotの名前を設定してください。）
- OPENAI_API_KEY: OpenAIのAPIキーを自分で取得してください。
- GAIANET_API_BASE_URL: りょーまさんから関連するURLをもらってください。
- GAIANET_API_KEY: 空で大丈夫です。

## Run server

```
$ pwd
$ client
$ pnpm run dev
```
