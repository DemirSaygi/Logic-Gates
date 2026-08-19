const wheelSpeed = 40

class Wheel {
    constructor(x, y, w, h, viewportHeight, buttonUpperLimit, buttonLowerLimit) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.trackUpper = this.y
        this.totalH = this.h
        this.trackLower = this.y + this.h
        this.viewportHeight = viewportHeight
        this.buttonUpperLimit = buttonUpperLimit
        this.buttonLowerLimit = buttonLowerLimit
        this.moving = false
        this.highlight = false
        this.isActive = false
        this.buttons = []
        if(viewportHeight + buttonUpperLimit != buttonLowerLimit) {console.log("HATA")}
    }
    show() {
        //Calculates the contentHeight
        let spacing = 0;
        this.contentHeight = 0;
        if(this.name == "starred" || this.name == "collection") spacing = spaceBetweenLibraryButtons;
        if(this.name == "customize") spacing = 10;
        if(this.name == "find") spacing = 10
        if(this.name == "find") {
            for(let b of this.buttons) {
                this.contentHeight += b.height/4
            }
            this.contentHeight += (this.buttons.length/4 - 1)*spacing
        } else {
            for(let b of this.buttons) {
                this.contentHeight += b.height
            }
            this.contentHeight += (this.buttons.length - 1)*spacing
        }
        if(this.name == "rom") {
            this.contentHeight = 0
            for(let i of romContainer.childNodes) {
                this.contentHeight += removePX(i.childNodes[1].style.height)
            }
            
        }
		
        ////////////////////////////////////

		this.isActive = this.contentHeight > this.viewportHeight
        if(this.isActive)  {
            //Base Color
            c.beginPath();
            c.rect(this.x, this.trackUpper, this.w, this.totalH);
            c.fillStyle = "rgba(25,25,25,1)";
            c.fill();
            c.closePath();
            //

            const maxScroll = Math.max(0, this.contentHeight - this.viewportHeight);
            let scrollOffset = this.name != "rom" ? this.buttonUpperLimit - this.buttons[0].y: -removePX(romContainer.childNodes[0].style.top);
            scrollOffset = clamp(scrollOffset, 0, maxScroll)
            
            this.h = this.totalH * (this.viewportHeight / this.contentHeight)
            //this.h = this.totalH - maxScroll // Üstekinin aynısı istersen bu kalsın fark etmez
            this.y = this.trackUpper;
            if (maxScroll > 0) {
                this.y = this.trackUpper + (scrollOffset / maxScroll) * (this.totalH - this.h);
            }

            c.beginPath();
            c.rect(this.x, this.y, this.w, this.h);
            c.fillStyle = this.highlight ? "rgba(119,98,184,1)": "rgba(107,87,171,1)";
            c.fill();
            c.closePath();
        } else {
            c.beginPath()
            c.fillStyle = "rgba(51,51,51,51)"
            c.rect(this.x, this.trackUpper, this.w, this.totalH)
            c.fill()
            c.closePath()
        }
        
        //DEBUG
        if(0) {
            c.beginPath()
            c.strokeStyle = "blue"
            c.lineWidth = 4
            c.moveTo(this.x, this.buttonUpperLimit)
            c.lineTo(this.x, this.buttonLowerLimit)
            c.stroke()
            c.closePath()
        }
    }
    move(offset = (mouseStartY - mouseScreenY) * this.contentHeight/this.viewportHeight) {
        if(this.name != "rom") {
            let upperLimit = this.buttonUpperLimit >= this.buttons[0].y + offset
            let bottomLimit = this.buttonLowerLimit <= last(this.buttons).y + last(this.buttons).height + offset
            let isLimiting = upperLimit && bottomLimit
            if(isLimiting) {
                for(let b of this.buttons) {
                    b.y += offset
                    if(this.name == "quit") b.realY += offset
                }
            }

            if(!upperLimit) {
                let tempOffset = this.buttonUpperLimit - this.buttons[0].y
                for(let b of this.buttons) {
                    b.y += tempOffset
                    if(this.name == "quit") b.realY += tempOffset
                }
            }
            if(!bottomLimit) {
                let tempOffset = this.buttonLowerLimit - (last(this.buttons).y + last(this.buttons).height)
                for(let b of this.buttons) {
                    b.y += tempOffset 
                    if(this.name == "quit") b.realY += tempOffset
                }
            }
        } else {
            offset = Math.floor(offset)
            let tempY1 = removePX(romContainer.childNodes[0].style.top)
            let tempY2 = removePX(romContainer.childNodes[255].style.top) + removePX(romContainer.childNodes[255].childNodes[1].style.height)
            let upperLimit = 0 >= tempY1 + offset
            let bottomLimit = removePX(romContainer.style.height) <= tempY2 + offset
            let isLimiting = upperLimit && bottomLimit
            if(isLimiting) {
                for(let b of romContainer.childNodes) {
                    b.style.top = `${removePX(b.style.top) + offset}px`
                }
            }

            if(!upperLimit) {
                let tempOffset = 0 - tempY1;
                for(let b of romContainer.childNodes) {
                    b.style.top = `${removePX(b.style.top) + tempOffset}px`
                }
            }
            if(!bottomLimit) {
                let tempOffset = removePX(romContainer.style.height) - tempY2
                for(let b of romContainer.childNodes) {
                     b.style.top = `${removePX(b.style.top) + tempOffset}px`
                }
            }
        }
        
    }

    isOnViewport() {
        if(this.name == "find") {
            return isInRect(fRect.x + 20, fRect.y + 160, 940, this.viewportHeight, mouseScreenX, mouseScreenY, "corner")
        }
        if(this.name == "collection") {
           return isInRect(cr.x + 20, cr.y + 60, cr.w - 40, cr.h-80, mouseScreenX, mouseScreenY, "corner")
        }
        if(this.name == "starred") {
           return isInRect(sr.x + 20, sr.y + 60, sr.w - 40, sr.h-80, mouseScreenX, mouseScreenY, "corner")
        }
        if(this.name == "customize") {
            return isInRect(20, 600, cRect.w - 20, 360, mouseScreenX, mouseScreenY, "corner")
        } 
        if(this.name == "rom") {
            return isInRect(roRect.x + 20, roRect.y + 20, roRect.w - 40, roRect.h - 40, mouseScreenX, mouseScreenY, "corner")
        }   
         if(this.name == "quit") {
            return isInRect(opRect.x, opRect.y, opRect.w, opRect.h, mouseScreenX, mouseScreenY, "corner")
        }
    }
}
