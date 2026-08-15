# Docker操作メモ

開発時にDocker関連のコマンドを確認するための個人的な作業メモです。
（本番のデプロイ手順は `DEPLOY.md`、実際に使われる構成は `docker-compose.yml` /
`server/Dockerfile` / `client/Dockerfile` を参照してください。このメモはそれらとは
別の、手元での試行錯誤の記録です。）

> 旧ファイル名「Dockerメモ」（日本語ファイル名）だとZIPで受け渡した際に文字化け
> することがあるため、`docs/docker-notes.md` にリネームし、あわせてMarkdown形式に
> 整理しました。内容は元のメモのままです。

## イメージのビルド

PowerShellなどのターミナルで `C:\Users\pikat\system\system_1` フォルダにいることを
確認し、次のコマンドを実行します。

`-t system_1` は、作成するイメージの名前を `system_1` に指定しています。

```
docker build -t system_1 .
```

## コンテナの起動

```
docker run -d -p 8080:80 --name system_1 system_1
```

## コンテナの停止・削除

```
docker stop system_1
docker rm system_1
```

## パソコンのフォルダと連動させて起動する

```
docker run -d -p 8080:80 --name system_1 -v ${PWD}:/usr/share/nginx/html system_1
```

## サーバー側の準備と起動

```
cd server
```

Pythonのライブラリをインストールします（YOLOv8やOpenCVが入ります）。

```
pip install -r requirements.txt
```

Node.jsのパッケージをインストールします。

```
npm.cmd install
```

サーバーを起動します。

```
node server.js
```

## クライアント側を起動する

```
cd C:\Users\pikat\system\system_1\client

npm.cmd install

npm.cmd run dev
```

### クライアントの再起動

```
npm.cmd run dev
```

## 一からの起動

### バックエンド

```
cd C:\Users\pikat\system\system_1\server

node server.js
```

### フロントエンド

```
cd C:\Users\pikat\system\system_1\client

npm.cmd run dev
```
