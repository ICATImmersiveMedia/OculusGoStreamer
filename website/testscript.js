
var ipCanvas;
var ipCtx;
function canvasResize(image, force) {
	var height = image.height * 2;

	var createIpCanvas = !ipCanvas || ipCanvas[0].height != height;

	if (force || createIpCanvas || canvas.width != image.width || canvas.height != height) {	
		canvas.width = image.width;
		canvas.height = height;
        	canvas.style.position = "absolute";
		canvas.style.left = ((window.innerWidth - image.width) / 2) + "px";
		canvas.style.top = ((window.innerHeight - height) / 2) + "px";
		
		frameCanvas.width = image.width;
		frameCanvas.height = height;
		frameCanvas2.width = image.width;
		frameCanvas2.height = image.height;
		frameCanvas3.width = image.width;
		frameCanvas3.height = image.height;
		ctx = canvas.getContext("2d");
		fctx = frameCanvas.getContext('2d');
		fctx2 = frameCanvas2.getContext('2d');
		fctx3 = frameCanvas3.getContext('2d');
		ctx.imageSmoothingEnabled = false;
		fctx.imageSmoothingEnabled = false;
		fctx2.imageSmoothingEnabled = false;
		fctx3.imageSmoothingEnabled = false;
	}

	if (createIpCanvas) {
		ipCanvas = new Array();
		ipCtx = new Array();

		for (var i = 0; i < 2; i++) {
			ipCanvas[i] = document.createElement('canvas');
			ipCanvas[i].width = 1;
			ipCanvas[i].height = height;
			ipCtx[i] = ipCanvas[i].getContext('2d');
			var imgData = ipCtx[i].getImageData(0, 0, 1, height);
			var bytes = imgData.data;
			var val1 = i == 0 ? 255 : 0;
			var val2 = i == 1 ? 255 : 0;
			for (var k = 0; k < bytes.length;) {
				bytes[k] = val1;
				k++;
				bytes[k] = val1;
				k++;
				bytes[k] = val1;
				k++;
				bytes[k] = val2;
				k++;
				
				if (k >= bytes.length) break;

				bytes[k] = val2;
				k++;
				bytes[k] = val2;
				k++;
				bytes[k] = val2;
				k++;
				bytes[k] = val1;
				k++;
			}
			ipCtx[i].putImageData(imgData,0,0);
		}
	}
}

var disableInterlacing = true;

function frameCompositing() {
	if (this.type == 1 || this.type == 2) {
		canvasResize(this, false);
		fctx.globalCompositeOperation = "source-over";
		fctx.drawImage(this, 0, 0, canvas.width, canvas.height);

		fctx.globalCompositeOperation = "source-atop";
		fctx.drawImage(ipCanvas[this.ip1], 0, 0, canvas.width, canvas.height);

		ctx.globalCompositeOperation = "source-atop";
		ctx.drawImage(ipCanvas[this.ip2], 0, 0, canvas.width, canvas.height);

		ctx.globalCompositeOperation = "lighter";
		ctx.drawImage(frameCanvas, 0, 0, canvas.width, canvas.height);
	} else if ((this.type == 3 || this.type == 4) && this.keyFrame) {
// Copy image
		fctx2.globalCompositeOperation = "source-over";
		fctx2.drawImage(this, 0, 0, canvas.width, frameCanvas2.height);

// Take lower half
		fctx2.globalCompositeOperation = "darken";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Multiply by 2
		fctx2.globalCompositeOperation = "color-dodge";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Invert
		fctx2.globalCompositeOperation = "difference";
		fctx2.fillStyle = 'rgb(255,255,255)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Subtract with keyframe
		fctx2.globalCompositeOperation = "difference"; 
		fctx2.drawImage(this.keyFrame, 0, 0, canvas.width, frameCanvas2.height);

		fctx.globalCompositeOperation = "source-over";
		fctx.drawImage(frameCanvas2, 0, 0, canvas.width, canvas.height);

		// ------
// Copy
		fctx2.globalCompositeOperation = "source-over";
		fctx2.drawImage(this, 0, 0, canvas.width, frameCanvas2.height);

// Take upper half
		fctx2.globalCompositeOperation = "lighten";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Invert
		fctx2.globalCompositeOperation = "difference";
		fctx2.fillStyle = 'rgb(255,255,255)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Multiply
		fctx2.globalCompositeOperation = "color-dodge";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Invert
		fctx2.globalCompositeOperation = "difference";
		fctx2.fillStyle = 'rgb(255,255,255)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Add to stored fb
		fctx.globalCompositeOperation = "lighter";
		fctx.drawImage(frameCanvas2, 0, 0, canvas.width, canvas.height);

// Interlace
		fctx.globalCompositeOperation = "source-atop";
		fctx.drawImage(ipCanvas[this.ip1], 0, 0, canvas.width, canvas.height);

// Interlace 2
		ctx.globalCompositeOperation = "source-atop";
		ctx.drawImage(ipCanvas[this.ip2], 0, 0, canvas.width, canvas.height);

// Merge both
		ctx.globalCompositeOperation = "lighter"; 
		ctx.drawImage(frameCanvas, 0, 0, canvas.width, canvas.height);
	}
};
function frameCompositingNoInterlacing() {
	var yoffset = this.type % 2;
																																																																																				
	if (this.type == 1 || this.type == 2) {
		canvasResize(this, false);

		ctx.globalCompositeOperation = "source-over";
		ctx.drawImage(this, 0, yoffset, canvas.width, canvas.height);
	} else if ((this.type == 3 || this.type == 4) && this.keyFrame) {
// Copy image
		fctx2.globalCompositeOperation = "source-over";
		fctx2.drawImage(this, 0, 0, canvas.width, frameCanvas2.height);

// Take lower half
		fctx2.globalCompositeOperation = "darken";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Multiply by 2
		fctx2.globalCompositeOperation = "color-dodge";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Invert
		fctx2.globalCompositeOperation = "difference";
		fctx2.fillStyle = 'rgb(255,255,255)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Subtract with keyframe
		fctx2.globalCompositeOperation = "difference"; 
		fctx2.drawImage(this.keyFrame, 0, 0, canvas.width, frameCanvas2.height);

		fctx3.globalCompositeOperation = "source-over";
		fctx3.drawImage(frameCanvas2, 0, 0, canvas.width, frameCanvas3.height);

		// ------
// Copy
		fctx2.globalCompositeOperation = "source-over";
		fctx2.drawImage(this, 0, 0, canvas.width, frameCanvas2.height);

// Take upper half
		fctx2.globalCompositeOperation = "lighten";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Invert
		fctx2.globalCompositeOperation = "difference";
		fctx2.fillStyle = 'rgb(255,255,255)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Multiply
		fctx2.globalCompositeOperation = "color-dodge";
		fctx2.fillStyle = 'rgb(128,128,128)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Invert
		fctx2.globalCompositeOperation = "difference";
		fctx2.fillStyle = 'rgb(255,255,255)';
		fctx2.fillRect(0,0,canvas.width, frameCanvas2.height);

// Add to stored fb
		fctx3.globalCompositeOperation = "lighter";
		fctx3.drawImage(frameCanvas2, 0, 0, canvas.width, frameCanvas3.height);

// Render result
		ctx.globalCompositeOperation = "source-atop";
		ctx.drawImage(frameCanvas3, 0, yoffset, canvas.width, canvas.height);
	}
};

function createCanvasData(image) {
	var h = image.height * 2;
	if (!canvasImageData || canvasImageData.width != image.width || canvasImageData.height != h) {
		canvas.width = image.width;
		canvas.height = h;
		ctx = canvas.getContext('2d');
		frameCanvas.width = image.width;
		frameCanvas.height = image.height;
		fctx = frameCanvas.getContext('2d');

		canvasImageData = ctx.createImageData(image.width, h);
		var cData = canvasImageData.data;
		for (var p = 0; p < cData.length; p++) {
			cData[p] = 255;
		}

		lastKeyData = new Array();
		console.log("Clear canvas");
	}
}

function framePixelEditing() {
	createCanvasData(this);
	if (this.type == 1 || this.type == 2) {
		var kData = getImageData(this).data;
		this.imageData = kData;
		transferData(kData, this.ip1);
	} else if ((this.type == 3 || this.type == 4) && this.keyFrame && this.keyFrame.imageData) {
		var kData = this.keyFrame.imageData;
		var iData = getImageData(this).data;
		transferDataI(kData, iData, this.ip1);
	}
};

function getImageData(image) {
	fctx.drawImage(image, 0, 0, 
		image.width, image.height);
	return fctx.getImageData(0,0,image.width, 
		image.height);
}

var canvasImageData;
function transferDataI(kData, iData, ip) {
	var cData = canvasImageData.data;
	var w = canvas.width * 4;
	var w2 = w - 4;
	var p2 = ip == 0 ? 0 : w;
	for (var p = 0; p < kData.length; p+=4, p2+=4) {
		var pg = p+1;
		var pb = p+2;
		var pg2 = p2+1;
		var pb2 = p2+2;
		cData[p2] = kData[p] + (iData[p] - 127) * 2;
		cData[pg2] = kData[pg] + (iData[pg] - 127) * 2;
		cData[pb2] = kData[pb] + (iData[pb] - 127) * 2;
		if (p % w == w2) p2 += w;
	}
	ctx.putImageData(canvasImageData, 0, 0);
}
function transferData(kData, ip) {
	var cData = canvasImageData.data;
	var w = canvas.width * 4;
	var w2 = w - 4;
	var p2 = ip == 0 ? 0 : w;
	for (var p = 0; p < kData.length; p+=4, p2+=4) {
		var pg = p+1;
		var pb = p+2;
		var pg2 = p2+1;
		var pb2 = p2+2;
		cData[p2] = kData[p];
		cData[pg2] = kData[pg];
		cData[pb2] = kData[pb];
		if (p % w == w2) p2 += w;
	}
	ctx.putImageData(canvasImageData, 0, 0);
}

var canvas;
var ctx;
var frameCanvas;
var fctx;
var frameCanvas2;
var fctx2;
var frameCanvas3;
var fctx3;
var rCanvas;
var rctx;
var websocket;
var lastKeyFrame = new Array();
var lastKeyData;
var urlCreator = window.URL || window.webkitURL;

var frameTime = Date.now();
var frameCnt = 0;
var testimage;
var frameFunction;
function testDecompression(type) {
	var image = testimage;//new Image();
	image.ip1 = type % 2 == 0 ? 0 : 1;
	image.ip2 = 1 - image.ip1;
	image.type = type;

	if (type == 1 || type == 2) {
		lastKeyFrame[type-1] = image;
	} else {
		image.keyFrame = lastKeyFrame[type-3];
	}
	image.frameLoad = frameFunction;
	//image.onload = function() {
		image.frameLoad(); 
		endLog();
	//};
	image.frameLoad();

	//image.setAttribute('crossOrigin', '');
	//image.src = "testimage.jpg";

}

var start;
var count = 0;
var maxIter = 30;
var endCount = 82*maxIter;
function endLog() {
	count++;
	if (count >= endCount) {
		var end = new Date().getTime();

		count = 0;
		console.log("Time taken: " + (end - start));
	}
}

function singleTest() {

}

function test() {

	console.log("Start timing...");
	start = new Date().getTime();
	count = 1;
	frameFunction = function() { };
	console.log("no function");
	for (var i = 0; i < maxIter; i++) {
		testDecompression(3);
		for (var k = 0; k < 20; k++) {
		testDecompression(2);
		testDecompression(1);
		}
		testDecompression(4);
		for (var k = 0; k < 20; k++) {
		testDecompression(1);
		testDecompression(2);
		}
	}
	while (count != 0);
	count = 1;
	start = new Date().getTime();
	frameFunction = frameCompositing;
	console.log("frameCompositing");
	for (var i = 0; i < maxIter; i++) {
		testDecompression(3);
		for (var k = 0; k < 20; k++) {
		testDecompression(2);
		testDecompression(1);
		}
		testDecompression(4);
		for (var k = 0; k < 20; k++) {
		testDecompression(1);
		testDecompression(2);
		}
	}
	while (count != 0);
	count = 1;
	start = new Date().getTime();
	frameFunction = frameCompositingNoInterlacing;
	console.log("frameCompositingNoInterlacing");
	for (var i = 0; i < maxIter; i++) {
		testDecompression(3);
		for (var k = 0; k < 20; k++) {
		testDecompression(2);
		testDecompression(1);
		}
		testDecompression(4);
		for (var k = 0; k < 20; k++) {
		testDecompression(1);
		testDecompression(2);
		}
	}
	while (count != 0);
	count = 1;
	start = new Date().getTime();
	frameFunction = framePixelEditing;
	console.log("framePixelEditing");
	for (var i = 0; i < maxIter; i++) {
		testDecompression(3);
		for (var k = 0; k < 20; k++) {
		testDecompression(2);
		testDecompression(1);
		}
		testDecompression(4);
		for (var k = 0; k < 20; k++) {
		testDecompression(1);
		testDecompression(2);
		}
	}
}

$(document).ready(function(){
	canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	ctx.font = "30px Arial";
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.fillText("Timing tests", 10, 50);

	frameCanvas = document.createElement('canvas');
	frameCanvas2 = document.createElement('canvas');
	frameCanvas3 = document.createElement('canvas');

	testimage = new Image();
	testimage.onload = test;
	testimage.src= "testimage.jpg";

});
