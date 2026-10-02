$wsh = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$shortcutPath = Join-Path $desktop "Travel Agent System.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "c:\Users\ASUS\Downloads\travel-agent-management-system\START_LYAN_SYSTEM.bat"
$shortcut.WorkingDirectory = "c:\Users\ASUS\Downloads\travel-agent-management-system"
$shortcut.Description = "Launch Lyan Travels Management System"
$shortcut.IconLocation = "shell32.dll,13"
$shortcut.Save()

Write-Host "Created Desktop shortcut: $shortcutPath"
