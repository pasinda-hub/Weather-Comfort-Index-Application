@echo off
echo Creating Weather Comfort Index Project...

REM Create files
type nul > server.js
type nul > package.json
type nul > .env
type nul > .gitignore
type nul > cities.json
type nul > comfortIndex.test.js
type nul > README.md

echo Files created successfully!
echo.
echo Next steps:
echo 1. Open in VS Code: code .
echo 2. Copy the code into each file
echo 3. Run: npm install
echo.
pause