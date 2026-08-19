// Mouse Click
let mouseOccupation = "nothing";
let mouseX = 0, mouseY = 0, mouseStartX = 0, mouseStartY = 0, mouseScreenX = 0, mouseScreenY = 0
let changingStartValues = {x: null, y: null}
let isHitboxColided = false
let justCreatedCable = false

window.addEventListener("click", (event) => {
	if (audioCtx.state === "suspended") {
		console.log("AUDIO STARTED");
        audioCtx.resume();
    }

	if(screen == 0) {

		// Main Output On/Off Switch
		if(mouseOccupation == "nothing" && currentPage == -1) {
			Loop1: for(let O = outputs.length-1; O >= 0; O--) {
				let o = outputs[O]
				if(o.switchHighlight != null) {
					o.lit[o.switchHighlight] = !o.lit[o.switchHighlight]
				}
			}
		}
		
		if(!newClickedForHighlight) {
			//Normal moving release
			if(mouseOccupation != "objectCreating") {
				if(highlightedObjects.length > 0) {
					for(let g of gates) {
						if(isHitboxColided && g.moving) {
							g.move(g.latestSavedPosition.x - g.x, g.latestSavedPosition.y - g.y)
						}
						g.highlight = false
						Splice(highlightedObjects, g)		
						g.moving = false			
					}
					for(let d of displays) {
						if(isHitboxColided && d.moving) {
							d.move(d.latestSavedPosition.x - d.x, d.latestSavedPosition.y - d.y)
						}
						d.highlight = false
						Splice(highlightedObjects, d)		
						d.moving = false
						
					}
					for(let i of inputs) {
						if(isHitboxColided && i.parentCode == null && i.moving) {
							i.move(i.latestSavedPosition.x - i.x, i.latestSavedPosition.y - i.y)
						}
						i.highlight = false
						Splice(highlightedObjects, i)		
						i.moving = false		
					}
					for(let o of outputs) {
						if(isHitboxColided && o.parentCode == null && o.moving) {
							o.move(o.latestSavedPosition.x - o.x, o.latestSavedPosition.y - o.y)
						}
						o.highlight = false
						Splice(highlightedObjects, o)		
						o.moving = false
					}
					for(let b of busses) {
						if(isHitboxColided && b.moving) {
							b.move(b.latestSavedPosition.x - b.x, b.latestSavedPosition.y - b.y)
						}
						b.highlight = false
						Splice(highlightedObjects, b)		
						b.moving = false
					}
					if(mouseOccupation != "cableCreating") mouseOccupation = "nothing"
				}		
			}			
		}


		//Creates the objects 
		if(mouseOccupation == "objectCreating" && !newClickedForObjectCreating && !isHitboxColided) {
			for(let Obj = creatingObjects.length - 1; Obj >= 0; Obj--) {
				let obj = creatingObjects[Obj];
				if(creatingObjectType == gates) {
					gates.push(new Gate(obj.x, obj.y, obj.name))
				} 
				if(creatingObjectType == displays) {
					displays.push(new Display(obj.x, obj.y, obj.name))
				}
				if(creatingObjectType == inputs) {
					inputs.push(new Input(obj.x, obj.y, null, obj.type))				
				}
				if(creatingObjectType == outputs) {
					outputs.push(new Output(obj.x, obj.y, null, obj.type))				
				}
				if(creatingObjectType == busses) {
					busses.push(new Bus(obj.x, obj.y, obj.type, obj.direction))
					if(busses.length % 2 == 0) Bus.connectPair()	
				}
			}

			swapLastNWithBeforeInPlace(creatingObjectType, creatingObjects.length)
			
			if(!shiftKeyActive) cancelObjectCreating()
		}	
	}

	if(screen == 7) {
		if(!newClickedForObjectCreating) {
			for(let d of customizeDisplays) {	
				d.moving = false	
			}
			mouseOccupation = "nothing"
		}	
	}
	
	

	newClickedForHighlight = false;
	newClickedForTag = false;
	newClickedForObjectCreating = false;
	newClickedForCableCreating = false;
})

let clickCounterForHighlight = 0

let clickedOnGate = false;
let clickedOnDisplay = false;



window.addEventListener("mousedown", (event) => {
	// Mousedown event
	if(event.button == 0) {
		isMouseDown = true;
		if(screen == 0) {

			

			//Checks for using the contextMenu
			if(mouseOccupation == "contextSelecting" || mouseOccupation == "objectCreating" || mouseOccupation == "nothing") {
				for(let m of contextMenus) {
					for(let b of m.buttons) {
						if(b.highlight && b.isActive) {
							b.clickFunction();
						}
					}
				}
			}
	
			// Deletes the contextMenus
			if(deleteContextMenus()) {
				return
			}
				
			// Checks every button if it is in the certain boundary creates a gate from its name
			if(mouseOccupation == "nothing" || mouseOccupation == "objectCreating") {
				//Passes the "Menu" button
				for(let B = 0; B < buttons.length; B++) {
					let b = buttons[B];
					if(b.highlight) {
						b.clickFunction();
						newClickedForHighlight = true;
					}				
				}
			}
	
			// Checks mouse against every output and input if there selects the object and creates a cable from it
			if(mouseOccupation == "nothing" && currentPage == -1) {
				for(let O = outputs.length - 1; O >= 0; O--) {
					let o = outputs[O];
					let onCableCreatingPoint = false;
					if(o.type == "1") {
						onCableCreatingPoint = isInCircle(o.cableConnectionPoint.x, o.cableConnectionPoint.y, mouseX, mouseY, IO_radius)
					}
					if(o.type == "4" || o.type == "8") {
						onCableCreatingPoint = isInRect(o.cableConnectionPoint.x, o.cableConnectionPoint.y, o.cableConnectionPoint.width, o.cableConnectionPoint.height,mouseX, mouseY, "center")
					}
					if(onCableCreatingPoint) {
						mouseOccupation = "cableCreating";
						let cable;
						

						cable = new Cable(o.cableConnectionPoint.x, o.cableConnectionPoint.y, null, null, o.code, null, o.type);					
						cable.connectionTypes.start.ObjectName = "Output"
						cable.connectionTypes.start.isBus = o.parentType == "bus"
						cable.colorMode = o.colorMode
						cable.isConnecting = true;
						cables.unshift(cable);
						o.outputs.push(cable.code);
						justCreatedCable = true
						break;
					}
				} 
			}

			if(mouseOccupation == "nothing" && currentPage == -1) {
				for(let I = inputs.length - 1; I >= 0; I--) {
					let i = inputs[I];
					let onCableCreatingPoint = false;
					if(i.type == "1") {
						onCableCreatingPoint = isInCircle(i.cableConnectionPoint.x, i.cableConnectionPoint.y, mouseX, mouseY, IO_radius)
					}
					if(i.type == "4" || i.type == "8") {
						onCableCreatingPoint = isInRect(i.cableConnectionPoint.x, i.cableConnectionPoint.y, i.cableConnectionPoint.width, i.cableConnectionPoint.height,mouseX, mouseY, "center")
					}
					if(onCableCreatingPoint) {
						mouseOccupation = "cableCreating";
						let cable;
						cable = new Cable(i.cableConnectionPoint.x, i.cableConnectionPoint.y, null, null, null, i.code, i.type);		
						cable.connectionTypes.start.ObjectName = "Input"
						cable.connectionTypes.start.isBus = i.parentType == "bus"
						cable.colorMode = i.colorMode
						cable.isConnecting = true;
						cables.unshift(cable);
						i.inputs.push(cable.code);
						justCreatedCable = true
						break;
					}
				} 
			}

			if(1) {
				// Checks mouse against every output and input if there selects the object and creates a cable from it
				if(mouseOccupation == "nothing" && currentPage == -1) {
					for(let C = cables.length - 1; C >= 0; C--) {
						let c = cables[C];
						if(c.highlight && !newClickedForCableCreating) {
							let tempIndex = cableHitboxTest(c, "array")
							mouseOccupation = "cableCreating";

							//Removes the highlight from the previous one
							c.highlight = false;
							c.updateDrawingPoints()
							let tempCable = cables.splice(C, 1);
							cables.splice(highlightedCablesOldIndex, 0, ...tempCable)
							highlightedCablesOldIndex = null;
							//

							let cable;
							let tempPoints = findClosestPointOnLine(c, tempIndex)
							tempPoints.index = tempIndex
							tempPoints.realX = tempPoints.x
							tempPoints.realY = tempPoints.y
							c.childAnchors.push(tempPoints)
							
							cable = new Cable(tempPoints.x, tempPoints.y, null, null, c.code, null, c.type);					
							cable.connectionTypes.start.ObjectName = "Cable"
							cable.connectionTypes.start.isBus = c.connectionTypes.start.isBus && c.connectionTypes.end.isBus
							cable.colorMode = c.colorMode
							cable.isConnecting = true;
							cables.unshift(cable);
							c.childs.push(cable.code);
							justCreatedCable = true
							break;
						}
					} 
				}
			}	
	
			
	
			// Checks mouse if it is in "gate creating area" boundary and start moving it
			if(mouseOccupation == "nothing" && between(mouseScreenX,buttons[0].width + spaceBetweenEveryButton*2,canvas.width-10) && between(mouseScreenY, gateCreatingAreaMetrics.y, gateCreatingAreaMetrics.y + gateCreatingAreaMetrics.height)) {
				let isHighlighted = false;
				for(let b of buttons) {
					if(b.highlight) {
						isHighlighted = true;
					}
				}
				if(!isHighlighted) {
					mouseOccupation = "boxMoving" 		
				}
			}

			// Checks every gate whether it is clicked or not
			if(mouseOccupation == "nothing") {
				for(let i = gates.length - 1; i >= 0; i--) {
					g = gates[i]
					if(isInRect(g.x, g.y, g.width, g.height, mouseX, mouseY, "center")) {
						if(!controlKeyActive) {
							mouseOccupation = "objectMoving";
							g.moving = true;
							for(h of highlightedObjects) {
								h.moving = true;
							}
						}		
						g.highlight = true;
						if(!include(highlightedObjects, g)) {
							highlightedObjects.push(g);
						}
						newClickedForHighlight = true;
						break;
					}
				}
			}

			// Checks every display whether it is clicked or not
			if(mouseOccupation == "nothing") {
				for(let i = displays.length - 1; i >= 0; i--) {
					d = displays[i]
					if(d.parentCode == null && isInRect(d.x, d.y, d.width, d.height, mouseX, mouseY, "center")) {
						if(!controlKeyActive) {
							mouseOccupation = "objectMoving";
							d.moving = true;
							for(h of highlightedObjects) {
								h.moving = true;
							}
						}
						d.highlight = true;
						if(!include(highlightedObjects, d)) {
							highlightedObjects.push(d);
						}
						newClickedForHighlight = true;
						break;
					}
				}
			}

			//Checks mouse if it is on the busses and start moving it
			if(mouseOccupation == "nothing") {
				for(let i = busses.length - 1; i >= 0; i--) {
					b = busses[i]
					if(b.parentCode == null && isInRect(b.x, b.y, b.width, b.height, mouseX, mouseY, "center")) {
						if(!controlKeyActive) {
							mouseOccupation = "objectMoving";
							b.moving = true;
							for(h of highlightedObjects) {
								h.moving = true;
							}
						}
						b.highlight = true;
						if(!include(highlightedObjects, b)) {
							highlightedObjects.push(b);
						}
						newClickedForHighlight = true;
						break;
					}
				}
			}

	
			//Checks mouse if it is on the (In/Out)puts and start moving it
			if(mouseOccupation == "nothing") {
				for(let o = outputs.length - 1; o >= 0; o--) {
					if(outputs[o].moveablePartHighlight) {
						if(!controlKeyActive || outputs[o].highlight) {
							mouseOccupation = "objectMoving";
							outputs[o].moving = true;
							for(let h of highlightedObjects) {
								h.moving = true
							}
						}
						
						outputs[o].highlight = true;
						if(!include(highlightedObjects, outputs[o])) {
							highlightedObjects.push(outputs[o])
						}
						
						newClickedForHighlight = true
						break;
					}
				}
				for(let i = inputs.length - 1; i >= 0; i--) {
					if(inputs[i].moveablePartHighlight) {
						if(!controlKeyActive || inputs[i].highlight) {
							mouseOccupation = "objectMoving";
							inputs[i].moving = true;
							for(let h of highlightedObjects) {
								h.moving = true
							}
						}
						
						inputs[i].highlight = true;		
						if(!include(highlightedObjects, inputs[i])) {
							highlightedObjects.push(inputs[i])
						}
						
						newClickedForHighlight = true
						break;
					}
				}
			}

			//Cable edittingPoints move
			if(mouseOccupation == "cableEditting") {
				let didSomething = false
				for(let p of edittingCable.edittingPoints) {
					if(p.highlight) {
						p.moving = true
						didSomething = true
					}
				}
				let tempP = edittingCable.potentialPoint
				if(tempP != null) {
					//console.log(tempP)
					for(let i = 0; i < edittingCable.edittingPoints.length; i++) {
						if(edittingCable.edittingPoints[i].index >= tempP.index + 1) edittingCable.edittingPoints[i].index++
					}
					edittingCable.connectionPoints.splice(tempP.index + 1, 0, [tempP.x, tempP.y])
					edittingCable.edittingPoints.splice(tempP.index + 1, 0, {x: tempP.x, y:tempP.y, bond: edittingCable, highlight: false, moving: false, index: tempP.index + 1})
					
					tempP = null
					didSomething = true
					edittingCable.updateDrawingPoints();
				}

				if(!didSomething) {
					// Cancels the cableEditting 
					edittingCable.editting = false
					edittingCable.edittingPoints = []
					edittingCable = null
					mouseOccupation = "nothing"
				}
			}

			// Either creates a connectionPoint or connects it
			if(mouseOccupation == "cableCreating" && !justCreatedCable) {
				let isHighlighted = false;

				for(let i of inputs) {
					if(i.connectionHighlight) {
						isHighlighted = true;
					}
				}

				for(let o of outputs) {
					if(o.connectionHighlight) {
						isHighlighted = true;
					}
				}

				for(let c of cables) {
					if(c.connectionHighlight) {
						isHighlighted = true;
					}
				}

				let tempCable = cables[0];
				if(isHighlighted) {
					tempCable.connect();
					mouseOccupation = "nothing";
					newClickedForCableCreating = true;

				} else {
					
					//Tests if it is too close, if so do not create
					if(tempCable.connectionPoints.length > 2) {
						let tempP = tempCable.connectionPoints[(tempCable.connectionPoints.length - 2)]
						if(!(Math.abs(tempP[0] - mouseX) < eps && Math.abs(tempP[1] - mouseY) < eps)) {
							tempCable.connectionPoints.push([mouseX,mouseY])
						}	
					} else {
						tempCable.connectionPoints.push([mouseX, mouseY])	
					}								
				}
			}
			justCreatedCable = false


			//If nothing has happened yet, select an area
			let allObjectThatHaveHitboxs = getAllObjectsThatHaveHitboxs()
			let isOnSomething = false
			for(let obj of allObjectThatHaveHitboxs) {
				if(rectHitboxCollision(obj.hitbox, {x: mouseX, y: mouseY, w:0, h:0})) {
					isOnSomething = true
					break;
				}
			}
			if(mouseOccupation == "nothing" && !isOnSomething) {
				selectedArea.x = mouseScreenX
				selectedArea.y = mouseScreenY
				mouseOccupation = "areaSelecting"
			}
	
			
			
		} else if(screen == 2) {
			for(let b of saveScreenButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}
		} else if(screen == 3) {
			for(let b of buttons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}
		} else if(screen == 4) {
			for(let b of buttons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}
		}
		else if(screen == 5) {
			let myWheels = getWheel(["starred", "collection"])
			for(w of myWheels) {
				if(w.highlight) {
					mouseOccupation = "wheelMoving"
					w.moving = true
				}
			}
			if(mouseOccupation == "nothing") {
				for(let b of libraryButtons) {
					if(b.highlight) {
						b.clickFunction();
					}
				}
			}
		} else if(screen == 6) {
			for(let b of confirmButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}
		} else if(screen == 7) {

			//Wheel Move Start
			if(getWheel("customize").highlight) {
				mouseOccupation = "wheelMoving"
				getWheel("customize").moving = true
			}
			
			//Scaler Move Start
			if(mouseOccupation == "nothing") {
				for(let d of customizeDisplays) {
					for(let s of d.scalers) {
						if(s.highlight) {
							s.moving = true;
							mouseOccupation = "scalerMoving"
						}
					}
				}
			}

			if(mouseOccupation == "nothing") {
				for(let i = customizeDisplays.length - 1; i >= 0; i--) {
					d = customizeDisplays[i]
					if(isInRect(d.x, d.y, d.framelessWidth_World, d.framelessHeight_World, mouseX, mouseY, "center")) {
						mouseOccupation = "objectMoving";
						d.moving = true;
						newClickedForObjectCreating = true	
					}
				}
			}

			
			

			if(mouseOccupation == "nothing") {
				for(let tri of customizingTriangles) {
					if(tri.highlight) {
						tri.moving = true
						mouseOccupation = "triPressed"
					}
				}
			}	

			for(let b of customizeScreenButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}
			for(let cb of checkboxs) {
				if(between(mouseScreenX, cb.x, cb.x + cb.s) && between(mouseScreenY, cb.y, cb.y + cb.s)) {
					if(cb.accessible) {
						cb.isActive = !cb.isActive;
					}			
				}
			}
		} else if(screen == 8) {
			for(let b of pulseEditButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}
		} else if(screen == 9) {
			for(let b of findButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}

			//Wheel Move Start
			if(getWheel("find").highlight) {
				mouseOccupation = "wheelMoving"
				getWheel("find").moving = true
			}
		} else if (screen == 10) {
			for(let b of rebindButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}
		}
		 else if (screen == 11) {
			for(let b of ROMButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}

			//Wheel Move Start
			if(getWheel("rom").highlight) {
				mouseOccupation = "wheelMoving"
				getWheel("rom").moving = true
			}
		}
		 else if (screen == 12) {
			for(let b of quitButtons) {
				if(b.highlight) {
					b.clickFunction();
				}
			}

			//Wheel Move Start
			if(getWheel("quit").highlight) {
				mouseOccupation = "wheelMoving"
				getWheel("quit").moving = true
			}
		}
	} else if(event.button == 1) {
		isMouseMiddleDown = true;
		deleteContextMenus()
	}
})


// Mouseup event
window.addEventListener("mouseup", () => {
	isMouseDown = false;
	isMouseMiddleDown = false
	for(let g of gates) {
		if(!include(highlightedObjects, g)) {
			// g.highlight = false;
			// g.moving = false
		}
	}
	for(let d of displays) {
		if(!include(highlightedObjects, d)) {
			// d.moving = false
			// d.highlight = false
		}
	}
	for(let o of outputs) {
		if(o.parentCode == null) {
			if(!include(highlightedObjects, o)) {
				// o.moving = false;
				// o.highlight = false
			}
		}
	}
	for(let i of inputs) {
		if(i.parentCode == null) {
			if(!include(highlightedObjects, i)) {
				// i.moving = false;
				// i.highlight = false
			}
		}
	}

	if(mouseOccupation == "cableEditting") {
		for(let p of edittingCable.edittingPoints) {
			p.moving = false
		}
	}

	if(mouseOccupation == "areaSelecting") {
		let allObjectThatHaveHitboxs = getAllObjectsThatHaveHitboxs()
		for(let h of highlightedObjects) {
			h.highlight = false
		}
		highlightedObjects = []
		for(let obj of allObjectThatHaveHitboxs) {
			let worldSelection = {x: screenToWorld(selectedArea.x, selectedArea.y).x, y: screenToWorld(selectedArea.x, selectedArea.y).y, w: selectedArea.w / camera.scale, h: selectedArea.h / camera.scale}
			if(rectHitboxCollision(obj.hitbox, worldSelection)) {
				highlightedObjects.push(obj)
				obj.highlight = true
				newClickedForHighlight = true
			}
		}
	}
	
	if(mouseOccupation != "cableCreating" && mouseOccupation != "contextSelecting" &&  mouseOccupation != "objectCreating" && mouseOccupation != "objectMoving" && mouseOccupation != "cableEditting") {
		mouseOccupation = "nothing"
	}
	if(screen == 5) {
		wheels.forEach((obj)=>obj.moving=false)
	}
	if(screen == 7) {
		wheels.forEach((obj)=>obj.moving=false)

		for(let tri of customizingTriangles) {
			tri.moving = false
		}

		for(let d of customizeDisplays) {
			for(let s of d.scalers) {
				s.moving = false
			}
		}
	}
	if(screen == 9) {
		wheels.forEach((obj)=>obj.moving=false)
	}
	if(screen == 11) {
		wheels.forEach((obj)=>obj.moving=false)
	}
	if(screen == 12) {
		wheels.forEach((obj)=>obj.moving=false)
	}
})




function setChangingStartValues(x, y) {
	changingStartValues.x = x;
	changingStartValues.y = y;
}



function handleMouseMoving() {
	if(0) {
		log(isMouseMiddleDown, 1)
	}


	if(screen == 0) {

		//If mouse is currently on a contextMenu highlight the context
		for(let m of contextMenus) {
			if(mouseOccupation != "objectCreating") {
				if(between(mouseScreenX, m.x, m.x + m.width) && between(mouseScreenY, m.y,m.y + m.height)) {
					mouseOccupation = "contextSelecting";
				} else if(mouseOccupation == "contextSelecting") {
					mouseOccupation = "nothing";
				}
			}
			for(let b of m.buttons) {
				b.highlight = false
			}
		}

		//Higlighting
		Loop1: for(let CM = contextMenus.length -1 ; CM >= 0; CM--) {
			let cm = contextMenus[CM] 
			for(let b of cm.buttons) {
				if(b.isOnButton() && b.isActive) {
					if(cm.buttonStyles == "childObjectCreatingButton") {
						if(creatingObjectType == outputs) {
							if(b.name == "IN-1" || b.name == "IN-4" || b.name == "IN-8") {
								b.highlight = true
								break Loop1;
							}
						}
						if(creatingObjectType == inputs) {
							if(b.name == "OUT-1" || b.name == "OUT-4" || b.name =="OUT-8") {
								b.highlight = true
								break Loop1;
							}
						}
						if(creatingObjectType == busses) {
							if(b.name == "BUS-1" || b.name == "BUS-4" || b.name == "BUS-8") {
								b.highlight = true
								break Loop1;
							}
						}
						if(creatingObjectType == gates || creatingObjectType == displays) {
							if(b.name == creatingObjects[0].name) {
								b.highlight = true;
								break Loop1;
							}
						}
						if(creatingObjectType == null) {
							b.highlight = true
							break Loop1;
						}	
					} else {
						b.highlight = true
						break Loop1;
					}		
				}
			}
		}
		
	
		// If mouse is currently on a button & not on a gate & not on a cable, highlight it
		for(let b of buttons) {
			b.highlight = false;
		}
		let isButtonHighlighted = false
		if(mouseOccupation == "nothing" || mouseOccupation == "objectCreating") {
			 for(let b of buttons) {
				if(b.isActive) {
					let isOverOnGate = false
					let isOverOnCable = false
					let isOverOnDisplay = false;
					let isOverOnPut = false;
					let isOverOnBus = false
					for(let g of gates) {
						if((g.moving && g.name != b.name)) {
							isOverOnGate = true;
							break;
						}
					}
					for(let d of displays) {
						if((d.moving && b.name != d.name)) {
							isOverOnDisplay = true;
							break;
						}
					}
					for(let c of cables) {
						if(c.highlight) {
							isOverOnCable = true
							break;
						}
					}
					for(let i of inputs) {
						if(i.moving && !(b.name == "OUT-1" || b.name == "OUT-4" || b.name =="OUT-8")) {
							isOverOnPut = true
							break;
						}
					}
					for(let o of outputs) {
						if(o.moving && !(b.name == "IN-1" || b.name == "IN-4" || b.name == "IN-8")) {
							isOverOnPut = true
							break;
						}
					}
					for(let b of busses) {
						if(b.moving && !(b.name == "BUS-1" || b.name == "BUS-4" || b.name == "BUS-8")) {
							isOverOnBus = true
							break;
						}
					}
					if(!isOverOnGate && !isOverOnCable && !isOverOnDisplay && !isOverOnPut && !isOverOnBus) {
						if(b.isOnButton()) {
							b.highlight = true;
							isButtonHighlighted = true
							break;
						}
					}
				}
			}
		}



		//If mouse hovers on in/outputs highlight them
		let anyPutHighlighted = false
		for(let o of outputs) {
			o.hoverHighlight = false
		}
		for(let i of inputs) {
			i.hoverHighlight = false
		}

		if(mouseOccupation == "nothing" && !isButtonHighlighted) {
			for(let O = outputs.length - 1; O >= 0; O--) {
				let o = outputs[O]
				if(o.type == 1) {
					if(isInCircle(o.cableConnectionPoint.x, o.cableConnectionPoint.y, mouseX, mouseY, o.cableConnectionPoint.radius)) {
						anyPutHighlighted = true
						o.hoverHighlight = true
						break;
					}
				}
				if(o.type == 4 || o.type == 8) {
					if(isInRect(o.cableConnectionPoint.x, o.cableConnectionPoint.y, o.cableConnectionPoint.width, o.cableConnectionPoint.height, mouseX, mouseY, "center")) {
						anyPutHighlighted = true
						o.hoverHighlight = true
						break;
					}
				}	
			}
			if(!anyPutHighlighted) {
				for(let I = inputs.length - 1; I >= 0; I--) {
					let i = inputs[I]
					if(i.type == 1) {
						if(isInCircle(i.cableConnectionPoint.x, i.cableConnectionPoint.y, mouseX, mouseY, i.cableConnectionPoint.radius)) {
							anyPutHighlighted = true
							i.hoverHighlight = true
							break;
						}
					}
					if(i.type == 4 || i.type == 8) {
						if(isInRect(i.cableConnectionPoint.x, i.cableConnectionPoint.y, i.cableConnectionPoint.width, i.cableConnectionPoint.height, mouseX, mouseY, "center")) {
							anyPutHighlighted = true
							i.hoverHighlight = true
							break;
						}
					}	
				}
			}	
		}
		//

		//If mouse hovers on in/outputs highlight them
		for(let o of outputs) {
			o.switchHighlight = null;
		}

		if(mouseOccupation == "nothing" && !isButtonHighlighted && !anyPutHighlighted) {
			loop1: for(let O = outputs.length - 1; O >= 0; O--) {
				let o = outputs[O]
				if(o.parentCode == null) {
					if(o.type == 1) {
						if(isInCircle(o.switchPoints[0].x, o.switchPoints[0].y, mouseX, mouseY, bigIO_radius)) {
							o.switchHighlight = 0;
							anyPutHighlighted = true
							break;
						}
					}
					if(o.type == 4 || o.type == 8) {
						for(let t = 0; t < o.type; t++) {
							if(isInRect(o.switchPoints[t].x, o.switchPoints[t].y, o.switchPoints[t].width, o.switchPoints[t].height, mouseX, mouseY, "center")) {
								o.switchHighlight = t;
								anyPutHighlighted = true
								break loop1;
							}
						}					
					}	
				}		
			}
		}
		//

		
		
		// If mouse is currently on a cable, highlight it 
		if(currentPage == -1 && !isButtonHighlighted && mouseOccupation != "cableEditting") {
			for(let C = cables.length - 1; C >= 0; C--) {
				let c = cables[C];
				let isHoverOnGate = false;
				let isHoverOnPuts = false;
				for(let g of gates) {
					if(isInRect(g.x, g.y, g.width, g.height, mouseX, mouseY, "center")) {
						isHoverOnGate = true;
					}
				}
				for(let i of inputs) {
					if(i.type == 1) {
						if(isInCircle(i.cableConnectionPoint.x, i.cableConnectionPoint.y, mouseX, mouseY, i.cableConnectionPoint.radius)) {
							isHoverOnPuts = true;
						}
					}
					if(i.type == 4 || i.type == 8) {
						if(isInRect(i.cableConnectionPoint.x, i.cableConnectionPoint.y, i.cableConnectionPoint.width, i.cableConnectionPoint.height, mouseX, mouseY, "center")) {
							isHoverOnPuts = true;
						}
					}
				}
				for(let o of outputs) {
					if(o.type == 1) {
						if(isInCircle(o.cableConnectionPoint.x, o.cableConnectionPoint.y, mouseX, mouseY, o.cableConnectionPoint.radius)) {
							isHoverOnPuts = true;
						}
					}
					if(o.type == 4 || o.type == 8) {
						if(isInRect(o.cableConnectionPoint.x, o.cableConnectionPoint.y, o.cableConnectionPoint.width, o.cableConnectionPoint.height, mouseX, mouseY, "center")) {
							isHoverOnPuts = true;
						}
					}	
				}


				if(c.highlight && (!cableHitboxTest(c) || isHoverOnGate || isHoverOnPuts)) {
					c.highlight = false;
					c.updateDrawingPoints()
					let tempCable = cables.splice(C, 1);
					cables.splice(highlightedCablesOldIndex, 0, ...tempCable)
					highlightedCablesOldIndex = null;
				}
			}
			
			for(let C = cables.length - 1; C >= 0; C--) {
				let c = cables[C];
				let isHoverOnGate = false;
				let isHoverOnPuts = false;
				let isHoverOnDisplays = false
				let isHoverOnBusses = false
				for(let g of gates) {
					if(isInRect(g.x, g.y, g.width, g.height, mouseX, mouseY, "center")) {
						isHoverOnGate = true;
					}
				}
				for(let d of displays) {
					if(isInRect(d.x, d.y, d.width, d.height, mouseX, mouseY, "center")) {
						isHoverOnDisplays = true;
					}
				}
				for(let b of busses) {
					if(isInRect(b.x, b.y, b.width, b.height, mouseX, mouseY, "center")) {
						isHoverOnBusses = true;
					}
				}
				for(let i of inputs) {
					if(i.type == 1) {
						if(isInCircle(i.cableConnectionPoint.x, i.cableConnectionPoint.y, mouseX, mouseY, i.cableConnectionPoint.radius)) {
							isHoverOnPuts = true;
						}
					}
					if(i.type == 4 || i.type == 8) {
						if(isInRect(i.cableConnectionPoint.x, i.cableConnectionPoint.y, i.cableConnectionPoint.width, i.cableConnectionPoint.height, mouseX, mouseY, "center")) {
							isHoverOnPuts = true;
						}
					}
				}
				for(let o of outputs) {
					if(o.type == 1) {
						if(isInCircle(o.cableConnectionPoint.x, o.cableConnectionPoint.y, mouseX, mouseY, o.cableConnectionPoint.radius)) {
							isHoverOnPuts = true;
						}
					}
					if(o.type == 4 || o.type == 8) {
						if(isInRect(o.cableConnectionPoint.x, o.cableConnectionPoint.y, o.cableConnectionPoint.width, o.cableConnectionPoint.height, mouseX, mouseY, "center")) {
							isHoverOnPuts = true;
						}
					}	
				}
				if(c.outputCode != null && mouseOccupation == "nothing" && !isHoverOnGate && !isHoverOnPuts && !isHoverOnDisplays && !isHoverOnBusses) {	
					let isOnCable = cableHitboxTest(c)
					if(isOnCable && highlightedCablesOldIndex == null) {
						c.highlight = true;
						c.updateDrawingPoints()
						cables.push(...cables.splice(C, 1))
						highlightedCablesOldIndex = C;
						break;
					}
				}
			}
		}

		if(mouseOccupation == "cableEditting") {
			let isMoving = false
			let isHighlight = false
			for(let p of edittingCable.edittingPoints) {
				p.highlight = false
				if(p.moving) {
					isMoving = true 
					p.highlight = true
					isHighlight = true
				}
			}
			if(!isMoving) {
				for(let p of edittingCable.edittingPoints) {
					if(isInCircle(p.x, p.y, mouseX, mouseY, edittingPointRadius) || p.moving) {
						isHighlight = true
						p.highlight = true
						break;
					}
				}
				setChangingStartValues(mouseScreenX, mouseScreenY)
			}
			edittingCable.potentialPoint = null
			if(!isHighlight) {
				//Test for connectionPoint creation
				let tempIndex = cableHitboxTest(edittingCable, "array")
				if(tempIndex != null) {
					let tempPoint = findClosestPointOnLine(edittingCable, tempIndex)
					edittingCable.potentialPoint = {x:tempPoint.x, y: tempPoint.y, index: tempIndex}
				}		
			} 
			
		}
	
		//If mouse is current on a (In/Out)puts moving area highlights it
		for(let o of outputs) {
			o.moveablePartHighlight = false
		}
		for(let i of inputs) {
			i.moveablePartHighlight = false
		}

		if(mouseOccupation == "nothing" && !isButtonHighlighted && !anyPutHighlighted) {
			for(let o = outputs.length - 1; o >= 0; o--) {
				if(outputs[o].parentCode == null) {
					if(isInRect(outputs[o].moveablePart.x,outputs[o].moveablePart.y,moveablePartMetrics.width, moveablePartMetrics.height,mouseX, mouseY, "center")) {
						outputs[o].moveablePartHighlight = true
						anyPutHighlighted = true
						break;
					}
				}
			}
			for(let i = inputs.length - 1; i >= 0; i--) {
				if(inputs[i].parentCode == null && !anyPutHighlighted) {
					if(isInRect(inputs[i].moveablePart.x,inputs[i].moveablePart.y,moveablePartMetrics.width, moveablePartMetrics.height,mouseX, mouseY, "center")) {
						inputs[i].moveablePartHighlight = true
						anyPutHighlighted = true
						break;
					}
				}
			}
		}
	
	
		let highlighted = false
		for(let i of inputs) {
			if(i.parentCode == null && i.moveablePartHighlight) {
				highlighted = true;
				break;
			}
		}
		for(let o of outputs) {
			if(o.parentCode == null && o.moveablePartHighlight) {
				highlighted = true;
				break;
			}
		}
	
		// Tests for preconnection
		if(mouseOccupation == "cableCreating") {
			cables[0].preConnect();
		}


		// Moves all the objects //
		let allObjectThatHaveHitboxs = getAllObjectsThatHaveHitboxs()
		let savedOffset = getDefaultMove()
		isHitboxColided = false
		
		// Moving Gates
		if(mouseOccupation == "objectMoving" || mouseOccupation == "objectCreating") {
			for(let G = gates.length - 1; G >= 0; G--) {
				let g = gates[G];
				if(g.moving) {
					g.highlight = true;
					if(!include(highlightedObjects, g)) {
						highlightedObjects.push(g)
					} 			
					g.move(savedOffset.x, savedOffset.y);

					//Collision
					if(!isHitboxColided) {
						for(let o of allObjectThatHaveHitboxs) {
							if(o != g) {
								if(rectHitboxCollision(g.hitbox, o.hitbox)) {
									isHitboxColided = true
									break;
								}
							}
						}
					}
					//	
				}					
			}
		}

		// Moving displays
		if(mouseOccupation == "objectMoving" || mouseOccupation == "objectCreating") {
			for(let D = displays.length - 1; D >= 0; D--) {
				let d = displays[D];
				if(d.moving) {
					d.highlight = true;
					if(!include(highlightedObjects, d)) {
						highlightedObjects.push(d)
					}
					d.move(savedOffset.x, savedOffset.y);
					//Collision
					if(!isHitboxColided) {
						for(let obj of allObjectThatHaveHitboxs) {
							if(obj != d) {
								if(rectHitboxCollision(d.hitbox, obj.hitbox)) {
									isHitboxColided = true
									break;
								}
							}
						}
					}
					//	
				}	
			}
		}

		// Moving Gates
		if(mouseOccupation == "objectMoving" || mouseOccupation == "objectCreating") {
			for(let B = busses.length - 1; B >= 0; B--) {
				let b = busses[B];
				if(b.moving) {
					b.highlight = true;
					if(!include(highlightedObjects, b)) {
						highlightedObjects.push(b)
					} 			
					b.move(savedOffset.x, savedOffset.y);

					//Collision
					if(!isHitboxColided) {
						for(let o of allObjectThatHaveHitboxs) {
							if(o != b) {
								if(rectHitboxCollision(b.hitbox, o.hitbox)) {
									isHitboxColided = true
									break;
								}
							}
						}
					}
					//	
				}					
			}
		}

		//Output Moving
		if(mouseOccupation == "objectMoving" || mouseOccupation == "objectCreating") {
			let movingOutput;
			for(let o of outputs) {
				if(o.parentCode == null && o.moving) {
					movingOutput = o
					movingOutput.move(savedOffset.x, savedOffset.y);
					//Collision
					if(!isHitboxColided) {
						for(let obj of allObjectThatHaveHitboxs) {
							if(obj != o) {
								if(rectHitboxCollision(o.hitbox, obj.hitbox)) {
									isHitboxColided = true
									break;
								}
							}
						}
					}
					//	
				}
			}				
		}

		//Input Moving
		if(mouseOccupation == "objectMoving" || mouseOccupation == "objectCreating") {
			let movingInput;
			for(let i of inputs) {
				if(i.parentCode == null && i.moving) {
					movingInput = i
					movingInput.move(savedOffset.x, savedOffset.y)
					//Collision
					if(!isHitboxColided) {
						for(let obj of allObjectThatHaveHitboxs) {
							if(obj != i) {
								if(rectHitboxCollision(i.hitbox, obj.hitbox)) {
									isHitboxColided = true
									break;
								}
							}
						}
					}
					//	
				}
			}		
		}

		///////////////////////////////////////////////////////////

		//Camera Changing
		if(!isInRect(gateCreatingAreaMetrics.x, gateCreatingAreaMetrics.y, gateCreatingAreaMetrics.width, gateCreatingAreaMetrics.height, mouseScreenX, mouseScreenY, "corner")) {
			if(mouseOccupation == "nothing" || mouseOccupation == "cameraChanging" || mouseOccupation == "cableEditting") {
				if(isMouseMiddleDown) {
					let worldStart = screenToWorld(mouseStartX, mouseStartY);
					mouseX = screenToWorld(mouseScreenX, mouseScreenY).x
					mouseY = screenToWorld(mouseScreenX, mouseScreenY).y
					camera.x += (worldStart.x - mouseX);
					camera.y += (worldStart.y  - mouseY);
					setChangingStartValues(mouseScreenX, mouseScreenY)
					//mouseOccupation = "cameraChanging"
				} else {
					//mouseOccupation = "nothing"
				}			
			}
		}		
		

		 if(isMouseDown) {
			// Checks mouse if it is in "gate creating area" boundary and start moving it
			let isAnyButton = false
			for(let b of buttons) {
				if(b.style == "gateButton" || b.style == "objectCreatingButtonWithChild") {
					isAnyButton = true
				}
			}
			
			if(mouseOccupation == "boxMoving" && isAnyButton) {
				let offsetX = mouseScreenX - mouseStartX;
				let lastGateButton;
				for(let b = 0; b < buttons.length; b++) {
					if(buttons[b].style == "gateButton" || buttons[b].style == "objectCreatingButtonWithChild") {
						lastGateButton = buttons[b]
					}
				}
				let isLimiting = (lastGateButton.x + lastGateButton.width + offsetX >= canvas.width - 20) && (buttons[1].x + offsetX <= buttons[0].width + 2* spaceBetweenEveryButton);
				if(isLimiting) {
					for(let i = 0; i < buttons.length; i++) {
						if(buttons[i].style == "gateButton" || buttons[i].style == "objectCreatingButtonWithChild") {
							buttons[i].x += offsetX;
						}
					}
					setChangingStartValues(mouseScreenX, mouseScreenY)
				}
			}

			if(mouseOccupation == "cableEditting") {
				for(let P = 0; P < edittingCable.edittingPoints.length; P++) {
					let p = edittingCable.edittingPoints[P]
					if(p.moving) {
						let finalMove = {x: 0, y: 0};
						let tempPoint

						if(p.index == 0 || p.index == edittingCable.connectionPoints.length - 1) {
							tempPoint = getClosestLinePoint(p.bond.connectionPoints)
							//console.log(tempPoint)
							finalMove.x = tempPoint.x - p.x
							finalMove.y = tempPoint.y - p.y
							setChangingStartValues(mouseScreenX, mouseScreenY)
						} else {
							if(doesSnap()) {
							let snapSize = gridInfos.spacing/2
							let worldPoints = screenToWorld(gridInfos.x, gridInfos.y)
							let defaultMove = getDefaultMove()
							let dx = Math.round((p.x  + defaultMove.x - worldPoints.x) / snapSize) * snapSize - p.x + worldPoints.x;
							let dy = Math.round((p.y  + defaultMove.y - worldPoints.y) / snapSize) * snapSize - p.y + worldPoints.y;				
							if(dx != 0 || dy != 0) {
								finalMove = {x: dx, y: dy}
								setChangingStartValues(dx * camera.scale + mouseStartX, dy * camera.scale + mouseStartY);
								} 	
							} else {
								finalMove = getDefaultMove()
								setChangingStartValues(mouseScreenX, mouseScreenY)
							}
						}
						
						p.x += finalMove.x
						p.y += finalMove.y
						edittingCable.connectionPoints[p.index][0] += finalMove.x
						edittingCable.connectionPoints[p.index][1] += finalMove.y
						
						if(p.index == 0 || p.index == edittingCable.connectionPoints.length - 1) {
							let parentCable = p.index == 0 ? decode(cables, edittingCable.inputCode) : decode(cables, edittingCable.outputCode)
							let tempIndex = findIndex(parentCable.childs, edittingCable.code)

							parentCable.childAnchors[tempIndex].x = edittingCable.connectionPoints[p.index][0]
							parentCable.childAnchors[tempIndex].y = edittingCable.connectionPoints[p.index][1]
							parentCable.childAnchors[tempIndex].realX = edittingCable.connectionPoints[p.index][0]
							parentCable.childAnchors[tempIndex].realY = edittingCable.connectionPoints[p.index][1]
							parentCable.childAnchors[tempIndex].index = tempPoint.index
						}
						edittingCable.updateDrawingPoints()

						
					}	
				}
			}
			

		}
	} else if(screen == 2) {
		// Save Screen
		if(!isMouseDown) {
			for(let b of saveScreenButtons) {
				b.highlight = false;
			}
			for(let b of saveScreenButtons) {
				if(b.isActive && (b.style == "subSaveButton" || b.style == "diceButton")) {
					if(b.isOnButton()) {
						b.highlight = true;
					}
				}
			}
		}
	} else if(screen == 3) {
		for(let b of buttons) {
			b.highlight = false;
		}
		for(let b of buttons) {
			if(b.isActive && (b.style == "subLabelButton" || b.style == "moveButton")) {
				if(b.isOnButton()) {
					b.highlight = true;
				}
			}
		}
	}
	else if(screen == 4) {
		for(let b of buttons) {
			b.highlight = false;
		}
		for(let b of buttons) {
			if(b.isActive && (b.style == "subOptionButton" || b.style == "moveButton")) {
				if(b.isOnButton()) {
					b.highlight = true;
				}
			}
		}
		
	} else if(screen == 5) {
		let myWheels = getWheel(["starred", "collection"])
		

		for(let w of myWheels) {
			w.highlight = false
		}
		for(let w of myWheels) {
			if(w.moving || (w.isActive && isInRect(w.x, w.y, w.w, w.h, mouseScreenX, mouseScreenY, "corner"))) {
				w.highlight = true	
			}
		}
		
		if(mouseOccupation == "wheelMoving") {
			let myWheels = getWheel(["starred", "collection"]);
			for(let w of myWheels) {
				if(w.moving) {
					w.move()
					setChangingStartValues(mouseScreenX, mouseScreenY)
				}
			}		
		}

		for(let b of libraryButtons) {
			b.highlight = false;
		}
		for(let b of libraryButtons) {
			if(b.isActive && mouseOccupation == "nothing" && b.isOnButton()) {
				b.highlight = true;
			}
		}
	} else if(screen == 6) {	
		for(let b of confirmButtons) {
			b.highlight = false;
		}
		for(let b of confirmButtons) {
			if(b.isOnButton()) {
				b.highlight = true;
			}
		}
	}
	if(screen == 7) {
		for(let b of customizeScreenButtons) {
			b.highlight = false;
		}
		if(mouseOccupation == "nothing") {
			for(let b of customizeScreenButtons) {
				if(b.isActive && b.isOnButton()) {
					b.highlight = true;
				}
			}
		}

		//Wheel highlight
		let w = getWheel("customize")
		w.highlight = false

		if(w.moving || (w.isActive && isInRect(w.x, w.y, w.w, w.h, mouseScreenX, mouseScreenY, "corner"))) {
			w.highlight = true	
		}
		

		//Scaler Detection
		for(let d of customizeDisplays) {
			for(let s of d.scalers) {
				s.highlight = false
			}
		}

		for(let D = customizeDisplays.length - 1; D >= 0; D--) {
			let d = customizeDisplays[D];
			let minCase = {value: Infinity, scaler:null}
			for(let s of d.scalers) {
				if(isInRect(s.x, s.y, s.width, s.height, mouseX, mouseY, "corner")) {
					let tempDist =dist(s.x, s.y, mouseX, mouseY)
					if(tempDist < minCase.value) {
						minCase.scaler = s
						minCase.value = tempDist
					}
				}
			}
			if(minCase.scaler != null) {
				minCase.scaler.highlight = true
			}
		}

		//Triangle Detection
		let isHoverOnDisplays = false
		for(let d of customizeDisplays) {
			if(isInRect(d.x, d.y, d.framelessWidth_World, d.framelessHeight_World, mouseX, mouseY, "center")) {
				isHoverOnDisplays = true
				break;
			}
		}

		for(tri of customizingTriangles) {
			tri.highlight = false
		}

		if(!isHoverOnDisplays) {
			for(let tri of customizingTriangles) {
				let p = getTrianglePoints(tri)
				if(isInTriangle(p[0],p[1],p[2], mouseX, mouseY)) {
					tri.highlight = true
				}
			}
		}
		

		//Camera Changing
		if(!isInRect(cRect.x, cRect.y, cRect.w, cRect.h, mouseScreenX, mouseScreenY, "corner") || mouseOccupation == "cameraChanging") {
			if(isMouseMiddleDown) {
				let worldStart = screenToWorld(mouseStartX, mouseStartY);
				mouseX = screenToWorld(mouseScreenX, mouseScreenY).x
				mouseY = screenToWorld(mouseScreenX, mouseScreenY).y
				camera.x += (worldStart.x - mouseX);
				camera.y += (worldStart.y - mouseY);
				setChangingStartValues(mouseScreenX, mouseScreenY)
				mouseOccupation = "cameraChanging"
			}
		}


		// Moving displays
		let savedOffset = getDefaultMove()
		if(mouseOccupation == "objectMoving") {	
			for(let D = customizeDisplays.length - 1; D >= 0; D--) {
				let d = customizeDisplays[D];
				if(d.moving) {
					d.move(savedOffset.x, savedOffset.y);
				}	
			}
		}

		if(isMouseDown) {
			if(mouseOccupation == "wheelMoving") {
				let myWheel = getWheel("customize");
				myWheel.move();
				setChangingStartValues(mouseScreenX, mouseScreenY)
			}

			//Scalers Moving
			if(mouseOccupation == "scalerMoving") {
				for(let d of customizeDisplays) {
					for(let s of d.scalers) {
						if(s.moving) {

							let move = {x:mouseScreenX - mouseStartX, y:mouseScreenY - mouseStartY}
							let unit = unitVector(s.vector)

							let projection = dotProduct(move, unit) 
							let baseDist  = dist(d.x, d.y, s.x, s.y)  
							let newScale = d.scale * (1 + projection / baseDist);

							newScale = Math.max(0.2, newScale);
							d.scale = newScale;

							d.moveScalers();
							setChangingStartValues(mouseScreenX, mouseScreenY)
						}

					}
				}
			}

			//Triangle Moving
			if(mouseOccupation == "nothing" || mouseOccupation == "triPressed") {
				for(let tri of customizingTriangles) {
					if(tri.moving) {
						
						tri.highlight = true

						let tempWH = calculateGateWH(customizingGate.name, tempGateInfos)	
						let worldStart = screenToWorld(mouseStartX, mouseStartY);
						let snapSize = gridInfos.spacing/2
						if(tri.direction == "N" || tri.direction == "S") {
							//Height
							let mult = tri.direction == "N" ? 1 : -1
							let offset = (mouseY - worldStart.y) * mult
							let dy = Math.round((offset) / snapSize) * snapSize
							if(dy != 0) {							
								if(customizingGate.height - dy * 2 >= tempWH.height) {
									tri.y -= dy
									customizingGate.height -= dy * 2
									setChangingStartValues(mouseScreenX, dy * camera.scale * mult + mouseStartY);
								} else {
									tri.y -= (customizingGate.height - tempWH.height) / 2
									customizingGate.height = tempWH.height				
									setChangingStartValues(mouseScreenX, dy * camera.scale * mult + mouseStartY);
								}
							} 
							
						} else {
							//Width
							let mult = tri.direction == "E" ? 1 : -1
							let offset = (mouseX - worldStart.x) * mult
							if(controlKeyActive) {
								let dx = Math.round((offset) / snapSize) * snapSize
								if(dx != 0) {
									if(customizingGate.width + dx * 2 >= tempWH.width) { 						
										tri.x += dx
										customizingGate.width += dx * 2
										setChangingStartValues(mouseStartX + dx * camera.scale * mult, mouseScreenY)
									} else {
										tri.x += (customizingGate.width - tempWH.width) / 2
										customizingGate.width = tempWH.width				
										setChangingStartValues(mouseStartX + dx * camera.scale * mult, mouseScreenY)
									}
								}
							} else {
								if(customizingGate.width + offset * 2 >= tempWH.width) { 						
									tri.x += offset
									customizingGate.width += offset * 2
									setChangingStartValues(mouseScreenX, mouseScreenY)
								} else {
									tri.x += (customizingGate.width - tempWH.width) / 2
									customizingGate.width = tempWH.width				
									setChangingStartValues(mouseScreenX, mouseScreenY)
								}
							}				
						}

						repositionTriangles()
						customizingGate.calculateHitbox()
						repositionCustomizingPuts()
					}
				}
			}
			

			//Color Picker Moving
			for(let cp of colorPickers) {
				let colorSelector = cp.colorSelector;
				let hueSelector = cp.hueSelector;
				if((isInCircle(colorSelector.x, colorSelector.y, mouseScreenX, mouseScreenY, colorSelectorRadius) && mouseOccupation == "nothing") || mouseOccupation == "colorSelectorMoving") {
					mouseOccupation = "colorSelectorMoving";
					let offsetX = mouseScreenX - mouseStartX;
					let offsetY = mouseScreenY - mouseStartY;
					colorSelector.x += offsetX
					colorSelector.y += offsetY
					colorSelector.x = constrain(colorSelector.x, cp.x, cp.x + cp.bigSide)
					colorSelector.y = constrain(colorSelector.y, cp.y, cp.y + cp.bigSide)
					cp.updateColor()			
					setChangingStartValues(mouseScreenX, mouseScreenY)
				}


				if((between(mouseScreenX, hueSelector.x - hueSelector.width/2, hueSelector.x + hueSelector.width) && between(mouseScreenY, hueSelector.y - hueSelector.height/2, hueSelector.y + hueSelector.height) && mouseOccupation == "nothing") || mouseOccupation == "hueSelectorMoving" ) {
					mouseOccupation = "hueSelectorMoving";
					let offsetY = mouseScreenY - mouseStartY;
					hueSelector.y += offsetY
					hueSelector.y = constrain(hueSelector.y, cp.y, cp.y + cp.bigSide)
					cp.updateColor()
					setChangingStartValues(mouseScreenX, mouseScreenY)
				}
			}
		}
	} else if(screen == 8) {
		for(let b of pulseEditButtons) {
			if(b.isOnButton()) {
				b.highlight = true
			} else {
				b.highlight = false
			}
		}
	}  else if(screen == 9) {
		if(mouseOccupation == "nothing") {
			for(let b of findButtons) {
				if(b.isOnButton() && b.isActive) {
					b.highlight = true
				} else {
					b.highlight = false
				}
			}
		}
		

		//Wheel highlight
		let w = getWheel("find")
		w.highlight = false

		if(w.moving || (w.isActive && isInRect(w.x, w.y, w.w, w.h, mouseScreenX, mouseScreenY, "corner"))) {
			w.highlight = true	
		}

		if(isMouseDown) {
			if(mouseOccupation == "wheelMoving") {
				w.move();
				setChangingStartValues(mouseScreenX, mouseScreenY)
			}
		}
	} else if(screen == 10) {
		for(let b of rebindButtons) {
			if(b.isOnButton()) {
				b.highlight = true
			} else {
				b.highlight = false
			}
		}
	} else if(screen == 11) {
		if(mouseOccupation == "nothing") {
			for(let b of ROMButtons) {
				if(b.isOnButton()) {
					b.highlight = true
				} else {
					b.highlight = false
				}
			}
		}

		//Wheel highlight
		let w = getWheel("rom")
		w.highlight = false

		if(w.moving || (w.isActive && isInRect(w.x, w.y, w.w, w.h, mouseScreenX, mouseScreenY, "corner"))) {
			w.highlight = true	
		}

		if(isMouseDown) {
			if(mouseOccupation == "wheelMoving") {
				w.move();
				setChangingStartValues(mouseScreenX, mouseScreenY)
			}
		}
	}
	else if(screen == 12) {
		if(mouseOccupation == "nothing") {
			for(let b of quitButtons) {
				if(quitModeExtra == null) {
					if(b.isOnButton() && b.isActive) {
						b.highlight = true
					} else {
						b.highlight = false
					}
				} else {
					if(b.isOnButton() && b.isActive && b.mode == quitModeExtra) {
						b.highlight = true
					} else {
						b.highlight = false
					}
				}
				
			}
		}

		//Wheel highlight
		let w = getWheel("quit")
		w.highlight = false

		if(w.moving || (w.isActive && isInRect(w.x, w.y, w.w, w.h, mouseScreenX, mouseScreenY, "corner"))) {
			w.highlight = true	
		}

		if(isMouseDown) {
			if(mouseOccupation == "wheelMoving") {
				w.move();
				setChangingStartValues(mouseScreenX, mouseScreenY)
			}
		}
	}
	
	if(mouseOccupation == "nothing") {
		mouseStartX = mouseScreenX
		mouseStartY = mouseScreenY
		changingStartValues.x = mouseScreenX
		changingStartValues.y = mouseScreenY
		selectedArea.x = mouseScreenX
		selectedArea.y = mouseScreenY
	} else {	
		mouseStartX = changingStartValues.x
		mouseStartY = changingStartValues.y
	}
	changeMouseStyle()
}

function changeMouseStyle() {
	if(mouseOccupation == "objectMoving") {
		canvas.style.cursor = "grabbing";
		return
	}
	if(mouseOccupation == "cameraChanging") {
		canvas.style.cursor = "grabbing";
		return
	}
	canvas.style.cursor = "default";
}

// Mousemove event
window.addEventListener("mousemove", (event) => {
	if(mouseOccupation !== "nothing") 
        document.body.style.userSelect = "none";
    else
        document.body.style.userSelect = "text";

	mouseScreenX = event.x - canvas.getBoundingClientRect().left;
	mouseScreenY = event.y - canvas.getBoundingClientRect().top;
	mouseX = screenToWorld(mouseScreenX, mouseScreenY).x
	mouseY = screenToWorld(mouseScreenX, mouseScreenY).y
})

let pressedKey = false

window.addEventListener("keydown", (event) => {
	if(event.ctrlKey) {
		controlKeyActive = true;
	}

	//EventPreventer
	if(event.ctrlKey && event.key === ' ') {
		event.preventDefault();
	} 
	if(event.ctrlKey && event.key.toLowerCase() === 's') {
		event.preventDefault();
	}  
	if(event.ctrlKey && event.key.toLowerCase() === 'f') {
		event.preventDefault();
	} 
	if (event.ctrlKey && event.key.toLowerCase() === 'n') {
		event.preventDefault();
	}
	if(event.ctrlKey && event.key.toLowerCase() === 'p') {		
		event.preventDefault();
	}
	if(event.ctrlKey && event.key.toLowerCase() === 'l') {		
		event.preventDefault();
	} 
	if(event.ctrlKey && event.key.toLowerCase() === 'g') {
		event.preventDefault();
	}
	if(event.ctrlKey && event.key.toLowerCase() === 'q') {
		event.preventDefault();
	}
	if(event.key == "Tab") {
		event.preventDefault();
	}
	//////////

	if(screen == 0) {
		if(event.key == "Backspace") {
			if(!pressedKey) {
				clickCounterForHighlight = 0
				pressedKey = true;
				if(highlightedObjects.length > 0) {
					for(let H = highlightedObjects.length - 1; H >= 0; H-- ) {
						let h = highlightedObjects[H]
						mouseOccupation = "nothing";
						h.delete()			
						if(h.ObjectName == "Bus") H--
					}
					highlightedObjects = [];
					return
				}
				if(mouseOccupation == "cableCreating") {
					cables[0].delete();
					mouseOccupation = "nothing";
					return
				} else if(currentPage == -1) {
					for(let B = busses.length -1; B >= 0; B--) {
						let b = busses[B];
						if(isInRect(b.x, b.y, b.width, b.height, mouseX, mouseY, "center")) {
							b.delete();
							return;
						}
					}
					for(let D = displays.length - 1; D >= 0; D--) {
						let d = displays[D];
						if(d.parentCode == null && isInRect(d.x, d.y, d.width, d.height, mouseX, mouseY, "center")) {
							d.delete();
							return;
						}
					}
					for(let G = gates.length -1; G >= 0; G--) {
						let g = gates[G];
						if(isInRect(g.x, g.y, g.width, g.height, mouseX, mouseY, "center")) {
							g.delete();
							return;
						}
					}
					for(let C = cables.length - 1; C >= 0; C--) {
						let c = cables[C];
						if(c.highlight) {
							c.delete();
							highlightedCablesOldIndex = null;
							return;
						}
					}
				}
			}
		}
		if(event.key == "Shift") {
			shiftKeyActive = true;
		}
		
		if(event.key == "Tab") {
			if(!tabKeyActive) {
				toggleWithTab = !toggleWithTab
			}
			tabKeyActive = true	
		}
		if(event.key == "Escape") {
			if(mouseOccupation == "objectCreating") {
				cancelObjectCreating()
			}
			if(mouseOccupation == "cableCreating") {
				cables[0].delete();
				mouseOccupation = "nothing";
			}
			if(mouseOccupation == "cableEditting") {
				// Cancels the cableEditting 
				edittingCable.editting = false
				edittingCable.edittingPoints = []
				edittingCable = null
				mouseOccupation = "nothing"
			}
		}
		if(event.key == " ") {
			spaceKeyActive = true;
		}

		if(event.key.toLowerCase() == "a") {
			debugMode = !debugMode
			console.log("DEBUG MODE: "+ debugMode)
		}
		if(getPreference("SimStatus") == "Paused") {
			if(event.key == " ") {
				stepsTakenWhenPaused++
				updateClockGate()
				if(currentPage == -1) {
					processArea(getWorkingArea());
				} else {
					processPageAreas()
				}
				
			}
		}
		
		



		//Shortcuts
		if (event.ctrlKey && event.key.toLowerCase() === 'g') {
			changePreferences("ShowGrid", +1, true)	
		} else if (event.ctrlKey && event.key === ' ') {
			changePreferences("SimStatus", +1, true)
		} else if (event.ctrlKey && event.key === 'q') {
			handleQuitScreen(getConfirm())
		}

		if(currentPage == -1) {
			if(mouseOccupation == "nothing") {
				if (event.ctrlKey && event.key.toLowerCase() === 's') {
					handleSaveScreen()
				} else if (event.ctrlKey && event.key.toLowerCase() === 'f') {
					handleFindScreen()
				} else if (event.ctrlKey && event.key.toLowerCase() === 'n') {
					// Çalışmıyor !!!
					console.log("Daha Yapılmadı")
					emptyWorkingArea(getConfirm())
				}
				else if (event.ctrlKey && event.key.toLowerCase() === 'p') {		
					handleOptionScreen()
				}
				else if (event.ctrlKey && event.key.toLowerCase() === 'l') {		
					handleLibraryScreen()
				}
			}	
		}

		
		
		keyGateToggle(event.key, true)
	}
	if(screen == 2) {
		if(event.key == "Escape") {
			saveScreenCancel()
		}
	}
	if(screen == 3) {
		if(event.key == "Escape") {
			removeInputBox()
		}
	}
	if(screen == 4) {
		if(event.key == "Escape") {
			optionMenuCancel()
		}
	}
	if(screen == 5) {
		if(event.key == "Escape") {
			cancelLibraryMenu()
		}
	}
	if(screen == 7) {
		if(event.key == "Escape") {
			if(mouseOccupation == "nothing") {
				cancelCustomizeScreen(false)
			}
			if(mouseOccupation == "objectMoving") {
				customizeScreenButtons.filter(b => b.style == "subCustomizeButtonDisplay")[last(customizeDisplays).customizeIndex].isActive = true
				last(customizeDisplays).delete(customizeDisplays)
				mouseOccupation = "nothing"
				checkboxs[0].accessible = isCheckBoxAccessible()
			}
		}
		//Shortcuts
		if (event.ctrlKey && event.key.toLowerCase() === 'g') {
			changePreferences("ShowGrid", +1, true)
		}

		if(event.key == "Backspace") {
			for(let D = customizeDisplays.length - 1; D >= 0; D--) {
				let d = customizeDisplays[D];
				if(isInRect(d.x, d.y, d.framelessWidth_World, d.framelessHeight_World, mouseX, mouseY, "center")) {
					customizeScreenButtons.filter(b => b.style == "subCustomizeButtonDisplay")[d.customizeIndex].isActive = true
					d.delete(customizeDisplays);
					mouseOccupation = "nothing"
					checkboxs[0].accessible = isCheckBoxAccessible()
					return;
				}
			}
		}	
	}
	if(screen == 8) {
		if(event.key == "Escape") {
			cancelPulseEdit(false)
		}
	}
	if(screen == 9) {
		if(event.key == "Escape") {
			cancelFindScreen()
		}
	}

	if(screen == 10) {
		if(event.key == "Escape") {
			cancelRebindScreen(false)
		}

		let allowedKeys = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ0123456789QWX"
		if(allowedKeys.includes(event.key.toUpperCase())) {
			changingKeyValue = event.key.toUpperCase();
		}
	} 
	if(screen == 11) {
		if(event.key == "Escape") {
			cancelROMScreen()
		}
	}
	if(screen == 12) {
		if(event.key == "Escape") {
			if(quitModeExtra != null) {
				removeQuitModeExtra()
			} else {
				quitMode = "mainMenu"
			}
		}
	}
})

function keyGateToggle(key, action) {
	for(let w of workingAreas) {
		for(let obj of w) {
			if(obj.ObjectName == "Gate") {
				mainToggler(obj, key, action)
			}
		}
	}
	for(let g of gates) {
		mainToggler(g, key, action)	
	}
	function mainToggler(g, key, action) {
		if(g.name == "KEY") {
			if(key.toLowerCase() == g.keyValue.toLowerCase()) {
				g.keyPressed = action
			}
		}
		if(g.visualObjects != undefined) {
			for(let v of g.visualObjects) {
				mainToggler(v, key, action)
			}
		}
	}
	
}

window.addEventListener("keyup", (event) => {
	pressedKey = false;
	if(event.key == "Shift") {
		shiftKeyActive = false;
	}
	if(event.key == "Control") {
		controlKeyActive = false;

	}
	if(event.key == " ") {
		spaceKeyActive = false;

	}
	if(event.key == "Tab") {
		tabKeyActive = false

	}
	keyGateToggle(event.key, false)
	
	
})

window.addEventListener("contextmenu", (event) => {
	event.preventDefault();
	if((mouseOccupation == "nothing" || mouseOccupation == "contextSelecting") && screen == 0) {
		//Creates a contextMenu by looking at what is underneath
		let overOn = null

		//Context Menu buttons
		if(overOn == null) {
			for(let cm of contextMenus) {
				for(let b of cm.buttons) {
					if(b.style == "childObjectCreatingButton" && b.isOnButton()) {
						overOn = b
						break
					}
				}
			}
		}

		//Buttons
		if(overOn == null) {
			for(let B = buttons.length - 1; B >= 0; B--) {
				let b = buttons[B];
				if(( b.style == "objectCreatingButtonWithChild" || b.style == "gateButton") && b.isOnButton()) {
					overOn = b
					break;
				}
			}
		}

		// Main Inputs
		if(overOn == null) {
			for(let i of inputs) {
				if(i.parentCode == null) { 
					if(i.type == 1) {
						if(dist(mouseX,mouseY, i.cableConnectionPoint.x,i.cableConnectionPoint.y) <= IO_radius) {
							overOn = i;
							break;
						}
					}
					if(i.type == 4 || i.type == 8) {
						if(isInRect(i.cableConnectionPoint.x, i.cableConnectionPoint.y, i.cableConnectionPoint.width, i.cableConnectionPoint.height, mouseX, mouseY, mode = "center")) {
							overOn = i;
							break;
						}
					}
					
				}
			}
		}

		// Main Outputs
		if(overOn == null) {
			for(let o of outputs) {
				if(o.parentCode == null) {
					if(o.type == 1) {
						if(dist(mouseX,mouseY, o.cableConnectionPoint.x,o.cableConnectionPoint.y) <= IO_radius) {
							overOn = o;
							break;
						}
					}
					if(o.type == 4 || o.type == 8) {
						if(isInRect(o.cableConnectionPoint.x, o.cableConnectionPoint.y, o.cableConnectionPoint.width, o.cableConnectionPoint.height, mouseX, mouseY, mode = "center")) {
							overOn = o;
							break;
						}
					}
				}
			}
		}	

		//Display
		if(overOn == null) {
			for(let D = displays.length - 1; D >= 0; D--) {
				let d = displays[D];
				if(d.parentCode == null && isInRect(d.x, d.y, d.width, d.height, mouseX, mouseY, "center")) {
					overOn = d
					break;
				}
			}
		}

		// Gates
		if(overOn == null) {
			for(let G = gates.length - 1; G >= 0; G--) {
				let g = gates[G];
				if(isInRect(g.x, g.y, g.width, g.height, mouseX, mouseY, "center")) {
					overOn = g
					break;
				}
			}
		}

		// Busses
		if(overOn == null) {
			for(let B = busses.length - 1; B >= 0; B--) {
				let b = busses[B];
				if(isInRect(b.x, b.y, b.width, b.height, mouseX, mouseY, "center")) {
					overOn = b
					break;
				}
			}
		}

		//Cables
		if(overOn == null) {
			for(let C = cables.length - 1; C >= 0; C--) {
				let c = cables[C];
				if(c.highlight) {
					overOn = c
					break;
				}
			}
		}

		//Context Menu Handler
		if(overOn == null || overOn.ObjectName != "Button" || overOn.style != "childObjectCreatingButton") {
			contextMenus = []
			latestUsedObjectCreatingButtonWithChild = null
			mouseOccupation = "nothing"
		} else {
			if(contextMenus.length == 2) {
				contextMenus.splice(1, 1)
			}
		}
		//

		let tempMenuValues = {contexts: [], functions: []}
		function addContexts(name) {
			if(name == "View") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changePage(getPage(overOn), overOn) )
			}
			if(name == "Open") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => openGate(new Gate(0,0, overOn.name), getConfirm()) )
			}
			if(name == "Label") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => labelMenu(overOn) )
			}
			if(name == "Delete") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => overOn.delete() )
			}
			if(name == "Fast Connect") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => {startFastConnecting(overOn,true,true)} )
			}
			if(name == "Red") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "red")  )	
			}
			if(name == "Orange") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "orange") )		
			}
			if(name == "Yellow") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "yellow") )		
			}
			if(name == "Green") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "green") )		
			}
			if(name == "Blue") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "blue") )		
			}
			if(name == "Violet") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "violet") )		
			}
			if(name == "Pink") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "pink") )		
			}
			if(name == "White") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => changeColor(overOn, "white") )		
			}
			if(name == "Un-star") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( ()=>removeFromStarred(overOn.name) )	
			}
			if(name == "Edit") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( ()=> handlePulseEdit(overOn) )	
			}
			if(name == "EditPin") {
				tempMenuValues.contexts.push("Edit")
				tempMenuValues.functions.push( () => labelMenu(overOn) )	
			}
			if(name == "Flip") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => overOn.flipBus())	
			}
			if(name == "Edit Cable") {
				tempMenuValues.contexts.push("Edit")
				tempMenuValues.functions.push( () => overOn.enterEditMode())	
			}
			if(name == "Fast Connect Bus") {
				tempMenuValues.contexts.push("Fast Connect")
				tempMenuValues.functions.push( () => overOn.fastConnect() )	
			}
			if(name == "Rebind") {
				tempMenuValues.contexts.push(name)
				tempMenuValues.functions.push( () => handleRebindScreen(overOn) )	
			}
			if(name == "Edit ROM") {
				tempMenuValues.contexts.push("Edit")
				tempMenuValues.functions.push( () => handleROMScreen(overOn) )	
			}
		}

		//Does the main process
		if(overOn != null) {
			
			mouseOccupation = "contextSelecting"

			if(overOn.ObjectName == "Button") {
				if(overOn.style == "gateButton") {
					addContexts("Open")
					addContexts("Un-star")
					contextMenus.push(new contextMenu(mouseScreenX, mouseScreenY, overOn.name, tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton"))
					if(include(defaultGates, overOn.name) || include(displayNames, overOn.name) || include(IONames, overOn.name)) {
						contextMenus[0].buttons[0].isActive = false
					}
				}

				if(overOn.style == "objectCreatingButtonWithChild") {
					addContexts("Un-star")
					contextMenus.push(new contextMenu(mouseScreenX, mouseScreenY, overOn.name, tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton"))
				}

				if(overOn.style == "childObjectCreatingButton") {
					addContexts("Open")
					contextMenus.push(new contextMenu(mouseScreenX, mouseScreenY, overOn.name, tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton"))
					if(include(defaultGates, overOn.name) || include(displayNames, overOn.name) || include(IONames, overOn.name)) {
						last(contextMenus).buttons[0].isActive = false
					}
				}

				last(contextMenus).y -= last(contextMenus).height
				for(let b of last(contextMenus).buttons) {
					b.y -= last(contextMenus).height
				}
			}


			if(overOn.ObjectName == "Bus") {
				addContexts("Flip")
				addContexts("Label")
				addContexts("Fast Connect Bus")
				addContexts("Delete")
				contextMenus.push(new contextMenu(mouseScreenX,mouseScreenY, "Bus" ,tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton"))
			} 
			if(overOn.ObjectName == "Input") {
				addContexts("EditPin")
				addContexts("Delete")
				addContexts("Red")
				addContexts("Orange")
				addContexts("Yellow")
				addContexts("Green")
				addContexts("Blue")
				addContexts("Pink")
				addContexts("Violet")
				addContexts("White")
				contextMenus.push(new contextMenu(mouseScreenX,mouseScreenY, "Output" ,tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton", [2]))
				if(currentPage != -1) contextMenus[0].buttons.forEach((b)=>b.isActive = false)
			}
			if(overOn.ObjectName == "Output") {
				addContexts("EditPin")
				addContexts("Delete")
				addContexts("Red")
				addContexts("Orange")
				addContexts("Yellow")
				addContexts("Green")
				addContexts("Blue")
				addContexts("Pink")
				addContexts("Violet")
				addContexts("White")
				contextMenus.push(new contextMenu(mouseScreenX,mouseScreenY, "Input " ,tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton", [2]))
				if(currentPage != -1) contextMenus[0].buttons.forEach((b)=>b.isActive = false)		
			}
			if(overOn.ObjectName == "Gate") {
				if(!include(defaultGates, overOn.name)) {
					addContexts("View")
					addContexts("Open")
				}
				if(overOn.name == "PULSE") {
					addContexts("Edit")
				}
				if(overOn.name == "KEY") {
					addContexts("Rebind")
				}
				if(overOn.name == "ROM 256x16") {
					addContexts("Edit ROM")
				}
				addContexts("Label")
				addContexts("Delete")
				addContexts("Fast Connect")
				contextMenus.push(new contextMenu(mouseScreenX,mouseScreenY, "Gate " ,tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton"))
				if(currentPage != -1) {
					contextMenus[0].buttons[contextMenus[0].buttons.length - 3].isActive = false
					contextMenus[0].buttons[contextMenus[0].buttons.length - 2].isActive = false
					contextMenus[0].buttons[contextMenus[0].buttons.length - 1].isActive = false
				}
			}
			if(overOn.ObjectName == "Display") {
				addContexts("Label")
				addContexts("Delete")
				addContexts("Fast Connect")
				let tempSeperator = []
				if(overOn.name == "LED") {
					addContexts("Red")
					addContexts("Orange")
					addContexts("Yellow")
					addContexts("Green")
					addContexts("Blue")
					addContexts("Pink")
					addContexts("Violet")
					addContexts("White")
					tempSeperator.push(3)
				}
				contextMenus.push(new contextMenu(mouseScreenX,mouseScreenY, "Display ", tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton", tempSeperator))
				if(currentPage != -1) contextMenus[0].buttons.forEach((b)=>b.isActive = false)	
			}
			if(overOn.ObjectName == "Cable") {
				addContexts("Edit Cable")
				addContexts("Delete")
				addContexts("Red")
				addContexts("Orange")
				addContexts("Yellow")
				addContexts("Green")
				addContexts("Blue")
				addContexts("Pink")
				addContexts("Violet")
				addContexts("White")
				contextMenus.push(new contextMenu(mouseScreenX,mouseScreenY, "Cable ", tempMenuValues.contexts, tempMenuValues.functions, "contextMenuButton", [2]))
				if(currentPage != -1) contextMenus[0].buttons.forEach((b)=>b.isActive = false)
			}		
		}
	}
})

window.addEventListener("wheel", (event) => {
	const signOfValue = event.deltaY < 0 ? 1 : -1
	deleteContextMenus()
	if(screen == 0) {	
		//Changes the spaces between objects when creating
		if(mouseOccupation == "objectCreating" && shiftKeyActive) {
			const addingValue = gridInfos.spacing * camera.scale	
			let currentSpacing = spaceBetweenGatesWhenCreating * camera.scale
			const minSpace = 30 * camera.scale
			if(highlightedObjects.length > 1) {
				let offset = 0
				if(currentSpacing + signOfValue * addingValue >= minSpace) {
					offset = signOfValue * addingValue	 	
				} else {
					offset = minSpace - currentSpacing
				}
				spaceBetweenGatesWhenCreating += offset/camera.scale
				for(let i = 0; i < creatingObjects.length; i++) {
					let tempObject = creatingObjects[i];
					mouseStartY = mouseScreenY + (i) * offset;
					tempObject.move();
					mouseStartY = mouseScreenY;
				}
			}	
		}

		let isInBoxMoving = false
		//An alternative for boxMoving
		if(mouseOccupation == "nothing") {
			let isAnyButton = false
			for(let b of buttons) {
				if(b.style == "gateButton" || b.style == "objectCreatingButtonWithChild") {
					isAnyButton = true
				}
			}
			if(between(mouseScreenX,buttons[0].width + spaceBetweenEveryButton*2,canvas.width-10) && between(mouseScreenY, gateCreatingAreaMetrics.y, gateCreatingAreaMetrics.y + gateCreatingAreaMetrics.height)) {
				isInBoxMoving = true
				if(isAnyButton) {
					const offsetX = -signOfValue * 50;
					let lastGateButton;
					let totalWidth = 0
					for(let b = 0; b < buttons.length; b++) {
						if(buttons[b].style == "gateButton" || buttons[b].style == "objectCreatingButtonWithChild") {
							lastGateButton = buttons[b]
							totalWidth += buttons[b].width + spaceBetweenEveryButton
						}
					}
					totalWidth -= spaceBetweenEveryButton 
					let isLongEnough = buttons[0].width + 2 * spaceBetweenEveryButton + totalWidth + 20 >= canvas.width
					let leftLimit = buttons[1].x + offsetX <= buttons[0].width + 2 * spaceBetweenEveryButton
					let rightLimit = lastGateButton.x + lastGateButton.width + offsetX >= canvas.width - 20
					let isLimiting = (rightLimit) && (leftLimit);
					if(isLimiting) {
						for(let i = 0; i < buttons.length; i++) {
							if(buttons[i].style == "gateButton" || buttons[i].style == "objectCreatingButtonWithChild") {
								buttons[i].x += offsetX;
							}
						}
					}
					if(!rightLimit && isLongEnough)  {
						let tempOffset = canvas.width - 20 - lastGateButton.x - lastGateButton.width
						for(let i = 0; i < buttons.length; i++) {
							if(buttons[i].style == "gateButton" || buttons[i].style == "objectCreatingButtonWithChild") {
								buttons[i].x += tempOffset;
							}
						}
					}
					if(!leftLimit && isLongEnough)  {
						let tempOffset = buttons[0].width + 2* spaceBetweenEveryButton - buttons[1].x
						for(let i = 0; i < buttons.length; i++) {
							if(buttons[i].style == "gateButton" || buttons[i].style == "objectCreatingButtonWithChild") {
								buttons[i].x += tempOffset;
							}
						}
					}
				}
			}
		}

		if(!isInBoxMoving && !shiftKeyActive) {
			let worldBeforeZoom = screenToWorld(mouseScreenX, mouseScreenY);

			const zoomFactor = 1.1;
			if (event.deltaY < 0) {
				camera.scale = Math.min(Math.floor(camera.scale * zoomFactor * 100)/ 100, 10);
			} else {
				camera.scale = Math.max(Math.floor(camera.scale / zoomFactor * 100)/ 100, 0.1);
			}

			camera.x = worldBeforeZoom.x - mouseScreenX / camera.scale;
			camera.y = worldBeforeZoom.y - mouseScreenY / camera.scale;
		}
	} else if(screen == 5 && mouseOccupation == "nothing") {
		let myWheels = getWheel(["starred","collection"])
		let defaultOffset = wheelSpeed * signOfValue
		for(let w of myWheels) {
			if(w.isOnViewport() && w.isActive) {
				w.move(defaultOffset)
			}
		}
	} else if(screen == 7) {
		let defaultOffset = wheelSpeed * signOfValue
		let w = getWheel("customize")
		if(w.isOnViewport() && w.isActive) {
			w.move(defaultOffset)
		} else {
			if(!shiftKeyActive) {
				let worldBeforeZoom = screenToWorld(mouseScreenX, mouseScreenY);
				const zoomFactor = 1.1;
				if (event.deltaY < 0) {
					camera.scale = Math.min(Math.floor(camera.scale * zoomFactor * 100)/ 100, 10);
				} else {
					camera.scale = Math.max(Math.floor(camera.scale / zoomFactor * 100)/ 100, 0.1);
				}

				camera.x = worldBeforeZoom.x - mouseScreenX / camera.scale;
				camera.y = worldBeforeZoom.y - mouseScreenY / camera.scale;
			}
		}
	} else if(screen == 9) {

		let defaultOffset = wheelSpeed * signOfValue
		let w = getWheel("find")
		if(w.isOnViewport() && w.isActive) {
			w.move(defaultOffset)
		}
	} else if(screen == 11) {
		let defaultOffset = wheelSpeed * signOfValue
		let w = getWheel("rom")
		if(w.isOnViewport() && w.isActive) {
			w.move(defaultOffset)
		}
	}
	else if(screen == 12) {
		let defaultOffset = wheelSpeed * signOfValue
		let w = getWheel("quit")
		if(w.isOnViewport() && w.isActive) {
			w.move(defaultOffset)
		}
	}

    //event.preventDefault();
})