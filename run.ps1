# Start backend in new window - changed host to localhost
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn api:app --host 127.0.0.1 --port 8000 --reload"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ Both servers starting..."
Write-Host "Backend: http://localhost:8000"
Write-Host "Frontend: http://localhost:5173"