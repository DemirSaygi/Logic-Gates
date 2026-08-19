class Button {
	constructor(x, y, name, style, clickFunction = () => {console.log("No Function")}) {
		this.x = x; 
		this.y = y;
		this.name = name;
		this.style = style;
		this.clickFunction = clickFunction;
		this.isActive = true;
		this.height = 0;
		this.width = this.calcW();	
		this.highlight = false;
		this.ObjectName = this.constructor.name;
		this.clipRect = {x: NaN, y: NaN, w: NaN, h: NaN}
		this.createClipRect()
	}

	createClipRect() {
		if(this.style == "gateButton" || this.style == "objectCreatingButtonWithChild") this.clipRect = {x: buttons[0].width + 2*spaceBetweenEveryButton, y: gateCreatingAreaMetrics.y, w: canvas.width - 20 - buttons[0].width- 2*spaceBetweenEveryButton, h:gateCreatingAreaMetrics.height}
		if(this.style == "subCustomizeButtonDisplay") this.clipRect = {x: 40, y: 620, w: cRect.w-60, h: 340}
		if(this.style == "libraryButtonStarred" || this.style == "libraryButtonStarredC") this.clipRect = {x: sr.x + 40, y: sr.y + 80, w: sr.w - 80, h: sr.h-120}
		if(this.style == "libraryButtonCollection" || this.style == "libraryButtonCollectionC") this.clipRect = {x: cr.x + 40, y: cr.y + 80, w: cr.w - 80, h: cr.h-120}
		if(this.style == "subFindButton" || this.style == "subFindButtonDecor") this.clipRect = {x: fRect.x + 20, y: fRect.y + 180, w: 940, h: 740}
		if(this.style == "subQuitButtonFile") this.clipRect = {x: opRect.x + 20, y: opRect.y + 20, w: opRect.w - 60, h: opRect.h-40}
	}

	isOnButton() {
		return isInRect(this.x, this.y, this.width, this.height, mouseScreenX, mouseScreenY, "corner") && isInRect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h, mouseScreenX, mouseScreenY, "corner")
	}

	show() {
		c.textBaseline = "middle"
		//Draw Rect
		if(this.style == "menuButton") {
			c.beginPath();
			c.fillStyle = "rgba(80, 100, 150, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(110, 130, 180, 1)"
			}
			c.rect(this.x, this.y, this.width, this.height)
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}

		if(this.style == "gateButton") {
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h);
			c.clip()
			c.beginPath();
			
			c.fillStyle = "rgba(50, 50, 50, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			if(!this.isActive) {
				c.fillStyle = "rgba(65,65,65, 1)"
			}
			c.rect(this.x, this.y, this.width, this.height)
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
			c.restore()
		}

		if(this.style == "confirmScreen") {
			c.beginPath()
			c.fillStyle = "rgba(64, 64, 64, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.rect(this.x, this.y, this.width, this.height)
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();

		}

		if(this.style == "backButton") {
			c.beginPath();
			c.fillStyle = "rgba(30, 30, 30, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
			}
			c.rect(this.x, this.y, this.width, this.height)
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `24px ${myFont}`
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}

		if(this.style == "subMenuButton") {
			c.beginPath();
			c.fillStyle = "white"
			if(this.highlight) {
				c.fillStyle = "rgba(115,185,255)"
			}
			if(!this.isActive) {
				c.fillStyle = "rgba(200,200,200,1)";
			}
			c.rect(this.x, this.y, this.width, this.height)
			c.fill()
			c.closePath();

			//RightSideContext
			c.beginPath()
			c.fillStyle = "rgba(102,102,102,1)"
			c.textAlign = "right"
			c.letterSpacing = "1px"
			c.font = `24px ${myFont}`
			c.drawCenteredText(this.rightSideContext, this.x + contextMenuOffset + this.width - 15, this.y + this.height/2 );
			c.closePath()

			//Name
			c.beginPath();
			c.fillStyle = "black"
			if(!this.isActive) {
				c.fillStyle = "rgba(125,125,125,1)";
			}
			c.textAlign = "left";
			c.letterSpacing = "1px"
			c.font = `24px ${myFont}`
			c.drawCenteredText(this.name, this.x + contextMenuOffset + 10, this.y + this.height/2  );
			c.closePath();
		}

		if(this.style == "contextMenuButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "white";
			if(this.highlight) {
				c.fillStyle = "rgba(115,185,255)"
			}
			
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "black"
			c.textAlign = "left";
			c.letterSpacing = "1px";
			c.font = `24px ${myFont}`
			c.lineWidth = 1
			if(!this.isActive) {
				c.fillStyle = "rgba(192,192,192,1)";
			}
			c.drawCenteredText(this.name, this.x + nameOffset, this.y + this.height / 2 );
			c.closePath();
		}

		if(this.style == "subSaveButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(50, 50, 50, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		if(this.style == "subQuitButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(73, 73, 82, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(72,108,233,1)";
			}
			if(!this.isActive) {
				c.fillStyle = "rgba(62, 62, 62, 1)"
				if(this.name == "CONFIRM" && isQuotaExceed) {
					c.fillStyle = "rgba(255, 59, 59, 1) "
				}
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(113,113,113, 1)"
				if(this.name == "CONFIRM" && isQuotaExceed) {
					c.fillStyle = "rgba(30,30,30, 1)"
				}
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `normal 26px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		if(this.style == "subQuitButtonFile") {
			//Draws the basic rectangle
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h);
			c.clip()
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(30, 30, 30, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(54,58,135,1)";
			}
			if(this == focusedFile) {
				c.fillStyle = "rgba(87,54,230,1)";
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(113,113,113, 1)"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `normal 26px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
			c.restore()
		}

		if(this.style == "subCustomizeButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(64, 64, 64, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `27px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		if(this.style == "subPulseEditButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(64, 64, 64, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `27px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		if(this.style == "subROMButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(64, 64, 64, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `27px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		if(this.style == "subCustomizeButtonDisplay") {
			//Draws the basic rectangle
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h);
			c.clip()
			c.beginPath();
			
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(64, 64, 64, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `27px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
			c.restore()
		}
		if(this.style == "subLabelButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(50, 50, 50, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `30px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		if(this.style == "subFindButton") {
			//Draws the basic rectangle
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h);
			c.clip()
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(64, 64, 64, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `26px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
			c.restore()
		}
		if(this.style == "subRebindButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(64, 64, 64, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `26px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}

		if(this.style == "subFindButtonDecor") {
			//Draws the basic rectangle
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h);
			c.clip()
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(82, 156, 217, 1)"
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "black"
			c.textAlign = "left";
			c.letterSpacing = "1px"
			c.font = `26px ${myFont}`
			c.drawCenteredText(this.name, this.x + textBuffer, this.y + (this.height/2));
			c.closePath();
			c.restore()
		}
		if(this.style == "subOptionButton") {		
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(50, 50, 50, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `30px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		if(this.style == "libraryButtonOrganize") {		
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(50, 50, 50, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}

		if(this.style == "libraryButtonStarred" || this.style == "libraryButtonStarredC") {		
			//Draws the basic rectangle
			c.beginPath()
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h);
			c.clip()
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			
			let isFocused = include(focusedObjects, this)
			if(this.style == "libraryButtonStarred") {
				c.fillStyle = "rgba(37, 37, 37, 1)"
				if(isFocused) {
					c.fillStyle = "rgba(82,156,217,1)"
				}
			} else if(this.style == "libraryButtonStarredC") {
				c.fillStyle = "rgba(17, 17, 17, 1)"
				if(isFocused) {
					c.fillStyle = "rgba(247,120,120,1)"
				}
			}

			if(this.highlight) {
				if(!isFocused) {
					c.fillStyle = "rgba(212,212,212,1)";
					c.lineWidth = 1;
					c.stroke();
				} else {
					if(this.style == "libraryButtonStarred") {
						c.fillStyle = "rgba(121,194,255,1)"
					} else if(this.style == "libraryButtonStarredC") {
						c.fillStyle = "rgba(255,149,149,1)"
					}
				}
			}

			if(!this.isActive) {
				if(this.style == "libraryButtonStarredC") {
					c.fillStyle = "rgba(17, 17, 17, 1)"
				} else {
					c.fillStyle = "rgba(37, 37, 37, 1)"
				}	
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			
			if(this.highlight || isFocused) {
				c.fillStyle = "black"
			}
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			c.textAlign = "left";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			if(this.style == "libraryButtonStarredC") {
				c.drawCenteredText(this.name, this.x + 20, this.y + (this.height/2));
			} else {
				c.drawCenteredText(this.name, this.x + 20, this.y + (this.height/2));
			}
			
			c.closePath();
			c.restore()
		}
		if(this.style == "libraryButtonCollection" || this.style == "libraryButtonCollectionC") {		
			//Draws the basic rectangle
			c.beginPath()
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h);
			c.clip()
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			
			let isFocused = include(focusedObjects, this)
			
			if(this.style == "libraryButtonCollection") {		
				c.fillStyle = "rgba(37, 37, 37, 1)"
				if(isFocused) {
					c.fillStyle = "rgba(82,156,217,1)"
				}
			} else if(this.style == "libraryButtonCollectionC") {
				c.fillStyle = "rgba(17, 17, 17, 1)"
				if(isFocused) {
					c.fillStyle = "rgba(247,120,120,1)"
				}
			}
			if(this.highlight) {
				if(!isFocused) {
					c.fillStyle = "rgba(212,212,212,1)";
					c.lineWidth = 1;
					c.stroke();
				} else {
					if(this.style == "libraryButtonCollection") {
						c.fillStyle = "rgba(121,194,255,1)"
					} else if(this.style == "libraryButtonCollectionC") {
						c.fillStyle = "rgba(255,149,149,1)"
					}
				}
			}
			if(!this.isActive) {
				if(this.style == "libraryButtonCollectionC") {
					c.fillStyle = "rgba(17, 17, 17, 1)"
				} else {
					c.fillStyle = "rgba(37, 37, 37, 1)"
				}	
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			
			if(this.highlight || isFocused) {
				c.fillStyle = "black"
			}
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			c.textAlign = "left";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			if(this.style == "libraryButtonCollectionC") {
				let tempOffset = 15
				if(childObjectCreatingButtonInfos[findIndex(objectCreatingButtonWithChildNames, this.name)].length == 0) {
					c.drawCenteredText("◌", this.x + tempOffset, this.y + (this.height/2)); /// !!! değştirmeyi unutma başka bir şeyle
				} else {
					if(isCollectionOpen[findIndex(objectCreatingButtonWithChildNames, this.name)]) {
						c.drawCenteredText("▼", this.x + tempOffset - 2, this.y + (this.height/2));
					} else {
						c.drawCenteredText("▶", this.x + tempOffset, this.y + (this.height/2));
					}			
				}
				c.drawCenteredText(this.name, this.x + tempOffset + 35, this.y + (this.height/2))	
			} else {
				c.drawCenteredText(this.name, this.x + 20, this.y + (this.height/2));
			}
			c.closePath();
			c.restore()
		}
		if(this.style == "moveButton") {
			//Draws the basic rectangle
			c.beginPath();
			c.rect(this.x, this.y, this.width, this.height);
			c.fillStyle = "rgba(219, 105, 105, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(254,177,177,1)";
			}
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			c.textAlign = "center";
			c.letterSpacing = "1px"
			c.font = `25px ${myFont}`
			c.drawCenteredText(this.name, this.x + (this.width/2), this.y + (this.height/2));
			c.closePath();
		}
		
		if(this.style == "diceButton") {
			/// !!! kullanılmıyor
			c.beginPath()
			c.roundRect(this.x, this.y, this.width, this.height, 5)
			c.fillStyle = "white"
			c.strokeStyle = "black"
			c.lineWidth = 8
			c.stroke();
			c.fill();
			c.closePath()

			let diceRadius = 5
			let a = ((this.width * Math.sqrt(2)) -  6*diceRadius) / 6;
			for(let i = 0; i < 3; i++) {
				c.beginPath();
				c.arc(this.x + ((2*i + 1)*(a + diceRadius))/Math.sqrt(2), this.y + ((2*i + 1)*(a + diceRadius))/Math.sqrt(2), diceRadius, 0, 360);
				c.fillStyle = "black"
				c.fill()
				c.closePath();
			}
		}

		if(this.style == "objectCreatingButtonWithChild") {
			c.save()
			c.rect(this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h)
			c.clip()
			c.beginPath();
			c.fillStyle = "rgba(50, 50, 50, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(212,212,212,1)";
				c.lineWidth = 1;
				c.stroke();
			}
			if(!this.isActive) {
				c.fillStyle = "rgba(65,65,65, 1)"
			}
			c.rect(this.x, this.y, this.width, this.height)
			c.fill();
			c.closePath();

			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			
			c.textAlign = "left";
			c.letterSpacing = "1px"
			c.font = `28px ${myFont}`
			let tempOffset = 15
			if(latestUsedObjectCreatingButtonWithChild == this.name) {
				c.drawCenteredText("▲", this.x + tempOffset - 2, this.y + (this.height/2));
			} else {
				c.drawCenteredText("▶", this.x + tempOffset, this.y + (this.height/2));
			}
			c.drawCenteredText(this.name, this.x + tempOffset + 30, this.y + (this.height/2))
			c.closePath();
			c.restore()
		}
		if(this.style == "childObjectCreatingButton") {
			c.beginPath();
			c.fillStyle = "rgba(44,44,44, 1)"
			if(this.highlight) {
				c.fillStyle = "rgba(168,168,168,1)";
			}
			
			c.rect(this.x, this.y, this.width, this.height)
			c.fill();
			c.closePath();
			c.beginPath();
			c.fillStyle = "white"
			if(!this.isActive) {
				c.fillStyle = "rgba(110,110,110, 1)"
			}
			if(this.highlight) {
				c.fillStyle = "black"
			}
			c.textBaseline = "middle"
			c.textAlign = "left";
			c.letterSpacing = "1px"
			c.font = `24px ${myFont}`
			
			c.drawCenteredText(this.name, this.x + 10, this.y + (this.height/2));
			c.closePath();
		}
	}

	calcW() {
		// Calculates the width of the object depending on its name
		if(this.style ==  "menuButton") {
			c.font = `28px ${myFont}`
			c.textAlign = "center";
			this.height = 50;
			let width = getTextWidth(this.name)
			//let width = c.measureText(this.name).width
			return Math.floor(width) + 50;
		}
		if(this.style == "gateButton") {	
			c.font = `28px ${myFont}`
			c.textAlign = "center";
			this.height = 50;
			let width = getTextWidth(this.name)
			//let width = c.measureText(this.name).width
			return Math.floor(width) + 30;
		}
		if(this.style == "backButton") {
			this.height = 50
			return 150
		}
		if(this.style == "subMenuButton") {
			this.height = 45
			return 320 - 2 * contextMenuOffset
		}
		if(this.style == "contextMenuButton") {
			c.font = `24px ${myFont}`
			this.height = c.measureText(this.name).actualBoundingBoxAscent + c.measureText(this.name).actualBoundingBoxDescent + nameOffset * 2
			return 200 - 2 * contextMenuOffset
		}
		if(this.style == "subSaveButton") {
			this.height = 50
			return 820/3;
		}
		if(this.style == "diceButton") {
			this.height = 45
			return 45
		}
		if(this.style == "objectCreatingButtonWithChild") {
			c.font = `28px ${myFont}`
			c.letterSpacing = "1px"
			this.height = 50;
			let width = getTextWidth("▶" + this.name)
			return Math.floor(width) + 30;
		}
		if(this.style =="childObjectCreatingButton") {
			this.height = childObjectCreatingButtonHeight
		}
		if(this.style == "subOptionButton") {
			this.height = 50
			return 522
		}
		if(this.style == "subFindButton") {
			this.height = 50
			return 150
		}
		if(this.style == "subFindButtonDecor") {
			this.height = 50
			return 420
		}
		if(this.style == "subRebindButton") {
			this.height = 50
			return 175
		}
	}
}

const childObjectCreatingButtonHeight = 45