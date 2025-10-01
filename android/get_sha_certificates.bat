@echo off
echo ====================================
echo SHA証明書フィンガープリント取得
echo ====================================
echo.

echo [1] デバッグ用SHA-1証明書を取得中...
echo.
cd "%USERPROFILE%\.android"
if exist debug.keystore (
    keytool -list -v -alias androiddebugkey -keystore debug.keystore -storepass android -keypass android | findstr "SHA1:"
) else (
    echo デバッグキーストアが見つかりません: %USERPROFILE%\.android\debug.keystore
)
echo.

echo [2] リリース用SHA-1証明書を取得中...
echo.
cd /d "%~dp0app"
if exist release-key.jks (
    echo リリースキーストアのパスワードを入力してください:
    keytool -list -v -keystore release-key.jks | findstr "SHA1:"
) else if exist roastplus-new-key.keystore (
    echo リリースキーストアのパスワードを入力してください:
    keytool -list -v -keystore roastplus-new-key.keystore | findstr "SHA1:"
) else (
    echo リリースキーストアが見つかりません
)
echo.

echo ====================================
echo 完了
echo ====================================
echo.
echo 上記のSHA-1証明書をFirebaseコンソールに登録してください。
echo Firebase Console ^> Project Settings ^> General ^> Your apps ^> Android app
echo ^> SHA certificate fingerprints
echo.
pause

