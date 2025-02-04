# Setup for devenv

## TG Bot

1. Open Telegram and search for @BotFather
2. Start chat and send `/newbot`
3. Follow prompts to name your bot
4. Copy the provided token

## Ngrok

Ngrokは自分のローカルで立てているAPIをインターネット公開できるツールです。TG Botのwebhookに使うので、開発環境として必ず必要になります。
[公式サイト](https://ngrok.com/)

backendは開発環境では3001ポートなので、ngrokで3001ポートをインターネット公開してください。

## Set env vars

```
$ pwd
$ backend
$ cp .env.example .env
```

## Run server

```
$ pwd
$ backend
$ pnpm run dev
```
