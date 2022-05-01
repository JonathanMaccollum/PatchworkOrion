$ErrorActionPreference="STOP"
$azcopy = "$PSScriptRoot/Bin/AzCopy/azcopy.exe"
if(-not (test-path $azcopy)){
    Start-BitsTransfer -Source "https://aka.ms/downloadazcopy-v10-windows" -Destination $PSScriptRoot/AZCopy.zip
    Expand-Archive -Path $PSScriptRoot\AZCopy.zip -DestinationPath $PSScriptRoot/Bin/AzCopy
    Remove-Item $PSScriptRoot\AZCopy.zip
    Get-ChildItem $PSScriptRoot/Bin/AzCopy -Recurse -File |
        foreach-object {
            move-item $_.FullName $PSScriptRoot/Bin/AzCopy
        }
    Get-ChildItem $PSScriptRoot/Bin/AzCopy -Directory |
        foreach-object {
            remove-item $_.FullName
        }
}
if($null -eq $sas){
    $sas = Get-Credential -Message "Specify a shared access signature to use for publishing. (Token should begin with sv=)" -username "NA"
}
$source="$PSScriptRoot\src"
$destination = "https://jonsastro.blob.core.windows.net/`$web/PatchworkOrion/v1/?$($sas.GetNetworkCredential().Password.TrimStart('?'))"

& $azcopy sync $source $destination --recursive