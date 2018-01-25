var canvasImage = null;
$(document).ready(function() {

	var img = new Image();
	img.onload = function() {
		draw(img);
	};
	img.src = "./img/beach.jpg";

	$('.blackAndWhite').on('click',function() {
		canvasImage.blackWhite(0, 0,canvasImage.canvas.width,canvasImage.canvas.height);
	});

	$('.gaosi').on('click',function() {
		canvasImage.gaussianBlur(0, 0,canvasImage.canvas.width,canvasImage.canvas.height);
	});

	// $('.edge').click(function() {
	// 	var context = $('#canvas')[0].getContext('2d');
	// 	var imageData = context.getImageData(0, 0, 1080, 900);
	// 	CanvasImage.edge(imageData, 1080);
	// 	context.putImageData(imageData, 0, 0);
	// })

	$('.flip').on('click',function() {
		canvasImage.colorFlip(0, 0,canvasImage.canvas.width,canvasImage.canvas.height);
	});

	// $('.sharpen').click(function() {
	// 	var context = $('#canvas')[0].getContext('2d');
	// 	var imageData = context.getImageData(0, 0, 1080, 900);
	// 	CanvasImage.sharpen(imageData, 1080);
	// 	context.putImageData(imageData, 0, 0);
	// })
	// $('.histogramBlance').click(function() {
	// 	var context = $('#canvas')[0].getContext('2d');
	// 	var imageData = context.getImageData(0, 0, 1080, 900);
	// 	CanvasImage.histogramBlanceWithColor(imageData);
	// 	context.putImageData(imageData, 0, 0);
	// })
	// $('.medianFilter').click(function() {
	// 	var context = $('#canvas')[0].getContext('2d');
	// 	var imageData = context.getImageData(0, 0, 1080, 900);
	// 	CanvasImage.medianFilter(imageData, 1080);
	// 	context.putImageData(imageData, 0, 0);
	// })

	$('.removeOneColor').on('click',function () {
		var colorData = {
			R : 74,
			G : 156,
			B : 201
		},
		threshold = 50;
		canvasImage.removeOneColor(0, 0,canvasImage.canvas.width,canvasImage.canvas.height,colorData,threshold);
	});


	$('.download').on('click',function() {
		var href = $('#canvas')[0].toDataURL('image/png').replace("image/png", "image/octet-stream");
		window.location.href = href;
	})

	$('.reset').on('click',function() {
		canvasImage.reset();
	});
});

function draw(img, width, height) {
	var canvas = document.getElementById("canvas");
	canvasImage = new CanvasImage($('#canvas')[0]);
	var context = canvas.getContext("2d");
	context.shadowBlur = 20;
	context.shadowColor = "#DDDDDD";
	context.drawImage(img, 0, 0, canvas.width, canvas.height);
}