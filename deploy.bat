@echo off
echo 🚀 Deploying Admin Dashboard for Production...
echo.

echo ✅ Step 1: Installing dependencies...
call npm install

echo.
echo ✅ Step 2: Building for production...
call npm run build

echo.
echo ✅ Step 3: Production build complete!
echo.
echo 📁 Build files are in the 'dist' folder
echo 🌐 Ready for deployment to Vercel, Netlify, or any hosting service
echo.
echo 🎯 Next steps:
echo    1. Deploy 'dist' folder to your hosting service
echo    2. Configure environment variables
echo    3. Update Firebase security rules
echo    4. Test the deployed admin dashboard
echo.
echo 🎉 Admin Dashboard is ready for production!
pause
