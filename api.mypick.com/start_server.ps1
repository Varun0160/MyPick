$serverPath = "c:\Users\varun\OneDrive\Desktop\MyPick\api.mypick.com"
$env:PYTHONPATH = $serverPath

# Kill any existing Python processes
Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for processes to close
Start-Sleep -Seconds 2

# Start the Flask server
Set-Location -Path $serverPath
python app.py
