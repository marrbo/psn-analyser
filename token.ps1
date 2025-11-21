function Get-AuthenticationToken {
param(
 [Parameter(Mandatory=$true)]
 [string]$npsso
)

if ($PSVersionTable.PSVersion.Major -lt 7) {
 Write-Host "This function requires PowerShell 7. Download it from https://github.com/PowerShell/PowerShell"
 return
}

$params = @(
 "access_type=offline",
 "client_id=09515159-7237-4370-9b40-3806e67c0891",
 "response_type=code",
 "scope=psn:mobile.v2.core psn:clientapp",
 "redirect_uri=com.scee.psxandroid.scecompcall://redirect"
)
$url = "https://ca.account.sony.com/api/authz/v3/oauth/authorize?$($params -join "&")"

try {
 $result = Invoke-WebRequest -Uri $url -Headers @{
   "Cookie"="npsso=$npsso"
 }
 Write-Host "Error: Check npsso"
 return
}
catch {
 if ($_.Exception.Response.Headers.Location.Query -like "?code=v3*") {
   $query = [System.Web.HttpUtility]::ParseQueryString($_.Exception.Response.Headers.Location.Query)
 }
 else {  Write-Host "Error: Check npsso"; return }
}

$body = @{
 code=$query['code']
 redirect_uri="com.scee.psxandroid.scecompcall://redirect"
 grant_type="authorization_code"
 token_format="jwt"
}

$contentType = "application/x-www-form-urlencoded"
$url = "https://ca.account.sony.com/api/authz/v3/oauth/token"

try {
 $result = Invoke-WebRequest -Method POST -Uri $url -body $body -ContentType $ContentType -Headers @{
   "Authorization"="Basic MDk1MTUxNTktNzIzNy00MzcwLTliNDAtMzgwNmU2N2MwODkxOnVjUGprYTV0bnRCMktxc1A="
 }
 $token = ConvertTo-SecureString ($result.Content | ConvertFrom-Json).access_token -AsPlainText
 if ($token) {
   Write-Host "Authentication Token successfully granted"
   # return $token
   return ($result.Content | ConvertFrom-Json).access_token
 }
 else { Write-Host "Error: Unable to obtain Authentication Token" }
}
catch { Write-Host "Error: Unable to obtain Authentication Token" }
}


$token = Get-AuthenticationToken "IIP9qft9FIBWhMcwy8dKTBQCTwPFXUsNTrHxhoMn92FAWbYKxHhrtsy6XlRNj92G"
Write-Host $token