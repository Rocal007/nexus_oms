$r = Invoke-WebRequest -Uri 'http://localhost:5100/api/emails/pending' -UseBasicParsing
$emails = $r.Content | ConvertFrom-Json
Write-Host "Gesamt: $($emails.Count) Mails"
Write-Host "---"
foreach ($e in ($emails | Select-Object -First 10)) {
    $body50 = if ($e.text) { $e.text.Substring(0, [Math]::Min(80, $e.text.Length)) -replace "`n"," " } else { "(leer)" }
    Write-Host "UID:$($e.uid) | Phone:[$($e.customerPhone)] | $body50"
}
