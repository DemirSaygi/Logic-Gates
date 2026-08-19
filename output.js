class Output {
	constructor(x, y, parentCode,type = 1) {
		this.x = x;
		this.y = y;
		this.parentCode = parentCode;
		this.parentType = "gate"
		this.outputs = [];
		this.code = generateCode();
		this.lit = Array(type).fill(false);
		this.isPowered =  Array(type).fill((this.parentCode == null)); //For testing loopingGates
		this.basePower = Array(type).fill(this.parentCode == null); //For using three state buffer
		this.moving = false
		this.ObjectName = this.constructor.name;
		this.name = null;
		this.highlight = false;
		this.connectionHighlight = false;
		this.switchHighlight = null; 
		this.moveablePartHighlight = false;
		this.hoverHighlight = false;
		this.colorMode = "red"
		this.tag = this.parentCode == null ? "IN" : "OUT"
		this.type = type; // Can be 1, 4, 8
		this.width;
		this.height;
		this.calcWH();
		this.cableConnectionPoint = this.getCableConnectionPoint();
		this.switchPoints = this.getSwitchPoints();
		this.moveablePart = this.getMoveablePoints();
		this.calculateHitbox()
		this.decimalDisplay = "Off"
		this.FP_useable = true
		this.tagDirection = 1
	}

	calculateHitbox() {
		if(this.parentCode == null) {
			let hitboxOffset = hitboxOffsets["Pin"]
			if(this.type == 1) {
				this.hitbox = {
					x: this.x - bigIO_radius - moveablePartMetrics.xOffset - moveablePartMetrics.width - hitboxOffset.x, 
					y: this.y - this.height/2 - hitboxOffset.y, 
					w: this.width + hitboxOffset.x*2, 
					h: this.height + hitboxOffset.y*2
				}
			}
			if(this.type == 4) {
				this.hitbox = {
					x: this.x - oneSquareSwitchLength - moveablePartMetrics.xOffset - moveablePartMetrics.width - hitboxOffset.x, 
					y: this.y - this.height/2 - hitboxOffset.y, 
					w: this.width + hitboxOffset.x*2, 
					h: this.height + hitboxOffset.y*2
				}
			}
			if(this.type == 8) {
				this.hitbox = {
					x: this.x - oneSquareSwitchLength*2 - moveablePartMetrics.xOffset - moveablePartMetrics.width - hitboxOffset.x, 
					y: this.y - this.height/2 - hitboxOffset.y, 
					w: this.width + hitboxOffset.x*2, 
					h: this.height + hitboxOffset.y*2
				}
			}	
		}
	}

	calcWH() {
		if(this.parentCode == null) {
			if(this.type == 1) {
				this.height = moveablePartMetrics.height
				this.width  = bigIO_radius * 2 + mainPutLineWidth + IO_radius * 2 + moveablePartMetrics.width + moveablePartMetrics.xOffset
			} else if (this.type == 4) {
				this.height = moveablePartMetrics.height
				this.width =  oneSquareSwitchLength * 2 + mainPutLineWidth + 2*IO_radius + moveablePartMetrics.width + moveablePartMetrics.xOffset
			} else if(this.type == 8) {
				this.height = moveablePartMetrics.height
				this.width = oneSquareSwitchLength * 4 + mainPutLineWidth + 2*IO_radius + moveablePartMetrics.width + moveablePartMetrics.xOffset
			}
		}	
	}

	getMoveablePoints() {
		if(this.parentCode == null) {
			if(this.type == 1) {
				return {x: this.x - bigIO_radius - moveablePartMetrics.xOffset - moveablePartMetrics.width/2, y: this.y}
			}
			if(this.type == 4) {
				return {x: this.x - oneSquareSwitchLength - moveablePartMetrics.xOffset - moveablePartMetrics.width/2, y: this.y}
			}
			if(this.type == 8) {
				return {x: this.x - oneSquareSwitchLength * 2 - moveablePartMetrics.xOffset - moveablePartMetrics.width/2, y: this.y}
			}
		} else {
			return {}
		}
 	}

	getCableConnectionPoint() {
		if(this.parentCode == null) {
			if(this.type == 1) {
				return {x: this.x+IO_radius+bigIO_radius+mainPutLineWidth, y:this.y, radius: radiusOfPuts[this.type]}
			} else if(this.type == 4) {
				return {x: this.x + oneSquareSwitchLength     + mainPutLineWidth + IO_radius, y: this.y, width: IO_radius * 2, height: radiusOfPuts[this.type] * 2}
			} else if(this.type == 8) {
				return {x: this.x + oneSquareSwitchLength * 2 + mainPutLineWidth + IO_radius, y: this.y, width: IO_radius * 2, height: radiusOfPuts[this.type] * 2}
			}
		} else {
			if(this.type == 1) {
				return {x: this.x, y:this.y, radius: radiusOfPuts[this.type]}
			} else if(this.type == 4) {
				return {x: this.x, y:this.y,  width: IO_radius * 2, height: radiusOfPuts[this.type] * 2}
			} else if(this.type == 8) {
				return {x: this.x, y:this.y,  width:IO_radius * 2, height: radiusOfPuts[this.type] * 2}		
			}
		}
	}

	getSwitchPoints() {
		if(this.parentCode == null) {
			if(this.type == 1) {
				return [{x: this.x, y:this.y}]
			} 
			if(this.type == 4) {
				let tempArr = [];
				for(let i = -1; i <= +1; i+=2) {
					for(let j = -1; j <= +1; j+=2) {
						tempArr.push({x: this.x + j*(oneSquareSwitchLength/2), y:this.y + i*(oneSquareSwitchLength/2), width: oneSquareSwitchLength, height: oneSquareSwitchLength})
					}
				}
				return tempArr.slice();
			} 
			if(this.type == 8) {
				let tempArr = [];
				for(let i = -1; i <= +1; i+=2) {
					for(let j = -3; j <= +3; j+=2) {
						tempArr.push({x: this.x + j*(oneSquareSwitchLength/2), y:this.y + i*(oneSquareSwitchLength/2), width: oneSquareSwitchLength, height: oneSquareSwitchLength})
					}
				}
				return tempArr.slice();
			}
		} else {
			return [];
		}
	}

	getColor(isLit) {
		if(!isLit) {
			if(this.parentCode != null) {		
				return "black"
			}
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

	show() {
 		
		let screenPoints = worldToScreen(this.x, this.y)
		let bigRadius = bigIO_radius* camera.scale
		let smallRadius = IO_radius * camera.scale
		let MP = worldToScreen(this.moveablePart.x, this.moveablePart.y);
		let MPW = moveablePartMetrics.width * camera.scale
		let MPH = moveablePartMetrics.height * camera.scale
		let CP = worldToScreen(this.cableConnectionPoint.x, this.cableConnectionPoint.y);

		if(this.parentCode == null) {
			if(!this.moving) {
				this.latestSavedPosition = {x: this.x, y: this.y}
			}

			//Draws the moveable part
			c.beginPath()
			c.fillStyle = "rgba(80,80,80, 1)"
			if(this.moveablePartHighlight) {
				c.fillStyle = "rgba(150,150,150, 1)"
			}
			c.rect(MP.x - MPW / 2, MP.y - MPH / 2, MPW, MPH);
			c.fill()
			c.closePath()

			if(this.type == 1) {	
				//Draws the big circle
				c.beginPath();
				c.lineWidth = 2.5 * camera.scale;
				c.strokeStyle = "black";
				c.fillStyle = this.getColor(this.lit[0]);
				
				c.arc(screenPoints.x, screenPoints.y, bigRadius, 0, Math.PI * 2);
				c.fill();
				if(this.switchHighlight == 0) {
					c.fillStyle = "rgba(255,255,255,0.4)"
					c.fill();
				}
				c.stroke();
				c.closePath();

				//Draws the line in between
				c.beginPath();
				c.fillStyle = "black";
				c.rect(screenPoints.x + bigRadius, screenPoints.y - (mainPutLineHeight * camera.scale)/2, (mainPutLineWidth + IO_radius) * camera.scale, mainPutLineHeight * camera.scale);
				c.fill();
				c.closePath();

				// Draws the small circle for cableConnectionPoint
				let CR = this.cableConnectionPoint.radius * camera.scale
				c.beginPath();
				c.fillStyle = "black";
				if(this.connectionHighlight || this.hoverHighlight) {
					c.fillStyle =  "rgba(255,255,255,1)"
				}
				c.arc(CP.x, CP.y, CR, 0, Math.PI * 2);
				c.fill();
				c.closePath();
			} 
			if(this.type == 4) {
				//Draws the 4 square
				for(let i = 0; i < 4; i++) {
					let SP = worldToScreen(this.switchPoints[i].x, this.switchPoints[i].y);
					let SPW = oneSquareSwitchLength * camera.scale

					c.beginPath();
					c.lineWidth = 2.5 * camera.scale;
					c.strokeStyle = "black";
					c.fillStyle = this.getColor(this.lit[i]);
					c.rect(SP.x - SPW / 2, SP.y - SPW / 2, SPW, SPW);
					c.fill();
					if(this.switchHighlight == i) {
						c.fillStyle = "rgba(255,255,255,0.4)"
						c.fill();
					}
					c.stroke();
					c.closePath();
				}
				

				//Draws the line in between
				c.beginPath();
				c.fillStyle = "black";
				c.rect(screenPoints.x + oneSquareSwitchLength * camera.scale, screenPoints.y - mainPutLineHeight * camera.scale / 2, (mainPutLineWidth + IO_radius) * camera.scale, mainPutLineHeight * camera.scale);
				c.fill();
				c.closePath();

				// Draws the small cableConnectionPoint
				let CW = this.cableConnectionPoint.width * camera.scale
				let CH = this.cableConnectionPoint.height * camera.scale
				c.beginPath();
				c.fillStyle = "black";
				if(this.connectionHighlight || this.hoverHighlight) {
					c.fillStyle =  "rgba(255,255,255,1)"
				}
				c.rect(CP.x - CW / 2, CP.y - CH / 2, CW, CH);
				c.fill();
				c.closePath();
			} 
			if(this.type == 8) {
				//Draws the 8 square
				for(let i = 0; i < 8; i++) {
					let SP = worldToScreen(this.switchPoints[i].x, this.switchPoints[i].y);
					let SPW = oneSquareSwitchLength * camera.scale
					c.beginPath();
					c.lineWidth = 2.5 * camera.scale;
					c.strokeStyle = "black";
					c.fillStyle = this.getColor(this.lit[i]);
					c.rect(SP.x - SPW / 2, SP.y - SPW / 2, SPW, SPW);
					c.fill();
					if(this.switchHighlight == i) {
						c.fillStyle = "rgba(255,255,255,0.4)"
						c.fill();
					}
					c.stroke();
					c.closePath();
				}
				

				//Draws the line in between
				c.beginPath();
				c.fillStyle = "black";
				c.rect(screenPoints.x + oneSquareSwitchLength * 2 * camera.scale, screenPoints.y - mainPutLineHeight * camera.scale / 2, (mainPutLineWidth + IO_radius) * camera.scale, mainPutLineHeight * camera.scale);
				c.fill();
				c.closePath();

				// Draws the big cableConnectionPoint
				let CW = this.cableConnectionPoint.width * camera.scale
				let CH = this.cableConnectionPoint.height * camera.scale
				c.beginPath();
				c.fillStyle = "black";
				if(this.connectionHighlight || this.hoverHighlight) {
					c.fillStyle =  "rgba(255,255,255,1)"
				}
				c.rect(CP.x - CW / 2, CP.y - CH / 2, CW, CH);
				c.fill();
				c.closePath();
			}

			//HIGHLIGHT
			if(this.highlight) {

				let highlightRect = {}
				highlightRect = {
					y: this.y - this.height/2 - highlightOffset, 
					w: this.width + highlightOffset*2, 
					h: this.height + highlightOffset*2
				}
				if(this.type == 1) {
					highlightRect.x = this.x - bigIO_radius - moveablePartMetrics.xOffset - moveablePartMetrics.width - highlightOffset

				}
				if(this.type == 4) {				
					highlightRect.x = this.x - oneSquareSwitchLength - moveablePartMetrics.xOffset - moveablePartMetrics.width - highlightOffset		
				}
				if(this.type == 8) {
					highlightRect.x = this.x - oneSquareSwitchLength*2 - moveablePartMetrics.xOffset - moveablePartMetrics.width - highlightOffset
				}

				c.save()
				c.beginPath();
				c.fillStyle = "rgba(255,255,255,0.1)";
				let screenH = worldToScreen(highlightRect.x, highlightRect.y)
				c.rect(
					screenH.x,
					screenH.y,
					highlightRect.w * camera.scale,
					highlightRect.h * camera.scale
				);
				if(isHitboxColided) {
					c.fillStyle = "rgba(255, 0, 0, 0.1)"
				}
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

			// Draws a small rectangle and write its tag
			let myP = getPreference("ShowIOPinName")
			if(myP == "Always" || (myP == "On Hover" && this.hoverHighlight) || (myP == "Tab To Toggle" && toggleWithTab)) {		
				c.save()
				c.font = `${18 * camera.scale}px ${myFont}`;
				c.letterSpacing = "1px";
				c.textAlign = "center";
				c.textBaseline = "middle";

				let writingOffset = { x: 7 * camera.scale, y: 5 * camera.scale };
				let extraOffset = this.type == 8 ? oneSquareSwitchLength : 0
				let distanceToPut = 6;

				let textWidth = Math.floor(c.measureText(this.tag).width) + writingOffset.x * 2;
				let textHeight = c.measureText(this.name).actualBoundingBoxAscent + c.measureText(this.name).actualBoundingBoxDescent

				c.beginPath()
				c.fillStyle = "rgba(0,0,0,0.7)"
				c.rect(screenPoints.x + (bigIO_radius + mainPutLineWidth + IO_radius * 2 + distanceToPut + extraOffset) * camera.scale, screenPoints.y - textHeight / 2 - writingOffset.y, textWidth, textHeight + writingOffset.y * 2);
				c.fill();
				c.fillStyle = "white";
				c.drawCenteredText(this.tag, screenPoints.x +  camera.scale * (bigIO_radius + mainPutLineWidth + IO_radius * 2 + distanceToPut + extraOffset) + textWidth / 2, screenPoints.y);
				c.closePath()
				c.restore()
			}

			//Draws the decimal display
			c.save()
			if(this.decimalDisplay != "Off") {
				let value = 0;
				for(let i = 0; i < this.type; i++) {
					if(this.decimalDisplay == "Signed") {
						if(this.lit[0] && i == 0) {
							value -= Math.pow(2, this.type - 1)
						} else {
							if(this.lit[i]) {
								value += Math.pow(2, this.type - 1 - i)
							}
						}
					} else if(this.decimalDisplay == "Unsigned" || this.decimalDisplay == "HEX") {
						if(this.lit[i]) {
							value += Math.pow(2, this.type - 1 - i)
						}	
					}
				}
				if(this.decimalDisplay == "HEX") {
					value = value.toString(16).padStart(2, "0").toUpperCase();
				}
				c.textBaseline = "alphabetic"
				let screenPoints = worldToScreen(this.x, this.y)
				let displayOffsetY = 5 * camera.scale
				let offsetY = (this.type == 1 ? bigIO_radius : (this.type == 4 ||this.type == 8) ? oneSquareSwitchLength : 0) * camera.scale; 
			
				c.font = `bold ${16 * camera.scale}px ${myFont}`;
				c.letterSpacing = "1px";
				c.textAlign = "center";
				c.textBaseline = "middle";
				c.beginPath()
				let rectMetrics;
				if(this.type == 1) {
					rectMetrics = {x: screenPoints.x - bigIO_radius* camera.scale, y: screenPoints.y + displayOffsetY + offsetY , width: bigIO_radius * 2 * camera.scale, height: 20* camera.scale}
				}
				if(this.type == 4) {
					rectMetrics = {x: screenPoints.x - oneSquareSwitchLength * camera.scale, y: screenPoints.y + displayOffsetY + offsetY , width: oneSquareSwitchLength * 2 * camera.scale, height: 20* camera.scale}
				}
				if(this.type == 8) {
					rectMetrics = {x: screenPoints.x - oneSquareSwitchLength* 2 * camera.scale, y: screenPoints.y + displayOffsetY + offsetY , width: oneSquareSwitchLength * 4 * camera.scale, height: 20* camera.scale}
				} 
				c.fillStyle = "rgba(0,0,0, 0.2)"
				c.rect(rectMetrics.x, rectMetrics.y, rectMetrics.width, rectMetrics.height)
				c.fill()
				c.closePath()
				c.beginPath()
				c.fillStyle = "white"
				c.drawCenteredText(value, screenPoints.x, rectMetrics.y + rectMetrics.height/2)
				c.closePath()				
			}
			c.restore()
		} else {

			let CW = this.cableConnectionPoint.width * camera.scale
			let CH = this.cableConnectionPoint.height * camera.scale
			if(this.type == 1) {
				// Draws the small circle
				c.beginPath();
				c.fillStyle = this.getColor(this.lit[0])
				if(this.connectionHighlight || this.hoverHighlight) {
					c.fillStyle =  "rgba(255,255,255,1)"
				}
				c.arc(screenPoints.x , screenPoints.y, smallRadius, 0, Math.PI * 2);
				c.fill();
				c.closePath();
			}

			if(this.type == 4) {
				// Draws the small rectangle
				c.beginPath();
				c.fillStyle = this.getColor(this.lit[0])
				if(this.connectionHighlight || this.hoverHighlight) {
					c.fillStyle =  "rgba(255,255,255,1)"
				}
				c.rect(CP.x - CW / 2, CP.y - CH / 2, CW, CH);				
				c.fill();
				c.closePath();
			}


			if(this.type == 8) {
				// Draws the big rectangle
				c.beginPath();
				c.fillStyle = this.getColor(this.lit[0])
				if(this.connectionHighlight || this.hoverHighlight) {
					c.fillStyle =  "rgba(255,255,255,1)"
				}
				c.rect(CP.x - CW / 2, CP.y - CH / 2, CW, CH);
				c.fill();
				c.closePath();
			}

			// Draws a small rectangle and write its tag
			let myP = getPreference("ShowChipPinName")
			if(myP == "Always" || (myP == "On Hover" && this.hoverHighlight) || (myP == "Tab To Toggle" && toggleWithTab)) {	
				if(this.parentType == "bus") {
					this.tag = "BUS-"+this.type
				}
				c.save()
				c.font = `${18 * camera.scale}px ${myFont}`;
				c.letterSpacing = "1px";
				c.textAlign = "center";
				c.textBaseline = "middle";

				let writingOffset = { x: 7 * camera.scale, y: 5 * camera.scale };
				let distanceToPut = 6;

				let textWidth = Math.floor(c.measureText(this.tag).width) + writingOffset.x * 2;
				let textHeight = getTextHeight(this.name);	

				c.beginPath()
				c.fillStyle = "rgba(0,0,0,0.7)"
				if(this.tagDirection == 1) {
					c.rect(screenPoints.x + this.tagDirection*((IO_radius + distanceToPut) * camera.scale), screenPoints.y - textHeight / 2 - writingOffset.y, textWidth, textHeight + writingOffset.y * 2);	
				} else {
					c.rect(screenPoints.x + this.tagDirection*((IO_radius + distanceToPut) * camera.scale + textWidth), screenPoints.y - textHeight / 2 - writingOffset.y, textWidth, textHeight + writingOffset.y * 2);
				}
				
				c.fill();
				c.fillStyle = "white";
				c.drawCenteredText(this.tag, screenPoints.x +this.tagDirection*((IO_radius + distanceToPut) * camera.scale + textWidth / 2), screenPoints.y	);
				c.closePath()
				c.restore()
			}
		}

		if(showIsPowered) {
			c.beginPath()
			c.fillStyle = this.isPowered[0] ? "blue" : "red"
			c.arc(CP.x + 5, CP.y, 3, 0 , 360)
			c.fill()
			c.closePath()
		}
	}
	move(addX = getDefaultMove().x, addY = getDefaultMove().y, isParentAllowed = true) {
		if(doesSnap() && isParentAllowed) {
			let snapSize = gridInfos.spacing/2
			let worldPoints = screenToWorld(gridInfos.x, gridInfos.y)
			let dx = Math.round((this.cableConnectionPoint.x  + addX - worldPoints.x) / snapSize) * snapSize - this.cableConnectionPoint.x + worldPoints.x;
			let dy = Math.round((this.cableConnectionPoint.y  + addY - worldPoints.y) / snapSize) * snapSize - this.cableConnectionPoint.y + worldPoints.y;	
			if(dx != 0 || dy != 0) {
				this.x += dx 
				this.y += dy 
				this.updateAllPoints()
				for(let o of this.outputs) {
					decode(cables, o).move(dx, dy, "Output");
				}
				
				setChangingStartValues(dx * camera.scale + mouseStartX, dy * camera.scale + mouseStartY)
			} 		
		} else {
			this.x += addX;
			this.y += addY;
			this.updateAllPoints()
			for(let o of this.outputs) {
				decode(cables, o).move(addX, addY, "Output");
			}	
			setChangingStartValues(mouseScreenX, mouseScreenY)
		}

		
	}
	delete() {
		for(let O = this.outputs.length - 1; O >= 0; O--) {
			let c = this.outputs[O];
			let tempCable = decode(cables, c, false);
			if(tempCable != null) {
				tempCable.delete();
			}
		}

		if(findIndex(outputs, this) != null) {	
			outputs.splice(findIndex(outputs, this),1);
		}
		
		rewriteUsedCodes();

		//currentFile.save()
	}

	updateAllPoints() {
		this.cableConnectionPoint = this.getCableConnectionPoint();
		this.switchPoints = this.getSwitchPoints();
		this.moveablePart = this.getMoveablePoints();
		this.calculateHitbox()
		
	}
}
