const checkboxOffset = 15

class Checkbox {
	constructor(x, y, s, isActive = true, accessible = true) {
		this.x = x;
		this.y = y;
		this.s = s;
		this.isActive = isActive;
		this.accessible = accessible;
	}

	show() {
		// Draws the main area
		c.beginPath()
		c.rect(this.x, this.y, this.s, this.s);
		if(this.accessible) {
			c.fillStyle = "rgba(51,51,51,1)";
		} else {
			c.fillStyle = "rgba(120,120,120,0.4)"
			c.fillStyle = "rgba(51,51,51,1)";
		}
		c.fill()
		c.closePath()

		
		if(this.isActive) {
			let color = "rgba(150, 150, 150, 1)"
			
			//Draws the cross
			c.beginPath()
			c.strokeStyle = color
			c.lineWidth = 10
			c.moveTo(this.x + checkboxOffset, this.y + checkboxOffset)
			c.lineTo(this.x + this.s - checkboxOffset, this.y + this.s - checkboxOffset)
			c.stroke()
			c.closePath()
			c.beginPath()
			c.strokeStyle = color
			c.lineWidth = 10
			c.moveTo(this.x + checkboxOffset, this.y + this.s - checkboxOffset)
			c.lineTo(this.x + this.s - checkboxOffset, this.y + checkboxOffset)
			c.stroke()
			c.closePath()

			
		}
		if(!this.accessible) {
			let imageScale = 0.1
			let imageSpace = {x: 340 * imageScale, y: 445 * imageScale}
			if(images.lock != null) c.drawImage(images.lock, this.x + (this.s - imageSpace.x)/2, this.y + (this.s - imageSpace.y)/2, imageSpace.x, imageSpace.y);
		}
	}
}