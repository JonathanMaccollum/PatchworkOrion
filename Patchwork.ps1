Function New-PatchworkSource
{
    param(
        [String]$Author,
        [String]$Source,
        [String]$Target
    )
    new-object psobject -Property @{
        Author=$Author
        Source=$Source
        Target=$Target
    }
}
import-module "$PSScriptRoot\Bin\DeepZoomTools.DLL"

$sources = @(
    New-PatchworkSource -Target "MainImage" -Author "JonathanMacCollum" -Source "https://www.darkflats.com/Widefield/Orion/Orion%20Mosaic.ThreePanel.204x3m.195x3m.178x3m.Drizzled.DBE.PCC.MbC.PhMos.GHS.ColorGHS.StarCleanup.LHE.HT.NR.StarlessEnh2.jpg"
    New-PatchworkSource -Target "Annotated" -Author "PixInsight" -Source "https://www.darkflats.com/Widefield/Orion/Orion%20Mosaic.ThreePanel.204x3m.195x3m.178x3m.Drizzled.Annotations.png"
)
$sources|foreach-object {
    $i = $_
    if(([string]::IsNullOrWhiteSpace($_.Source) )){
        write-warning "Unable create DZI for $($_.Author)'s target $($_.Target): could not locate file $($_.Source)"
        return;
    }
    $imageList = new-object System.Collections.Generic.List[Microsoft.DeepZoomTools.Image]
    $imageList.Add(
        (new-object Microsoft.DeepZoomTools.Image ($i.Source)))

    
    try
    {
        $sparse = [Microsoft.DeepZoomTools.SparseImageCreator]::new()
        $sparse.MaxLevel=20
        #$sparse.ConversionTileFormat = [Microsoft.DeepZoomTools.ImageFormat]::Png
        $sparse.TileFormat = [Microsoft.DeepZoomTools.ImageFormat]::Png
        $sparse.Create($imageList,"$PSScriptRoot\src\$($i.Author).$($i.Target).xml")
    }
    catch
    {
        write-warning $_.Exception.ToString()
        throw
    }
}