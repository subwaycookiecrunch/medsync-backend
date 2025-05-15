Option Explicit

' Get the script's directory
Dim fso, scriptDir
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Run the application with a hidden window
Dim shell, command
Set shell = CreateObject("WScript.Shell")

' Change to the application directory
shell.CurrentDirectory = scriptDir

' Try to start the app using npx electron directly
command = "npx electron ."
shell.Run command, 0, False

' Clean up
Set shell = Nothing
Set fso = Nothing 