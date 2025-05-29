# Start the backend server
Start-Process -NoNewWindow powershell -ArgumentList "-Command", "cd api.mypick.com; python app.py"

# Start the frontend server
Start-Process -NoNewWindow powershell -ArgumentList "-Command", "cd www.mypick.com; npm run dev"

Write-Host "Servers are starting..."
Write-Host "Frontend will be available at: http://localhost:3000"
Write-Host "Backend will be available at: http://localhost:8080"
