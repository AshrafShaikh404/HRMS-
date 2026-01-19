# Script to replace Grid2 with Grid in all page files

$files = @(
    "c:\Users\VIDHI\OneDrive\Desktop\HRM\frontend\src\pages\Dashboard.jsx",
    "c:\Users\VIDHI\OneDrive\Desktop\HRM\frontend\src\pages\Employees.jsx",
    "c:\Users\VIDHI\OneDrive\Desktop\HRM\frontend\src\pages\Attendance.jsx",
    "c:\Users\VIDHI\OneDrive\Desktop\HRM\frontend\src\pages\Leaves.jsx",
    "c:\Users\VIDHI\OneDrive\Desktop\HRM\frontend\src\pages\Payroll.jsx",
    "c:\Users\VIDHI\OneDrive\Desktop\HRM\frontend\src\pages\Profile.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Replace Grid2 import with Grid
        $content = $content -replace 'Grid2,', 'Grid,'
        
        # Replace opening Grid2 tags with Grid and convert size prop
        $content = $content -replace '<Grid2\s+container', '<Grid container'
        
        # Replace size={{ xs: X, sm: Y, md: Z, lg: W }} with item xs={X} sm={Y} md={Z} lg={W}
        $content = $content -replace '<Grid2\s+size=\{\{\s*xs:\s*(\d+)\s*\}\}>', '<Grid item xs={$1}>'
        $content = $content -replace '<Grid2\s+size=\{\{\s*xs:\s*(\d+),\s*sm:\s*(\d+)\s*\}\}>', '<Grid item xs={$1} sm={$2}>'
        $content = $content -replace '<Grid2\s+size=\{\{\s*xs:\s*(\d+),\s*sm:\s*(\d+),\s*md:\s*(\d+)\s*\}\}>', '<Grid item xs={$1} sm={$2} md={$3}>'
        $content = $content -replace '<Grid2\s+size=\{\{\s*xs:\s*(\d+),\s*sm:\s*(\d+),\s*md:\s*(\d+),\s*lg:\s*(\d+)\s*\}\}>', '<Grid item xs={$1} sm={$2} md={$3} lg={$4}>'
        $content = $content -replace '<Grid2\s+size=\{\{\s*xs:\s*(\d+),\s*md:\s*(\d+)\s*\}\}>', '<Grid item xs={$1} md={$2}>'
        $content = $content -replace '<Grid2\s+size=\{\{\s*xs:\s*(\d+),\s*lg:\s*(\d+)\s*\}\}>', '<Grid item xs={$1} lg={$2}>'
       
        # Replace closing Grid2 tags
        $content = $content -replace '</Grid2>', '</Grid>'
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Fixed $file"
    }
}

Write-Host "All Grid2 replaced with Grid!"
