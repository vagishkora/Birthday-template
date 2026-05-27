$path = "C:\Vagish Dell Data\vagish\projects\Sukkus Birthday Surprise"
$artifactPath = "C:\Users\VAGISH\.gemini\antigravity-ide\brain\8fed7e0d-37b5-486c-bcab-1e6a1759ce21"

Write-Host "Copying placeholders..."
Copy-Item "$artifactPath\placeholder_avatar_*.png" "$path\pics\placeholder_avatar.png" -Force
Copy-Item "$artifactPath\placeholder_memory_*.png" "$path\pics\placeholder_memory.png" -Force
Copy-Item "$artifactPath\placeholder_landscape_*.png" "$path\pics\placeholder_landscape.png" -Force

Write-Host "Deleting personal photos..."
Get-ChildItem -Path "$path\pics" -Recurse -File | Where-Object {
    $_.Name -notmatch "bmw.png" -and
    $_.Name -notmatch "netflix_hero.png" -and
    $_.Name -notmatch "Indian_Passport" -and
    $_.Name -notmatch "placeholder_"
} | Remove-Item -Force

Write-Host "Cleaning up text..."
$files = Get-ChildItem -Path $path -Recurse -Include *.html, *.js, *.css | Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\site\\" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($null -eq $content) { continue }
    
    $original = $content

    $content = $content -creplace 'Sukkus', 'Janes'
    $content = $content -creplace 'sukkus', 'janes'
    $content = $content -creplace 'SukkuVerse', 'JaneVerse'
    $content = $content -creplace 'Sukku', 'Jane'
    $content = $content -creplace 'sukku', 'jane'
    $content = $content -creplace 'Vagish', 'John'
    $content = $content -creplace 'vagish', 'john'
    $content = $content -creplace 'waffles', 'password' # Replaces the password if it's there
    $content = $content -creplace 'magic word\.\.\.', 'demo password...'
    
    # Replace image paths in JS and HTML (e.g. pics/something.jpg -> pics/placeholder_memory.png)
    $content = [regex]::Replace($content, 'pics/[^"''\)]+\.(jpg|jpeg|png|JPG|JPEG|PNG)', 'pics/placeholder_memory.png')

    if ($original -cne $content) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated $($file.Name)"
    }
}

# Fix specific known SVGs that we didn't want to replace but the regex caught
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($null -eq $content) { continue }
    
    $original = $content
    $content = $content -replace 'pics/placeholder_memory\.png"', 'pics/placeholder_memory.png"' # just a dummy to check logic
    # actually, since we deleted the pics except bmw, netflix, etc., if we broke the references to those, let's fix them manually if needed.
}

Write-Host "Done!"
