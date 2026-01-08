@echo off
echo ===================================
echo Fixing CSS Module Parse Error
echo ===================================
echo.

echo Step 1: Cleaning cache and build files...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
echo Cache cleaned!
echo.

echo Step 2: Reinstalling dependencies...
call npm install
echo Dependencies installed!
echo.

echo Step 3: Verifying Tailwind installation...
call npm list tailwindcss postcss autoprefixer
echo.

echo ===================================
echo Fix Complete! Try running npm run dev now
echo ===================================
pause
