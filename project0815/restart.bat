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
echo 同名のコンテナが残っていないか確認しています...
echo ----------------------------------------
rem 【重要】docker-compose.ymlではコンテナ名を system1-server / system1-web に
rem 固定しているため、以前このzipを別のフォルダに展開して起動したことがある場合、
rem そちらのコンテナがPC上に残ったままだと「name is already in use」エラーで
rem 起動できないことがある(コンテナ名はフォルダに関係なくPC全体で共有されるため、
rem 上の"docker compose down"はこのフォルダのコンテナしか停止できない)。
rem そのため名前を指定して強制的に削除してから起動し直す(存在しない場合のエラーは無視)。
docker rm -f system1-server >nul 2>&1
docker rm -f system1-web >nul 2>&1

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
