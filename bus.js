class Bus {
    constructor(x, y, type, direction) {
        this.x = x
        this.y = y
        this.type = type
        this.direction = direction
        this.calcWH()
        this.code = generateCode();
        this.ObjectName = "Bus"
        this.inputs = []
        this.outputs = []
        this.createPuts();
        this.calculateHitbox();
        this.highlight = false
        this.moving = false
        this.tag = ""
    }



    show() {
        if(!this.moving) {
			this.latestSavedPosition = {x: this.x, y: this.y}
		}

        let screenPts = worldToScreen(this.x - this.width/2, this.y - this.height/2)
        let screenWidth = this.width * camera.scale
        let screenHeight = this.height * camera.scale

        for(let i of this.inputs) {         
            let tempInput = decode(inputs, i)
            tempInput.show()
        }
        for(let o of this.outputs) {
            let tempOutput = decode(outputs, o)
            tempOutput.show()
        }
        // Main rectangle
        c.beginPath()
        c.fillStyle = "rgba(25,25,25,1)"
        c.rect(screenPts.x, screenPts.y, screenWidth, screenHeight)
        c.fill()
        c.closePath()

        
        c.beginPath();
		c.strokeStyle = "rgba(0, 0,0 , 1)"
		let lw = 3 
		c.lineWidth = lw * camera.scale
		let strokeOffset = -lw/2
		let strokePos = worldToScreen(this.x - this.width/2 + strokeOffset, this.y - this.height/2 + strokeOffset)
		c.rect(strokePos.x, strokePos.y, (this.width - strokeOffset*2) * camera.scale, (this.height - strokeOffset*2)* camera.scale);
		c.stroke();
		c.closePath();


        //Debug for hitbox
		if(showHitbox && this.hitbox != null) {
			let HP = worldToScreen(this.hitbox.x, this.hitbox.y)
			let sW = this.hitbox.w * camera.scale
			let sH = this.hitbox.h * camera.scale
			c.beginPath()
			c.lineWidth = 4 * camera.scale
			c.strokeStyle = "blue"
			c.rect(HP.x, HP.y, sW, sH)
			c.stroke()
			c.closePath()
		}

        //Debuggin for pairs
        if(0) {
            let pair = this.getPair()
            let centerP = worldToScreen(this.x, this.y)
            let pairPts = worldToScreen(pair.x, pair.y)
            c.beginPath()
            c.lineWidth = 3
            c.strokeStyle = "green"
            c.moveTo(centerP.x, centerP.y)
            c.lineTo(pairPts.x, pairPts.y)
            c.stroke()
            c.closePath()
        }
       
        // Highlighting
		if(this.highlight) {
			let HO = highlightOffset * camera.scale
			let highlightRect = {x: screenPts.x - HO, y: screenPts.y - HO, w: screenWidth + 2*HO, h: screenHeight + 2*HO}
			highlightRect.w += IO_radius * camera.scale
            if(this.direction == -1) highlightRect.x -= IO_radius * camera.scale

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
		}

        // Writes the Tag
		if(this.tag != "") {		
			c.save()
			c.font = `${Math.round(18 * camera.scale)}px ${myFont}`
			c.letterSpacing = "1px";
			c.textAlign = "center";
			c.textBaseline = "middle";

			let writingOffset = { x: 7 * camera.scale, y: 5 * camera.scale };
			let screenPoints = worldToScreen(this.x, this.y)
			let textWidth = Math.floor(c.measureText(this.tag).width) + writingOffset.x * 2;
			let textHeight = getTextHeight(this.tag)
			let distanceToGate = 5 * camera.scale

			c.beginPath()
			c.fillStyle = "rgba(0,0,0,0.7)"
			c.rect(screenPoints.x - textWidth/2 - writingOffset.x , screenPoints.y + this.height*camera.scale/2 + distanceToGate, textWidth + writingOffset.x*2, textHeight + writingOffset.y * 2);
			c.fill();
			c.closePath()

			c.beginPath()
			c.fillStyle = "white";
			c.drawCenteredText(this.tag, screenPoints.x , screenPoints.y + this.height * camera.scale/2 + distanceToGate + writingOffset.y + textHeight/2);
			c.closePath()
			c.restore()
		}
    }

    flipBus() {
        this.direction *= -1
        let tempPin = this.getPin()
        tempPin.direction *= -1
        tempPin.x += (this.x - tempPin.x) * 2

        this.calculateHitbox()
        tempPin.tagDirection *= -1
        tempPin.updateAllPoints() 
        
        if(tempPin.ObjectName == "Input") {
            for(let i of tempPin.inputs) {
                let tempCable = decode(cables, i)
                tempCable.move()
            }
        } else {
             for(let o of tempPin.outputs) {
                let tempCable = decode(cables, o)
                tempCable.move()
            }
        }
        
    }

    fastConnect() {
        let pair = this.getPair()
        let tempInput;
        let tempOutput
        if(this.inputs.length > 0) {
            tempInput = this.getPin()
            tempOutput = pair.getPin()
        } else {
            tempOutput = this.getPin()
            tempInput = pair.getPin()
        }
        if(tempInput.inputs.length == 0) {
            let tempCable = Cable.fastConnect(tempOutput, tempInput, this.type, true)
            cables.push(tempCable)
        }

    }

    getPin(pinArray = inputs.concat(outputs)) {
        if(this.inputs.length > 0) {
            return decode(pinArray, this.inputs[0])
        } else {
            return decode(pinArray, this.outputs[0])
        }
    }

    getPair(busArray = busses) {
        return decode(busArray, this.pairCode)
    }

    calculateHitbox() {
        let hitboxOffset = hitboxOffsets["Bus"]
		this.hitbox = {x: this.x - this.width/2 - hitboxOffset.x, y: this.y - this.height/2 - hitboxOffset.y, w: this.width + 2*hitboxOffset.x, h: this.height + hitboxOffset.y*2}
        this.hitbox.w += IO_radius
        if(this.direction == -1) this.hitbox.x -= IO_radius
    }

    move(addX = getDefaultMove().x, addY = getDefaultMove().y) {
		if(doesSnap()) {
			let snapSize = gridInfos.spacing/2
			let worldPoints = screenToWorld(gridInfos.x, gridInfos.y)
			let dx = Math.round((this.x  + addX - worldPoints.x) / snapSize) * snapSize - this.x + worldPoints.x;
			let dy = Math.round((this.y  + addY - worldPoints.y) / snapSize) * snapSize - this.y + worldPoints.y;
			if(dx != 0 || dy != 0) {
				this.x += dx
				this.y += dy
				for(let i = 0; i < this.inputs.length; i++) {
					let tempInput = decode(inputs, this.inputs[i])
					tempInput.move(dx, dy, false);
				}

				for(let o = 0; o < this.outputs.length; o++) {
					let tempOutput = decode(outputs, this.outputs[o]);
					tempOutput.move(dx, dy, false);
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
		
		this.calculateHitbox()
	}

    createPuts() {
        if(this.direction == 1) {
            let tempOutput = new Output(this.x + this.width/2 * this.direction, this.y, this.code, this.type)
            outputs.push(tempOutput)
            this.outputs.push(tempOutput.code)
            tempOutput.parentType = "bus"
        }
        if(this.direction == -1) {
            let tempInput = new Input(this.x + this.width/2 * this.direction, this.y, this.code, this.type)
            inputs.push(tempInput)
            this.inputs.push(tempInput.code)
            tempInput.parentType = "bus"
        }
       
    }

    calcWH() {
        this.width = 2 * gridInfos.spacing
        this.height = busHeights[this.type]
    }

    delete(busArray = busses, arrOutput = outputs, arrInput = inputs, cableArray = cables) {

		// Deletes the cables coming from its inputs and outputs. 
		// Also deletes the inputs and outputs
		for(let I = this.inputs.length - 1; I >= 0; I--) {
			let tempInput = decode(arrInput, this.inputs[I]);
			for(let I2 = tempInput.inputs.length - 1; I2 >= 0; I2--) {
				let i2 = tempInput.inputs[I2];
				let tempCable = decode(cableArray, i2);
				if(tempCable != null) {
					tempCable.delete(arrOutput, arrInput, cableArray);
				}
			}
			Splice(arrInput, tempInput)
		}

		for(let O = this.outputs.length -1; O >= 0; O--) {
			let tempOutput = decode(arrOutput, this.outputs[O]);
			for(let O2 = tempOutput.outputs.length - 1; O2 >= 0; O2--) {
				let tempCable = decode(cableArray, tempOutput.outputs[O2]);
				if(tempCable != null) {
					tempCable.delete(arrOutput, arrInput, cableArray);
				}
			}
			Splice(arrOutput, tempOutput)
		}		

		// Deletes itself and its pair
		if(findIndex(busArray, this) != null) {
			Splice(busArray, this)
		}

        if(busArray.length % 2 == 1) {
            let pair = this.getPair(busArray)
            pair.delete(busArray)  
        }

    
		rewriteUsedCodes();

        //currentFile.save()
	}

    static connectPair(busArray = busses) {
        let bus1 = busArray[busArray.length - 1]
        let bus2 = busArray[busArray.length - 2]
        bus1.pairCode = bus2.code;
        bus2.pairCode = bus1.code;
    }
}