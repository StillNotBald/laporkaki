import AppKit
let w=480, h=360
let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:w,pixelsHigh:h,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current=NSGraphicsContext(bitmapImageRep:rep)
NSColor.white.setFill(); NSRect(x:0,y:0,width:w,height:h).fill()
let lines=["KEDAI MAKAN AH HOCK","Nasi Lemak Ayam    RM 8.50","Teh Tarik          RM 2.50","Roti Canai x2      RM 3.00","TOTAL              RM 14.00","Date: 2026-11-19  Thank you!"]
var y=h-50
for l in lines { (l as NSString).draw(at:NSPoint(x:24,y:y),withAttributes:[.font:NSFont.monospacedSystemFont(ofSize:22,weight:.bold),.foregroundColor:NSColor.black]); y-=50 }
NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:CommandLine.arguments[1]))
