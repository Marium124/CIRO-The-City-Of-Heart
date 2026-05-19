@echo off
cd c:\ciro\backend
start "" ".\venv\Scripts\python.exe" main.py
cd c:\ciro\web-dashboard
start "" npm run dev
