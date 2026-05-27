$source = "c:\Vagish Dell Data\vagish\projects\Sukkus Birthday Surprise"
$dest = "c:\Vagish Dell Data\vagish\projects\Sukkus Birthday Surprise\ReadyTemplate"

New-Item -ItemType Directory -Force -Path $dest
Copy-Item -Path "$source\*" -Destination $dest -Exclude "ReadyToHost", "site", "ReadyTemplate", ".git" -Recurse -Force

Set-Location -Path $dest
git init
git add .
git commit -m "Initial commit of cleaned template"
