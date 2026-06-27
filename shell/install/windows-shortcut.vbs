Set shell = CreateObject("WScript.Shell")
desktop = shell.SpecialFolders("Desktop")
startMenu = shell.SpecialFolders("StartMenu") & "\Programs\Frozen RPC"

Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FolderExists(startMenu) Then fso.CreateFolder(startMenu)

srcPath = fso.GetParentFolderName(WScript.ScriptFullName)
rootPath = fso.GetParentFolderName(fso.GetParentFolderName(srcPath))
iconPath = rootPath & "\assets\icon.png"
batPath = rootPath & "\shell\frozen-rpc.bat"

Function MakeShortcut(folder, name, target, icon)
  Set sc = shell.CreateShortcut(folder & "\" & name & ".lnk")
  sc.TargetPath = target
  sc.WorkingDirectory = rootPath
  sc.IconLocation = icon
  sc.Description = "Frozen RPC - Discord Rich Presence injector"
  sc.Save
End Function

MakeShortcut desktop, "Frozen RPC", batPath, iconPath
MakeShortcut startMenu, "Frozen RPC", batPath, iconPath

MsgBox "Shortcuts created:" & vbCrLf & vbCrLf & _
  "Desktop: Frozen RPC.lnk" & vbCrLf & _
  "Start Menu: Frozen RPC.lnk", vbInformation, "Frozen RPC"
