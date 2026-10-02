Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run Chr(34) & strPath & "\START_LYAN_SYSTEM.bat" & Chr(34), 0, False
Set WshShell = Nothing
