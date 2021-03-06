;(function (window, document, undefined) {

	function MagicImage(canvas) {
		this._canvas = cloneCanvas(canvas);
		this.canvas = canvas;
		this.ctx2d = this.canvas.getContext('2d');
		this.parent = $(canvas).parent();
		return this;
	}

	var matrixData = {
		gaussianBlurMatrix: [
			[1, 4, 6, 4, 1],
			[4, 16, 24, 16, 4],
			[6, 24, 36, 24, 6],
			[4, 16, 24, 26, 4],
			[1, 4, 6, 4, 1],
		],
		edgeMatrix: [
			[2, -1, 2],
			[-1, -4, -1],
			[2, -1, 2],
		],
		detailMatrix: [
			[0, -1, 0],
			[-1, 10, -1],
			[0, -1, 0],
		],
		sharpenMatrix: [
			[-1, -1, -1],
			[-1, 10, -1],
			[-1, -1, -1],
		],
	};

	function cloneCanvas(oldCanvas) {
		var newCanvas = document.createElement('canvas');
		var context = newCanvas.getContext('2d');
		newCanvas.width = oldCanvas.width;
		newCanvas.height = oldCanvas.height;
		context.drawImage(oldCanvas,0,0,oldCanvas.width,oldCanvas.height);
		return newCanvas;
	}

	function toMatrix(imgData, dWidth) {
		var matrix = getTwoDimenArray(dWidth, imgData.length / 4 / dWidth);
		for (var i = 0, length = imgData.length; i < length; i += 4) {
			var y = Math.floor(i / (4 * dWidth));
			var x = (i / 4) % dWidth;
			matrix[x][y] = new matrixFactory(imgData[i], imgData[i + 1], imgData[i + 2], imgData[i + 3]);
		}
		return matrix;
	}

	function getTwoDimenArray(x, y) {
		var matrix = new Array(x);
		for (var i = 0; i < x; i++) {
			matrix[i] = new Array(y);
		}
		return matrix;
	}

	function matrixFactory(R, G, B, A) {
		this.R = R;
		this.G = G;
		this.B = B;
		this.A = A;
	}

	function decodeMatrix(dataMatrix) {
		var width = dataMatrix.length;
		var height = dataMatrix[0].length;
		var pixelData = new Uint8ClampedArray(width * height * 4);

		var counter = 0;
		for (var j = 0; j < height; j++) {
			for (var i = 0; i < width; i++) {
				pixelData[counter] = dataMatrix[i][j].R;
				pixelData[counter + 1] = dataMatrix[i][j].G;
				pixelData[counter + 2] = dataMatrix[i][j].B;

				if (dataMatrix[i][j].A == undefined) {
					pixelData[counter + 3] = 255;
				} else {
					pixelData[counter + 3] = dataMatrix[i][j].A;
				}

				counter = counter + 4;
			}
		}
		return pixelData;
	}

	function calculateByMatrix(dataMatrix, coreMatrix) {
		if (coreMatrix.length % 2 == 0) {
			alert('核矩阵不正确！');
			return;
		}
		var newMatrix = getTwoDimenArray(dataMatrix.length, dataMatrix[0].length);
		var center = (coreMatrix.length - 1) / 2;
		var coreSize = coreMatrix.length;

		var round = Math.round;
		for (var i = 0, ilength = dataMatrix.length; i < ilength; i++) {
			for (var j = 0, jlength = dataMatrix[i].length; j < jlength; j++) {
				var R, G, B;
				var rTotal = 0;
				var gTotal = 0;
				var bTotal = 0;
				var average = 0;
				for (var x = i - center, xlength = i + center, countx = 0; x <= xlength; x++) {
					for (var y = j - center, ylength = j + center, county = 0; y <= ylength; y++) {

						if (x < 0 || y < 0) {
							continue;
						}
						if (x >= dataMatrix.length || y >= dataMatrix[0].length) {
							continue;
						}

						try {
							rTotal += dataMatrix[x][y].R * coreMatrix[county][countx];
						} catch (e) {
							console.log(x, y);
							window.dataMatrix = dataMatrix;
						}

						gTotal += dataMatrix[x][y].G * coreMatrix[county][countx];
						bTotal += dataMatrix[x][y].B * coreMatrix[county][countx];
						average += coreMatrix[county][countx];
						county++;
					}
					countx++;
				}
				if (average == 0) {
					average = 1;
				}
				R = round(rTotal / average);
				G = round(gTotal / average);
				B = round(bTotal / average);
				newMatrix[i][j] = new matrixFactory(R, G, B);
			}
		}

		return newMatrix;
	}

	function RGBtoHSV(r, g, b) {
		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);
		var h, s, v;
		if (max === min) {
			return [0, 0, max];
		}
		if (r === max) {
			h = (g - b) / (max - min);
		}
		if (g === max) {
			h = 2 + (b - r) / (max - min);
		}
		if (b === max) {
			h = 4 + (r - g) / (max - min)
		}
		h = h * 60;
		if (h < 0) {
			h = h + 360;
		}
		v = max;
		s = (max - min) / max;
		if (h == 0 && s == 0 && v == 0) {
			console(r, g, b);
		}
		return [h, s, v];
	}

	function HSVtoRGB(h, s, v) {
		var max = v;
		var R, G, B;
		if (s === 0) {
			return [max, max, max];
		} else {
			var h = h / 60;
			var i = Math.floor(h);
			var f = h - i;
			var a = v * (1 - s);
			var b = v * (1 - s * f);
			var c = v * (1 - s * (1 - f));
			switch (i) {
				case 0:
					R = v;
					G = c;
					B = a;
					break;
				case 1:
					R = b;
					G = v;
					B = a;
					break;
				case 2:
					R = a;
					G = v;
					B = c;
					break;
				case 3:
					R = a;
					G = b;
					B = v;
					break;
				case 4:
					R = c;
					G = a;
					B = v;
					break;
				case 5:
					R = v;
					G = a;
					B = b;
					break;
			}
			return [R, G, B];
		}

	}

	function _blackWhite(imageData) {
		var pixel = imageData.data;
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			pixel[i + 2] = pixel[i + 1] = pixel[i] = (pixel[i] * 2 + pixel[i + 1] * 5 + pixel[i + 2] * 1) >> 3;
		}
	}

	function _gaussianBlur(imageData) {
		var pixes = imageData.data;
		var width = imageData.width;
		var height = imageData.height;
		var gaussMatrix = [],
			gaussSum = 0,
			x, y,
			r, g, b, a,
			i, j, k, len;

		var radius = 10;
		var sigma = 5;

		a = 1 / (Math.sqrt(2 * Math.PI) * sigma);
		b = -1 / (2 * sigma * sigma);

		//生成高斯矩阵
		for (i = 0, x = -radius; x <= radius; x++, i++){
			g = a * Math.exp(b * x * x);
			gaussMatrix[i] = g;
			gaussSum += g;
		}

		//归一化, 保证高斯矩阵的值在[0,1]之间
		for (i = 0, len = gaussMatrix.length; i < len; i++) {
			gaussMatrix[i] /= gaussSum;
		}

		//x 方向一维高斯运算
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				r = g = b = a = 0;
				gaussSum = 0;
				for(j = -radius; j <= radius; j++){
					k = x + j;
					if(k >= 0 && k < width){//确保 k 没超出 x 的范围
						//r,g,b,a 四个一组
						i = (y * width + k) * 4;
						r += pixes[i] * gaussMatrix[j + radius];
						g += pixes[i + 1] * gaussMatrix[j + radius];
						b += pixes[i + 2] * gaussMatrix[j + radius];
						// a += pixes[i + 3] * gaussMatrix[j];
						gaussSum += gaussMatrix[j + radius];
					}
				}
				i = (y * width + x) * 4;
				// 除以 gaussSum 是为了消除处于边缘的像素, 高斯运算不足的问题
				// console.log(gaussSum)
				pixes[i] = r / gaussSum;
				pixes[i + 1] = g / gaussSum;
				pixes[i + 2] = b / gaussSum;
				// pixes[i + 3] = a ;
			}
		}
		//y 方向一维高斯运算
		for (x = 0; x < width; x++) {
			for (y = 0; y < height; y++) {
				r = g = b = a = 0;
				gaussSum = 0;
				for(j = -radius; j <= radius; j++){
					k = y + j;
					if(k >= 0 && k < height){//确保 k 没超出 y 的范围
						i = (k * width + x) * 4;
						r += pixes[i] * gaussMatrix[j + radius];
						g += pixes[i + 1] * gaussMatrix[j + radius];
						b += pixes[i + 2] * gaussMatrix[j + radius];
						// a += pixes[i + 3] * gaussMatrix[j];
						gaussSum += gaussMatrix[j + radius];
					}
				}
				i = (y * width + x) * 4;
				pixes[i] = r / gaussSum;
				pixes[i + 1] = g / gaussSum;
				pixes[i + 2] = b / gaussSum;
			}
		}
	}

	function _colorFlip(imageData) {
		var pixel = imageData.data;
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			pixel[i] = 225 - pixel[i];
			pixel[i + 1] = 225 - pixel[i + 1];
			pixel[i + 2] = 225 - pixel[i + 2];
		}
	}

	function _edge(imageData) {
		var pixel = imageData.data;
		var matrix = toMatrix(pixel, imageData.width);
		var coreMatrix = matrixData.edgeMatrix;
		var newMatrix = calculateByMatrix(matrix, coreMatrix);
		var newpixel = decodeMatrix(newMatrix);
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			pixel[i] = newpixel[i];
			pixel[i + 1] = newpixel[i + 1];
			pixel[i + 2] = newpixel[i + 2];
			pixel[i + 3] = newpixel[i + 3];
		}
	}

	function _sharpen(imageData) {
		var pixel = imageData.data;
		var matrix = toMatrix(pixel, imageData.width);
		var coreMatrix = matrixData.sharpenMatrix;
		var newMatrix = calculateByMatrix(matrix, coreMatrix);
		var newpixel = decodeMatrix(newMatrix);
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			pixel[i] = newpixel[i];
			pixel[i + 1] = newpixel[i + 1];
			pixel[i + 2] = newpixel[i + 2];
			pixel[i + 3] = newpixel[i + 3];
		}
	}

	function _medianFilter(imageData) {
		var pixel = imageData.data;
		var matrix = toMatrix(pixel, imageData.width);
		var newMatrix = getTwoDimenArray(matrix.length, matrix[0].length);

		function sortNumber(a, b) {
			return a - b
		}

		for (var x = 0; x < matrix.length; x++) {
			for (var y = 0; y < matrix[x].length; y++) {
				var arr = new Array(8);
				var left = matrix[x - 1] || matrix[x];
				var right = matrix[x + 1] || matrix[x];

				arr[0] = left[y - 1] || matrix[x][y];
				arr[1] = matrix[x][y - 1] || matrix[x][y];
				arr[2] = right[y - 1] || matrix[x][y];
				arr[3] = left[y] || matrix[x][y];
				arr[4] = matrix[x][y] || matrix[x][y];
				arr[5] = right[y] || matrix[x][y];
				arr[6] = left[y + 1] || matrix[x][y];
				arr[7] = matrix[x][y + 1] || matrix[x][y];
				arr[8] = right[y + 1] || matrix[x][y];

				var newR = [arr[0].R, arr[1].R, arr[2].R, arr[3].R, arr[4].R, arr[5].R, arr[6].R, arr[7].R].sort(sortNumber)[4];
				var newG = [arr[0].G, arr[1].G, arr[2].G, arr[3].G, arr[4].G, arr[5].G, arr[6].G, arr[7].G].sort(sortNumber)[4];
				var newB = [arr[0].B, arr[1].B, arr[2].B, arr[3].B, arr[4].B, arr[5].B, arr[6].B, arr[7].B].sort(sortNumber)[4];
				newMatrix[x][y] = new matrixFactory(newR, newG, newB);
			}
		}
		var newpixel = decodeMatrix(newMatrix);
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			pixel[i] = newpixel[i];
			pixel[i + 1] = newpixel[i + 1];
			pixel[i + 2] = newpixel[i + 2];
			pixel[i + 3] = newpixel[i + 3];
		}
	}

	function _histogramBlance(imageData) {
		var pixel = imageData.data;
		var totalPixel = 0;
		var Ramount = new Array(256),
			Gamount = new Array(256),
			Bamount = new Array(256),
			Rmap = new Array(256),
			Gmap = new Array(256),
			Bmap = new Array(256);
		for (var i = 0; i < 256; i++) {
			Ramount[i] = Gamount[i] = Bamount[i] = Rmap[i] = Gmap[i] = Bmap[i] = 0;
		}
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			Ramount[pixel[i]] += 1;
			Gamount[pixel[i + 1]] += 1;
			Bamount[pixel[i + 2]] += 1;
			totalPixel += 1;
		}

		for (var i = 0; i < 256; i++) {
			var counterR = counterG = counterB = 0;
			for (var j = 0; j <= i; j++) {
				counterR = counterR + Ramount[j];
				counterG = counterG + Gamount[j];
				counterB = counterB + Bamount[j];
			}
			Rmap[i] = Math.round(counterR / totalPixel * 255);
			Gmap[i] = Math.round(counterG / totalPixel * 255);
			Bmap[i] = Math.round(counterB / totalPixel * 255);
		}
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			pixel[i] = Rmap[pixel[i]];
			pixel[i + 1] = Gmap[pixel[i + 1]];
			pixel[i + 2] = Bmap[pixel[i + 2]];
		}
		return;
	}

	function _histogramBlanceWithColor(imageData) {
		var pixel = imageData.data;
		var hsvData = new Array(pixel.length);
		var Vamount = new Array(256);
		var Vmap = new Array(256);
		var totalPixel = 0;
		for (var i = 0; i < 256; i++) {
			Vamount[i] = 0;
		}
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			var HSV = RGBtoHSV(pixel[i], pixel[i + 1], pixel[i + 2]);
			hsvData[i] = HSV[0];
			hsvData[i + 1] = HSV[1];
			hsvData[i + 2] = HSV[2];
			hsvData[i + 3] = 0;
			Vamount[HSV[2]] += 1;
			totalPixel += 1;
		}
		for (var i = 0; i < 256; i++) {
			var counterV = 0;
			for (var j = 0; j <= i; j++) {
				counterV = counterV + Vamount[j];
			}
			Vmap[i] = Math.round(counterV / totalPixel * 255);
		}
		console.log(Vmap);
		for (var i = 0, length = hsvData.length; i < length; i += 4) {
			hsvData[i + 2] = Vmap[hsvData[i + 2]];
		}
		for (var i = 0, length = pixel.length; i < length; i += 4) {
			var RGB = HSVtoRGB(hsvData[i], hsvData[i + 1], hsvData[i + 2])
			pixel[i] = RGB[0];
			pixel[i + 1] = RGB[1];
			pixel[i + 2] = RGB[2];

			if (RGB[0] == 0 && RGB[1] == 0 && RGB[2] == 0) {
				//console.log(i, hsvData[i], hsvData[i + 1], hsvData[i + 2]);
			}
		}
	}

	function _removeOneColor(imageData,colorData,threshold) {
		var data = imageData.data;
		for (var i = 0; i < data.length - 4; i+=4) {
			if (Math.abs(data[i] - colorData.R) > threshold) continue;
			if (Math.abs(data[i + 1] - colorData.G) > threshold) continue;
			if (Math.abs(data[i + 2] - colorData.B) > threshold) continue;
			data[i + 3] = 0;
		}
	}
	
	MagicImage.prototype.blackWhite = function (dx, dy, dWidth, dHeight) {
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_blackWhite(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.gaussianBlur = function (dx, dy, dWidth, dHeight) {
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_gaussianBlur(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.colorFlip = function (dx, dy, dWidth, dHeight) {
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_colorFlip(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.edge = function (dx, dy, dWidth, dHeight) {
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_edge(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.removeOneColor = function (dx, dy, dWidth, dHeight,colorData,threshold) {
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_removeOneColor(imageData,colorData,threshold);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.sharpen = function (dx, dy, dWidth, dHeight) {
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_sharpen(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.medianFilter = function (dx, dy, dWidth, dHeight) {
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_medianFilter(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.histogramBlance = function (dx, dy, dWidth, dHeight){
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_histogramBlance(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.histogramBlanceWithColor = function (dx, dy, dWidth, dHeight){
		var imageData = this.ctx2d.getImageData(dx, dy, dWidth, dHeight);
		_histogramBlanceWithColor(imageData);
		this.ctx2d.putImageData(imageData,dx,dy);
	};

	MagicImage.prototype.reset = function(){
		this.canvas = cloneCanvas(this._canvas);
		this.ctx2d = this.canvas.getContext('2d');
		this.parent.empty().append(this.canvas);
	};

	window.MagicImage = MagicImage;

})(window, document, undefined);