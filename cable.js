const autoConnectRadius = 20;
const curveRadius = 20
const cableBoldness = {1: 6, 4: 28, 8: 45}
const cableModeChangerAngle = 40
const cableHighlightMult = 1.2
const edittingPointRadius = 10

class Cable {
	constructor(x1, y1, x2, y2, inputCode, outputCode, type = 1) {
		this.inputCode = inputCode;
		this.outputCode = outputCode;
		this.type = type;
		this.code = generateCode();	
		this.highlight = false;
		this.connectionHighlight = false
		this.ObjectName = this.constructor.name;
		this.colorMode = "red"	
		this.connectionPoints = [];
		this.createBaseConnectionPoints(x1, y1, x2, y2)
		this.isPowered = [];
		this.basePower = []; 	
		this.isConnecting = false;
		this.editting = false;
		this.connectionTypes = {start: {ObjectName: null, isBus: null}, end: {ObjectName: null, isBus: null}}
		this.lit = Array(this.type).fill(false)
		this.basePower = Array(this.type).fill(false)
		this.childs = [];
		this.childAnchors = [];
	}

	createBaseConnectionPoints(x1, y1, x2, y2) {
		this.connectionPoints.push([x1, y1])
		this.connectionPoints.push([x2, y2])
		return
	}

	getColor(isLit, isBasePower = true) {

		if(!isBasePower) {
			return "rgba(0,0,0,1)"
		}

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

	move(addX, addY, calledFrom) {
		let firstConnectionPoint = this.connectionPoints[0];
		let lastConnectionPoint = last(this.connectionPoints)
		if(this.connectionTypes.start.ObjectName == "Output") {
			let tempInput = decode(outputs, this.inputCode)
			firstConnectionPoint[0] = tempInput.cableConnectionPoint.x
			firstConnectionPoint[1] = tempInput.cableConnectionPoint.y
		} else if(this.connectionTypes.start.ObjectName == "Input") {
			let tempInput = decode(outputs, this.inputCode)
			lastConnectionPoint[0] = tempInput.cableConnectionPoint.x
			lastConnectionPoint[1] = tempInput.cableConnectionPoint.y
		} else {
			let tempCable = decode(cables, this.inputCode)
			let myIndex = findIndex(tempCable.childs, this.code)
			firstConnectionPoint[0] = tempCable.childAnchors[myIndex].x
			firstConnectionPoint[1] = tempCable.childAnchors[myIndex].y
		}
		if(this.connectionTypes.end.ObjectName == "Input") {
			let tempOutput = decode(inputs, this.outputCode)
			lastConnectionPoint[0] = tempOutput.cableConnectionPoint.x
			lastConnectionPoint[1] = tempOutput.cableConnectionPoint.y
		} else if(this.connectionTypes.end.ObjectName == "Output") {
			let tempOutput = decode(inputs, this.outputCode)
			firstConnectionPoint[0] = tempOutput.cableConnectionPoint.x
			firstConnectionPoint[1] = tempOutput.cableConnectionPoint.y
		} else {
			let tempCable = decode(cables, this.outputCode)
			let myIndex = findIndex(tempCable.childs, this.code)
			lastConnectionPoint[0] = tempCable.childAnchors[myIndex].x
			lastConnectionPoint[1] = tempCable.childAnchors[myIndex].y
		}
		
		this.moveChildAnchors(addX, addY, calledFrom)

		this.updatePoints();
	}

	moveChildAnchors(addX, addY, calledFrom) {
		if(addX != 0 || addY != 0) {
			for(let i = 0; i < this.childAnchors.length; i++) {
				let tempAnchor = this.childAnchors[i]
				if(tempAnchor.index == 0 || tempAnchor.index == this.connectionPoints.length - 2) {
					let prev = turnObject(this.connectionPoints[tempAnchor.index]);
					let next = turnObject(this.connectionPoints[tempAnchor.index + 1]);

					let seg = getVector(prev, next);
					let segLen = vectorLength(seg);
					if (segLen < eps) continue;

					// --- 1) Normal projeksiyonu hesapla ---
					let normal = leftNormal(seg);
					let moveV = { x: addX, y: addY };
					let projection = vectorProjection(normal, moveV);
					

					// REAL pozisyona göre t hesaplanmalı:
					let rawT = ((tempAnchor.realX - prev.x) * seg.x + (tempAnchor.realY - prev.y) * seg.y) / (segLen * segLen);
					let t = Math.max(0, Math.min(1, rawT));

					// --- 2) REAL position'a projection * t ekle ---
					tempAnchor.realX += projection.x * t;
					tempAnchor.realY += projection.y * t;

					let newT = ((tempAnchor.realX - prev.x) * seg.x + (tempAnchor.realY - prev.y) * seg.y) / (segLen * segLen);
					newT = Math.max(0, Math.min(1, newT));

					tempAnchor.x = prev.x + seg.x * newT;
					tempAnchor.y = prev.y + seg.y * newT;
				}
			}
		}
		

		for(let c of this.childs) {
			let tempCable = decode(cables, c)
			tempCable.move(0, 0, calledFrom)
		}
		
	}

	updatePoints() {
		//Sets the ending point
		let lastPoint = last(this.connectionPoints)
		let prevPoint = this.connectionPoints[this.connectionPoints.length -2]
		let dX,dY
		if(this.isConnecting) {	
			if(getPreference("ShowGrid") == "On" || (mouseOccupation == "cableCreating" && controlKeyActive)) {		
				let worldPoints = screenToWorld(gridInfos.x,gridInfos.y)
				let snapSize = gridInfos.spacing  / 2;
				
				if(isStraight()) {
					dX = Math.abs(mouseX - prevPoint[0]);
					dY = Math.abs(mouseY - prevPoint[1]);
					if(dX > dY) {
						lastPoint[0] = Math.round((mouseX - worldPoints.x) / snapSize) * snapSize + worldPoints.x;
						lastPoint[1] =  prevPoint[1]
					} else {
						lastPoint[0] = prevPoint[0]
						lastPoint[1] = Math.round((mouseY - worldPoints.y) / snapSize) * snapSize + worldPoints.y;			
					}
				} else {
					lastPoint[0] = Math.round((mouseX - worldPoints.x) / snapSize) * snapSize + worldPoints.x;
					lastPoint[1] = Math.round((mouseY - worldPoints.y) / snapSize) * snapSize + worldPoints.y;
				}
				
			} else {
				if(isStraight()) {
					dX = Math.abs(mouseX - prevPoint[0]);
					dY = Math.abs(mouseY - prevPoint[1]);
					if(dX > dY) {
						lastPoint[0] = mouseX
						lastPoint[1] = prevPoint[1]
					} else {
						lastPoint[0] = prevPoint[0]
						lastPoint[1] = mouseY			
					}
					
				} else {
					lastPoint[0] = mouseX
					lastPoint[1] = mouseY
				}
				
			}
		}
		
		this.updateDrawingPoints()
	}

	updateDrawingPoints() {
		this.drawingPoints = []
		let cableWidth = cableBoldness[this.type] * camera.scale;
		if (this.highlight || this.connectionHighlight) cableWidth *= cableHighlightMult;
		let stripeWidth = cableWidth / this.type
		let forcedNormalFlip = false
		let doesFallback = true // Must be true

		// Loop Starts: Gets all the drawingPoints
		for(let i = 0; i < this.connectionPoints.length; i++) {
			let prevP, nextP;
			if(i < this.connectionPoints.length - 1) nextP = turnObject(this.connectionPoints[i + 1])
			if(i > 0)								 prevP = turnObject(this.connectionPoints[i - 1])
			let currP = turnObject(this.connectionPoints[i])
			let tempPoints = []

			
			
			//Helper Function --> gets all the points 
			function getPoints(p, v, type, fix) {
				let startValue = (type - 1)/2
				for(let index = 0; index < type; index++) {
					const scaler = stripeWidth*(startValue - index)*fix/camera.scale
					let scaledVector = scaleVector(v, scaler)
					tempPoints.push({x: p.x + scaledVector.x, y: p.y + scaledVector.y})
				} 
			}

			//Helper Function --> handles fallbackPoints
			function getFallbackPoints(points, v, type) {
				//Fallback//
				for(let index = 0; index < type; index++) { 
					tempPoints.push({x: points[index].x + v.x, y: points[index].y + v.y})
				} 
			}

			function isReallyClose(v1, v2) {
				return ((Math.abs(v1.x - v2.x) < eps && Math.abs(v1.y - v2.y) < eps) && doesFallback)
			}

			//First Point
			if(i == 0) {	
				let tempVector = getVector(currP, nextP)
				let normalVector = unitVector(leftNormal(tempVector))
				getPoints(currP, normalVector, this.type, 1)
			}
			////
			
			// Last Point
			else if(i == this.connectionPoints.length - 1) {
				let tempVector = getVector(prevP, currP)
				if(isReallyClose(prevP, currP)) {				
					getFallbackPoints(this.drawingPoints[i - 1], tempVector, this.type) //Fallback
				} else {			
					let normalVector = unitVector(leftNormal(tempVector))
					if (forcedNormalFlip) normalVector = flipVector(normalVector)
					getPoints(currP, normalVector, this.type, 1)
				}			
			} 
			////
			
			// Middle Points
			else {
				let tempAngle = getApexAngle(prevP, currP, nextP, "degree")
				let v1 = unitVector(getVector(prevP, currP))
				let v2 = unitVector(getVector(nextP, currP))
				let sumV = addUnitVectors(v1, v2)
				if(tempAngle < cableModeChangerAngle) { 
					//Dar Açılı: Katlantılı Metot
					let normalVector = leftNormal(sumV)
					if (forcedNormalFlip) normalVector = flipVector(normalVector)
					getPoints(currP, normalVector, this.type, 1)
					forcedNormalFlip = !forcedNormalFlip
				} else { 

					//Geniş Açılı: Kırılmalı Metot
					let rotation = getRotation(prevP, currP, nextP)
					let rotationMult = rotation == "anticlockwise" ? -1 : 1
					if(isReallyClose(prevP, currP) || rotation == "collinear") {
						let realVector = getVector(prevP, currP)
						getFallbackPoints(this.drawingPoints[i - 1], realVector, this.type)  //Fallback
					} else {
						if (forcedNormalFlip) sumV = flipVector(sumV)
						let angle = convertAngle(tempAngle)
						let scaleFix = 1 / Math.sin(angle / 2) * rotationMult
						getPoints(currP, sumV, this.type, scaleFix)
					}
				}		
			}
			////
			this.drawingPoints.push(tempPoints)

		}
		//console.log(this.drawingPoints)
	}

	show() {
		//if(!debugMode) return
	
		if(this.isConnecting) {
			this.updatePoints();		
		}
		
		if(this.connectionPoints.length >= 2) {
			const litValues = this.lit.slice()
			const basePowerValues = this.basePower.slice()
			let cableWidth = cableBoldness[this.type] * camera.scale;
			if (this.highlight || this.connectionHighlight) cableWidth *= cableHighlightMult;
			let stripeWidth = cableWidth / this.type
			c.lineJoin = "round";
			c.lineCap  = "round";

			
			for(let p = 0; p < this.drawingPoints.length - 1; p++) {
				for(let t = 0; t < this.type; t++) {
					if(1) {
						c.beginPath()
						let startPoint = worldToScreen(this.drawingPoints[p][t].x, this.drawingPoints[p][t].y)
						let endPoint = worldToScreen(this.drawingPoints[p + 1][t].x, this.drawingPoints[p + 1][t].y)
						c.moveTo(startPoint.x, startPoint.y)
						c.lineTo(endPoint.x, endPoint.y)
						let color = this.getColor(litValues[this.type - 1 - t], basePowerValues[this.type - 1 - t]);
						c.strokeStyle = (t % 2 === 0) ? darkenRGBA(color, 0.02) : color;
						c.lineWidth = stripeWidth;
						c.stroke();
						c.closePath()
					}				
				}
			}
		}
 
		if(this.type == 1) {
			let arcPoint = null;
			if(this.connectionTypes.start.ObjectName == "Cable") {
				arcPoint = this.connectionPoints[0]
			}
			if(this.connectionTypes.end.ObjectName == "Cable") {
				arcPoint = last(this.connectionPoints)
			}
			if(arcPoint != null) {
				let scrnPoint = worldToScreen(arcPoint[0], arcPoint[1])
				c.beginPath()
				c.fillStyle = this.getColor(this.lit[0], this.basePower[0])
				c.arc(scrnPoint.x, scrnPoint.y, 6* camera.scale, 0, 360)
				c.fill()
				c.closePath()
			}			
		}

		//Draws the editting points
		if(this.editting) {
			for(let P = this.edittingPoints.length - 1; P >= 0; P--) {
				let p = this.edittingPoints[P]
				let scrPoints = worldToScreen(p.x, p.y)
				c.beginPath()
				c.fillStyle = "rgba(51, 21, 21, 1)"
				if(p.highlight) c.fillStyle = "rgba(242, 76, 76, 1)"
				c.arc(scrPoints.x, scrPoints.y, edittingPointRadius * camera.scale, 0, 360)
				c.lineWidth = 7 * camera.scale
				c.strokeStyle = "white"
				c.stroke()
				c.fill()
				c.closePath()
			}
			if(this.potentialPoint != null) {
				c.beginPath()
				let scrPoints = worldToScreen(this.potentialPoint.x, this.potentialPoint.y)
				c.fillStyle = "white"
				c.arc(scrPoints.x, scrPoints.y, cableBoldness[1]/2 * camera.scale, 0, 360)
				c.fill()
				c.closePath()
			}
		}
		
			
		
		//DEBUG
		if(0) {
			for(let i = 0; i < this.connectionPoints.length; i++) {
				c.fillStyle = "rgba(0,0,255,1)"
				c.beginPath()
				let screenPoints = worldToScreen(this.connectionPoints[i][0], this.connectionPoints[i][1])
				c.arc(screenPoints.x,screenPoints.y, 6, 0, 360);
				c.fill()
				c.closePath()
			}	
		}
		//	
	}
	preConnect() {
		
		let closestObject = null;
		let closestObjectDist = Infinity;
		let searchFrom;
		let tempConnectionPoint = last(this.connectionPoints).slice()
		let startName = this.connectionTypes.start.ObjectName
		let isBus = this.connectionTypes.start.isBus

		/// 6 different combination is possible
		if(!isBus) {
			if(startName == "Output") {
				searchFrom = inputs.filter(obj => obj.parentType == "gate" && obj.inputs.length == 0).concat(cables.filter(obj=> (obj.connectionTypes.start.isBus && obj.connectionTypes.end.isBus)))
			}
			if(startName == "Input") {
				searchFrom = outputs.filter(obj => obj.parentType == "gate").concat(cables.filter(obj => obj != this))
			}
			if(startName == "Cable") {
				searchFrom = inputs.filter(obj => obj.parentType == "gate" && obj.inputs.length == 0)
			}
		} else {
			if(startName == "Output" || startName == "Input") {
				//Only Allows PairPin
				let myPin
				if(startName == "Output") {
					myPin = decode(outputs, this.inputCode)
				} else {
					myPin = decode(inputs, this.outputCode)
				}
				let myBus = decode(busses, myPin.parentCode)
				let myPair = myBus.getPair()
				let myPairPin = myPair.getPin()
				searchFrom = [myPairPin]
			}
			if(startName == "Cable") {
				searchFrom = inputs.filter(obj => obj.parentType == "gate" && obj.inputs.length == 0).concat(outputs.filter(obj => obj.parentType == "gate"))
			}
		}

		for(let obj of searchFrom) {
			let distance;
			if(this.type == obj.type) {
				if(obj.ObjectName == "Cable") {
					let cableTest = cableHitboxTest(obj, "boolean")
					if(cableTest) {
						closestObject = obj
						break;
					}
				} else {	
					if(obj.type == 1) {
						distance = dist(tempConnectionPoint[0],tempConnectionPoint[1],obj.cableConnectionPoint.x,obj.cableConnectionPoint.y);
						distance = Math.abs(distance - IO_radius)
					}
					if(obj.type == 4 || obj.type == 8) {
						distance = closestDistPointToRect(obj.cableConnectionPoint.x, obj.cableConnectionPoint.y, obj.cableConnectionPoint.width, obj.cableConnectionPoint.height,tempConnectionPoint[0], tempConnectionPoint[1])
					}
					
					
					if(distance < autoConnectRadius) {
						// If input is in range of mouse checks whether it is occupied or not
						if(closestObjectDist > distance) {
							closestObjectDist = distance;
							closestObject = obj;
						}							
					}
				}
			}			
		}

		for(let c of cables) {
			if(c.connectionHighlight) {
				c.connectionHighlight = false
				c.updateDrawingPoints()
			}
		}

		for(let i of inputs) {
			i.connectionHighlight = false;
		}

		for(let o of outputs) {
			o.connectionHighlight = false;
		}

		if(closestObject != null) {
			closestObject.connectionHighlight = true;
			if(closestObject.ObjectName == "Cable") closestObject.updateDrawingPoints()
		}
	}

	connect() {
		let closestObject = null;
		for(let i of inputs) {
			if(i.connectionHighlight) {
				closestObject = i;	
			}
		}
		for(let o of outputs) {
			if(o.connectionHighlight) {
				closestObject = o;		
			}
		}
		for(let c of cables) {
			if(c.connectionHighlight) {
				closestObject = c;		
			}
		}
		
		//Connects to an input
		if(closestObject.ObjectName == "Input") {
			closestObject.inputs.push(this.code);
			this.outputCode = closestObject.code;
			last(this.connectionPoints)[0] = closestObject.cableConnectionPoint.x
			last(this.connectionPoints)[1] = closestObject.cableConnectionPoint.y

			this.connectionTypes.end.ObjectName = "Input"
			this.connectionTypes.end.isBus = closestObject.parentType == "bus"
		}

		//Connects to an output
		if(closestObject.ObjectName == "Output") {
			closestObject.outputs.push(this.code);
			
			last(this.connectionPoints)[0] = closestObject.cableConnectionPoint.x
			last(this.connectionPoints)[1] = closestObject.cableConnectionPoint.y

			if(this.connectionTypes.start.ObjectName == "Cable") { //This means bus cable connecting to an output
				this.outputCode = this.inputCode
				this.inputCode = closestObject.code
				//Changes the order 
				this.connectionTypes.start.ObjectName = "Output";
				this.connectionTypes.start.isBus = false;
				this.connectionTypes.end.ObjectName = "Cable";
				this.connectionTypes.end.isBus = true
				this.connectionPoints.reverse()
			} else {	
				this.inputCode = closestObject.code;
				this.connectionTypes.end.ObjectName = "Output"
				this.connectionTypes.end.isBus = closestObject.parentType == "bus"
			}	
		}

		//Connects to a cable
		if(closestObject.ObjectName == "Cable") {	
			let tempIndex = cableHitboxTest(closestObject, "array")
			let tempPoints = findClosestPointOnLine(closestObject, tempIndex)
			tempPoints.index = tempIndex
			tempPoints.realX = tempPoints.x
			tempPoints.realY = tempPoints.y
			closestObject.childs.push(this.code);
			closestObject.childAnchors.push(tempPoints)
			last(this.connectionPoints)[0] = tempPoints.x
			last(this.connectionPoints)[1] = tempPoints.y
			if(this.connectionTypes.start.ObjectName == "Output") {
				this.outputCode = closestObject.code
				this.connectionTypes.end.ObjectName = "Cable"
				this.connectionTypes.end.isBus = true
			}
			if(this.connectionTypes.start.ObjectName == "Input") {
				//Changes the order
				this.inputCode = closestObject.code
				this.connectionTypes.start.ObjectName = "Cable"
				this.connectionTypes.start.isBus = closestObject.connectionTypes.end.isBus &&  closestObject.connectionTypes.start.isBus
				this.connectionTypes.end.ObjectName = "Input"
				this.connectionTypes.end.isBus = false
				this.connectionPoints.reverse()
			}
		}

		closestObject.connectionHighlight = false;
		this.isConnecting = false;
		this.updatePoints();
	}
	
	delete(arrOutput = outputs, arrInput = inputs, cableArray = cables) {
		// When you find the temp(In/Out)puts it will search for cables code and deletes it
		let myAnchor;

		// Deletes the codes from cables inputs which is an output. Don't get confused!
		if(this.inputCode != null) {
			if(this.connectionTypes.start.ObjectName == "Output" || this.connectionTypes.start.ObjectName == "Input") {
				let tempInput = decode(arrOutput, this.inputCode);
				tempInput.outputs.splice(findIndex(tempInput.outputs, this.code), 1);
			}
			if(this.connectionTypes.start.ObjectName == "Cable") {
				let parentCable = decode(cableArray, this.inputCode)
				let tempIndex = findIndex(parentCable.childs, this.code)
				myAnchor = parentCable.childAnchors.splice(tempIndex, 1)
				parentCable.childs.splice(tempIndex, 1)
			}
		}

		for(let i of arrInput) {
			i.connectionHighlight = false;
		}

		for(let o of arrOutput) {
			o.connectionHighlight = false;
		}
		
		for(let c of cableArray) {
			c.connectionHighlight = false
		}

		// Check whether there is a output, if true then deletes the codes from cables outputs which is an input. Don't get confused!
		// Also unlits the input.
		if(this.outputCode != null) {
			if(this.connectionTypes.end.ObjectName == "Cable") {
				let parentCable = decode(cableArray, this.outputCode)
				let tempIndex = findIndex(parentCable.childs, this.code)
				parentCable.childAnchors.splice(tempIndex, 1)
				parentCable.childs.splice(tempIndex, 1)

				//Bus resetter
				let isBusCableHaveChild = false
				for(let c of parentCable.childs) {
					let tempCable = decode(cableArray, c)
					if(tempCable.connectionTypes.start.ObjectName != "Cable") {
						isBusCableHaveChild = true
						break;
					}
				}
				if(!isBusCableHaveChild) {
					parentCable.lit = Array(parentCable.type).fill(false);
					parentCable.isPowered =  Array(parentCable.type).fill(false);
					parentCable.basePower = Array(parentCable.type).fill(false);

					for(let c of parentCable.childs) {
						let tempCable = decode(cableArray, c)
						tempCable.lit = Array(parentCable.type).fill(false);
						tempCable.isPowered =  Array(parentCable.type).fill(false);
						tempCable.basePower = Array(parentCable.type).fill(false);
					}
				}
				///
			} else {
				let tempOutput = decode(arrInput, this.outputCode);
				tempOutput.lit = Array(tempOutput.type).fill(false);
				tempOutput.isPowered =  Array(tempOutput.type).fill(false);
				tempOutput.basePower = Array(tempOutput.type).fill(false);
				tempOutput.inputs.splice(findIndex(tempOutput.inputs, this.code), 1);	
			}			
		}

		for(let C = this.childs.length - 1; C >= 0; C--) {
			let c = this.childs[C]
			let tempCable = decode(cableArray, c) 
			if(this.connectionTypes.start.isBus && this.connectionTypes.end.isBus) {		
				tempCable.delete(arrOutput, arrInput, cableArray)
			} else {		
				let tempAnchor = this.childAnchors[C];
				//Creates the connection points
				if(this.connectionTypes.start.ObjectName == "Output") {	
					let tempOutput = decode(arrOutput, this.inputCode)
					for(let i = tempAnchor.index; i >= 0 ; i--) {
						tempCable.connectionPoints.unshift(this.connectionPoints[i])
					}
					tempOutput.outputs.push(tempCable.code)
					tempCable.inputCode = tempOutput.code
					tempCable.connectionTypes.start.ObjectName = "Output"	
				}
				if(this.connectionTypes.start.ObjectName == "Input") {
					let tempOutput = decode(arrOutput, this.inputCode)
					for(let i = tempAnchor.index + 1; i < this.connectionPoints.length; i++) {
						tempCable.connectionPoints.unshift(this.connectionPoints[i])
					}
					tempOutput.outputs.push(tempCable.code)
					tempCable.inputCode = tempOutput.code
					tempCable.connectionTypes.start.ObjectName = "Output"
				}
				if(this.connectionTypes.start.ObjectName == "Cable") {
					let parentCable = decode(cableArray, this.inputCode)
					for(let i = tempAnchor.index; i >= 0; i--) {
						tempCable.connectionPoints.unshift(this.connectionPoints[i])
					}
					tempCable.inputCode = parentCable.code
					parentCable.childs.push(tempCable.code)
					parentCable.childAnchors.push(myAnchor.slice()[0])
				}
				tempCable.updateDrawingPoints();
			}
		}


		// Deletes itself from "cables" array
		if(findIndex(cableArray, this) != null) {
			cableArray.splice(findIndex(cableArray, this), 1);
		}


		rewriteUsedCodes();

		//currentFile.save()
	}
	transfer(arrOutput = outputs, arrInput = inputs, cableArray = cables) {
		//console.log(findIndex(cableArray, this))

		//if(this.isConnecting) return
		// Transfers the energy
		let tempInput = null;
		let tempOutput = null;
		if(!(this.connectionTypes.start.isBus && this.connectionTypes.end.isBus)) {
			if(this.inputCode != null) {
				if(this.connectionTypes.start.ObjectName == "Output" || this.connectionTypes.start.ObjectName == "Input") {
					tempInput = decode(arrOutput, this.inputCode); 
					this.lit = tempInput.lit.slice()
					this.basePower = tempInput.basePower.slice()
					this.isPowered = tempInput.isPowered.slice();
				}
				
				if(this.connectionTypes.start.ObjectName == "Cable") {
					tempInput = decode(cableArray, this.inputCode);
					this.lit = tempInput.lit.slice()
					this.basePower = tempInput.basePower.slice()
					this.isPowered = tempInput.isPowered.slice();
				}	
			}
		
			if(this.outputCode != null && this.inputCode != null) {
				if(this.connectionTypes.end.isBus) {
					//Make the bus cable tranfer
					tempOutput = decode(cableArray, this.outputCode)
					tempOutput.transfer(arrOutput, arrInput, cableArray)
				} else {
					tempOutput = decode(arrInput, this.outputCode);
					tempOutput.lit = tempInput.lit.slice();
					tempOutput.isPowered = tempInput.isPowered.slice();
					tempOutput.basePower = tempInput.basePower.slice();	
				}		
			}
			for(let c of this.childs) {
				let childCable = decode(cableArray, c)	
				childCable.transfer(arrOutput, arrInput, cableArray)
			}
		} else {
			
			//Bus Cable Transfer
			let tempLits = []
			let tempIsPowered = []
			for(let c of this.childs) {
				let childCable = decode(cableArray, c)
				if(childCable.connectionTypes.start.ObjectName == "Input" || childCable.connectionTypes.start.ObjectName == "Output") {			
					for(let t = 0; t < this.type; t++) {
						tempLits.push([])
						tempIsPowered.push([])
						if(childCable.basePower[t]) {
							tempLits[t].push(childCable.lit[t])
							tempIsPowered[t].push(childCable.isPowered[t])
						}
					}
				}
			}

			for(let t = 0; t < this.type; t++) {
				if(tempLits[t].length == 0) {
					this.lit[t] = false
					this.isPowered[t] = false
					this.basePower[t] = false
				} else {
					let chosenIndex = getRandomNumber(0, tempLits[t].length - 1)
					this.lit[t] = tempLits[t][chosenIndex]
					this.isPowered[t] = tempIsPowered[t][chosenIndex]
					this.basePower[t] = true
				}			
			}

			for(let c of this.childs) {
				let childCable = decode(cableArray, c)	
				if(childCable.connectionTypes.start.ObjectName == "Cable") {
					childCable.transfer(arrOutput, arrInput, cableArray)
				}
			}
		}	
	}
	enterEditMode() {
		mouseOccupation = "cableEditting"
		this.editting = true;
		edittingCable = this
		this.edittingPoints = []
		if(this.connectionTypes.start.ObjectName == "Cable") this.edittingPoints.push({x: this.connectionPoints[0][0], y: this.connectionPoints[0][1], bond: decode(cables, this.inputCode), highlight: false, moving: false, index: 0})
		for(let i = 1; i < this.connectionPoints.length - 1; i++) {
			this.edittingPoints.push({x: this.connectionPoints[i][0], y: this.connectionPoints[i][1], bond: this, highlight: false, moving: false, index: i})
		}
		if(this.connectionTypes.end.ObjectName == "Cable") this.edittingPoints.push({x: last(this.connectionPoints)[0], y: last(this.connectionPoints)[1], bond: decode(cables, this.outputCode), highlight: false, moving: false, index: this.connectionPoints.length - 1})
	}

	static fastConnect(output, input, type, isBus = false) {
		// Creates a new cable starts at a given output and ends at a given input.

		if(output != null && input != null) {
			if(input.inputs.length == 0) {
				let x1 = output.cableConnectionPoint.x;
				let x2 = input.cableConnectionPoint.x;
				let newCable = new Cable(x1, output.y, x2, input.y, output.code, input.code, type);
				output.outputs.push(newCable.code);
				input.inputs.push(newCable.code);
				newCable.colorMode = output.colorMode
				

				newCable.connectionTypes.start.ObjectName = "Output"
				newCable.connectionTypes.start.isBus = isBus
				newCable.connectionTypes.end.ObjectName = "Input"
				newCable.connectionTypes.end.isBus = isBus

				newCable.updateDrawingPoints();
				return newCable
			} else {
				console.log("Hata FastConnect! Input boş değil");
			}
		} else {
			console.log("Hata! FastConnect, input veya output \"null\" olamaz");
			console.log(output, input);
		}
	}
}


function addUnitVectors(u, v) {
  const sum = { x: u.x + v.x, y: u.y + v.y };
  return unitVector(sum)
}

function unitVector(v) {
  const length = Math.sqrt(v.x * v.x + v.y * v.y);
  if (length === 0) return { x: 0, y: 0 }; // sıfır vektör kontrolü
  return {
    x: v.x / length,
    y: v.y / length
  };
}

function getVector(p1, p2) {
  return {
    x: p2.x - p1.x,
    y: p2.y - p1.y
  };
}

function leftNormal(v) {
  return { x: -v.y, y: v.x };  // counter-clockwise (sol normal)
}

function scaleVector(v, s) {
  return {
    x: v.x * s,
    y: v.y * s
  };
}

function flipVector(v) {
	return {x: -v.x, y: -v.y}
}


function getRotation(prev, curr, next) {
	// Vektörleri oluştur
	const v1 = { x: curr.x - prev.x, y: curr.y - prev.y }; // prev → curr
	const v2 = { x: next.x - curr.x, y: next.y - curr.y }; // curr → next

	// 2D cross product z bileşeni
	const crossZ = v1.x * v2.y - v1.y * v2.x;

	if (crossZ > 0) return "anticlockwise";
	else if (crossZ < 0) return "clockwise";
	else return "collinear"; // aynı doğrultudalar
}

function getApexAngle(A, B, C, unit = "degree") {

	const BA = { x: A.x - B.x, y: A.y - B.y };
	const BC = { x: C.x - B.x, y: C.y - B.y };

	if(Math.hypot(BA.x, BA.y) < eps || Math.hypot(BC.x, BC.y) < eps) {	
		return 0 /// ???
	}

	// Nokta çarpımı
	const dot = BA.x * BC.x + BA.y * BC.y;

	// Uzunluklar
	const magBA = Math.hypot(BA.x, BA.y);
	const magBC = Math.hypot(BC.x, BC.y);

	// Açı (radyan)
	const angleRad = Math.acos(clamp(dot / (magBA * magBC), -1, 1));
	if(unit == "radian") return angleRad
	if(unit == "degree") return angleDeg = angleRad * (180 / Math.PI);
}

function convertAngle(angle) {
    return angle * (Math.PI / 180);
}

function turnObject(arr) {
	return {x: arr[0], y: arr[1]}
}

function vectorLength(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

function vectorProjection(v1, v2) {
	let scaler = dotProduct(v1, v2) / (vectorLength(v1) ** 2)
	return {x: v1.x*scaler, y: v1.y* scaler}
}