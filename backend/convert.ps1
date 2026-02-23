param (
    [string]$Source,
    [string]$Target,
    [string]$ExamDate = "",
    [string]$RadiologistName = ""
)

$ErrorActionPreference = "Stop"
$LogFile = "C:\Users\Lenovo\Documents\GitHub\Old_radiology_report\backend\conversion_log.txt"

function Log-Message([string]$msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "$timestamp - $msg"
}

try {
    Log-Message "Starting conversion for $Source"
    Log-Message "Date: $ExamDate, Sign: $RadiologistName"

    # Create Word Object
    $word = New-Object -ComObject Word.Application
    
    try {
        $word.Visible = $false
        $word.DisplayAlerts = "wdAlertsNone"
    } catch {
        Log-Message "Warning: Could not set visibility props"
    }

    $doc = $word.Documents.Open($Source, $false, $false)
    
    Log-Message "Document opened."

    # Update Fields
    try {
        $doc.Fields.Update()
    } catch {
        Log-Message "Warning: Could not update fields"
    }
    
    # FUNCTION TO REPLACE TEXT IN A RANGE
    function Replace-In-Range($rng, $findText, $replaceText) {
        if ([string]::IsNullOrEmpty($replaceText)) { return }
        $find = $rng.Find
        $find.ClearFormatting()
        # Find.Execute(FindText, MatchCase, MatchWholeWord, MatchWildcards, MatchSoundsLike, MatchAllWordForms, Forward, Wrap, Format, ReplaceWith, Replace)
        # Wrap=1 (wdFindContinue), Replace=2 (wdReplaceAll)
        $find.Execute($findText, $false, $true, $false, $false, $false, $true, 1, $false, $replaceText, 2)
    }

    # ITERATE ALL STORIES (Body, Headers, Footers, TextBoxes)
    foreach ($range in $doc.StoryRanges) {
        do {
            Replace-In-Range $range "#RADDATE#" $ExamDate
            
            if ($RadiologistName) {
                $sigText = "Signed by: $RadiologistName"
                Replace-In-Range $range "#RADSIGN#" $sigText
            }
            
            $range = $range.NextStoryRange
        } while ($range -ne $null)
    }
    
    # Also search in Shapes/TextBoxes specifically if StoryRanges missed them
    foreach ($shape in $doc.Shapes) {
        if ($shape.TextFrame.HasText) {
            Replace-In-Range $shape.TextFrame.TextRange "#RADDATE#" $ExamDate
            if ($RadiologistName) {
                $sigText = "Signed by: $RadiologistName"
                Replace-In-Range $shape.TextFrame.TextRange "#RADSIGN#" $sigText
            }
        }
    }

    Log-Message "Replacements attempted."

    # Save as PDF
    $doc.SaveAs([ref]$Target, [ref]17)
    Log-Message "Saved to $Target"
    
    $doc.Close([ref]0)
    $word.Quit()
    
    Write-Host "Success"
} catch {
    $err = $_.Exception.Message
    Log-Message "ERROR: $err"
    Write-Error "PowerShell Conversion Failed: $err"
    if ($word) { 
        try { $word.Quit() } catch {} 
    }
    exit 1
}
