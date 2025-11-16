# Restart script to regenerate Prisma client
# Run this after stopping the dev server

Write-Host "🔄 Regenerating Prisma client..." -ForegroundColor Cyan

# Wait a moment for any processes to release files
Start-Sleep -Seconds 1

# Try to generate
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma client generated successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error generating Prisma client." -ForegroundColor Yellow
    Write-Host "   Please stop the dev server and run this script again." -ForegroundColor Yellow
    Write-Host "   Or restart your terminal/VS Code." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
