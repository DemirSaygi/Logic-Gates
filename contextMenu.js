const contextMenuOffset = 0;
const nameOffset = 8;
const seperatorHeight = 15
const strokeOffsetForButtons = 5

class contextMenu {
	constructor(x, y, name, contexts, contextFunctions, buttonStyles, seperators = []) {
		this.x = x;
		this.y = y;
		this.name = name;
		this.contexts = contexts
		this.contextFunctions = contextFunctions
		this.seperators = seperators;
		this.highlightedContext = null;
		this.contextsXYH = [];
		this.buttonStyles = buttonStyles;
		this.getGrowVector()
		this.buttons = this.createButtons();
			

		this.width;
		this.height;
		this.calcWH()
	}
	getGrowVector() {
		this.growVector = {x: 1, y: 1}
		if(this.buttonStyles =="childObjectCreatingButton") {
			this.growVector.y = -1
		}
	}

	createButtons() {
		let tempButtons = [];
		c.font = `28px ${myFont}`
		let previousOffset = 0
		if(this.name != "") {
			previousOffset += getTextHeight(this.name) + 2 * nameOffset + contextMenuOffset;			
		}
		if(this.growVector.y == -1) previousOffset += childObjectCreatingButtonHeight
		let offsetX = 0;
		let columnCount = 0
		let columnMaxWidth = -Infinity
		for(let f = 0; f < this.contexts.length; f++) {
			if(include(this.seperators, f)) {
				previousOffset += seperatorHeight
			}
			
			let tempX = this.x + contextMenuOffset + offsetX
			let newButton = new Button(tempX, this.y + this.growVector.y * (previousOffset + contextMenuOffset), this.contexts[f], this.buttonStyles, this.contextFunctions[f])
			newButton.column = columnCount
			tempButtons.push(newButton);
			if(this.buttonStyles == "childObjectCreatingButton") {
				previousOffset += strokeOffsetForButtons
			}
			
			previousOffset += newButton.height;

			//Calculates the width
			if(this.buttonStyles == "childObjectCreatingButton") {
				c.textAlign = "left";
				c.letterSpacing = "1px"
				c.font = `24px ${myFont}`
				let textWidth = getTextWidth(newButton.name) + 30
				if(textWidth > columnMaxWidth) {
					columnMaxWidth = textWidth
					for(let b of tempButtons) {
						if(b.column == columnCount) {
							b.width = columnMaxWidth
						}
					}
				} else {
					newButton.width = columnMaxWidth
				}					
			}
			
			//Changes the column
			if(this.buttonStyles == "childObjectCreatingButton" ) {
				if(newButton.y - strokeOffsetForButtons - childObjectCreatingButtonHeight < 0) {
					//Changes the column
					offsetX += columnMaxWidth + strokeOffsetForButtons
					previousOffset = childObjectCreatingButtonHeight			
					columnCount++
					columnMaxWidth = -Infinity
				}
			}
		}
		return tempButtons;
	}

	show() {
		//Draws the basic rectangle
		if(this.buttonStyles == "childObjectCreatingButton" && this.buttons.length > 0) {
			let columnStart = this.buttons[0]
			for(let b = 0; b < this.buttons.length; b++) {
				if(this.buttons[b].column != columnStart.column) {
					let columnEnd = this.buttons[b-1]
					c.beginPath()
					c.lineWidth = 10
					c.strokeStyle = "rgba(30,30,30,1)";
					c.fillStyle = "rgba(30,30,30,1)"	
					c.rect(columnEnd.x, columnEnd.y, columnStart.width, columnStart.y - columnEnd.y + columnEnd.height)
					c.stroke()
					c.fill()
					c.closePath()

					columnStart = this.buttons[b]
				}
				if(b == this.buttons.length -1) {
					let columnEnd = this.buttons[b]
					c.beginPath()
					c.lineWidth = 10
					c.strokeStyle = "rgba(30,30,30,1)";
					c.fillStyle = "rgba(30,30,30,1)"	
					c.rect(columnEnd.x, columnEnd.y, columnStart.width, columnStart.y - columnEnd.y + columnEnd.height)
					c.fill()
					c.stroke()
					c.closePath()
				}
			}
		}
		c.beginPath();
		c.rect(this.x, this.y, this.width, this.height);
		
		if(this.buttonStyles == "contextMenuButton") {
			c.lineWidth = 8;
			c.strokeStyle = "rgba(232,232,232,1)";
			c.fillStyle = "rgba(232,232,232,1)";
		}
		if(this.buttonStyles == "childObjectCreatingButton") {
			c.lineWidth = 10
			c.strokeStyle = "rgba(30,30,30,0)";
			c.fillStyle = "rgba(30,30,30,0)"	
		}
		if(this.buttonStyles == "subMenuButton") {
			c.lineWidth = 8;
			c.strokeStyle = "rgba(255,255,255,1)";
		}
		
		if(this.buttonStyles == "childObjectCreatingButton") {
			//c.fillStyle = "rgba(76, 0, 255, 1)"
			//For debugging
		}	
		c.stroke();
		c.fill();
		c.closePath();


	
		//Writes down the name
		if(this.name != "") {
			let previousOffset = 0

			c.beginPath();
			c.textAlign = "left";
			c.textBaseline = "middle"
			c.letterSpacing = "1px";
			c.font = `28px ${myFont}`
			previousOffset += getTextHeight(this.name);
			c.rect(this.x + contextMenuOffset, this.y + contextMenuOffset, this.width - 2*contextMenuOffset, previousOffset + 2*nameOffset);
			c.fillStyle = "rgba(46,46,46,1)";
			c.fill();
			c.closePath()

			//Name
			c.beginPath()
			c.fillStyle = "white"
			c.drawCenteredText(this.name, this.x + contextMenuOffset + nameOffset, this.y + contextMenuOffset +(previousOffset+ 2*nameOffset)/2);
			c.closePath();
		}

		//Draws the seperators
		for(let i = 0; i < this.seperators.length; i++) {
			let buttonIndex = this.seperators[i]
			c.beginPath()
			c.strokeStyle = "rgba(153,153,153, 1)"
			c.lineWidth = 2
			c.moveTo(this.buttons[buttonIndex].x, this.buttons[buttonIndex].y - seperatorHeight/2)
			c.lineTo(this.buttons[buttonIndex].x + this.buttons[buttonIndex].width, this.buttons[buttonIndex].y - seperatorHeight/2)
			c.stroke()
			c.closePath()
		}

		

		for(let b of this.buttons) {	
			b.show();
		}
		///

	}

	calcWH() {
		//Calculates the width of the box
		if(this.buttonStyles == "contextMenuButton") {
			let maxWidth = 150
			c.textAlign = "left";
			c.letterSpacing = "1px"

			//Name width
			c.font = `28px ${myFont}`
			maxWidth = Math.max(maxWidth, c.measureText(this.name).width)

			//Button widths
			c.font = `24px ${myFont}`
			for(let b of this.buttons) {
				maxWidth = Math.max(maxWidth, c.measureText(b.name).width)
			}
			this.width = maxWidth + nameOffset*2
			for(let b of this.buttons) {
				b.width = this.width
			}



			c.font = `28px ${myFont}`
			this.height = getTextHeight(this.name)
			if(this.contexts.length > 0) {
				c.font = `24px ${myFont}`
				for(let t of this.contexts) {
					this.height += getTextHeight(t)
				}
				this.height += (2 * contextMenuOffset) + (this.contexts.length) * 2 * nameOffset
				if(this.name != "") {
					this.height += contextMenuOffset + 2 * nameOffset
				}
			}
			this.height += this.seperators.length * seperatorHeight
		}
		if(this.buttonStyles == "subMenuButton") {
			this.width = 320
			this.height = this.contexts.length * 45 + 2 * contextMenuOffset
		}
		if(this.buttonStyles == "childObjectCreatingButton") {
			// this.width = 0
			// this.height = 0
			// let maxWidth = -Infinity
			// c.textAlign = "left";
			// c.letterSpacing = "1px"
			// c.font = `24px ${myFont}`
			// for(let b of this.buttons) {
			// 	this.height += b.height
			// 	maxWidth = Math.max(maxWidth, c.measureText(b.name).width)
			// }
			// this.height += (this.contexts.length - 1) * strokeOffsetForButtons
			// this.width = maxWidth + 30
			// // for(let b of this.buttons) {
			// // 	b.width = this.width
			// // }
			
			// // this.x += contextMenuOffset
			// // this.y += contextMenuOffset
		}
		

		//Calculates the height of the box
		if(this.buttonStyles == "contextMenuButton") {
			
		}

		
	}
}

