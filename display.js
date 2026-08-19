const scalerLength = 15;

class Display {
	constructor(x, y, name, frameless = false) {
		this.x = x;
		this.y = y;
		this.name = name
		this.frameless = (screen == 7 ? true : false) || frameless //Customize --> frameless
		this.parentCode == null

		// Generates a individual code for future uses
		this.code = generateCode();

		this.width = gateInfos[name]?.width;
		this.height = gateInfos[name]?.height;
		
		
		this.numberOfIO = gateInfos[name]?.gateIO;
		this.inputs = [];
		this.outputs = [];
		this.createPuts();

		this.moving = false;
		this.ObjectName = this.constructor.name;
		this.tag = ""

		
		this.scale = 1
		if(this.name == "LED") {
			this.colorMode = "red"
		}
		if(this.name == "DOT DISPLAY") {
			this.dotMemory = Array(256).fill(false)
			this.unrefreshedMemory = Array(256).fill(false)
			this.clockLocked = false
		}
		if(this.name == "RGB DISPLAY") {
			this.rgbMemory = Array(256).fill({r: 0, g: 0, b: 0})
			this.unrefreshedMemory = Array(256).fill({r: 0, g: 0, b: 0})
			this.clockLocked = false
		}

		this.calculateHitbox()
	}

	createScalers() {
		this.scalers = [];
		let len = scalerLength
		for(let i = -1; i <= 1; i+=2) {
			for(let j = -1; j <= 1; j+=2) {
				let tempVector = {x: i, y: j}
				let tempWH = {w: -i*len, h: -j*len}
				let tempScaler = {
					x: this.x + (tempVector.x * this.framelessWidth_World/2), 
					y: this.y + (tempVector.y * this.framelessHeight_World/2), 
					width: tempWH.w, 
					height: tempWH.h, 
					highlight: false, 
					moving: false, 
					vector: tempVector
				}
				this.scalers.push(tempScaler)
			}	
		}	
	}

	moveScalers() {
		for(let s of this.scalers) {
			s.x = this.x + (s.vector.x * this.framelessWidth_World/2)
			s.y = this.y + (s.vector.y * this.framelessHeight_World/2)
		}
	}

	powerSupply(arrOutput = outputs, arrInput = inputs) {
		//IsPowered
		this.poweredPutsCount = 0;
		let connectedInputCount = 0
		for(let i of this.inputs) {
			let tempInput = decode(arrInput, i) 
			for(let t = 0; t < tempInput.type; t++) {
				if(tempInput.isPowered[t] == true) {
					this.poweredPutsCount++
				}
				if(tempInput.inputs.length > 0) {
					connectedInputCount++
				}
			}		
		}
		if(this.poweredPutsCount == 0) {
			this.isPowered = false;
		}
		if(this.poweredPutsCount > 0) {
			this.isPowered = "semiPowered";
		}
		if(this.poweredPutsCount == connectedInputCount) {
			this.isPowered = true;
		}
		//if(debugMode) console.log(this, this.poweredPutsCount, connectedInputCount, this.isPowered)


		//Base Power 
		for(let o of this.outputs) {
			let tempOutput = decode(arrOutput, o)
			tempOutput.basePower = Array(tempOutput.type).fill(true);			
		}
	}

	calculateHitbox() {
		if(!this.frameless) {
			let hitboxOffset = hitboxOffsets["Display"]
			this.hitbox = {x: this.x - this.width/2 - hitboxOffset.x, y: this.y - this.height/2 - hitboxOffset.y, w: this.width + 2*hitboxOffset.x, h: this.height + hitboxOffset.y*2}
			if(this.numberOfIO != null) {
				let inputC = getTotalIO(this.numberOfIO[0])
				let outputC = getTotalIO(this.numberOfIO[1])
				if(inputC == 0 && outputC == 0) {
					//Does nothing
				}
				if(inputC != 0 && outputC == 0) {
					this.hitbox.x -= IO_radius
					this.hitbox.w += IO_radius
				}
				if(inputC == 0 && outputC != 0) {
					this.hitbox.w += IO_radius
				}
				if(inputC != 0 && outputC != 0) {
					this.hitbox.x -= IO_radius
					this.hitbox.w += IO_radius * 2
				}
			}
		}
	}

	createPuts() {
		if(!this.frameless) {

			let inputTags = [];
			let outputTags = [];

			if(this.name == "7 SEGMENT") {
				inputTags = ["A", "B", "C", "D", "E", "F", "G", "COL"]
			}
			if(this.name == "DOT DISPLAY") {
				inputTags = ["Address", "Pixel In", "Reset", "Write", "Refresh", "Clock"]
				outputTags = ["Pixel Out"]
			}
			if(this.name == "RGB DISPLAY") {
				inputTags = ["Address", "Red", "Green", "Blue", "Reset", "Write", "Refresh", "Clock"]
				outputTags = ["R Out", "G Out", "B Out"]
			}

			// Creates inputs/outputs and link the display and them
			if(this.numberOfIO != null) {
				// Creates inputs/outputs and link the display to them
				let totalInputHeight = 0;
				let totalOutputHeight = 0;
				for (let i = 0; i < this.numberOfIO[0].length; i++) {
					let type = this.numberOfIO[0][i]
					totalInputHeight += radiusOfPuts[type] * 2;
				}
				for (let i = 0; i < this.numberOfIO[1].length; i++) {
					let type = this.numberOfIO[1][i]
					totalOutputHeight += radiusOfPuts[type] * 2;
				}

				let currentY = this.y - this.height/2 + putOffset;
				for(let i = 0; i < this.numberOfIO[0].length; i++) {
					let inputY;
					let n = this.numberOfIO[0].length;
					let availableSpace = this.height - 2 * putOffset - totalInputHeight;
					let gap = (n > 1) ? availableSpace / (n - 1) : 0;		
					let type = this.numberOfIO[0][i]
					inputY = currentY + radiusOfPuts[type];
					currentY += radiusOfPuts[type] * 2 + gap;
					if(n == 1) {
						inputY = this.y 
					}

					let input = new Input(this.x - this.width/2, inputY, this.code, this.numberOfIO[0][i]);
					inputs.push(input);
					this.inputs.push(input.code);
					input.parentType = "gate"

					//Tags the inputs
					if(inputTags.length > 0) {
						input.tag = inputTags[i]
					}
				}

				currentY = this.y - this.height/2 + putOffset;
				for(let i = 0; i < this.numberOfIO[1].length; i++) {
					let outputY;	
					let n = this.numberOfIO[1].length;
					let availableSpace = this.height - 2 * putOffset - totalOutputHeight;
					let gap = (n > 1) ? availableSpace / (n - 1) : 0;		
					let type = this.numberOfIO[1][i]
					outputY = currentY + radiusOfPuts[type];
					currentY += radiusOfPuts[type] * 2 + gap;
					if(n == 1) {
						outputY = this.y
					}
								
					let output = new Output(this.x + this.width/2, outputY, this.code, this.numberOfIO[1][i]);
					outputs.push(output);
					this.outputs.push(output.code);
					output.parentType = "gate"

					//Tags the inputs
					if(outputTags.length > 0) {
						output.tag = outputTags[i]
					}
				}
			}
		}
		
	}
	getSegmentColor(index) {
		let tempInput
		let tempGate
		let lastInput
		if(screen == 7) return "rgba(37,35,35,1)";
		if(!this.frameless) {
			tempInput = decode(inputs, this.inputs[index])
			lastInput = decode(inputs, this.inputs[7])
		} else {		
			tempGate = decode(gates, this.parentCode)
			if(tempGate.visualObjects.length == 0) {
				console.log("Hata")
				return "rgba(37,35,35,1)";	
			}
			let tempDisplays = tempGate.visualObjects.filter(obj=>obj.ObjectName == "Display" && obj.parentCode == null)
			tempInput = decode(tempGate.visualObjects, tempDisplays[this.customizeIndex].inputs[index])
			lastInput = decode(tempGate.visualObjects, tempDisplays[this.customizeIndex].inputs[7])
		} 
		
		let isLit = tempInput.lit[0]
		let isHighlight = tempInput.hoverHighlight || tempInput.connectionHighlight
		if(isLit) {
			if(!lastInput.lit[0]) {
				return "rgba(245,45,60,1)";
			} else {
				return "rgba(0,156,255)"
			}
		} else {
			if(isHighlight) {
				if(!lastInput.lit[0]) {
					return "rgba(68,58,58,1)"
				} else {
					return "rgba(58,58,68,1)"
				}
			}
			return "rgba(37,35,35,1)";
		}
	}

	show() {
		let totalScale = camera.scale * this.scale
		let screenWidth = this.width * totalScale;
		let screenHeight = this.height * totalScale;

		let screenPos = worldToScreen(this.x - this.width/2, this.y - this.height/2);
		let screenX = screenPos.x;
		let screenY = screenPos.y;
		if(!this.moving) {
			this.latestSavedPosition = {x: this.x, y: this.y}
		}

		if(this.name == "7 SEGMENT") this.drawSevenSegment()
		if(this.name == "LED") this.drawLED()
		if(this.name == "DOT DISPLAY") this.drawDotDisplay()
		if(this.name == "RGB DISPLAY") this.drawRGBDisplay()

		//Draws Scalers
		if(this.scalers != undefined) {
			this.moveScalers();
			if(isInRect(this.x, this.y, this.framelessWidth_World, this.framelessHeight_World, mouseX, mouseY, "center") || this.scalers[0].moving || this.scalers[1].moving || this.scalers[2].moving || this.scalers[3].moving) {
				this.scalers.forEach((s) => showScalers(s))
				this.scalers.forEach((s) => {if(s.highlight) showScalers(s)})
			}
				
			function showScalers(s) {
				c.beginPath()
				c.lineWidth = 3 * camera.scale
				c.strokeStyle = mouseOccupation == "scalerMoving" ? "rgba(102, 255, 51, 1)" : s.highlight ? "rgba(255, 204, 51, 1)" : "rgba(255, 255, 255, 1)"
				c.lineCap = "round"
				let s_scp = worldToScreen(s.x, s.y)
				c.moveTo(s_scp.x, s_scp.y);
				c.lineTo(s_scp.x + s.width * camera.scale, s_scp.y);
				c.moveTo(s_scp.x, s_scp.y);
				c.lineTo(s_scp.x, s_scp.y + s.height * camera.scale);
				c.stroke()
				c.closePath()
			}
		}
	
		// Highlighting
		if(this.highlight) {
			let HO = highlightOffset * totalScale
			let highlightRect = {x: screenX - HO, y: screenY - HO, w: screenWidth + 2*HO, h: screenHeight + 2*HO}
			if(this.numberOfIO != null) {
				let inputC = getTotalIO(this.numberOfIO[0])
				let outputC = getTotalIO(this.numberOfIO[1])
				if(inputC != 0 && outputC == 0) {
					highlightRect.x -= IO_radius * totalScale
					highlightRect.w += IO_radius * totalScale
				}
				if(inputC == 0 && outputC != 0) {
					highlightRect.w += IO_radius * totalScale
				}
				if(inputC != 0 && outputC != 0) {
					highlightRect.x -= IO_radius * totalScale
					highlightRect.w += IO_radius * 2 * totalScale
				}
			}


			c.save()
			c.beginPath();
			c.fillStyle = "rgba(255,255,255,0.1)";
			if(isHitboxColided) {
				c.fillStyle = "rgba(255, 0, 0, 0.1)"
			}
			c.rect(
            	highlightRect.x,
           	 	highlightRect.y,
           	 	highlightRect.w,
            	highlightRect.h
        	);
			c.fill();
			c.closePath();
			c.restore()
		}

		//Debug for hitbox
		if(showHitbox && this.hitbox != null) {
			let HP = worldToScreen(this.hitbox.x, this.hitbox.y)
			let sW = this.hitbox.w * camera.scale
			let sH = this.hitbox.h * camera.scale
			c.beginPath()
			c.lineWidth = 4
			c.strokeStyle = "blue"
			c.rect(HP.x, HP.y, sW, sH)
			c.stroke()
			c.closePath()
		}

		if(this.tag != "") {		
			c.save()
			c.font = `${Math.round(18 * totalScale)}px ${myFont}`
			c.letterSpacing = "1px";
			c.textAlign = "center";
			c.textBaseline = "middle";

			let writingOffset = { x: 7 * totalScale, y: 5 * totalScale};
			let screenPoints = worldToScreen(this.x, this.y)
			let textWidth = Math.floor(c.measureText(this.tag).width) + writingOffset.x * 2;
			let textHeight = getTextHeight(this.tag)
			let distanceToGate = 5 * totalScale

			c.beginPath()
			c.fillStyle = "rgba(0,0,0,0.7)"
			c.rect(screenPoints.x - textWidth/2 - writingOffset.x , screenPoints.y + this.height * totalScale/2 + distanceToGate, textWidth + writingOffset.x*2, textHeight + writingOffset.y * 2);
			c.fill();
			c.closePath()

			c.beginPath()
			c.fillStyle = "white";
			c.drawCenteredText(this.tag, screenPoints.x, screenPoints.y + this.height * totalScale/2 + distanceToGate + writingOffset.y + textHeight/2);
			c.closePath()
			c.restore()
		}
	}

	drawSevenSegment() {
		let totalScale = camera.scale * this.scale
		let screenWidth = this.width * totalScale;
		let screenHeight = this.height * totalScale;

		let screenPos = worldToScreen(this.x - this.width/2, this.y - this.height/2);
		let screenX = screenPos.x;
		let screenY = screenPos.y;		

		if(!this.frameless) {
			for(let i of this.inputs) {
				decode(inputs, i).show();
			}	

			for(let o = 0; o < this.outputs.length; o++) {
				decode(outputs, this.outputs[o]).show();
			}

			// Outer rectangle
			c.beginPath();
			c.fillStyle = "rgba(25,25,25,1)";
			c.rect(screenX,screenY,screenWidth,screenHeight);
			c.fill();
			c.closePath();

			c.beginPath();
			let strokeOffset = 0
			c.strokeStyle = "black"
			c.lineWidth = 4 * totalScale
			let strokePos = worldToScreen(this.x - this.width/2 + strokeOffset, this.y - this.height/2 + strokeOffset)
			c.rect(strokePos.x, strokePos.y, (this.width - strokeOffset*2) * totalScale, (this.height - strokeOffset*2)* totalScale);
			c.stroke();
			c.closePath();
		}
		
		
		//Inner Rect
		let offset = 15 * totalScale
		let iPos = worldToScreen(this.x - this.width * this.scale/2, this.y - this.height * this.scale/2)
		iPos.x += offset
		iPos.y += offset

		let innerR = {x: iPos.x, y: iPos.y, w: (this.width)* totalScale - offset*2, h: (this.height)*totalScale - offset*2}

		this.framelessWidth = innerR.w
		this.framelessHeight = innerR.h
		this.framelessWidth_World = this.framelessWidth / camera.scale
		this.framelessHeight_World = this.framelessHeight / camera.scale

		if(screen == 7 && this.scalers == undefined) this.createScalers();

		let displayOffset = Math.sqrt(2) * totalScale;
		let segmentDistToRect = 5 * totalScale;

		//15 olmuyor segmentDistToRect
		let segmentHeight = innerR.h - innerR.w - 2*displayOffset
		let segmentWidth = 2*innerR.w - innerR.h - 2*segmentDistToRect
		let segmentRoofHeight = segmentWidth / 2 
		let segmentRectHeight = segmentHeight - (segmentRoofHeight * 2)

		let gatePoints
		let gateWH
		//Black Background
		c.save()
		c.beginPath()	
		if(screen == 7 && !this.moving) {
			gatePoints = worldToScreen(customizingGate.x, customizingGate.y)
			gateWH = {w: customizingGate.width * camera.scale, h: customizingGate.height * camera.scale}
			
			c.rect(gatePoints.x - gateWH.w/2, gatePoints.y - gateWH.h/2, gateWH.w, gateWH.h)
			c.clip()
		}
		
		c.beginPath()
		c.fillStyle = "black"
		c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
		c.fill()
		c.closePath()

		//Stroke
		if(this.frameless) {
			c.beginPath()
			let lw = 3 
			c.lineWidth = lw * camera.scale
			let strokeOffset = -lw/2
			let strokePos = worldToScreen(this.x - this.width * this.scale/2 + strokeOffset, this.y - this.height * this.scale/2 + strokeOffset)
			strokePos.x += offset
			strokePos.y += offset
			if(screen == 7) {
				c.strokeStyle = darkenRGBA(customizingGate.color, 0.3)
			} else {
				c.strokeStyle = darkenRGBA(decode(gates, this.parentCode).color, 0.3)
			}
			
			c.rect(strokePos.x, strokePos.y, this.framelessWidth - strokeOffset* camera.scale * 2, this.framelessHeight - strokeOffset* camera.scale * 2);
			c.stroke()		
			c.closePath()
		}
		

		// //Draws A-SEGMENT
		segmentDisplay(innerR.x + segmentDistToRect + segmentWidth/2 + segmentHeight/2 + displayOffset, innerR.y + segmentDistToRect + segmentWidth/2, this.getSegmentColor(0), true)

		// //Draws B-SEGMENT
		segmentDisplay(innerR.x + segmentDistToRect + segmentWidth/2 + segmentHeight + 2*displayOffset, innerR.y + segmentDistToRect + segmentWidth/2 + segmentHeight/2 + displayOffset,  this.getSegmentColor(1), false)

		// //Draws C-SEGMENT
		segmentDisplay(innerR.x + segmentDistToRect + segmentWidth/2 + segmentHeight + 2*displayOffset, innerR.y + segmentDistToRect + segmentWidth/2 + 3*segmentHeight/2 + 3*displayOffset,  this.getSegmentColor(2), false)

		// //Draws D-SEGMENT
		segmentDisplay(innerR.x + segmentDistToRect + segmentWidth/2 + segmentHeight/2 + displayOffset, innerR.y + segmentDistToRect + segmentWidth/2 + 2*segmentHeight + 4 * displayOffset, this.getSegmentColor(3), true)

		// //Draws E-SEGMENT
		segmentDisplay(innerR.x + segmentDistToRect + segmentWidth/2, innerR.y + segmentDistToRect + segmentWidth/2 + 3*segmentHeight/2 + 3*displayOffset,  this.getSegmentColor(4), false)

		// //Draws F-SEGMENT
		segmentDisplay(innerR.x + segmentDistToRect + segmentWidth/2, innerR.y + segmentDistToRect + segmentWidth/2 + segmentHeight/2 + displayOffset, this.getSegmentColor(5), false)

		// //Draws G-SEGMENT
		segmentDisplay(innerR.x + segmentDistToRect + segmentWidth/2 + segmentHeight/2 + displayOffset, innerR.y + segmentDistToRect + segmentWidth/2 + segmentHeight + 2* displayOffset, this.getSegmentColor(6), true)

		c.restore()

		if(screen == 7 && !this.moving) {
			let isInGate = isRectInside(
				innerR,
				{x: gatePoints.x - gateWH.w/2, y: gatePoints.y - gateWH.h/2, w: gateWH.w, h: gateWH.h}			
			)
			if(!isInGate) {
				c.beginPath()
				c.fillStyle = "rgba(255, 0, 0, 0.4)"
				c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
				c.fill()
				c.closePath()
			}
		}

		// Draws each segement
		function segmentDisplay(x, y, color, isSideway, minus = false) {
			if(minus) {
				c.beginPath()
					c.moveTo(x - minusSegmentHeight/2, y)
					c.lineTo(x - minusSegmentRectHeight/2, y - minusSegmentWidth/2)
					c.lineTo(x + minusSegmentRectHeight/2, y - minusSegmentWidth/2)
					c.lineTo(x + minusSegmentHeight/2, y)
					c.lineTo(x + minusSegmentRectHeight/2, y + minusSegmentWidth/2)
					c.lineTo(x - minusSegmentRectHeight/2, y + minusSegmentWidth/2)
					c.closePath()
			} else {
				if(isSideway) {
					c.beginPath()
					c.moveTo(x - segmentHeight/2, y)
					c.lineTo(x - segmentRectHeight/2, y - segmentWidth/2)
					c.lineTo(x + segmentRectHeight/2, y - segmentWidth/2)
					c.lineTo(x + segmentHeight/2, y)
					c.lineTo(x + segmentRectHeight/2, y + segmentWidth/2)
					c.lineTo(x - segmentRectHeight/2, y + segmentWidth/2)
					c.closePath()
				} else {
					c.beginPath();
					c.moveTo(x, y - segmentHeight/2)
					c.lineTo(x + (segmentWidth / 2), y - (segmentRectHeight/2))
					c.lineTo(x + (segmentWidth / 2), y + (segmentRectHeight/2))
					c.lineTo(x, y + segmentHeight/2)
					c.lineTo(x - (segmentWidth / 2), y + (segmentRectHeight/2))
					c.lineTo(x - (segmentWidth / 2), y - (segmentRectHeight/2))
					c.lineTo(x, y - segmentHeight/2)
					c.closePath();
				}
			}
			
			c.fillStyle = color
			c.fill();
		}
	}

	drawLED() {
		let totalScale = camera.scale * this.scale
		let screenWidth = this.width * totalScale;
		let screenHeight = this.height * totalScale;

		let screenPos = worldToScreen(this.x - this.width/2, this.y - this.height/2);
		let screenX = screenPos.x;
		let screenY = screenPos.y;		

		if(!this.frameless) {
			for(let i of this.inputs) {
				decode(inputs, i).show();
			}	
			for(let o = 0; o < this.outputs.length; o++) {
				decode(outputs, this.outputs[o]).show();
			}

			// Outer rectangle
			c.beginPath();
			c.fillStyle = "rgba(25,25,25,1)";
			c.rect(screenX,screenY,screenWidth,screenHeight);
			c.fill();
			c.closePath();

			c.beginPath();
			let strokeOffset = 0
			c.strokeStyle = "black"
			c.lineWidth = 3 * totalScale
			let strokePos = worldToScreen(this.x - this.width/2 + strokeOffset, this.y - this.height/2 + strokeOffset)
			c.rect(strokePos.x, strokePos.y, (this.width - strokeOffset*2) * totalScale, (this.height - strokeOffset*2)* totalScale);
			c.stroke();
			c.closePath();
		}
		
		
		//Inner Rect
		let offset = 5 * totalScale
		let iPos = worldToScreen(this.x - this.width * this.scale/2, this.y - this.height * this.scale/2)
		iPos.x += offset
		iPos.y += offset

		let innerR = {x: iPos.x, y: iPos.y, w: (this.width)* totalScale - offset*2, h: (this.height)*totalScale - offset*2}

		this.framelessWidth = innerR.w
		this.framelessHeight = innerR.h
		this.framelessWidth_World = this.framelessWidth / camera.scale
		this.framelessHeight_World = this.framelessHeight / camera.scale
		//

		if(screen == 7 && this.scalers == undefined) this.createScalers();

		

		//Led Color
		let gatePoints
		let gateWH
		c.save()
		c.beginPath()	
		if(screen == 7 && !this.moving) {
			gatePoints = worldToScreen(customizingGate.x, customizingGate.y)
			gateWH = {w: customizingGate.width * camera.scale, h: customizingGate.height * camera.scale}
			
			c.rect(gatePoints.x - gateWH.w/2, gatePoints.y - gateWH.h/2, gateWH.w, gateWH.h)
			c.clip()
		}
		
		c.beginPath()
		c.fillStyle = this.getLEDColor()
		c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
		c.fill()
		c.lineWidth = 2 * camera.scale
		c.strokeStyle = "black"
		c.stroke()
		c.closePath()
		//

		//Stroke
		if(this.frameless) {
			c.beginPath()
			let lw = 3 
			c.lineWidth = lw * camera.scale
			let strokeOffset = -lw/2
			let strokePos = worldToScreen(this.x - this.width * this.scale/2 + strokeOffset, this.y - this.height * this.scale/2 + strokeOffset)
			strokePos.x += offset
			strokePos.y += offset
			if(screen == 7) {
				c.strokeStyle = darkenRGBA(customizingGate.color, 0.3)
			} else {
				c.strokeStyle = darkenRGBA(decode(gates, this.parentCode).color, 0.3)
			}
			
			c.rect(strokePos.x, strokePos.y, this.framelessWidth - strokeOffset* camera.scale * 2, this.framelessHeight - strokeOffset* camera.scale * 2);
			c.stroke()		
			c.closePath()
		}
		

		c.restore()

		if(screen == 7 && !this.moving) {
			let isInGate = isRectInside(
				innerR,
				{x: gatePoints.x - gateWH.w/2, y: gatePoints.y - gateWH.h/2, w: gateWH.w, h: gateWH.h}			
			)
			if(!isInGate) {
				c.beginPath()
				c.fillStyle = "rgba(255, 0, 0, 0.4)"
				c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
				c.fill()
				c.closePath()
			}
		}
	}

	drawDotDisplay() {
		let totalScale = camera.scale * this.scale
		let screenWidth = this.width * totalScale;
		let screenHeight = this.height * totalScale;

		let screenPos = worldToScreen(this.x - this.width/2, this.y - this.height/2);
		let screenX = screenPos.x;
		let screenY = screenPos.y;		

		if(!this.frameless) {
			for(let i of this.inputs) {
				decode(inputs, i).show();
			}	

			for(let o = 0; o < this.outputs.length; o++) {
				decode(outputs, this.outputs[o]).show();
			}

			// Outer rectangle
			c.beginPath();
			c.fillStyle = "rgba(25,25,25,1)";
			c.rect(screenX,screenY,screenWidth,screenHeight);
			c.fill();
			c.closePath();

			c.beginPath();
			let strokeOffset = 0
			c.strokeStyle = "black"
			c.lineWidth = 4 * totalScale
			let strokePos = worldToScreen(this.x - this.width/2 + strokeOffset, this.y - this.height/2 + strokeOffset)
			c.rect(strokePos.x, strokePos.y, (this.width - strokeOffset*2) * totalScale, (this.height - strokeOffset*2)* totalScale);
			c.stroke();
			c.closePath();
		}
		
		
		//Inner Rect
		let offset = 15 * totalScale
		let iPos = worldToScreen(this.x - this.width * this.scale/2, this.y - this.height * this.scale/2)
		iPos.x += offset
		iPos.y += offset

		let innerR = {x: iPos.x, y: iPos.y, w: (this.width)* totalScale - offset*2, h: (this.height)*totalScale - offset*2}

		this.framelessWidth = innerR.w
		this.framelessHeight = innerR.h
		this.framelessWidth_World = this.framelessWidth / camera.scale
		this.framelessHeight_World = this.framelessHeight / camera.scale

		if(screen == 7 && this.scalers == undefined) this.createScalers();

		let gatePoints
		let gateWH
		//Black Background
		c.save()
		c.beginPath()	
		if(screen == 7 && !this.moving) {
			gatePoints = worldToScreen(customizingGate.x, customizingGate.y)
			gateWH = {w: customizingGate.width * camera.scale, h: customizingGate.height * camera.scale}
			
			c.rect(gatePoints.x - gateWH.w/2, gatePoints.y - gateWH.h/2, gateWH.w, gateWH.h)
			c.clip()
		}
		
		c.beginPath()
		c.fillStyle = "black"
		c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
		c.fill()
		c.closePath()

		//Draws the dots
		let dotRadius = 5 * totalScale
		let dotOffset = 2.5 * totalScale
		let dotSpace = 1 * totalScale
		let tempY;
		for(let i = 0; i <= 15; i++) { 
			tempY = innerR.y + dotOffset + (2*(15-i) + 1)*dotRadius + (15-i) * dotSpace
			for(let j = 0; j <= 15; j++) {
				if(!this.moving && screen != 7 && !this.dotMemory[j + i*16]) continue //It means it is black
				let tempX = innerR.x + dotOffset + (2*j + 1)*dotRadius + j * dotSpace 
				c.beginPath()
				c.fillStyle = this.dotMemory[j + i*16] ? "rgba(255,255,255,1)" : "rgba(25,25,25,1)"
				c.arc(tempX, tempY, dotRadius, 0, 360)
				c.fill()
				c.closePath()
			}
		}

		//Stroke
		if(this.frameless) {
			c.beginPath()
			let lw = 3 
			c.lineWidth = lw * camera.scale
			let strokeOffset = -lw/2
			let strokePos = worldToScreen(this.x - this.width * this.scale/2 + strokeOffset, this.y - this.height * this.scale/2 + strokeOffset)
			strokePos.x += offset
			strokePos.y += offset
			if(screen == 7) {
				c.strokeStyle = darkenRGBA(customizingGate.color, 0.3)
			} else {
				c.strokeStyle = darkenRGBA(decode(gates, this.parentCode).color, 0.3)
			}
			
			c.rect(strokePos.x, strokePos.y, this.framelessWidth - strokeOffset* camera.scale * 2, this.framelessHeight - strokeOffset* camera.scale * 2);
			c.stroke()		
			c.closePath()
		}


		c.restore()

		if(screen == 7 && !this.moving) {
			let isInGate = isRectInside(
				innerR,
				{x: gatePoints.x - gateWH.w/2, y: gatePoints.y - gateWH.h/2, w: gateWH.w, h: gateWH.h}			
			)
			if(!isInGate) {
				c.beginPath()
				c.fillStyle = "rgba(255, 0, 0, 0.4)"
				c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
				c.fill()
				c.closePath()
			}
		}
	}

	drawRGBDisplay() {
		let totalScale = camera.scale * this.scale
		let screenWidth = this.width * totalScale;
		let screenHeight = this.height * totalScale;

		let screenPos = worldToScreen(this.x - this.width/2, this.y - this.height/2);
		let screenX = screenPos.x;
		let screenY = screenPos.y;		

		if(!this.frameless) {
			for(let i of this.inputs) {
				decode(inputs, i).show();
			}	

			for(let o = 0; o < this.outputs.length; o++) {
				decode(outputs, this.outputs[o]).show();
			}

			// Outer rectangle
			c.beginPath();
			c.fillStyle = "rgba(25,25,25,1)";
			c.rect(screenX,screenY,screenWidth,screenHeight);
			c.fill();
			c.closePath();

			c.beginPath();
			let strokeOffset = 0
			c.strokeStyle = "black"
			c.lineWidth = 4 * totalScale
			let strokePos = worldToScreen(this.x - this.width/2 + strokeOffset, this.y - this.height/2 + strokeOffset)
			c.rect(strokePos.x, strokePos.y, (this.width - strokeOffset*2) * totalScale, (this.height - strokeOffset*2)* totalScale);
			c.stroke();
			c.closePath();
		}
		
		
		//Inner Rect
		let offset = 15 * totalScale
		let iPos = worldToScreen(this.x - this.width * this.scale/2, this.y - this.height * this.scale/2)
		iPos.x += offset
		iPos.y += offset

		let innerR = {x: iPos.x, y: iPos.y, w: (this.width)* totalScale - offset*2, h: (this.height)*totalScale - offset*2}

		this.framelessWidth = innerR.w
		this.framelessHeight = innerR.h
		this.framelessWidth_World = this.framelessWidth / camera.scale
		this.framelessHeight_World = this.framelessHeight / camera.scale

		if(screen == 7 && this.scalers == undefined) this.createScalers();

		let gatePoints
		let gateWH
		//Black Background
		c.save()
		c.beginPath()	
		if(screen == 7 && !this.moving) {
			gatePoints = worldToScreen(customizingGate.x, customizingGate.y)
			gateWH = {w: customizingGate.width * camera.scale, h: customizingGate.height * camera.scale}
			
			c.rect(gatePoints.x - gateWH.w/2, gatePoints.y - gateWH.h/2, gateWH.w, gateWH.h)
			c.clip()
		}
		
		c.beginPath()
		c.fillStyle = "black"
		c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
		c.fill()
		c.closePath()

		//Draws the dots
		
		let rectOffset = 6 * totalScale
		let rectSpace = 1.5 * totalScale
		let rectLen = (innerR.w - 15*rectSpace - 2*rectOffset)/16
		let tempY;
		for(let i = 0; i <= 15; i++) { 
			tempY = innerR.y + rectOffset + (15-i)*rectLen + (15-i) * rectSpace
			for(let j = 0; j <= 15; j++) {
				if(!this.moving && screen != 7 && this.getRGBColor(i * 16 + j) == "rgba(0, 0, 0, 1)") continue //It means it is black
				let tempX = innerR.x + rectOffset + (j)*rectLen + j * rectSpace 
				c.beginPath()
				c.fillStyle = (this.moving && this.getRGBColor(i * 16 + j) == "rgba(0, 0, 0, 1)") || screen == 7 ? "rgba(25, 25, 25, 1)": this.getRGBColor(i * 16 + j)
				c.rect(tempX, tempY, rectLen, rectLen)
				c.fill()
				c.closePath()
			}
		}

		//Stroke
		if(this.frameless) {
			c.beginPath()
			let lw = 3 
			c.lineWidth = lw * camera.scale
			let strokeOffset = -lw/2
			let strokePos = worldToScreen(this.x - this.width * this.scale/2 + strokeOffset, this.y - this.height * this.scale/2 + strokeOffset)
			strokePos.x += offset
			strokePos.y += offset
			if(screen == 7) {
				c.strokeStyle = darkenRGBA(customizingGate.color, 0.3)
			} else {
				c.strokeStyle = darkenRGBA(decode(gates, this.parentCode).color, 0.3)
			}
			
			c.rect(strokePos.x, strokePos.y, this.framelessWidth - strokeOffset* camera.scale * 2, this.framelessHeight - strokeOffset* camera.scale * 2);
			c.stroke()		
			c.closePath()
		}


		c.restore()

		if(screen == 7 && !this.moving) {
			let isInGate = isRectInside(
				innerR,
				{x: gatePoints.x - gateWH.w/2, y: gatePoints.y - gateWH.h/2, w: gateWH.w, h: gateWH.h}			
			)
			if(!isInGate) {
				c.beginPath()
				c.fillStyle = "rgba(255, 0, 0, 0.4)"
				c.rect(innerR.x, innerR.y, innerR.w, innerR.h)
				c.fill()
				c.closePath()
			}
		}
	}
 
	getRGBColor(index) {
		let c = this.rgbMemory[index]
		return `rgba(${c.r}, ${c.g}, ${c.b}, 1)`
	}
	

	getLEDColor() {
		let tempInput;
		let tempGate
		if(screen != 7) {
			if(!this.frameless) {
				tempInput = decode(inputs, this.inputs[0])
			} else {	
				tempGate = decode(gates, this.parentCode)
				if(tempGate.visualObjects.length == 0) {
					console.log("Hata")
					return "rgba(37,35,35,1)";	
				}
				let tempDisplays = tempGate.visualObjects.filter(obj=>obj.ObjectName == "Display" && obj.parentCode == null)
				tempInput = decode(tempGate.visualObjects, tempDisplays[this.customizeIndex].inputs[0])
			} 
		}
		

		let isLit = (screen == 7) ? false : tempInput.lit[0]
		if(!isLit) {
			if(this.colorMode == "red") {
				return "rgba(50,25,25,1)"
			}
			if(this.colorMode == "orange") {
				return "rgba(71,38,2,1)"
			}
			if(this.colorMode == "yellow") {
				return "rgba(66,50,18,1)"
			}
			if(this.colorMode == "green") {
				return "rgba(25,51,25,1)"
			}
			if(this.colorMode == "blue") {
				return "rgba(25,36,89,1)"
			}
			if(this.colorMode == "violet") {
				return "rgba(48,31,71,1)"
			}
			if(this.colorMode == "pink") {
				return "rgba(64,25,64,1)"
			}
			if(this.colorMode == "white") {
				return "rgba(89,89,89,1)"
			}
			
		} else {
			if(this.colorMode == "red") {
				return "rgba(242,76,79,1)"
			}
			if(this.colorMode == "orange") {
				return "rgba(235,112,31,1)"
			}
			if(this.colorMode == "yellow") {
				return "rgba(250,194,66,1)"
			}
			if(this.colorMode == "green") {
				return "rgba(64,168,79,1)"
			}
			if(this.colorMode == "blue") {
				return "rgba(51,127,255,1)"
			}
			if(this.colorMode == "violet") {
				return "rgba(153,102,250,1)"
			}
			if(this.colorMode == "pink") {
				return "rgba(214,84,229,1)"
			}
			if(this.colorMode == "white") {
				return "rgba(229,229,229,1)"
			}
		}	
	}


	process(arrOutput = outputs, arrInput = inputs, gateArray = gates) {	
		if(this.name == "DOT DISPLAY") {
			if(this.frameless && screen != 7) {
				let tempGate = decode(gateArray, this.parentCode)
				if(tempGate.visualObjects.length == 0) {
					console.log("Hata!")
					return
				}
				let tempDisplay = tempGate.visualObjects.filter(obj=>obj.ObjectName == "Display" && obj.parentCode == null)[this.customizeIndex]
				this.dotMemory = tempDisplay.dotMemory.slice()
			} else {
				let addrInput = decode(arrInput, this.inputs[0])
				let pixelInput = decode(arrInput, this.inputs[1])
				let resetInput = decode(arrInput, this.inputs[2])
				let writeInput = decode(arrInput, this.inputs[3])
				let refreshInput = decode(arrInput, this.inputs[4])
				let clockInput = decode(arrInput, this.inputs[5])
				let pixelOut = decode(arrOutput, this.outputs[0])
				let addr = 0;
				for(let i = 0; i < addrInput.type; i++) {
					if(addrInput.lit[i]) addr += 2**(7-i)
				}
				if(!this.clockLocked && clockInput.lit[0]) {		
					if(writeInput.lit[0]) {
						this.unrefreshedMemory[addr] = pixelInput.lit[0]
					}

					if(resetInput.lit[0]) {
						this.unrefreshedMemory = Array(256).fill(false)
					}

					if(refreshInput.lit[0]) {
						this.dotMemory = this.unrefreshedMemory.slice()
					}
				}
				pixelOut.basePower = [true]
				pixelOut.isPowered = [true]
				pixelOut.lit = [this.dotMemory[addr]]
				
				//Locks and unlocks the display
				if(clockInput.lit[0] && !this.clockLocked) {
					this.clockLocked = true
				}
				if(!clockInput.lit[0] && this.clockLocked) {
					this.clockLocked = false
				}
			}	
		}

		if(this.name == "RGB DISPLAY") {
			if(this.frameless && screen != 7) {
				let tempGate = decode(gateArray, this.parentCode)
				if(tempGate.visualObjects.length == 0) {
					console.log("Hata!")
					return
				}
				let tempDisplay = tempGate.visualObjects.filter(obj=>obj.ObjectName == "Display" && obj.parentCode == null)[this.customizeIndex]
				this.rgbMemory = tempDisplay.rgbMemory.slice()
			} else {
				let addrInput = decode(arrInput, this.inputs[0])
				let redInput = decode(arrInput, this.inputs[1])
				let greenInput = decode(arrInput, this.inputs[2])
				let blueInput = decode(arrInput, this.inputs[3])
				let resetInput = decode(arrInput, this.inputs[4])
				let writeInput = decode(arrInput, this.inputs[5])
				let refreshInput = decode(arrInput, this.inputs[6])
				let clockInput = decode(arrInput, this.inputs[7])

				let redOutput = decode(arrOutput, this.outputs[0])
				let greenOutput = decode(arrOutput, this.outputs[1])
				let blueOutput = decode(arrOutput, this.outputs[2])
		
				let addr = 0;
				for(let i = 0; i < addrInput.type; i++) {
					if(addrInput.lit[i]) addr += 2**(7-i)
				}
				if(!this.clockLocked && clockInput.lit[0]) {		
					if(writeInput.lit[0]) {
						let redValue = 0; for(let i = 0; i < redInput.type; i++) {if(redInput.lit[i]) redValue += 2**(6-2*i) * 3}
						let greenValue = 0; for(let i = 0; i < greenInput.type; i++) {if(greenInput.lit[i]) greenValue += 2**(6-2*i) * 3}
						let blueValue = 0; for(let i = 0; i < blueInput.type; i++) {if(blueInput.lit[i]) blueValue += 2**(6-2*i) * 3}

						this.unrefreshedMemory[addr] = {r: redValue, g: greenValue, b: blueValue}
					}

					if(resetInput.lit[0]) {
						this.unrefreshedMemory = Array(256).fill({r: 0, g: 0, b: 0})
					}

					if(refreshInput.lit[0]) {
						this.rgbMemory = cloneArray(this.unrefreshedMemory)
					}
				}

				redOutput.basePower = [true]
				redOutput.isPowered = [true]
				greenOutput.basePower = [true]
				greenOutput.isPowered = [true]
				blueOutput.basePower = [true]
				blueOutput.isPowered = [true]

				for(let i = 0; i<=3;i++) {
					let binaryRed = this.rgbMemory[addr].r.toString(2).padStart(8,"0")
					let binaryGreen = this.rgbMemory[addr].g.toString(2).padStart(8,"0")
					let binaryBlue = this.rgbMemory[addr].b.toString(2).padStart(8,"0")
					redOutput.lit[i] = !!+binaryRed[i*2] // i*2 çünkü 4 kat artış var o yüzden bitlerin yarısı aynı
					greenOutput.lit[i] = !!+binaryGreen[i*2]
					blueOutput.lit[i] = !!+binaryBlue[i*2]
				}
				
				//Locks and unlocks the display
				if(clockInput.lit[0] && !this.clockLocked) {
					this.clockLocked = true
				}
				if(!clockInput.lit[0] && this.clockLocked) {
					this.clockLocked = false
				}
			}
			
		}
	}



	move(addX = getDefaultMove().x, addY = getDefaultMove().y, isParentAllowed = true) {
		if(doesSnap() && isParentAllowed) {
			let snapSize = gridInfos.spacing/2
			let worldPoints = screenToWorld(gridInfos.x, gridInfos.y)
			let dx = Math.round((this.x  + addX - worldPoints.x) / snapSize) * snapSize - this.x + worldPoints.x;
			let dy = Math.round((this.y  + addY - worldPoints.y) / snapSize) * snapSize - this.y + worldPoints.y;
			if(dx != 0 || dy != 0) {
				this.x += dx
				this.y += dy
				for(let i = 0; i < this.inputs.length; i++) {
					let tempInput = decode(inputs,this.inputs[i])
					tempInput.move(dx, dy, false);
				}

				for(let o = 0; o < this.outputs.length; o++) {
					let tempOutput = decode(outputs,this.outputs[o]);
					tempOutput.move(dx, dy , false);
				}

				
				setChangingStartValues(dx * camera.scale + mouseStartX, dy * camera.scale + mouseStartY);
			} 		
		} else {
			this.x += addX
			this.y += addY
			let savedOffset = {x: addX, y: addY}
			for(let i = 0; i < this.inputs.length; i++) {
				let tempInput = decode(inputs,this.inputs[i])
				tempInput.move(savedOffset.x, savedOffset.y);
			}

			for(let o = 0; o < this.outputs.length; o++) {
				let tempOutput = decode(outputs,this.outputs[o]);
				tempOutput.move(savedOffset.x, savedOffset.y);
			}

			setChangingStartValues(mouseScreenX, mouseScreenY)
		}

		
		this.calculateHitbox();
	}

	delete(displayArray = displays, arrOutput = outputs, arrInput = inputs, cableArray = cables) {

		// Deletes the cables coming from its inputs and outputs. 
		// Also deletes the inputs and outputs
		for(let I = this.inputs.length - 1; I >= 0; I--) {
			let tempInput = decode(arrInput, this.inputs[I]);
			for(let I2 = tempInput.inputs.length - 1; I2 >= 0; I2--) {
				let tempCable = decode(cables,tempInput.inputs[I2], false);
				if(tempCable != null) {
					tempCable.delete(arrOutput, arrInput, cableArray);
				}
			}
			arrInput.splice(findIndex(arrInput, tempInput),1);
		}

		for(let O = this.outputs.length -1; O >= 0; O--) {
			let tempOutput = decode(arrOutput, this.outputs[O]);
			for(let O2 = tempOutput.outputs.length - 1; O2 >= 0; O2--) {
				let tempCable = decode(cables,tempOutput.outputs[O2], false);
				if(tempCable != null) {
					tempCable.delete(arrOutput, arrInput, cableArray);
				}
			}
			arrOutput.splice(findIndex(arrOutput, tempOutput),1);
		}

		// For Customize Details
		if(latestOpened != null && screen == 0) {
			let deletingIndex = findIndex(displayArray, this);
			for(let i = currentCustomizedDisplayArray.length-1; i >= 0; i--) {
				if(deletingIndex == currentCustomizedDisplayArray[i][2]) {
					currentCustomizedDisplayArray.splice(i, 1)
				}	
			}
			for(let i = 0; i < currentCustomizedDisplayArray.length; i++) {
				if(deletingIndex < currentCustomizedDisplayArray[i][2]) {
					currentCustomizedDisplayArray[i][2] -= 1
				}
			}
		}

		// Deletes itself
		if(findIndex(displayArray, this) != null) {
			displayArray.splice(findIndex(displayArray, this), 1);
		}
		rewriteUsedCodes();

		
		//currentFile.save()
	}
}