$netlifyToken = "nfc_qctfm69Cw229i7uPTWFydFSfAvuJZf7c9d40"
$siteId = "a1e8e46a-3496-41bf-a9ad-86e6e72c1ed6"
$headers = @{ Authorization = "Bearer $netlifyToken"; "Content-Type" = "application/json" }

# Step 1: Create a new deploy and get upload URLs
Write-Host "Creating deploy..."

# Collect all files to upload
$staticDir = ".netlify\static"
$files = @{}

# Hash all static files
Get-ChildItem $staticDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Replace((Resolve-Path $staticDir).Path, "").Replace("\", "/").TrimStart("/")
    $hash = (Get-FileHash $_.FullName -Algorithm SHA1).Hash.ToLower()
    $files["/$relativePath"] = $hash
}

Write-Host "Found $($files.Count) static files"

$deployBody = @{
    files = $files
    async = $false
} | ConvertTo-Json -Depth 10

$deploy = Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/sites/$siteId/deploys" -Method POST -Headers $headers -Body $deployBody
Write-Host "Deploy ID: $($deploy.id) State: $($deploy.state)"
Write-Host "Required files: $($deploy.required.Count)"

# Step 2: Upload required files
foreach ($filePath in $deploy.required) {
    $localPath = Join-Path $staticDir ($filePath.TrimStart("/").Replace("/", "\"))
    if (Test-Path $localPath) {
        $uploadHeaders = @{ Authorization = "Bearer $netlifyToken"; "Content-Type" = "application/octet-stream" }
        $encodedPath = [Uri]::EscapeDataString($filePath)
        Invoke-RestMethod -Uri "https://api.netlify.com/api/v1/deploys/$($deploy.id)/files$filePath" -Method PUT -Headers $uploadHeaders -InFile $localPath | Out-Null
        Write-Host "Uploaded: $filePath"
    } else {
        Write-Host "MISSING: $localPath"
    }
}

Write-Host "Done! Deploy URL: https://$siteId.netlify.app"
