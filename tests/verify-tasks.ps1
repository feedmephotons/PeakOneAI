# Verify Tasks DB Sync, API, and Build script
$ErrorActionPreference = "Continue"

$logPath = "\\wsl.localhost\Ubuntu\home\wfowlkes\Claude Main Projects\SaasX\saasx-platform\.agents\challenger_tasks_db_1\verification_output.log"
New-Item -ItemType File -Path $logPath -Force | Out-Null

function Log-Output($message) {
    Write-Host $message
    $message | Out-File -FilePath $logPath -Append
}

Log-Output "=== Start Verification Script ==="
Log-Output (Get-Date -Format U)

Log-Output "`n1. Running prisma db push..."
npx prisma db push *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n2. Running prisma generate..."
npx prisma generate *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n3. Running Integration Tests..."
npx tsx tests/tasks-db-sync.ts *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n4. Running npm run build..."
npm run build *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n=== Verification Script Finished ==="
Log-Output (Get-Date -Format U)
