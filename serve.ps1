$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()
Write-Host 'Server started on http://localhost:8080/'
while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        $path = $req.Url.LocalPath
        if ($path -eq '/') { $path = '/index.html' }
        $localPath = Join-Path 'd:\softower making\Gravity Ai' ($path.TrimStart('/').Replace('/', '\'))
        $frontendRoutes = @('/promptgen', '/flowgen', '/slicer', '/vectorizer', '/Vectorizer', '/bannergen', '/dashboard', '/checkout', '/checkout/monthly', '/checkout/six_months', '/checkout/annual', '/pricing')
        if ($frontendRoutes -contains $path) {
            $localPath = Join-Path 'd:\softower making\Gravity Ai' 'index.html'
        }
        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            if ($localPath.EndsWith('.html')) { $res.ContentType = 'text/html; charset=utf-8' }
            elseif ($localPath.EndsWith('.css')) { $res.ContentType = 'text/css' }
            elseif ($localPath.EndsWith('.js')) { $res.ContentType = 'application/javascript' }
            elseif ($localPath.EndsWith('.png')) { $res.ContentType = 'image/png' }
            elseif ($localPath.EndsWith('.jpg') -or $localPath.EndsWith('.jpeg')) { $res.ContentType = 'image/jpeg' }
            elseif ($localPath.EndsWith('.svg')) { $res.ContentType = 'image/svg+xml' }
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    } catch {
        # ignore single request errors
    }
}
