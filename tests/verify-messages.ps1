# Verify Messages DB Sync, Build, and E2E Tests script
$ErrorActionPreference = "Continue"

$logPath = "\\wsl.localhost\Ubuntu\home\wfowlkes\Claude Main Projects\SaasX\.agents\worker_messages_10\verification_output.log"
New-Item -ItemType File -Path $logPath -Force | Out-Null

function Log-Output($message) {
    Write-Host $message
    $message | Out-File -FilePath $logPath -Append
}

Log-Output "=== Start Verification Script ==="
Log-Output (Get-Date -Format U)

Log-Output "`n1. Running prisma db push --accept-data-loss..."
npx prisma db push --accept-data-loss *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n2. Running prisma generate..."
npx prisma generate *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n3. Running npm run build..."
npm run build *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n4. Running E2E messages-challenger.ts tests on PORT 3003..."
$env:PORT="3003"
npx tsx tests/messages-challenger.ts *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n5. Running E2E run-all.ts tests on PORT 3003..."
$env:PORT="3003"
npx tsx tests/run-all.ts *>&1 | Out-String | ForEach-Object { Log-Output $_ }

Log-Output "`n=== Verification Script Finished ==="
Log-Output (Get-Date -Format U)
