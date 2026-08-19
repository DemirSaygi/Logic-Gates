const hueSectorWidth = 40
const hueSelectorOffsetX = 6
const hueSelectorHeight = 20
const colorSelectorRadius = 12

class ColorPicker {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.bigSide = 320
		this.HSBValue;
		this.selectedColor;
		this.colorSelector
		this.hueSelector
		this.createRandomColor()
		this.setStrokeStyle()	
	}

	show() {
		//Draws the main colorPicker area
		c.beginPath()
		let color = ColorPicker.hsbToRgb(this.HSBValue.h, 1, 1)
		let gradientH = c.createLinearGradient(this.x, this.y, this.x + this.bigSide, this.y);
		gradientH.addColorStop(0, "#fff");
		gradientH.addColorStop(1, color);
		c.fillStyle = gradientH;
		c.fillRect(this.x, this.y, this.bigSide, this.bigSide);

		let gradientV = c.createLinearGradient(this.x, this.y, this.x, this.y + this.bigSide);
		gradientV.addColorStop(0, 'rgba(0,0,0,0)');
		gradientV.addColorStop(1, 'black');
		c.fillStyle = gradientV;
		c.fillRect(this.x, this.y, this.bigSide, this.bigSide)
		c.closePath()

		// Draws the hue selecting area
		c.beginPath()

		let colors = []
		for(let i = 0; i <= 6; i++) {
			colors.push(ColorPicker.hsbToRgb(i * 60, 1, 1))
		}
		let gradient = c.createLinearGradient(this.x, this.y, this.x, this.y + this.bigSide)
		for(let i = 0; i < colors.length; i++) {
			gradient.addColorStop(map(i, 0, colors.length - 1 , 0, 1), colors[i])
		}

		c.fillStyle = gradient;
		c.fillRect(this.x + this.bigSide + 10, this.y, hueSectorWidth, this.bigSide)
		c.closePath()


		//Draws the main area selector indicator which is moveable
		c.beginPath()
		c.fillStyle = this.selectedColor
		c.strokeStyle = this.strokeStyle
		
		c.lineWidth = 7
		c.arc(this.colorSelector.x, this.colorSelector.y, this.colorSelector.radius, 0, 360)
		c.stroke()
		c.fill();
		c.closePath()

		// Draws the hue selector indicator which is moveable
		c.beginPath()
		c.fillStyle = "white"
		c.rect(this.hueSelector.x - this.hueSelector.width/2, this.hueSelector.y - this.hueSelector.height/2, hueSectorWidth + hueSelectorOffsetX, hueSelectorHeight);

		c.fill();
		
		c.closePath()
		// c.beginPath()
		// c.fillStyle = "red"
		// c.arc(this.hueSelector.x, this.hueSelector.y, 4, 0, 360)
		// c.fill()
		// c.closePath()
	}

	setStrokeStyle() {
		if(this.HSBValue.b - this.HSBValue.s > 0.5) {
			this.strokeStyle = "rgba(0, 0, 0, 1)"
		} else {
			this.strokeStyle = "rgba(255, 255, 255, 1)"		
		}
		if(this.selectedColor == "rgba(0, 0, 0, 1)") {
			this.strokeStyle = "rgba(38, 38, 38, 1)"
		}
	}

	updateColor() {
		this.HSBValue.h = map(this.hueSelector.y, this.y, this.y + this.bigSide, 0, 360);
		this.HSBValue.s = map(this.colorSelector.x, this.x, this.x + this.bigSide, 0, 1);
		this.HSBValue.b = map(this.colorSelector.y, this.y, this.y + this.bigSide, 1, 0);
		this.selectedColor = ColorPicker.hsbToRgb(this.HSBValue.h, this.HSBValue.s, this.HSBValue.b);
		colorPickerInput.value = hsbToHex(this.HSBValue.h, this.HSBValue.s, this.HSBValue.b).toUpperCase()
		this.setStrokeStyle()
		
	}

	updateSelectors() {
		this.colorSelector = {x: this.x +  map(this.HSBValue.s, 0, 1, 0, this.bigSide), y: this.y + map(this.HSBValue.b, 1, 0, 0, this.bigSide), radius: colorSelectorRadius}
		let tempWidth = hueSectorWidth + hueSelectorOffsetX
		this.hueSelector = {x: this.x + this.bigSide + 10 + tempWidth/2 - hueSelectorOffsetX/2, y: this.y + map(this.HSBValue.h, 0, 360, 0, this.bigSide), width: hueSectorWidth + hueSelectorOffsetX, height: hueSelectorHeight}
	}

	static hsbToRgb(hue, saturation, brightness) {
		hue = hue % 360 / 360;
		saturation = constrain(saturation, 0, 1);
		brightness = constrain(brightness, 0, 1);

		let r, g, b;
		if (saturation == 0) {
		  // Eğer doygunluk 0 ise renk gri tonlarında olacak (Sıfır doygunluk beyaz olur)
		  r = g = b = brightness;
		} else {
		  const hueSector = hue * 6; // Renk dairede 6 sektöre ayrılır
		  const sectorIndex = Math.floor(hueSector);
		  const fractionalSector = hueSector - sectorIndex;
		  const p = brightness * (1 - saturation);
		  const q = brightness * (1 - saturation * fractionalSector);
		  const t = brightness * (1 - saturation * (1 - fractionalSector));

		  switch (sectorIndex) {
		    case 0:
		      r = brightness;
		      g = t;
		      b = p;
		      break;
		    case 1:
		      r = q;
		      g = brightness;
		      b = p;
		      break;
		    case 2:
		      r = p;
		      g = brightness;
		      b = t;
		      break;
		    case 3:
		      r = p;
		      g = q;
		      b = brightness;
		      break;
		    case 4:
		      r = t;
		      g = p;
		      b = brightness;
		      break;
		    case 5:
		      r = brightness;
		      g = p;
		      b = q;
		      break;
		    default:
		      break;
		  }
		}

		return `rgba(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)}, 1)`
	}

	createRandomColor() {
		let hValue = Math.floor(getRandomNumber(0, 360));
		let sValue = Math.random();
		let bValue = Math.random();
		this.HSBValue = {h: hValue, s: sValue, b: bValue};
		this.selectedColor = ColorPicker.hsbToRgb(hValue, sValue, bValue);
		this.updateSelectors();
		this.setStrokeStyle()
	}


	setColor(hsbVal) {
		this.HSBValue = {h: hsbVal.h, s: hsbVal.s, b: hsbVal.b}
		this.selectedColor = ColorPicker.hsbToRgb(hsbVal.h, hsbVal.s, hsbVal.b);
		this.updateSelectors();
		this.setStrokeStyle();
	}
}