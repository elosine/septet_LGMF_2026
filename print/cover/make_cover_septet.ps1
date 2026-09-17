# THE SEPTET'S COVER — PLAN 2b.4.1, 2026-09-17.
#
# The house style, unchanged from piece #4 (measured off scores/Litany.pdf, its day 36):
#   EngraversGothic BT  ·  title : name = 2 : 1  ·  title baseline 27.1% down
#   subtitle 0.65 x title, under it  ·  name 1.60 title-heights below  ·  centred, no tracking, black
#
# What is new here, and why: #4's generator shrank the type until the TITLE fitted the
# margins and never looked at the subtitle. This piece's subtitle is the long one —
# "for flute, bass clarinet, piano and string quartet" at 0.65 x title is WIDER than
# the title itself, so the tuba's loop would have run it into the margins. The loop
# now fits every line it draws.
#
#   powershell -File print/cover/make_cover_septet.ps1
Add-Type -AssemblyName System.Drawing

$FONT = "EngraversGothic BT"
$MARGIN_IN = 0.75
$ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$OUT = Join-Path $PSScriptRoot "cover-septet-a3-landscape.svg"

# the sheet the print exporter draws (tools/export_print.js FORMATS['a3-landscape']:
# a fifth of a millimetre under DIN A3 so Chrome's rounding stays inside the call's ceiling)
$WIn = 419.7 / 25.4
$HIn = 296.8 / 25.4

$TITLE = "Scattered Substance"
$SUB = "for flute, bass clarinet, piano and string quartet"
$NAME = "Justin Yang"

$fam = New-Object System.Drawing.FontFamily($FONT)
$sf = [System.Drawing.StringFormat]::GenericTypographic
$bmp = New-Object System.Drawing.Bitmap(10, 10)
$g = [System.Drawing.Graphics]::FromImage($bmp)

function Get-W { param([string]$Txt, [double]$Pt)
  $f = New-Object System.Drawing.Font($fam, $Pt, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Point)
  $w = $g.MeasureString($Txt, $f, 100000, $sf).Width * 72.0 / $g.DpiX
  $f.Dispose(); return [double]$w
}

$maxWpt = ($WIn - 2 * $MARGIN_IN) * 72.0
$titlePt = 93.0
while ($titlePt -gt 8) {
  $wT = Get-W $TITLE $titlePt
  $wS = Get-W $SUB ($titlePt * 0.65)
  $wN = Get-W $NAME ($titlePt * 0.5)
  if (($wT -le $maxWpt) -and ($wS -le $maxWpt) -and ($wN -le $maxWpt)) { break }
  $titlePt = $titlePt - 0.5
}
$subPt = $titlePt * 0.65
$namePt = $titlePt * 0.5

$wpt = [math]::Round($WIn * 72.0, 2); $hpt = [math]::Round($HIn * 72.0, 2)
$y = $hpt * 0.271
$lines = @()
$lines += "    <text x=""$([math]::Round($wpt/2,2))"" y=""$([math]::Round($y,2))"" font-size=""$([math]::Round($titlePt,2))"">$TITLE</text>"
$y = $y + $titlePt * 1.15 + $titlePt * 0.10
$lines += "    <text x=""$([math]::Round($wpt/2,2))"" y=""$([math]::Round($y,2))"" font-size=""$([math]::Round($subPt,2))"">$SUB</text>"
$y = $y + $titlePt * 1.60
$lines += "    <text x=""$([math]::Round($wpt/2,2))"" y=""$([math]::Round($y,2))"" font-size=""$([math]::Round($namePt,2))"">$NAME</text>"

$doc = "<svg xmlns=""http://www.w3.org/2000/svg"" width=""${wpt}pt"" height=""${hpt}pt"" viewBox=""0 0 $wpt $hpt"">`n" +
       "  <rect width=""100%"" height=""100%"" fill=""#ffffff""/>`n" +
       "  <g font-family=""$FONT"" fill=""#000000"" text-anchor=""middle"">`n" + ($lines -join "`n") + "`n  </g>`n</svg>`n"
[System.IO.File]::WriteAllText($OUT, $doc, (New-Object System.Text.UTF8Encoding $false))

# the report BEFORE the graphics are disposed — measuring after Dispose throws,
# which is how the first run printed "widest line 0 pt"
"{0,-24} {1:N2} x {2:N2} in   title {3:N1}  sub {4:N1}  name {5:N1} pt" -f "cover-septet-a3", $WIn, $HIn, $titlePt, $subPt, $namePt
"title {0:N0} pt wide · subtitle {1:N0} pt · of {2:N0} available   last baseline {3:N0} pt ({4:P0} down)" -f `
  (Get-W $TITLE $titlePt), (Get-W $SUB $subPt), $maxWpt, $y, ($y / $hpt)
$g.Dispose(); $bmp.Dispose()
"wrote $OUT"
