const spaceBetweenPuts = 7.5;
const putOffset = 7.5 / 2

class Gate {
	constructor(x, y, name, putArray = [inputs, outputs], displayArray = displays) {
		this.x = x;
		this.y = y;
		this.name = name;
		this.color = gateInfos[name]?.color;
		this.nameColor = gateInfos[name]?.nameColor;
		this.numberOfIO = gateInfos[name]?.gateIO;
		this.useableIO =  gateInfos[name]?.useableIO
		
		this.nameMode = gateInfos[name]?.nameMode
		this.nameOrder = getBestDistribution(name);
		
		
		// Calculating the width and height of the object depending on its name and inputs/outputs.
		this.width = gateInfos[name]?.width;
		this.height = gateInfos[name]?.height;



		// Generates a individual code for future uses
		this.code = generateCode();

		// Creates child (In/Out)-puts and connect them via code
		this.inputs = [];
		this.outputs = [];
		this.createPuts(putArray);

		//Creates child Displays and connect them via code
		this.displays = []
		this.createDisplays(displayArray)		

		this.moving = false;

		this.visualObjects = [];
		if(!(include(fastProcessedGates, name)) && this.name != null && !include(defaultGates, this.name)) {		
			this.visualObjects = this.createVisualObjects(); 
		}

		this.highlight = false;


		this.ObjectName = this.constructor.name;
		this.delay = Math.random();
		this.isPowered = false;


		if(gateInfos[this.name]?.isMemoryHolder && include(fastProcessedGates, this.name)) {
			this.memory = gateInfos[this.name].initialMemory.slice();
			console.log(this.memory)
		}

		this.tag = ""

		this.calculateHitbox()
		this.latestSavedPosition = {x: this.x, y:this.y}

		if(this.name == "KEY") {
			this.keyValue = "K";
			this.nameOrder = [this.keyValue]
		}
		if(this.name == "PULSE") {
			this.pulseWidth = 50;
			this.pulseTimer = 0;
			this.pulseActive = false
			this.pulseLocked = false
		}
		if(this.name == "ROM 256x16") {
			this.romValues = Array(256).fill("0000000000000000")
			this.romDisplay = "Unsigned Decimal"
		}
	}

	calculateHitbox() {
		let hitboxOffset = hitboxOffsets["Gate"]
		this.hitbox = {x: this.x - this.width/2 - hitboxOffset.x, y: this.y -this.height/2 - hitboxOffset.y, w: this.width + 2*hitboxOffset.x, h: this.height + hitboxOffset.y*2}
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

	createVisualObjects() {
		let tempObjects = [];
		let arr = gateInfos[this.name].savedGate;
		tempObjects = clone_Objects(arr, true);
		// buraya modify yapman lazım yani mesela visualObjects oluşturdu fastProcess olanların visualObjectsini silemn gerekiyor çok zor bir kod değil sıkıntı yok !!!
		return tempObjects;
	}
	show() {

		if(!this.moving) {
			this.latestSavedPosition = {x: this.x, y: this.y}
		}

		for(let o of this.outputs) {
			decode(outputs, o).show();
		}
		for(let i of this.inputs) {
			decode(inputs, i).show();
		}

		let screenPos = worldToScreen(this.x, this.y);
		let myX = screenPos.x;
		let myY = screenPos.y;

		let screenWidth = this.width * camera.scale;
		let screenHeight = this.height * camera.scale;

		let screenX = myX - screenWidth/2
		let screenY = myY - screenHeight/2
		

		c.lineCap = "butt"
		c.lineJoin = "miter"
		// Base rectangle
		c.beginPath()	
		c.fillStyle = this.color;
		if(this.name == "KEY" && this.keyPressed) c.fillStyle = "rgba(255, 255, 255, 1)"
		c.rect(screenX, screenY, screenWidth, screenHeight);
		c.fill();

		c.closePath();


		//Stroke
		c.beginPath();
		this.strokeStyle = darkenRGBA(this.color, 0.3)
		if(this.color == "rgba(0, 0, 0, 1)") {
			this.strokeStyle = "rgba(38, 38, 38, 1)"
		}
		if(isSpecialName(this.name)) {
			this.strokeStyle = "black"
		}
		if(this.name == "KEY" && this.keyPressed) {
			this.strokeStyle = "rgba(217, 217, 217, 1)"
		}
		c.strokeStyle = this.strokeStyle
		let lw = 3 
		c.lineWidth = lw * camera.scale
		let strokeOffset = -lw/2
		let strokePos = worldToScreen(this.x - this.width/2 + strokeOffset, this.y - this.height/2 + strokeOffset)
		c.rect(strokePos.x, strokePos.y, (this.width - strokeOffset*2) * camera.scale, (this.height - strokeOffset*2)* camera.scale);
		c.stroke();
		c.closePath();
		//


		// Name of the gate
		c.textAlign = "center";
		c.textBaseline = "middle";
		c.fillStyle = "white"
		c.textAlign = "center";
		c.letterSpacing =`${Math.round(1 * camera.scale)}px`
		c.font = `bold ${Math.round(32 * camera.scale)}px ${myFont}`

		
    	let rectCenterX = screenX + screenWidth / 2;
   		let rectCenterY = screenY + screenHeight / 2;

		let totalHeightOfName = 0
		for(let n = 0; n < this.nameOrder.length; n++) {
			totalHeightOfName += getTextHeight(this.nameOrder[n]);
		}

		totalHeightOfName += spaceBetweenLines * (this.nameOrder.length - 1) * camera.scale;
		
		
		function isSpecialName(name) {
			return (name == "3-STATE BUFFER" || include(MS_gates, name) || name == "PULSE" || name == "CLOCK" || name == "KEY")
		}
	
		c.beginPath();
		if(this.nameMode == "Middle") {
			let currentY = (rectCenterY - totalHeightOfName / 2)
			for (let n of this.nameOrder) {		
				let nameHeight = getTextHeight(n)
				let y = currentY + nameHeight / 2;
				
				c.fillStyle = this.nameColor
				if(isSpecialName(this.name)) {
					c.fillStyle = "rgba(89,89,89,1)"
				}
				c.textBaseline = "middle"
				c.drawCenteredText(n, rectCenterX, y);
				currentY += nameHeight + spaceBetweenLines * camera.scale;
			}
		} 
		if(this.nameMode == "Top") {
			let offset = lw/2
			let namePadding = 7.5 * camera.scale
			//Top Rect
			if(this.name != "") {		
				c.beginPath()
				c.fillStyle = (this.nameColor == "rgba(255, 255, 255, 1)") ? darkenRGBA(this.color, 0.1) : lightenRGBA(this.color, 0.1)
				if(isSpecialName(this.name)) {
					c.fillStyle = "black"
				}
		
				c.rect(screenX + offset, screenY + offset, screenWidth - lw, totalHeightOfName + namePadding * 2)
				c.fill()
				c.closePath()
			}
			
			let currentY = screenY;
			for (let n of this.nameOrder) {		
				let nameHeight = getTextHeight(n)
				let y = currentY + nameHeight / 2;
				
				
				c.fillStyle = this.nameColor
				if(isSpecialName(this.name) || this.color == "black") {
					c.fillStyle = "rgba(89, 89, 89, 1)"
				}
				if(this.name == "KEY" && this.keyPressed) c.fillStyle = "rgba(127, 127, 127, 1)"
				c.textBaseline = "hanging"
				c.drawCenteredText(n, rectCenterX, y + namePadding + offset);
				
				currentY += nameHeight + spaceBetweenLines * camera.scale;
			}
		}
		c.closePath();

		
		
		if(screen == 7) {
			drawGrid()
			for(let d of customizeDisplays) {
				d.show()
			}
		}

		// Display Showing
		c.save()
		c.beginPath()	
		c.rect(screenX, screenY, screenWidth, screenHeight);
		c.clip()


		for(let d of this.displays) {
			decode(displays, d).show()
		}
		c.closePath()
		c.restore()
		
		

		// Highlighting
		if(this.highlight) {
			let HO = highlightOffset * camera.scale
			let highlightRect = {x: screenX - HO, y: screenY - HO, w: screenWidth + 2*HO, h: screenHeight + 2*HO}
			if(this.numberOfIO != null) {
				let inputC = getTotalIO(this.numberOfIO[0])
				let outputC = getTotalIO(this.numberOfIO[1])
				if(inputC != 0 && outputC == 0) {
					highlightRect.x -= IO_radius * camera.scale
					highlightRect.w += IO_radius * camera.scale
				}
				if(inputC == 0 && outputC != 0) {
					highlightRect.w += IO_radius * camera.scale
				}
				if(inputC != 0 && outputC != 0) {
					highlightRect.x -= IO_radius * camera.scale 
					highlightRect.w += IO_radius * 2 * camera.scale
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

		//Hover highlight
		for(let o of this.outputs) {
			let myO = decode(outputs, o)
			if(myO.hoverHighlight) {
				myO.show();
			}
			
		}
		for(let i of this.inputs) {
			let myI = decode(inputs, i);
			if(myI.hoverHighlight) {
				myI.show();
			}
		}


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
	calcWH() {
		if(this.numberOfIO != null) {
			// Calculates the height of the object depending on its max value of inputs and outputs and name.
			let inputHeight = 0;
			let outputHeight = 0;

			for(let n = 0; n < this.numberOfIO[0].length; n++) {
				inputHeight += radiusOfPuts[this.numberOfIO[0][n]] * 2
			}
			for(let n = 0; n < this.numberOfIO[1].length; n++) {
				outputHeight += radiusOfPuts[this.numberOfIO[1][n]] * 2
			}

			let maxIO = Math.max(this.numberOfIO[0].length, this.numberOfIO[1].length);
			let totalHeightOfPuts = Math.max(inputHeight, outputHeight) + ((maxIO - 1) * spaceBetweenPuts) + putOffset * 2

			//let totalHeightOfPuts = maxIO * 2 * gridInfos.spacing

			

			let totalHeightOfName = 0
			for(let n = 0; n < this.nameOrder.length; n++) {
				c.textAlign = "center";
				c.letterSpacing = "1px";
				c.font = `bold 32px ${myFont}`
				totalHeightOfName += getTextHeight(this.nameOrder[n]);
			}
			totalHeightOfName += spaceBetweenLines * (this.nameOrder.length - 1);
			totalHeightOfName += gateNameHeightOffset * 2

			
			let tempHeight = Math.max(totalHeightOfPuts, totalHeightOfName)
			tempHeight = Math.ceil(tempHeight / gridInfos.spacing) * gridInfos.spacing
			


			
			// Calculates the width of the object depending on its name
			c.font = `bold 32px ${myFont}`
			c.letterSpacing = "1px"
			let tempWidth = -Infinity
			for(let line of this.nameOrder) { 
				c.textAlign = "center";
				let metrics = c.measureText(...line)
				tempWidth = Math.max(Math.floor(metrics.width), tempWidth);	
			}
			tempWidth += gateWidthOffset
			tempWidth = Math.ceil(tempWidth / gridInfos.spacing) * gridInfos.spacing

			this.height = Math.max(tempHeight, 30);
			this.width = tempWidth;
		}
	}
	createPuts(putArray, infos = gateInfos[this.name]) {
		let arr = infos?.savedGate;
		let inputTags = [];
		let outputTags = [];
		let inputColors = [];
		let outputColors = [];
		let inputUseable = []
		let outputUseable = []

		if(arr != null) {
			for(let a = 0; a < arr.length; a++) {
				if(arr[a].ObjectName == "Input" && arr[a].parentCode == null) {
					outputTags.push(arr[a].tag);
					outputUseable.push(arr[a].FP_useable)
					outputColors.push(arr[a].colorMode);
				}
				if(arr[a].ObjectName == "Output" && arr[a].parentCode == null) {
					inputTags.push(arr[a].tag);			
					inputUseable.push(arr[a].FP_useable)
					inputColors.push(arr[a].colorMode);	
				}		
			}
		}	
		
		
		if(this.numberOfIO != null) {
			// Creates inputs/outputs and link the gate to them
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

			//Inputs
			let currentY = this.y - this.height/2 + putOffset;
			for(let i = 0; i < this.numberOfIO[0].length; i++) {
				let inputY;
				let n = this.numberOfIO[0].length;
				let availableSpace = this.height - 2 * putOffset - totalInputHeight;
				let gap = (n > 1) ? availableSpace / (n - 1) : 0;		
				let type = this.numberOfIO[0][i]
				inputY = currentY + radiusOfPuts[type];
				
				if(n == 1) {
					inputY = this.y
				}
			
				let input = new Input(this.x - this.width/2, inputY, this.code, this.numberOfIO[0][i]);
				currentY += radiusOfPuts[type] * 2 + gap;
				putArray[0].push(input);
				this.inputs.push(input.code);
				input.parentType = "gate"

				//Tags the inputs
				if(inputTags.length > 0) {
					input.tag = inputTags[i]
				}		

				if(inputColors.length > 0) {
					input.colorMode = inputColors[i]
				}

				if(inputUseable.length > 0) {
					input.FP_useable = inputUseable[i]
				}
			}

			//Outputs
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
				putArray[1].push(output);
				this.outputs.push(output.code);
				output.parentType = "gate"

				//Tags the outputs
				if(outputTags.length > 0) {
					output.tag = outputTags[i]
				}

				//Colors the outputs
				if(outputColors.length > 0) {
					output.colorMode = outputColors[i]
				}
				
				if(outputUseable.length > 0) {
					output.FP_useable = outputUseable[i]
				}
			}
		}
	}
	createDisplays(displayArray) {
		if(this.name == undefined) return
		let tempDisplays = gateInfos[this.name]?.savedGate.filter(obj => obj.ObjectName == "Display")
		for(let arr of gateInfos[this.name].displays) {
			let tempDisplay = new Display(arr[0] + this.x ,arr[1] + this.y, tempDisplays[arr[2]].name, true)
			tempDisplay.customizeIndex = arr[2]
			tempDisplay.scale = arr[3]
			displayArray.push(tempDisplay)
			
			if(tempDisplay.name == "LED") tempDisplay.colorMode = tempDisplays[arr[2]].colorMode

			tempDisplay.parentCode = this.code
			this.displays.push(tempDisplay.code)
		}
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
					let tempInput = decode(inputs,this.inputs[i])
					tempInput.move(dx, dy, false);
				}

				for(let o = 0; o < this.outputs.length; o++) {
					let tempOutput = decode(outputs,this.outputs[o]);
					tempOutput.move(dx, dy, false);
				}

				for(let d of this.displays) {
					let tempDisplay = decode(displays, d)
					tempDisplay.move(dx, dy, false)
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

			for(let d of this.displays) {
				let tempDisplay = decode(displays, d)
				tempDisplay.move(savedOffset.x, savedOffset.y);
			}
			setChangingStartValues(mouseScreenX, mouseScreenY)
		}
		
		this.calculateHitbox()
	}
	delete(gateArray = gates, arrOutput = outputs, arrInput = inputs, cableArray = cables, displayArray = displays) {

		// Deletes the cables coming from its inputs and outputs. 
		// Also deletes the inputs and outputs
		for(let I = this.inputs.length - 1; I >= 0; I--) {
			let tempInput = decode(arrInput, this.inputs[I]);
			for(let I2 = tempInput.inputs.length - 1; I2 >= 0; I2--) {
				let i2 = tempInput.inputs[I2];
				let tempCable = decode(cableArray, tempInput.inputs[I2], false);
				if(tempCable != null) {
					tempCable.delete(arrOutput, arrInput, cableArray);
				}
			}
			Splice(arrInput, tempInput)
		}

		for(let O = this.outputs.length -1; O >= 0; O--) {
			let tempOutput = decode(arrOutput, this.outputs[O]);
			for(let O2 = tempOutput.outputs.length - 1; O2 >= 0; O2--) {
				let tempCable = decode(cableArray, tempOutput.outputs[O2], false);
				if(tempCable != null) {
					tempCable.delete(arrOutput, arrInput, cableArray);
				}
			}
			Splice(arrOutput, tempOutput)
		}

		//Deletes displays
		for(let D = this.displays.length - 1; D>=0; D--) {
			let tempDisplay = decode(displayArray, this.displays[D])
			Splice(displayArray, tempDisplay)
		}
				

		// Deletes itself
		if(findIndex(gateArray, this) != null) {
			Splice(gateArray, this)
		}


		rewriteUsedCodes();

		//currentFile.save()
	}
	process(arrOutput = outputs, arrInput = inputs, doesStabilize = false) {

		
		//Loop

		// Do stuff about base power
		//this.powerSupply(arrOutput, arrInput); ??? değiştirdim

		

		if(this.isPowered == true) {
			for(let o of this.outputs) {
				let tempOutput = decode(arrOutput, o)
				for(let t = 0; t < tempOutput.type; t++) {
					tempOutput.isPowered[t] = true;
				}		
			} 
		} else {
			for(let o of this.outputs) {
				let myOutput = decode(arrOutput, o)
				myOutput.isPowered = Array(myOutput.type).fill(false);
				myOutput.lit = Array(myOutput.type).fill(false);
			}
		}
		

		/////////////////////////////////////////////////

		// Process "AND" Gate 
		if(this.name == "AND") {
			let tempInput0 = decode(arrInput, this.inputs[0])
			let tempInput1 = decode(arrInput, this.inputs[1])
			let tempOutput = decode(arrOutput, this.outputs[0])
			tempOutput.lit[0] = tempInput0.lit[0] && tempInput1.lit[0]
			tempOutput.isPowered = [true]
			tempOutput.basePower = [true]
			return		
		}

		// Process "NOT" Gate 
		if(this.name == "NOT") {
			let tempInput = decode(arrInput, this.inputs[0])
			let tempOutput = decode(arrOutput, this.outputs[0])
			tempOutput.lit[0] = !tempInput.lit[0]
			tempOutput.isPowered = [true]
			tempOutput.basePower = [true]
			return		
		}

		// Process "3-STATE BUFFER" Gate 
		if(this.name == "3-STATE BUFFER") {
			decode(arrOutput, this.outputs[0]).basePower[0] = decode(arrInput, this.inputs[0]).lit[0];
			if(decode(arrOutput, this.outputs[0]).basePower[0]) {
				decode(arrOutput, this.outputs[0]).lit = decode(arrInput, this.inputs[1]).lit.slice();
			} else {
				decode(arrOutput, this.outputs[0]).lit[0] = false;
			}
			return		
		}


		//Process (MS_gates) MERGE/SPLIT GATES
		if(include(MS_gates, this.name)) {
			let litValues = [];
			let basePowerValues = [];
			let isPoweredValues = [];
			for(let i = 0; i < this.inputs.length; i++) {
				let tempInput = decode(arrInput, this.inputs[i]) 
				let isConnected = tempInput.inputs.length > 0
				for(let t = 0; t < tempInput.type; t++) {
					litValues.push(tempInput.lit[t])
					basePowerValues.push(tempInput.basePower[t] && isConnected)
					isPoweredValues.push(tempInput.isPowered[t])
				}
			}
			let counter = 0
			for(let o = 0; o < this.outputs.length; o++) {
				let tempOutput = decode(arrOutput, this.outputs[o])
				for(let t = 0; t < tempOutput.type; t++) {
					tempOutput.lit[t] = litValues[counter];
					tempOutput.basePower[t] = basePowerValues[counter]
					tempOutput.isPowered[t] = isPoweredValues[counter]
					counter++
				}
			}
			return
		}

		//Process "CLOCK" gate
		if(this.name == "CLOCK") {
			decode(arrOutput, this.outputs[0]).lit[0] = clockState;
			return
		}


		//Process "PULSE" gate
		if(this.name == "PULSE") {
			let tempInputLit = decode(arrInput, this.inputs[0]).lit[0]

			if(!this.pulseActive && !tempInputLit && this.pulseLocked) {
				this.pulseLocked = false
			}

			if(!this.pulseActive && tempInputLit && !this.pulseLocked) {
				this.pulseActive = true;
				this.pulseLocked = true
				this.pulseTimer = this.pulseWidth;
			}

			if(this.pulseActive) {				
				if(this.pulseTimer <= 0) {
					this.pulseActive = false
					decode(arrOutput, this.outputs[0]).lit[0] = false
				} else {
					decode(arrOutput, this.outputs[0]).lit[0] = true
					this.pulseTimer--	
				}
				
			}
			return
		}

		//Process "KEY" gate
		if(this.name == "KEY") {
			if(this.keyPressed) {
				decode(arrOutput, this.outputs[0]).lit[0] = true
			} else {
				decode(arrOutput, this.outputs[0]).lit[0] = false
			}
			return
		}

		//Process "Buzzer" Gate
		if(this.name == "BUZZER") {
			this.playBuzzer(arrInput)
			return
		}

		//Process "ROM 256x16" Gate
		if(this.name == "ROM 256x16") {
			let tempInput = decode(arrInput, this.inputs[0])
			let addr = 0
			for(let i = 0; i < tempInput.lit.length; i++) {
				if(tempInput.lit[i]) addr += 2 ** (7-i)
			}
			
			let tempValues = this.romValues[addr]
			let counter = 0
			for(let o of this.outputs) {
				let tempOutput = decode(arrOutput, o)
				tempOutput.basePower = Array(tempOutput.type).fill(true)
				for(let t = 0; t < tempOutput.type; t++) {
					if(debugMode) console.log(t, tempValues[counter])
					tempOutput.lit[t] = !!parseInt(tempValues[counter])
					counter++
				}
			}
			return
		}

		///////////////////////////////////////////////////
		
		// Process (Fast Processed) Gates 
		if(include(fastProcessedGates, this.name)) {
			this.fastProcess(arrOutput, arrInput);
			return;
		}
		/////////////////////////////////////////////////
		

		
		
		// Process Other Gates by using "visualObjects"
		if(!include(fastProcessedGates, this.name)) {
			if(this.visualObjects.length == 0) {
				console.log(this.name + " Visual Objects'i yok!")
				return
			}

			// Divides visualObjects into groups for easier usage // "M" stands for "Main"
			let visualMInputs = [];
			let visualMOutputs = [];

			for(let v of this.visualObjects) {
				if(v instanceof Input) {
					if(v.parentCode == null) {
						visualMInputs.push(v)
					}
				}
				if(v instanceof Output) {
					if(v.parentCode == null) {
						visualMOutputs.push(v)
					}
				}
			}

			//Real Inputs gives power to visual main outputs (Don't get confused!)	
			for(let I = 0; I < this.inputs.length; I++) {
				visualMOutputs[I].lit = decode(arrInput, this.inputs[I]).lit.slice();
				visualMOutputs[I].basePower = decode(arrInput, this.inputs[I]).basePower.slice();
			}

			if(!doesStabilize) processArea(this.visualObjects)
			if(doesStabilize) stabilizeArea(this.visualObjects)
		
			// Visual Main Inputs gives power to real outputs (Don't get confused!)
			for(let i = 0; i < this.outputs.length; i++) {
				decode(arrOutput, this.outputs[i]).lit = visualMInputs[i].lit.slice();
				decode(arrOutput, this.outputs[i]).basePower = visualMInputs[i].basePower.slice();
			}		
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
		if(this.name == "3-STATE BUFFER") {
			decode(arrOutput, this.outputs[0]).basePower[0] = decode(arrInput, this.inputs[0]).lit[0]		
		} else {
			if(!gateInfos[this.name].isThreeState && !include(MS_gates, this.name)) {
				for(let o of this.outputs) {
					let tempOutput = decode(arrOutput, o)
					tempOutput.basePower = Array(tempOutput.type).fill(true);			
				}
			} 	
		}		
	}
	fastProcess(arrOutput = outputs, arrInput = inputs) {
		/// !!! calculateFastProcess'e basePower'ı entegre et yoksa MS gates çalışmıyor adam akıllı!
		let tempValues = fastProcessInfos[this.name].values
		if(!gateInfos[this.name].isMemoryHolder) {		
			let binaryInput = "";
	
			for(let i of this.inputs) {
				let tempInput = decode(arrInput, i)
				if(tempInput.FP_useable) {
					for(let t = 0; t < tempInput.type; t++) {
						binaryInput = binaryInput.concat(+tempInput.lit[t]);
					}	
				}
			}

			// !!! bu kısım basitleşebilir aşağısı
			let useableInputLength = 0
			let useableOutputLength = 0		
			for(let i of this.inputs) {
				let tempInput = decode(arrInput, i)
				if(tempInput.FP_useable) {
					useableInputLength += tempInput.type
				}
			}
			for(let o of this.outputs) {
				let tempOutput = decode(arrOutput, o)
				if(tempOutput.FP_useable) {
					useableOutputLength += tempOutput.type
				}
			}
			//

			let totalUseablePut = useableInputLength + useableOutputLength
			
			let startPoint = parseInt(binaryInput, 2) * (totalUseablePut) + useableInputLength;
			let counter = 0
			for(let o = 0; o < this.numberOfIO[1].length; o++) {
				let tempOutput = decode(arrOutput, this.outputs[o])
				if(tempOutput.FP_useable) {
					for(let t = 0; t < tempOutput.type; t++) {
						tempOutput.lit[t] = !!tempValues[startPoint + counter];
						counter++
					}
				}			
			}

		} else {
			let binaryInput = "";

			// !!! aynı şekilde
			let useableInputLength = 0
			let useableOutputLength = 0		
			for(let i of this.inputs) {
				let tempInput = decode(arrInput, i)
				if(tempInput.FP_useable) {
					useableInputLength += tempInput.type
				}
			}
			for(let o of this.outputs) {
				let tempOutput = decode(arrOutput, o)
				if(tempOutput.FP_useable) {
					useableOutputLength += tempOutput.type
				}
			}
			//

			for(let l = 0; l < this.memory.length; l++) {
				binaryInput = binaryInput.concat(this.memory[l]);
			}

			for(let i of this.inputs) {
				let tempInput = decode(arrInput, i)
				if(tempInput.FP_useable) {
					for(let t = 0; t < tempInput.type; t++) {
						binaryInput = binaryInput.concat(+decode(arrInput, i).lit[t]);
					}
				}
			}

			// !!! bunu yapan bir fonksiyon var zaten
			let counter = 0
			let oneTruthTableLength;
			if(gateInfos[this.name].isLooping)  {
				oneTruthTableLength = useableInputLength + this.memory.length * 2; //Actually this one longer --> Memory Input -> Memory (Memory does not include output here)
			}
			if(!gateInfos[this.name].isLooping) {
				oneTruthTableLength = useableInputLength + useableOutputLength + this.memory.length * 2; // Actually this one shorter --> Memory Input -> Memory Output (Memory does not include output here)
			}

			let startPoint = parseInt(binaryInput, 2) * oneTruthTableLength + useableInputLength + this.memory.length;
			for(let o = 0; o < this.numberOfIO[1].length; o++) {	
				let tempOutput = decode(arrOutput, this.outputs[o])				
				for(let t = 0; t < tempOutput.type; t++) {
					if(tempOutput.FP_useable) {
						tempOutput.lit[t] = !!tempValues[startPoint + counter];
						counter++
					}				
				}
			}
			if(gateInfos[this.name].isLooping)  {
				for(let m = 0; m < this.memory.length; m++) {
					this.memory[m] = tempValues[startPoint + m];
				}
			} else {
				for(let m = 0; m < this.memory.length; m++) {
					this.memory[m] = tempValues[startPoint + useableOutputLength + m];
				}
			}
			
		}
	}

	playBuzzer(arrInput) {
		// İlk çalıştırmada osilatör yoksa oluştur
		if(!this.osc){
			this.createAudioContext();
		}

		let pitchInput  = decode(arrInput, this.inputs[0]);
		let volumeInput = decode(arrInput, this.inputs[1]);

		// bit to value
		this.pitch = 0;
		this.volume = 0;

		for(let i = 0; i < pitchInput.type; i++)
			if(pitchInput.lit[i]) this.pitch += 2 ** (7 - i);

		for(let i = 0; i < volumeInput.type; i++)
			if(volumeInput.lit[i]) this.volume += 2 ** (3 - i);

		let freq = pitchToFreq(this.pitch);
		let vol  = volumeMapped(this.volume, freq);

		

		// Sert geçiş yerine smooth geçiş yap
		this.osc.frequency.cancelScheduledValues(audioCtx.currentTime);
		this.osc.frequency.exponentialRampToValueAtTime(Math.max(freq,1), audioCtx.currentTime + 0.03);

		this.gain.gain.cancelScheduledValues(audioCtx.currentTime);
		this.gain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.015);

		// duration kadar sonra sesi durdur
		setTimeout(() => {
			this.gain.gain.cancelScheduledValues(audioCtx.currentTime);
			this.gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.015);
		}, 0.1 * 1000);
	}
	createAudioContext() {
		this.osc = audioCtx.createOscillator();
        this.gain = audioCtx.createGain();

        this.osc.type = "sine";
        this.gain.gain.value = 0;

        this.osc.connect(this.gain).connect(audioCtx.destination);
        this.osc.start();
	}
}

function pitchToFreq(pitch){
    const min = 100;
    const max = 700;
    return min + (pitch/255) * (max-min);
}

function volumeMapped(volume, freq){
    const base = volume / 5; // önceki 15 yerine 5 ile 0..1 arası daha yüksek
    const freqFactor = 1 / Math.pow((freq / 200 + 1), 2); 
    const maxReduction = 0.5; 
    return base * freqFactor * maxReduction;
}