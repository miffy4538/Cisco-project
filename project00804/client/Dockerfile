# 子供見守りシステム - クライアント用イメージ
# 1段階目: React+Three.jsアプリをビルド(npm install / vite buildを自動実行)
# 2段階目: ビルド成果物をCaddyで配信 + /socket.io/ をサーバーへ中継(HTTPS自動対応)

# --- build stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 見守りサーバーへの接続先。空にするとCaddy経由の同一オリジン接続になる(推奨・デフォルト)。
ARG VITE_SOCKET_URL=
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN npm run build

# --- serve stage ---
FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
