@echo off
setlocal
cd /d "%~dp0mobile"
if exist android\gradlew.bat (
  echo Android native folder already exists.
) else (
  echo Generating the React Native Android native project...
  if exist TodoNative rmdir /s /q TodoNative
  npx @react-native-community/cli@latest init TodoNative --version 0.82.1 --skip-install
  if errorlevel 1 goto :error
  robocopy TodoNative\android android /E >nul
  rmdir /s /q TodoNative
)
echo Installing JavaScript dependencies...
npm install
if errorlevel 1 goto :error
echo.
echo Setup complete. Open mobile\android in Android Studio or run: npm run android
exit /b 0
:error
echo Setup failed. Please copy the error shown above.
exit /b 1
