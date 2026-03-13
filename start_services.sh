#!/bin/bash
cd huashu-backend
npm install
npm run start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ../huashu-admin
npm install
npm run dev -- --port 5173 > ../admin.log 2>&1 &
ADMIN_PID=$!
cd ../huashu-app
npm install
npm run dev -- --port 5174 > ../app.log 2>&1 &
APP_PID=$!
echo "Services started. Backend: $BACKEND_PID, Admin: $ADMIN_PID, App: $APP_PID"
echo $BACKEND_PID > ../backend.pid
echo $ADMIN_PID > ../admin.pid
echo $APP_PID > ../app.pid
