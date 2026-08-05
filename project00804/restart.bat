@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ----------------------------------------
echo Dockerの動作確認をしています...
echo ----------------------------------------
docker version >nul 2>&1
if errorlevel 1 goto NODOCKER

if exist ".env" goto HASENV
echo .env が見つからないため、.env.example からローカル用の設定を作成します。
copy ".env.example" ".env" >nul

:HASENV
echo ----------------------------------------
echo 既存のコンテナを停止しています...
echo ----------------------------------------
docker compose down

echo ----------------------------------------
echo コンテナをビルドして起動します。
echo npm install / pip install などの環境構築はすべて自動で行われます。
echo (初回はダウンロードが発生するため数分かかることがあります)
echo ----------------------------------------
docker compose up --build

echo ----------------------------------------
echo 終了しました。もう一度起動する場合はこのファイルを再実行してください。
echo ----------------------------------------
pause
goto END

:NODOCKER
echo [エラー] Docker Desktop が見つからないか起動していません。
echo Docker Desktop をインストール・起動してから、もう一度実行してください。
echo https://www.docker.com/products/docker-desktop/
pause
exit /b 1

:END
