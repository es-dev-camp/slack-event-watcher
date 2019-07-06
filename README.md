


## デプロイ
`.env.yaml` に 正式な値をセットしたうえで実行する

```sh
gcloud beta functions deploy slackEventWatcher --trigger-http --runtime nodejs8 --allow-unauthenticated --env-vars-file .env.yaml --project slack-bot-creator
```

## テスト
`payload.json` で期待するリクエストを構築する

```sh
curl -X POST -H "Content-Type:application/json" -d @payload.json https://us-central1-slack-bot-creator.cloudfunctions.net/slackEventWatcher
```

# how to debug

```sh
npm run serve
```

立ちあがったapiにcurlなどでリクエストを投げる

```sh
curl -X POST -H "Content-Type:application/json" -d @payload.json http://localhost:3000
```
