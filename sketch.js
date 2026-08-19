const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let gateInputBox = document.getElementById("gateBox");
let pinInputBox = document.getElementById("pinBox");
let universalInput = document.getElementById("universalInput");
let colorPickerInput =  document.getElementById("colorPickerInput");
let spsInput = document.getElementById("sps");
let spctInput = document.getElementById("spct");
let peInput = document.getElementById("pe");
let findInput = document.getElementById("findInput")
let romContainer = document.getElementById("rom-container");
let newProjectInput = document.getElementById("newProject");

let resolution = {width: 1920, height: 1080}
let isFullScreen = false

canvas.width = (isFullScreen) ? resolution.width : window.innerWidth;
canvas.height = (isFullScreen) ? resolution.height : window.innerHeight;

let imageData = c.createImageData(canvas.width, canvas.height);
const eps = 1e-4
const textBuffer = 20
const codeVersion = "1.0.0 (05/12/2025)"

let letting = true; //sil bunu sonra

let defaultInputCount = 7; // for creating puts when starting
let defaultOutputCount = 9; // for creating puts when starting
let gridInfos = {x: 0, y:0, spacing:15}
let gates = [];
let outputs = [];
let inputs = [];
let cables = [];
let buttons = [];
let displays = [];
let busses = [];
let usedCodes = [];
const IO_radius = 11.25;
const bigIO_radius = 25
const oneSquareSwitchLength = bigIO_radius
const radiusOfPuts = {1: IO_radius, 4: 18.75, 8: 26.25}
const busHeights = {1: gridInfos.spacing * 2, 4: gridInfos.spacing * 3, 8: gridInfos.spacing * 4}
const mainPutLineWidth = 15
const mainPutLineHeight = 10
let boxMoving = false;
let isMouseDown = false;
let isMouseMiddleDown = false
let animation; 
let gateInfos = {}
const displayNames = ["7 SEGMENT", "DOT DISPLAY", "RGB DISPLAY", "LED"]
const IONames = ["IN-1", "IN-4","IN-8","OUT-1","OUT-4","OUT-8"]
const busNames = ["BUS-1", "BUS-4", "BUS-8"]
const MS_gates = ["1-4BIT", "1-8BIT", "4-8BIT", "8-4BIT", "8-1BIT", "4-1BIT"];
let gateNames = [];
let defaultGates = [];
const spaceBetweenEveryButton = 5
let currentPage = -1;
let highlightedObjects = [];
let highlightOffset = 10

let fastProcessInfos = {}
let fastProcessQueue = [];
let fastProcessedGates = [];
let fastProcessAbortController = false
let currentFastProcess = null

let showThreeState = true;

let doFastProcess = true;			//DEBUG
let showFP = false 					//DEBUG
let showHitbox = false				//DEBUG
let showIsPowered = false    		//DEBUG
let autoEnterFile = {"name" : "test", "isEnter": false}			//DEBUG

let shiftKeyActive = false;
let toggleWithTab = false;
let tabKeyActive = false;
let contextMenus = [];
let workingAreas = [];
let pageNames = [];
let objectCreatingButtonWithChildNames = []
let childObjectCreatingButtonInfos = []
let latestUsedObjectCreatingButtonWithChild = null

let starredButtons = [];
let colorPickers = [];
let checkboxs = [];
let screen = 0;
const maxTruthTableLengthThreshold = 30;
const images = {};
let newClickedForHighlight = false;
let newClickedForTag = false;
let newClickedForObjectCreating = false;
let newClickedForCableCreating = false;
let controlKeyActive = false;
let spaceKeyActive = false
let lastLogTime = Date.now();
let now = Date.now();
let changingLabelObject; // Tells the which object changing its label
let spaceBetweenGatesWhenCreating = 30;
let creatingObjects = [];
let creatingObjectType = null;
let highlightedCablesOldIndex = null;
const gateWidthOffset = 20;
const gateNameHeightOffset = 5;
const spaceBetweenLines = 10;
let debugMode = false
let camera = {
    x: 0, 
    y: 0,      
    scale: 1,         
};
const gateCreatingAreaMetrics = {x: 0, y: canvas.height - 60, width: canvas.width, height: 60}
let savedCamera;

let decimalDisplayTypes = ["Off","Unsigned", "Signed", "HEX"]

let preferences = {
	ShowIOPinName: {arr: ["On Hover", "Tab To Toggle", "Always"], showIndex: 0, currentIndex: 0}, 
	ShowChipPinName: {arr: ["On Hover", "Tab To Toggle", "Always"], showIndex: 0, currentIndex: 0}, 
	ShowGrid: {arr: ["Off", "On"], showIndex: 0, currentIndex: 0}, 
	SnapToGrid: {arr: ["Hold Ctrl", "If Grid Shown", "Always"], showIndex: 0, currentIndex: 0}, 
	StraightWires: {arr: ["Hold Shift", "If Grid Shown", "Always"], showIndex: 0, currentIndex: 0}, 
	SimStatus: {arr: ["Active", "Paused"], showIndex: 0, currentIndex: 0}
};
let stepsTakenWhenPaused = 0
let targetStepsPerSecond = 6000
let currentStepsPerSecond = 1
let lastUpdateTime = performance.now();
let accumulatedTime = 0;
let stepsPerClockTick = 10
let simulatedStepsPerSecond = 0;
let clockStepCounter = 0;
let clockState = false;

let latestOpened = null
let currentCustomizedDisplayArray = [];
let latestSavedStation = []

const hitboxOffsets = {Gate: {x: 4, y: 4}, Pin: {x: 4, y: 4}, Display: {x: 4, y: 4}, Bus:  {x: 4, y: 4}}
let selectedArea = {x: null, y: null, w: null, h: null}
let edittingCable = null
let rebindingGate = null

let wheels = [];

let fileNames = []
let saveFiles = []
let currentFile = null

let myFont = "'JetBrains Mono'"

CanvasRenderingContext2D.prototype.drawCenteredText = function(text, x, y) { 
	this.fillText(text, x, textCorrectY(y, text));
}

CanvasRenderingContext2D.prototype.drawParagraph = function (text, x, y, maxWidth, lineHeight, align = "left") {
    if (!text) return 0;

    const words = text.split(/\s+/);
    let line = "";
    const lines = [];

    // Satırları oluştur
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = this.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + " ";
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());

    // Çizim ayarları
    const oldAlign = this.textAlign;
    const oldBaseline = this.textBaseline;
    this.textAlign = align;
    this.textBaseline = "top";


    // Satırları çiz
    for (let i = 0; i < lines.length; i++) {
        this.fillText(lines[i], x, y + i * lineHeight);
    }

    // Eski ayarları geri yükle
    this.textAlign = oldAlign;
    this.textBaseline = oldBaseline;

    return (lines.length - 1) * lineHeight + getTextHeight(last(lines))
};





// Yapılacaklar:
//	✓  Page
//  ✓  Menu 
//	✓ input/output tags
// 	✓  curvey cables
//	✓  editting
//	✓  star buttons
//	✓  7segment display 
//	✓  colorful puts and cables 
//	✓  highlighting
//  ✓  more inputs in 'and' & 'or' gates
//  ✓  creating gates with more than one in one click
//	✓  saving does not work properly with memory gates. Because only two way gates should add its outputs to the initialMemory. Also fastProcess with subMemory does not work
//  ?  FastProccessi ADAM ET [0,0,0, 0,1,0, 1,0,0, 1,1,1] şekilde yazacağına {0: 0, 1: 0, 2: 0, 3: 0} olsa efso olur // gelecekten ben olmaz çünkü ne hızlı ne de daha az yer kaplıyor;
//  ✓  Shifte basılı tutarken gate oynat kablolar bozuluyor
//  ✓  Tri-state Buffer
//  ✓  Bus class
// 	✓  Better Creating Gates with multiple gates
//  ✓  Cable highlight yaputğımda anlık olarak en üste taşı sonra aşağı indir yoksa diğer cableların altıda kalıyor
//  ✓  Gatelerin putlarının tagları savedGatesten gelmiyor (o tarz bir şey)
//  ✓  Gate isimlerinin yazılımlarının bir daha düşün 18 karakterden fazlaysa spacetenn sonra alt satırea geçsin
//  ✓  savedGatesi içine defaultGatesleri de koy bence: and not
//  ✓  contextMenu for input and output type 4-8 fix
//  ✓  tekli ve çoklu inputların switchlerinin üstüne geldiğinde highlightla falan
//  ✓  inputların   noktalarının içine baktığıda hatalı kod yazıyor kesin Clone_array yüzünden
//  ✓  viewing 4 bit register does not wortk properly
//  ✓  merge and split gatelerr birden fazla creatlenmiyor hallet
//  ✓  kesinlikle basepower ve ispower gibi şeyleri type 4-8 için ayarlman gerekiyor lit gibi array yap
//  ✓  saveGate yaptıktan sonra kullandığım main putların colorunu childa aktar
//  ✓  better display show
//  ✓  display kullanıldığında aslında gatein dışında gözükse iyi olur ama birden fazla display varsa ne olacak bilmiyorum
//  ✓  labelling for gates
//  ✓  better labeling visual for all types of object
//  ✓  square like grid
//  ✓  scaling
//  ✓  infinite world 
//  ?  cableden bir şey çıktığında çıktığı noktadan ufak bir bağlantıyı ifade edecek şekilde daire çizdir
//  ✓  cableları grid like yap not curvey
//  ✓  cableları hem inputtan hem outputtan çıkartabilir yap
//  ✓  gatebox mouse wheel fix
//  ✓  more colors for puts
//  ✓  gate name color like gray and white 
//  ✓  contexmenu de label ve delete in altına böyle color seçme kısmından ayırmak için çizgi geç
//  ✓  literal start screen
//  ✓  option screen
//  X  calculate fast process yaparken input sayısı 0 iken (dene) 2^0 = 1 olduğundan problem çıkıyopr
//  ✓  display camera scaleini yapmamışım
//  ✓  find button
//  ✓  library Button
//  ✓  clock
//  ✓  hitbox colision
//  ✓  saved gates için fastconnect bozuk ve 4-8 bit bozuk büyük ihtimalle calcWH
//  ✓  selected are sol üsten başlamazsa olmuyor
//  ✓  changePagetaki getTruthTable biraz zorluyor 819200 gibi sayılarda maximum callstacke ulaşıyor nasıl çözülür bilemem 819200 için de 5 tane dlatchi düzgünce bağla 10 output 7 input kullanıcaksın test için
//  ✓  mesela dlatchin ismini değiştirdikten sonra 1 bit registerın içindeki d flipflopun visual objectsinin içinden de değiştirmen lazım veya recreatevisualobjects ayn şey smallDlete için de geçerli
//  ✓  bir menuye girerken obje oynatıyorsam mouseoccupation = nothing yetmiyor full mouse kaldırma muhabbetini yapmam gerekiyor gate haraket ettrirkjen library gir mesela çıktıkntasonra sonra halen g.moving = true olacak bunu halelt sıkıntı çıkmasın
//  ✓  eğer ki fp sırasında bir objenin içindeki asıl yapı silinirse veya renamelenirse abort olmalı
//  ✓  ileride calcFastProcess'i cloneObjectsin içine sadece gatei koy ve inputlarını direkt setle ve outputları direkt oku böylece arada kalan baya bir obje kullanılmasına gerrek klamaz ve böylece memoryproblemi hallolabilir ama inputları setlerken problem yaşıcaksın şöyle 1. input gatein 2. inputna bağlanıyor olabilir bu yüzden InputMap tarzında bir şey olması lazım
//  ✓  şu anda şöyle bir problem var diyelim ki d-flip flopun içindeki dlatchi sildim veya renameledim(bu sanırım gereksiz) d flip flop artık memory holder olmuyor bunu reEvaluateTarzıdnda bir şey olmalı
//  ✓  viewing and pause simulation overlay
//  ✓  key changing screen
//  ✓  more displays
//  ✓  buzzer and ram
//  ✓  contextMenu tavan bugı
//  ✓  view iteration
//  ✓  isVisual ve page mantığı saçma bence
//  X  fastProcess show


(async () => {
  await preload();          
  const env = setup();      
  draw(env);               
})();



async function preload() {
	await document.fonts.load("28px 'JetBrains Mono'");
	await preloadImages();
}

function setup() {
	loadSaveFiles()
	createDefaultButtons();
	createWheels()
	createROMInputs()
	getDefaultGates()

	//For Start
	handleQuitScreen()
	drawQuitScreen()

	if(autoEnterFile["isEnter"] && findButton(quitButtons, autoEnterFile["name"]) != null) {
		startLoadingFile(findButton(quitButtons, autoEnterFile["name"]))
		createDefaultPuts()
		latestSavedStation = clone_Objects(getWorkingArea(true), false)
	}
}

function draw() {
	now = Date.now();
	animation = requestAnimationFrame(draw);

	//console.log(mouseOccupation)
	c.clearRect(0,0,canvas.width,canvas.height);

	drawBackground();

	handleFastProcess()

	//Draws fps
	drawFPS()

	// Process The Main Area
	processMainArea()
	
	
	

	for(let c of cables) {
		c.show();
	}

	if(mouseOccupation == "cableEditting") edittingCable.show()

	for(let g of gates) {
		if(!g.highlight) {
			g.show();		
		}
	}

	for(let i of inputs) {
		if(i.parentCode == null && !i.highlight) {
			i.show()
		}
	}

	for(let o of outputs) {
		if(o.parentCode == null && !o.highlight) {
			o.show()
		}
	}

	for(let b of busses) {
		if(!b.highlight) {
			b.show()
		}
	}

	for(let d of displays) {
		if(!d.highlight && d.parentCode == null) {
			d.show();
		}
	}

	// Buttons
	for(let b of buttons ) {
		if(b.style == "gateButton") {
			b.isActive = true;
		}
		if(b.style == "objectCreatingButtonWithChild") {
			b.isActive = true;
		}
	}

	

	if(screen != 7) {	
		if(latestOpened != null) {
			drawOpenedGate()
		}
		if(pageNames.length != 0) {
			drawPageSection()
		}

		if(getPreference("SimStatus") == "Paused") {
			drawPausedArea()
		} else {
			stepsTakenWhenPaused = 0
		}

		drawObjectCreatingArea();
		for(let b of buttons) {
			b.show();
		}
	}

	for(let cm of contextMenus) {
		cm.show();
	}

	for(let h of highlightedObjects) {
		h.show()
	}



	if(screen == 2) {
		drawSaveScreen()
	}

	if(screen == 3) {
		drawLabelMenu()
	}

	if(screen == 4) {
		drawOptionMenu()
	}

	if(screen == 5) {
		drawLibraryMenu()
	}

	if(screen == 6) {
		drawConfirmScreen()
	}
	if(screen == 7) {
		drawCustomizeScreen()
	}
	if(screen == 8) {
		drawPulseEdit()
	}
	if(screen == 9) {
		drawFindScreen()
	}
	if(screen == 10) {
		drawRebindScreen()
	}
	if(screen == 11) {
		drawROMScreen()
	}
	if(screen == 12) {
		drawQuitScreen()
	}
	

	handleMouseMoving()
	drawSelectedArea()

	if(1) {
		c.beginPath()
		c.arc(mouseStartX, mouseStartY, 5, 0 ,360)
		c.fillStyle = "blue"
		c.fill()
		c.closePath()
	}
	
}

function loadSaveFiles() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Sadece saveFile_ ile başlayanları al
        if (key.startsWith("saveFile_")) {
            try {
                const jsonString = localStorage.getItem(key);
                const rawData = JSON.parse(jsonString);

                // Burası kritik: class prototiplerini geri yükle
                restoreClasses(rawData);

				let tempName = key.substring("saveFile_".length)
				let tempFile = new saveFile(tempName, rawData)
				saveFiles.push(tempFile)
				fileNames.push(tempName)

            } catch (e) {
                console.error("Savefile yüklenemedi:", key, e);
            }
        }
    }
}

function restoreClasses(obj) {

    if (obj === null) return obj;

    // Eğer array ise dizideki her elemanı restore et
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = restoreClasses(obj[i]);
        }
        return obj;
    }

    // Eğer primitive ise bırak
    if (typeof obj !== "object") {
        return obj;
    }

    // Eğer class instance ise (constructor string olarak kaydedildiğini varsayarak)
    if (obj.ObjectName) {
       applyPrototype(obj)
    }

    // Obje ise: içindeki tüm keyler restore edilsin
    for (const key of Object.keys(obj)) {
        obj[key] = restoreClasses(obj[key]);
    }

    return obj;
}


function drawPausedArea() {
	c.font = `bold 24px ${myFont}`
	c.textAlign = "left"
	c.textBaseline = "middle"

	c.beginPath()
	c.fillStyle = "rgba(0,0,0,0.8)"
	c.rect(0,0, canvas.width, 70)
	c.fill()
	c.closePath()

	let textWidth = getTextWidth("Simulation Paused")
	let offset = -350
	c.beginPath()
	c.fillStyle = "rgba(255,235,0,1)"
	c.drawCenteredText("Simulation Paused", canvas.width/2 + offset, 35)
	c.closePath()

	c.beginPath()
	c.fillStyle = "rgba(124,93,0,1)"
	c.drawCenteredText("(press space to advance one step)", canvas.width/2 + offset + textWidth, 35)
	c.closePath()

	c.beginPath()
	c.fillStyle = "rgba(165,165,165,1)"
	c.textAlign = "center"
	c.drawCenteredText(stepsTakenWhenPaused, canvas.width - 50, 35)
	c.closePath()
}

function drawFPS() {
	let currentFPS = getFPS()
	let offset = 50
	c.beginPath()
	c.fillStyle = "white"
	c.rect(canvas.width - offset - 30, offset - 20, 60, 2 * offset - 60)
	c.fill()
	c.closePath()
	c.beginPath()
	c.fillStyle = "green"
	c.textAlign = "center"
	c.font = `24px ${myFont}`
	c.drawCenteredText(currentFPS, canvas.width - offset, offset)
	c.closePath()
}

function updateClockGate() {
	if (stepsPerClockTick <= 0) {
		clockState = true; // sürekli açık kalır
		return;
	}

	clockStepCounter++;

	if (clockStepCounter % (2 * stepsPerClockTick) < stepsPerClockTick) {
		clockState = true; 
	} else {
		clockState = false; 
	}
}

function processMainArea() {
	
	if (getPreference("SimStatus") !== "Active") {
		currentStepsPerSecond = 0
		return;
	}

	const now = performance.now();
	const delta = (now - lastUpdateTime) / 1000;
	lastUpdateTime = now;

	// hedefe hızlı yaklaş
	const effectiveTarget = targetStepsPerSecond;
	simulatedStepsPerSecond += (effectiveTarget - simulatedStepsPerSecond) * 0.25;

	accumulatedTime += delta * simulatedStepsPerSecond;

	const frameStart = performance.now();
	let stepsThisFrame = 0;

	while (accumulatedTime >= 1) {
		updateClockGate()
		if(currentPage == -1) { 
			processArea(getWorkingArea());
		} else {
			processPageAreas();
		}

		
		accumulatedTime -= 1;
		stepsThisFrame++;

		if (performance.now() - frameStart > 15) break;
	}

	// --- ölçüm (her 1 saniyede bir) ---
	if (!processMainArea._lastMeasure) processMainArea._lastMeasure = now;
	if (!processMainArea._stepCounter) processMainArea._stepCounter = 0;

	processMainArea._stepCounter += stepsThisFrame;

	if (now - processMainArea._lastMeasure >= 1000) {
		// 1 saniyede bir anlık hız (steps / saniye)
		const elapsedSec = (now - processMainArea._lastMeasure) / 1000;
		currentStepsPerSecond = processMainArea._stepCounter / elapsedSec;

		processMainArea._stepCounter = 0;
		processMainArea._lastMeasure = now;
	}
}

function processPageAreas() {
	for(let w = 0; w < workingAreas.length; w++) {
		let tempStation = workingAreas[w];
		processArea(tempStation);

		let nextWorkingArea = w != workingAreas.length - 1 ? workingAreas[w + 1] : getWorkingArea(true);
		
		//console.log(pageNames[w], nextWorkingArea)
		setPageAreaInputs(pageNames[w], tempStation, nextWorkingArea);
	}
}

function setPageAreaInputs(gate, firstArea, secondArea) {
	if(!include(firstArea, gate)) console.log(123)
	let currentLit = [];
	let currentMemory = [];
	
	let useableInputLength
	let useableOutputLength

	useableInputLength = gateInfos[gate.name].useableIO[0]
	useableOutputLength = gateInfos[gate.name].useableIO[1]
	if(!include(displayNames, gate.name) && gateInfos[gate.name].isMemoryHolder && include(fastProcessedGates, gate.name)) {
		currentMemory = gate.memory.slice();
	}
	for(let i of gate.inputs) {
		let tempInput = decode(firstArea, i)
		if(tempInput.FP_useable) {
			for(let t = 0; t < tempInput.type; t++) {
				currentLit.push(+tempInput.lit[t])
			}
		}
	}


	if(include(fastProcessedGates, gate.name) && gateInfos[gate.name].isMemoryHolder) {	
		let targetTruthTable = currentMemory.concat(currentLit)
		let finishedIterations = [];
		
		let firstTruthTable = [];
		firstTruthTable = gateInfos[gate.name].initialMemory.slice()
		for(let i = 0; i < useableInputLength; i++) {
			firstTruthTable = firstTruthTable.concat([0]);
		}

		let targetInputOrder = []
		let toDoList = [];
		if(!equals(firstTruthTable, targetTruthTable)) getTruthTable([], firstTruthTable);

		//The main function that gets the inputOrder
		function getTruthTable(inputOrder, currentTruthTable) {
			//console.log(currentTruthTable)
			if(targetInputOrder.length != 0) return targetInputOrder;
			turnOffMainOutputs(outputs)
			finishedIterations.push(parseInt(currentTruthTable.join(""), 2))
			let tempValues = fastProcessInfos[gate.name].values;
			let truthTableLengths = getTruthTableLength(gate.name)
			let oneTruthTableLength = truthTableLengths[2]

			for(let i = 0; i < useableInputLength; i++) {
				let changedTruthTable = currentTruthTable.slice();
				changedTruthTable[i + currentMemory.length] = +!+currentTruthTable[i + currentMemory.length];
				let newInputOrder = inputOrder.slice();
				newInputOrder.push(i)
				let iteration = parseInt(changedTruthTable.join(""), 2)

				let newTruthTable = changedTruthTable.slice()

				if(gateInfos[gate.name].isLooping) {
					for(let m = 0; m < gate.memory.length; m++) {
						newTruthTable[m] = tempValues[oneTruthTableLength * iteration + currentTruthTable.length + m]
					}
				} else {
					for(let m = 0; m < gate.memory.length; m++) {
						newTruthTable[m] = tempValues[oneTruthTableLength * iteration + useableOutputLength + currentTruthTable.length + m]
					}
				}
				if(!include(finishedIterations, parseInt(newTruthTable.join(""), 2))) {
					if(equals(newTruthTable, targetTruthTable)) {
						targetInputOrder = newInputOrder.slice();
						return inputOrder
					} else {
						toDoList.push([newInputOrder, newTruthTable])
					}
				}	
			}
			toDoList.sort((a, b) => {
				let distA = hammingDistance(a[1], targetTruthTable);
				let distB = hammingDistance(b[1], targetTruthTable);
				return distA - distB; 
			});
			let tempArr = toDoList.shift()
			getTruthTable(tempArr[0], tempArr[1])	
		}
		turnOffMainOutputs(outputs)

		// Helper function to decide which switch to change
		function findSwitch(arr, targetSwitch) {
			let counter = 0
			for(let i = 0; i < arr.length; i++) {
				if(arr[i].parentCode == null && arr[i].outputs.length != 0) {
					if(arr[i].type + counter > targetSwitch) {
						return {output: arr[i], switchNumber: (targetSwitch - counter)}
					} else {
						counter += arr[i].type
					}
				}
			}
			console.log("HATA")
			return null
		}
		
		//console.log("InputOrder: " + targetInputOrder)
		for(let i = 0; i < targetInputOrder.length; i++) {
			let switchValues = findSwitch(secondArea.filter(obj => obj.ObjectName == "Output"), targetInputOrder[i])
			switchValues.output.lit[switchValues.switchNumber] = !switchValues.output.lit[switchValues.switchNumber]
			processArea(secondArea)		
		}
		processArea(secondArea)
		////


	} else {

		let counter = 0
		for(let s of secondArea) {			
			if(s.ObjectName == "Output" && s.parentCode == null && s.FP_useable) {
				for(let t = 0; t < s.type; t++) {
					s.lit[t] = !!currentLit[counter];
					counter++
				}	
			}
		}
		processArea(secondArea)		
		
	}
	
}

function stabilizeArea(objects = getWorkingArea(), maxIter = 1024) {
    let seen = new Map(); // stateString -> iteration index
    let history = [];

    for (let iter = 0; iter < maxIter; iter++) {
        // 1) run one full processing pass
        processArea(objects);
        let state = captureState(objects);
        history.push(state);

        if (seen.has(state)) {
            let startIndex = seen.get(state);
            return
        }
        seen.set(state, iter);

        // quick stable check: if previous state equals current -> stable fixed point
        if (iter > 0 && history[iter] === history[iter - 1]) {
            return
        }
    }

    // maxIter reached -> give up (treat as oscillatory/unresolved)
    return {
        stable: false,
        cycle: { startIndex: 0, length: history.length },
        finalStateString: history[history.length - 1],
        history
    };
}

function captureState(objects) {
    // objects: proccessableObjects veya tüm ilgili objelerin array'i
    // Biz gate çıktıları, gate memory (varsa), ana input/output lit değerlerini alıyoruz.
    let parts = [];
    for (let obj of objects) {
        if (obj.ObjectName == "Gate") {
            // gate outputs
            if (obj.outputs) {
                for (let o of obj.outputs) {
                    let out = decode(objects, o); // veya uygun array
                    for (let b = 0; b < out.type; b++) parts.push(out.lit[b] ? "1" : "0");
                }
            }
            // internal memory array varsa al
            if (Array.isArray(obj.memory) && obj.memory.length > 0) {
                for (let m of obj.memory) parts.push(m ? "1" : "0");
            }
        } else if (obj.ObjectName == "Output") {
            // Ana output'ların lit'leri (özellikle parentCode == null)
            if (obj.parentCode == null) {
                for (let b = 0; b < obj.type; b++) parts.push(obj.lit[b] ? "1" : "0");
            }
        } else if (obj.ObjectName == "Input") {
            if (obj.parentCode == null) {
                for (let b = 0; b < obj.type; b++) parts.push(obj.lit[b] ? "1" : "0");
            }
        }
    }
    return parts.join("");
}

function processArea(rawObjects) {
	//if(objects.length != 16) console.log(objects)
	let objects = rawObjects.filter(obj => !include(creatingObjects, obj))
	//console.log(objects.length)
	//Splits the "objects"
	let tempGates = [];
	let tempInputs = [];
	let tempOutputs = [];
	let tempCables = [];
	let tempDisplays = [];
	let tempBusses = []
	let proccessableObjects = []
	for(let obj of objects) {
		if(obj.ObjectName == "Gate") tempGates.push(obj)
		if(obj.ObjectName == "Input") tempInputs.push(obj) 
		if(obj.ObjectName == "Output") tempOutputs.push(obj)
		if(obj.ObjectName == "Bus") tempBusses.push(obj)
		if(obj.ObjectName == "Cable") tempCables.push(obj) 
		if(obj.ObjectName == "Display") tempDisplays.push(obj)
		if(obj.ObjectName == "Display" || obj.ObjectName == "Gate") proccessableObjects.push(obj)
	}
	////////////

	//Restarts all the objects' "isPowered" and "basePower"
	for(let obj of [...tempGates, ...tempInputs, ...tempOutputs]) {
		obj.isPowered = Array(obj.type).fill(false)
		obj.basePower = Array(obj.type).fill(false)
	}
	// Except main outputs
	for(let o of tempOutputs) {
		if(o.parentCode == null) {
			o.basePower = Array(o.type).fill(true)
			o.isPowered = Array(o.type).fill(true)

			//Transfers the first powers
			for(let c of o.outputs) {
				let tempCable = decode(tempCables, c)
				tempCable.transfer(tempOutputs, tempInputs, tempCables)
			}
		} 		
	}
	
	for(let g of proccessableObjects) {
		g.powerSupply(tempOutputs, tempInputs)
	}
	//


	// Processes "proccessableObjects"
	let proccessedObjects = [];
	while(proccessedObjects.length != proccessableObjects.length) {
		let needToProcessObjects = [];
		for(let g of proccessableObjects) {
			if(g.isPowered == true && !include(proccessedObjects, g)) { // include silsen süper olabilir bir bak derim ???proccessableObjects == 0 olunca bitsin falan
				needToProcessObjects.push(g)
			}
		}

		// Detects the loop and handles it	
		if(needToProcessObjects.length == 0 && proccessedObjects.length != proccessableObjects.length) {
			if(debugMode) {console.log("LOOP")}
			//Sorts the array
			let tempArr = proccessableObjects.filter(obj => !include(proccessedObjects, obj)).sort((a, b) => {
				if(a.numberOfInputsLit !== b.numberOfInputsLit) {
					return b.numberOfInputsLit - a.numberOfInputsLit;
				}
				return a.delay - b.delay;
			});
			needToProcessObjects.push(tempArr[0]);	
		}
		///////////////////////////////////////

		for(let obj of needToProcessObjects) {
			if(obj.ObjectName == "Gate") obj.process(tempOutputs, tempInputs);
			if(obj.ObjectName == "Display") obj.process(tempOutputs, tempInputs, rawObjects);
			proccessedObjects.push(obj);
			nextTransfer(obj)			
		}

		for(let obj of proccessableObjects) {
			obj.powerSupply(tempOutputs, tempInputs) // !!! optitimize et nextTransfere koy bu kısmı
		}
	}

	function nextTransfer(gate) {
		for(let o of gate.outputs) {
			let tempOutput = decode(tempOutputs, o)
			for(let c of tempOutput.outputs) {
				let tempCable = decode(tempCables, c)
				tempCable.transfer(tempOutputs, tempInputs, tempCables);
			}
		}
	}

	//if(debugMode) console.log(proccessableObjects)
	//proccessedObjects.forEach((i) => console.log(i.name))
}

document.addEventListener("visibilitychange", () => {
	if (document.hidden) {
		//simPausedByVisibility = true;
	} else {
		lastUpdateTime = performance.now();
		accumulatedTime = 0;
		//simPausedByVisibility = false;
	}
});

let edittingPulse = null
function handlePulseEdit(gate) {
	defaultScreenChanger()
	screen = 8
	edittingPulse = gate
	peInput.value = gate.pulseWidth
	focusInput(peInput)
}

function handleRebindScreen(gate) {
	defaultScreenChanger()
	screen = 10
	rebindingGate = gate
	changingKeyValue = gate.keyValue
}

function clearAllROM() {
	let tempInputs = getROMInputs()
	for(let i of tempInputs) {
		i.value = 0
	}
	fixROMInputValue()
}

function cancelRebindScreen(applyChanges) {
	screen = 0
	if(applyChanges) {
		rebindingGate.keyValue = changingKeyValue
		rebindingGate.nameOrder = [changingKeyValue]
	}
	changingKeyValue = null
	rebindingGate = null
}

let changingROMGate = null
function handleROMScreen(gate) {
	defaultScreenChanger()
	changingROMGate = gate
	screen = 11
	changingROM.display = gate.romDisplay

	const rows = romContainer.querySelectorAll(".romRow");
	rows.forEach(row => {
        row.style.display = "block";
    });

	let tempInputs = getROMInputs()
	for(let index = 0; index < tempInputs.length; index++) {
		tempInputs[index].value = changeROMValueFromBinary(gate.romValues[index])
	}

	focusInput(romContainer.childNodes[0].childNodes[1])

}

function getROMInputs() {
	let tempArr = []
	for(let i of romContainer.childNodes) {
		tempArr.push(i.childNodes[1])
	}
	return tempArr
}

function cancelROMScreen(applyChanges) {
	screen = 0;
	
    const rows = romContainer.querySelectorAll(".romRow");
    rows.forEach(row => {
        row.style.display = "none"; // canvas click artık geçer
    });

	if(applyChanges) {
		let tempInputs = getROMInputs()
		fixROMInputValue()

		for(let index = 0; index < tempInputs.length; index++) {
			changingROMGate.romValues[index] = valueToBinary(tempInputs[index].value)
			changingROMGate.romDisplay = changingROM.display
		}
	}

	changingROMGate = null
}

function valueToBinary(text) {
    let num = 0;

    switch(changingROM.display) {
        case "Unsigned Decimal":
            num = parseInt(text, 10) & 0xFFFF;
            break;

        case "Signed Decimal":
            num = parseInt(text, 10);
            if(num < 0) num = (num + 0x10000) & 0xFFFF;
            break;

        case "Binary":
            num = parseInt(text, 2) & 0xFFFF;
            break;

        case "HEX":
            num = parseInt(text, 16) & 0xFFFF;
            break;
    }

    // sonra kesin 16 bit binaryye çevir
    return num.toString(2).padStart(16, "0");
}

function changeROMValueFromBinary(binary) {
	let num = parseInt(binary, 2);

	let value = ""; // Gösterilecek/değere yazılacak final veri

	switch (changingROM.display) {

		case "Unsigned Decimal":
			value = num.toString(10);
			break;

		case "Signed Decimal":
			if (num & 0x8000) num = num - 0x10000; // 16-bit signed interpret
			value = num.toString(10);
			break;

		case "Binary":
			value = num.toString(2).padStart(16, "0");
			break;

		case "HEX":
			value = num.toString(16).toUpperCase().padStart(4, "0");
			break;
	}
	return value
}

function copyROM() {
	let tempInputs = getROMInputs()
	fixROMInputValue()
	for(let index = 0; index < tempInputs.length; index++) {
		changingROM.copiedROM[index] = valueToBinary(tempInputs[index].value)
	}
}

function pasteROM() {
    let tempInputs = getROMInputs();
    fixROMInputValue();
    for (let index = 0; index < tempInputs.length; index++) {
        tempInputs[index].value = changeROMValueFromBinary(changingROM.copiedROM[index]);
    }
}

function changeROMDisplayMode(value) {
	fixROMInputValue()

	let previousDisplayMode = changingROM.display
	changingROM.display = changingROM.displayTypes[(findIndex(changingROM.displayTypes, changingROM.display) + changingROM.displayTypes.length + value) % changingROM.displayTypes.length]
	
	let tempInputs = getROMInputs()
	for (let i of tempInputs) {
		let text = i.value;
		let rawValue;
		switch (previousDisplayMode) {
			case "Unsigned Decimal":  rawValue = parseInt(text,10) & 0xFFFF; break;
			case "Signed Decimal":
				rawValue = parseInt(text,10);
				if (rawValue < 0) rawValue = (rawValue + 0x10000) & 0xFFFF;
				break;
			case "Binary": rawValue = parseInt(text,2) & 0xFFFF; break;
			case "HEX": rawValue = parseInt(text,16) & 0xFFFF; break;
		}
		switch (changingROM.display) {
			case "Unsigned Decimal":
				i.value = rawValue.toString(10);
				break;

			case "Signed Decimal":
				if (rawValue & 0x8000) rawValue = rawValue - 0x10000;
				i.value = rawValue.toString(10);
				break;

			case "Binary":
				i.value = rawValue.toString(2).padStart(16,"0");
				break;

			case "HEX":
				i.value = rawValue.toString(16).toUpperCase().padStart(4,"0");
				break;
		}
	}
}

function fixROMInputValue(input) {
	if(input == null) {
		//Fixes all input
		let tempInputs = getROMInputs()
		for(let i of tempInputs) {
			fixROMInputValue(i)
		}
	} else {
		let value = input.value
		if(changingROM.display == "Unsigned Decimal")  {
			input.value = clamp(value, 0, 65535)
		}
		if(changingROM.display == "Signed Decimal")  {
			input.value = clamp(value, -32768, 32767)
		}
		if(changingROM.display == "Binary")  {
			input.value = value.padStart(16, 0)
		}
		if(changingROM.display == "HEX")  {
			input.value = value.padStart(4, 0)
		}
	}
}

function filterROMInput(input) {
    let value = input.value;

    switch(changingROM.display) {
       case "Unsigned Decimal":
            value = value.replace(/[^0-9]/g, '');
            break;

        case "Signed Decimal":
            value = value.replace(/[^0-9-]/g, '');  // sayı ve - dışı sil
            value = value.replace(/(?!^)-/g, '');   // - sadece başta olacak
            break;

		case "Binary":
			value = value.replace(/[^01]/g, '');
			value = value.slice(0,16)
			break;

        case "HEX":
            value = value.replace(/[^0-9a-fA-F]/g, '');
			value = value.toUpperCase()
			value = value.slice(0,4)
            break;

        default:
            break;
    }

    input.value = value;
}

function focusInput(input) {
	setTimeout(() => {
    	input.focus();
	}, 20);
}



let createButtonsForPulseEdit = true
let pulseEditButtons = []
let peRect = {w: 370, h: 220}
function drawPulseEdit() {
	peRect.x = (canvas.width - peRect.w)/2
	peRect.y = (canvas.height - peRect.h)/2 - gateCreatingAreaMetrics.height
	drawDarkener()

	c.beginPath()
	c.strokeStyle = "rgba(66,66,66,1)"
	c.fillStyle = "rgba(41,41,41,1)"
	c.lineWidth = 6
	c.rect(peRect.x, peRect.y, peRect.w, peRect.h)
	c.stroke()
	c.fill()
	c.closePath()

	c.beginPath()
	c.fillStyle = "rgba(171,171,171,1)"
	c.textAlign = "center"
	c.textBaseline = "middle"
	c.font = `bold 28px ${myFont}`
	c.drawCenteredText("Pulse Width (ticks)", peRect.x + peRect.w/2, peRect.y + 33)
	c.closePath()

	peInput.style.visibility = "visible"
	if(createButtonsForPulseEdit) {
		pulseEditButtons.push(new Button(peRect.x + 20, peRect.y + 150, "CANCEL", "subPulseEditButton", () => cancelPulseEdit(false)))
		pulseEditButtons.push(new Button(peRect.x + 190, peRect.y + 150, "CONFIRM", "subPulseEditButton", () => cancelPulseEdit(true)))
		pulseEditButtons.forEach((obj) => {
			obj.width = 160
			obj.height = 50
		})
		createButtonsForPulseEdit = false
	}

	changeInputPos(peInput, peRect.x + peRect.w/2 - 50 - 10, peRect.y + 70, 100, 50)
	strokeInput(peInput, "black", 3)
	


	for(let b of pulseEditButtons) {
		b.show()
	}
}

function cancelPulseEdit(applyChanges) {
	screen = 0
	peInput.style.visibility = "hidden"

	if(applyChanges) {
		edittingPulse.pulseWidth = parseInt(peInput.value)
	}
}

function drawSelectedArea() {
	if(mouseOccupation == "areaSelecting") {
		c.beginPath()
		c.fillStyle ="rgba(255,255,255,0.1)"
		selectedArea.w = mouseScreenX - selectedArea.x
		selectedArea.h = mouseScreenY - selectedArea.y
		c.rect(selectedArea.x, selectedArea.y,selectedArea.w , selectedArea.h)
		c.fill()
		c.closePath()
	}
}

function createWheels() {
	// Starred
	let tempWheel1 = new Wheel(sr.x + sr.w - 40, sr.y + 60, 20, sr.h-80, sr.h-120, sr.y + 80, sr.y + sr.h - 40)
	tempWheel1.name = "starred"
	wheels.push(tempWheel1)
	// Collection
	let tempWheel2 = new Wheel(cr.x + cr.w - 40, cr.y + 60, 20, cr.h-80, cr.h -120, cr.y + 80, cr.y + cr.h - 40)
	tempWheel2.name = "collection"
	wheels.push(tempWheel2)

	// Customize
	let tempWheel3 = new Wheel(cRect.w - 40, 600, 20, 380, 340, 620, 960)
	tempWheel3.name = "customize"
	wheels.push(tempWheel3)

	// Find
	let tempWheel4 = new Wheel(fRect.x + fRect.w - 40, fRect.y + 160, 20, 760, 720, fRect.y + 180, fRect.y + fRect.h - 40)
	tempWheel4.name = "find"
	wheels.push(tempWheel4)

	// ROM
	let tempWheel5 = new Wheel(roRect.x + roRect.w - 20, roRect.y, 20, roRect.h, roRect.h - 40, roRect.y + 20, roRect.y + roRect.h - 20)
	tempWheel5.name = "rom"
	wheels.push(tempWheel5)

	//Quit
	let tempWheel6 = new Wheel(opRect.x + opRect.w - 20, opRect.y, 20, opRect.h, opRect.h - 40, opRect.y + 20, opRect.y + opRect.h - 20)
	tempWheel6.name = "quit"
	wheels.push(tempWheel6)
}

function calculateGateWH(name, info) {
	if(name == "KEY") { // Special Case
		return {width: gridInfos.spacing * 3, height: gridInfos.spacing * 3}
	}

	let minWidth  = gridInfos.spacing * 3
	let minHeight = gridInfos.spacing * 3
	let tempWidth
	let tempHeight
	if(include(displayNames, name)) {
		if(name == "7 SEGMENT") {
			tempWidth = 150
			tempHeight = 240
		}
		if(name == "LED") {
			tempWidth = 30
			tempHeight = 30
		}
		if(name == "RGB DISPLAY") {
			tempWidth = 21*15
			tempHeight = 21*15
		}
		if(name == "DOT DISPLAY") {
			tempWidth = 14*15
			tempHeight = 14*15
		}
	} else {
		let inputCount = info.gateIO[0]
		let outputCount = info.gateIO[1]

		// Calculates the height of the object depending on its max value of inputs and outputs and name.
		let inputHeight = 0;
		let outputHeight = 0;

		for(let n = 0; n < inputCount.length; n++) {
			inputHeight += radiusOfPuts[inputCount[n]] * 2
		}
		for(let n = 0; n < outputCount.length; n++) {
			outputHeight += radiusOfPuts[outputCount[n]] * 2
		}

		let maxIO = Math.max(inputCount.length, outputCount.length);
		let totalHeightOfPuts = Math.max(inputHeight, outputHeight) + ((maxIO - 1) * spaceBetweenPuts) + putOffset * 2
		let totalHeightOfName = 0

		let nameOrder = getBestDistribution(name)
		for(let n = 0; n < nameOrder.length; n++) {
			c.textAlign = "center";
			c.letterSpacing = "1px";
			c.font = `bold 32px ${myFont}`
			totalHeightOfName += getTextHeight(nameOrder[n]);
		}
		totalHeightOfName += spaceBetweenLines * (nameOrder.length - 1);
		totalHeightOfName += gateNameHeightOffset * 2

		
		tempHeight = Math.max(totalHeightOfPuts, totalHeightOfName)
		tempHeight = Math.ceil(tempHeight / gridInfos.spacing) * gridInfos.spacing
		
		// Calculates the width of the object depending on its name
		c.font = `bold 32px ${myFont}`
		c.letterSpacing = "1px"
		tempWidth = -Infinity
		for(let line of nameOrder) { 
			c.textAlign = "center";
			let metrics = c.measureText(...line)
			tempWidth = Math.max(Math.floor(metrics.width), tempWidth);	
		}
		tempWidth += gateWidthOffset
		tempWidth = Math.ceil(tempWidth / gridInfos.spacing) * gridInfos.spacing
		
		tempWidth = Math.max(tempWidth,  minWidth)
		tempHeight = Math.max(tempHeight, minHeight)
	}
	return {width: tempWidth, height: tempHeight}
}

function handleFastProcess() {
	if(fastProcessQueue.length > 0) {
		if(currentFastProcess == null) {
			// (fastProcessingRunning || 1) olsa mesela ve paralel çalışabilse ???
			currentFastProcess = fastProcessQueue[0];
			calculateFastProcessValues(fastProcessQueue.shift(), true)
		}
	}
}


function drawDarkener() {
	c.beginPath()
	c.fillStyle = "rgba(0,0,0, 0.9)";
	c.rect(0,0, canvas.width, canvas.height)
	c.fill();
	c.closePath()
}

let confirmButtons = []
let createButtonsForConfirmScreen = true
function drawConfirmScreen() {
	drawDarkener()

	let bigR = {w: 710, h: 200}
	bigR.x = canvas.width/2 - bigR.w/2
	bigR.y = canvas.height/2 - bigR.h/2 - gateCreatingAreaMetrics.height
	if(createButtonsForConfirmScreen) {
		let button1 = new Button(bigR.x + 20, bigR.y + 130, "CANCEL", "confirmScreen", () => cancelConfirmScreen())
		confirmButtons.push(button1)
		button1.width = 330
		button1.height = 50

		let button2 = new Button(bigR.x + 360, bigR.y + 130, "CONFIRM", "confirmScreen", () => confirmRequest())
		confirmButtons.push(button2)
		button2.width = 330
		button2.height = 50
		
		createButtonsForConfirmScreen = false
	}

	let lw = 4
	c.beginPath()
	c.lineWidth = lw
	c.letterSpacing = "0.5px"
	c.fillStyle = "rgba(41, 41, 41, 1)"
	c.strokeStyle = "rgba(66,66,66,1)"
	c.rect(bigR.x - lw/2, bigR.y - lw/2, bigR.w + lw, bigR.h + lw)
	c.stroke()
	c.fill()
	c.closePath()

	c.beginPath()
	c.fillStyle = "rgba(28, 28, 28, 1)"
	c.rect(bigR.x + 20, bigR.y + 20, bigR.w - 40, 90)
	c.fill()
	c.closePath()

	let tempParagraph = "The current chip has unsaved changes. Are you sure you want to continue?"
	c.lineW
	c.font = `27px ${myFont}`
	c.fillStyle = "rgba(255,102,115)"
	c.drawParagraph(tempParagraph, bigR.x + 35 + 5, bigR.y + 35, 640, 38)

	for(let b of confirmButtons)  {
		b.show()
	}
}

function confirmRequest() {
	cancelConfirmScreen()
	requestedConfirm()
	requestedConfirm = null
}

function cancelConfirmScreen() {
	confirmButtons = []
	createButtonsForConfirmScreen = true
	screen = savedScreen
}


let limitedGates = []
function drawOpenedGate() {
	for(let b of buttons) {
		if(b.style == "gateButton") {
			if(include(limitedGates, b.name)) {
				b.isActive = false
			}
		}
	}


	//Big Rect
	let tempY = getPreference("SimStatus") == "Active" ? 0 : 70
	c.beginPath();
	c.rect(0,tempY, canvas.width, 70);
	c.fillStyle = "rgba(0, 0, 0, 0.4)"
	c.fill()

	//Main Header
	c.fillStyle = "rgba(35, 226, 28, 1)"
	c.font = `bold 45px ${myFont}`
	c.textAlign = "center";
	c.textBaseline = "middle"
	c.drawCenteredText("OPENED:", 130, 35 + tempY)
	c.closePath();

	//Writes down the latestOpened
	c.beginPath()
	c.fillStyle = "white"
	c.font = `45px ${myFont}`
	c.textAlign = "left"	
	c.drawCenteredText(latestOpened, 250, 35 + tempY)
	c.closePath()
}

function calculateCreatedFrom(name) {
	if(gateInfos[name].savedGate != undefined) {
		let tempCreatedFrom = [];
		for(let s of gateInfos[name].savedGate) {
			if(s.ObjectName == "Gate") {
				if(!include(tempCreatedFrom, s.name)) {
					tempCreatedFrom.push(s.name)
				}
			}
		}
		gateInfos[name].createdFrom = tempCreatedFrom
	}	
}

function getDefaultGates() {
	defaultGates = []
	for(let n of Object.entries(defaultFile.globalInfos.gateInfos)) {
		defaultGates.push(n[0])
	}
}

function getGateNames() {
	gateNames = []; 
	for(let i = 0; i< Object.entries(gateInfos).length; i++) {
		gateNames.push(Object.entries(gateInfos)[i][0])
	}
}

function willFastProcessed(name, checkChildGates = true, infos = gateInfos[name]) {
	if(include(defaultGates, name)) return false
	if(include(displayNames, name)) return false
	if(infos.isThreeState) return false

	let restrictedNames = ["KEY", "CLOCK", "PULSE"] // Bunlar varsa fp olamaz
	if(!checkRestricted(infos.savedGate)) {
		return false
	}
	
	let tempLengths = getTruthTableLength(name, infos)
	let inputTruthTableLength = tempLengths[0]
	let oneTruthTableLength = tempLengths[2]

	for(let v of infos.savedGate) {
		if(v.ObjectName == "Gate") {
			if(gateInfos[v.name].isMemoryHolder && !include(fastProcessedGates, v.name) && checkChildGates) {	
				return false; // İç içe fast process olmamış memoryHolders varsa --> false		
			}
		}	
	}

	return (2**maxTruthTableLengthThreshold >  oneTruthTableLength * 2**inputTruthTableLength)

	//Checks the restricted names
	function checkRestricted(arr) {
		for(let obj of arr) {
			if(obj.ObjectName == "Gate") {
				if(include(restrictedNames, obj.name)) {
					return false
				}
				if(obj.visualObjects.length > 0) {
					if(!checkRestricted(obj.visualObjects)) {
						return false
					}
				}			
			}
		}
		return true
	}
	//
}

function isCheckBoxAccessible() {
	if(screen == 7) {
		if(customizeDisplays.length > 0) {
			return false
		}
	}

	/// ??? şu anlık çalışıyor ama buna dikkatli ol
	if(screen == 2) {
		if(latestOpened != null) {
			if(gateInfos[latestOpened].displays.length > 0) {
				return false
			}
		}
	}
	

	return willFastProcessed(gateInputBox.value, true, tempGateInfos)	
}

function getTotalIO(numberOfIO) {
	if(numberOfIO[0] instanceof Array) {
		return getTotalIO(numberOfIO[0]) + getTotalIO(numberOfIO[1])
	}
	let sum = numberOfIO.reduce((sum, x) => sum + x, 0);
	return sum;
}

function getWorkingArea(getEmptyPuts = true) {
	savingGate = [];

	for(let o of outputs) {
		if(o.parentCode == null && (getEmptyPuts || o.outputs.length > 0)) {
			savingGate.push(o);
		}
	}
	for(let i of inputs) {
		if(i.parentCode == null && (getEmptyPuts || i.inputs.length > 0)) {
			savingGate.push(i);
		}
	}

	for(let g of gates) {
		savingGate.push(g);
		for(let I of g.inputs) {
			let i = decode(inputs, I);
			savingGate.push(i);
		}
		for(let O of g.outputs) {
			let o = decode(outputs, O);
			savingGate.push(o);
		}
	}
	for(let d of displays) {
		savingGate.push(d);
		for(let I of d.inputs) {
			let i = decode(inputs, I);
			savingGate.push(i);
		}
		for(let O of d.outputs) {
			let o = decode(outputs, O);
			savingGate.push(o);
		}
	}
	for(let b of busses) {
		savingGate.push(b)
		for(let I of b.inputs) {
			let i = decode(inputs, I);
			savingGate.push(i);
		}
		for(let O of b.outputs) {
			let o = decode(outputs, O);
			savingGate.push(o);
		}
	}
	for(let c of cables) {
		savingGate.push(c);
	}
	return savingGate;
}

function drawObjectCreatingArea() {
	// Object Creating Area
	c.beginPath()
	c.fillStyle = "rgba(30, 30, 30, 1)";
	c.rect(gateCreatingAreaMetrics.x, gateCreatingAreaMetrics.y, gateCreatingAreaMetrics.width, gateCreatingAreaMetrics.height);
	c.fill();
	c.closePath();
}

function drawPageSection() {
	// Draws the page change section

	let tempY = 0
	if(getPreference("SimStatus") == "Paused") tempY += 70

	c.beginPath();
	c.rect(0,tempY, canvas.width, 70);
	c.fillStyle = "rgba(0, 0, 0, 0.7)"
	c.fill()
	c.fillStyle = "rgba(240,90,80)"
	c.font = `bold 45px ${myFont}`
	c.textAlign = "center";
	c.textBaseline = "middle"
	c.drawCenteredText("VIEWING:", 130, 35 + tempY)
	c.closePath();

	for(let b of buttons) {
		if(b.style == "backButton") {
			b.y = 10 + tempY
			b.show();
		}
		if(b.style == "gateButton") {
			b.isActive = false;
			b.highlight = false;
		}
		if(b.style == "objectCreatingButtonWithChild") {
			b.isActive = false;
			b.highlight = false;
		}
	}	

	//Writes down the "pageNames"
	c.beginPath()
	c.fillStyle = "white"
	c.font = `32px ${myFont}`
	c.textAlign = "left"
	c.textBaseline = "middle"
	let pageString = ""
	for(let n = 0; n < pageNames.length; n++) {
		if(c.measureText(pageNames[n].name).width + c.measureText(pageString).width + c.measureText(" > ").width < canvas.width - 475) {
			pageString = pageString.concat(pageNames[n].name)
			if(n < pageNames.length  - 1) {
				pageString = pageString.concat(" > ")
			}
		} else {
			pageString = pageString.concat("...")
			break;
		}
	}	
	c.drawCenteredText(pageString, 250, 35 + tempY)
	c.closePath()
}

let tempGateInfos = {}
let customizingGate = null
let savedMouseOccupation = null
function handleSaveScreen() {
	defaultScreenChanger()
 	screen = 2
	getTempGateInfos()
	customizingGate = new Gate(canvas.width/2, canvas.height/2, null)

	let tempWH
	let infos = gateInfos[latestOpened]
	if(latestOpened == null) {
		tempWH = calculateGateWH(null, tempGateInfos)	
		customizeMenuSavedPreferences.nameMode = "Middle";
		customizingGate.nameMode = "Middle"
	} else {
		tempWH = {width: infos.width, height: infos.height}
		customizingGate.nameMode = infos.nameMode
		customizeMenuSavedPreferences.nameMode = infos.nameMode
		customizeMenuSavedPreferences.displays = currentCustomizedDisplayArray
	}

	//WH
	customizeMenuSavedPreferences.width = tempWH.width
	customizeMenuSavedPreferences.height = tempWH.height
	
	customizingGate.width = tempWH.width
	customizingGate.height = tempWH.height
	//

	customizingGate.numberOfIO = tempGateInfos.gateIO
	customizingGate.useableIO = tempGateInfos.useableIO
	let tempInputs = []
	let tempOutputs = []
	customizingGate.createPuts([tempInputs, tempOutputs], tempGateInfos)
	customizingPuts = tempInputs.concat(tempOutputs)
	

	

	customizingGate.calculateHitbox()
}

function saveScreenCancel() {
	savedMouseOccupation = null
	screen = 0;
	
	checkboxs = []; 
	colorPickers = []; 
	saveScreenButtons = []
	gateInputBox.style.visibility = "hidden"
	gateInputBox.value = ""
	createButtonsForSaveScreen = true
	tempGateInfos = {}
	customizingGate = null
	customizeMenuSavedPreferences = {width: 0, height: 0, nameMode: null, color: null, strokeStyle: null, checkBox: null, displays: []}
	customizingPuts = []
}



let createButtonsForSaveScreen = true
let saveScreenButtons = []
function drawSaveScreen() {
	const boxOffset = 20;
	let LW = 4
	const saveBox = {x: canvas.width / 2 - 440, y: canvas.height / 2 - 105 - gateCreatingAreaMetrics.height, w:880, h: 210}
	c.textBaseline = "middle"
	

	if(createButtonsForSaveScreen) {
		saveScreenButtons = []

		colorPickers.push(new ColorPicker(0, 0));
		if(latestOpened != null) {
			colorPickers[0].setColor(rgbaToHSB(gateInfos[latestOpened].color))
		}

		let accessible = isCheckBoxAccessible()

		let defaultTicked = true
		checkboxs.push(new Checkbox(cRect.w - 80, 1000, 60, defaultTicked && accessible, accessible));
		customizeMenuSavedPreferences.checkBox = checkboxs[0].isActive
		

		saveScreenButtons.push(new Button(saveBox.x + boxOffset, saveBox.y + 140, "CANCEL", "subSaveButton", () => {saveScreenCancel()}));
		saveScreenButtons.push(new Button(saveBox.x + boxOffset + 820/3 + 10, saveBox.y + 140, "CUSTOMIZE", "subSaveButton", () => {handleCustomizeScreen()}));
		saveScreenButtons.push(new Button(-1000, -1000, "RENAME", "subSaveButton", () => renameSavedGate()));
		saveScreenButtons.push(new Button(saveBox.x + boxOffset + (820/3 + 10)* 2, saveBox.y + 140, "SAVE", "subSaveButton", () => {createNewGate()}));


		changeInputPos(gateInputBox, saveBox.x + boxOffset + LW , saveBox.y + boxOffset + LW, saveBox.w - boxOffset * 2 - 20 - 2*LW, 110 - 4*LW)
		if(latestOpened != null) {
			gateInputBox.value = latestOpened
		}
		gateInputBox.style.visibility = 'visible';

		createButtonsForSaveScreen = false
	}


	drawDarkener()

	
	// Draws the background of the information box
	c.beginPath()
	c.lineWidth = LW
	c.fillStyle = "rgba(41, 41, 41, 1)";
	c.strokeStyle = "rgba(66,66,66,1)"
	c.rect(saveBox.x, saveBox.y, saveBox.w, saveBox.h)
	c.fill()
	c.rect(saveBox.x - LW/2, saveBox.y - LW/2, saveBox.w + LW, saveBox.h + LW)
	c.stroke()

	c.closePath()

	

	strokeInput(gateInputBox, "black", LW)

	tempGateInfos.name = gateInputBox.value

	customizeMenuSavedPreferences.color = colorPickers[0].selectedColor
	customizeMenuSavedPreferences.strokeStyle = colorPickers[0].strokeStyle

	// Organize Buttons
	if(latestOpened != null) {
		if(gateInputBox.value != latestOpened) {
			for(let b of saveScreenButtons) {
				b.width = 810/4
			}
			saveScreenButtons[0].x = saveBox.x + boxOffset
			saveScreenButtons[1].x = saveBox.x + boxOffset + (810/4 + 10)
			saveScreenButtons[2].x = saveBox.x + boxOffset + (810/4 + 10) * 2
			saveScreenButtons[2].y = saveBox.y + 140
			saveScreenButtons[3].x = saveBox.x + boxOffset + (810/4 + 10) * 3
			saveScreenButtons[3].name = "SAVE AS"
			findButton(saveScreenButtons, "SAVE AS").isActive = isValidName(gateInputBox.value)
			findButton(saveScreenButtons, "SAVE AS").clickFunction = () => createNewGate()
			findButton(saveScreenButtons, "RENAME").isActive = isValidName(gateInputBox.value)
		} else {
			for(let b of saveScreenButtons) {
				b.width = 820/3
			}
			saveScreenButtons[0].x = saveBox.x + boxOffset
			saveScreenButtons[1].x = saveBox.x + boxOffset + (820/3 + 10)
			saveScreenButtons[2].x = -1000
			saveScreenButtons[2].y = -1000
			saveScreenButtons[3].x = saveBox.x + boxOffset + (820/3 + 10) * 2
			saveScreenButtons[3].name = "SAVE"
			findButton(saveScreenButtons, "SAVE").isActive = true
			findButton(saveScreenButtons, "SAVE").clickFunction = () => renameSavedGate()
		}
	} else {
		findButton(saveScreenButtons, "SAVE").isActive = isValidName(gateInputBox.value)
	}
	//

	// Draws buttons
	for(let b of saveScreenButtons) {
		b.show()
	}

}

function isValidName(name) {
	return (!include(gateNames, name) && !include(IONames, name) && !include(busNames, name) && !(include(objectCreatingButtonWithChildNames, name)) && name != "")
}


const labelMenuConstant = 250
let changingDecimalDisplayMode = null
let createButtonsForLabelMenu = true
let labelMenuType;
function drawLabelMenu() {
	const constant = labelMenuConstant
	labelMenuType = (changingLabelObject.ObjectName == "Gate" || changingLabelObject.ObjectName == "Display" || changingLabelObject.type == 1) ? "Small" : "Big"
	let bigBoxMetrics
	

	if(labelMenuType == "Small") {
		bigBoxMetrics = {height: constant * 0.75, width: constant * 2.5, x: (canvas.width - constant*2.5)/2, y:(canvas.height - constant)/2 - gateCreatingAreaMetrics.height}
	} else {
		bigBoxMetrics = {height: constant , width: constant * 2.5, x: (canvas.width - constant*2.5)/2, y:(canvas.height - constant)/2 - gateCreatingAreaMetrics.height}
	}

	if(createButtonsForLabelMenu) {
		
		

		if(labelMenuType == "Big") {
			let tempButton1 = new Button(bigBoxMetrics.x + constant * 0.1 - 4, bigBoxMetrics.y + constant * 0.7, "CANCEL", "subLabelButton", () => removeInputBox())
			buttons.push(tempButton1)
			tempButton1.width = constant * 1.13 + 4
			tempButton1.height = constant * 0.2

			let tempButton2 = new Button(bigBoxMetrics.x + constant * 1.27 -4, bigBoxMetrics.y + constant * 0.7, "CONFIRM", "subLabelButton", () => changeTag())
			buttons.push(tempButton2)
			tempButton2.width = constant * 1.13 + 4
			tempButton2.height = constant * 0.2

			let tempButton3 = new Button(bigBoxMetrics.x + constant * 1.27 - 4, bigBoxMetrics.y + constant * 0.45, "<", "moveButton", ()=> changeDecimalDisplay(-1))
			buttons.push(tempButton3)
			tempButton3.width = constant * 0.17
			tempButton3.height = constant * 0.2

			let tempButton4 = new Button(bigBoxMetrics.x + constant * 2.24 - 4, bigBoxMetrics.y + constant * 0.45, ">", "moveButton", ()=> changeDecimalDisplay(+1))
			buttons.push(tempButton4)
			tempButton4.width = constant * 0.17
			tempButton4.height = constant * 0.2
			
		} else {
			let tempButton1 = new Button(bigBoxMetrics.x + constant * 0.1 - 4, bigBoxMetrics.y + constant * 0.45, "CANCEL", "subLabelButton", () => removeInputBox())
			buttons.push(tempButton1)
			tempButton1.width = constant * 1.13 + 4
			tempButton1.height = constant * 0.2

			let tempButton2 = new Button(bigBoxMetrics.x + constant * 1.27 -4, bigBoxMetrics.y + constant * 0.45, "CONFIRM", "subLabelButton", () => changeTag())
			buttons.push(tempButton2)
			tempButton2.width = constant * 1.13 + 4
			tempButton2.height = constant * 0.2
		}
		createButtonsForLabelMenu = false
	}

	drawDarkener()

	// Draws the Main rectangle
	c.beginPath()
	c.fillStyle = "rgba(40,40,40,1)"
	c.rect(bigBoxMetrics.x, bigBoxMetrics.y, bigBoxMetrics.width, bigBoxMetrics.height)
	c.strokeStyle = "rgba(63,63,63,1)"
	c.lineWidth = 6
	c.stroke();
	c.fill()
	c.closePath()


	
	// Draws the stroke around the pinInputBox
	strokeInput(pinInputBox, "black", 4)
	changeInputPos(pinInputBox, bigBoxMetrics.x + 0.1*constant , bigBoxMetrics.y + 0.1*constant  , constant *2.3 - 40 - 4, constant * 0.3 - 20 - 4)	
	
	

	if(labelMenuType == "Big") {
		//Decimal Display Writing
		c.beginPath()
		c.font = `28px ${myFont}`
		c.letterSpacing = "1px"
		c.fillStyle = "rgba(37,37,37,1)"
		c.rect(bigBoxMetrics.x + 0.1 * constant - 4, bigBoxMetrics.y + constant * 0.45, constant * 1.13 + 4, constant * 0.2)
		c.fill()
		c.closePath()

		c.beginPath()
		c.fillStyle = "white"
		c.drawCenteredText("Decimal Display", bigBoxMetrics.x + constant * 0.665, bigBoxMetrics.y + constant * 0.55)
		c.closePath()
		//

		

		//Mode Changing Area
		c.beginPath()
		c.font = `bold 28px ${myFont}`
		let offset = 0
		c.letterSpacing = "0.5px"
		c.fillStyle = "white"
		c.rect(bigBoxMetrics.x + constant * 1.44 - 4, bigBoxMetrics.y + constant * 0.45, constant * 0.81, constant * 0.2)
		c.fill();
		c.closePath()
		c.beginPath()
		c.fillStyle = "rgba(25,25,25,1)"
		c.drawCenteredText(changingDecimalDisplayMode, bigBoxMetrics.x + constant * 1.845, bigBoxMetrics.y + constant * 0.55 + offset)
		c.fill();
		c.closePath()
	}
	
	let myButtonCount = labelMenuType == "Big" ? 4 : 2
	for(let i = 1; i<= myButtonCount; i++) {
		buttons[buttons.length - i].show()
	}
	
}


function getTextHeight(text) {
	return c.measureText(text).actualBoundingBoxAscent + c.measureText(text).actualBoundingBoxDescent;
}

function getTextWidth(text) {
	const textWidth = c.measureText(text).width;
	const spacing = (text.length - 1) * parseFloat(c.letterSpacing);
	return textWidth + spacing
}

function textCorrectY(y, text) {
	return y + (c.measureText(text).actualBoundingBoxAscent - getTextHeight(text) / 2);	
}


let createButtonsForCustomizeScreen = true
let customizeScreenButtons = []
let customizeMenuSavedArea = null
let customizeSavedCamera = null
let customizeMenuSavedPreferences = {width: 0, height: 0, nameMode: null, color: null, strokeStyle: null, checkBox: null, displays: []} //displays: x, y, index
let customizingPuts = []

function handleCustomizeScreen() {
	defaultScreenChanger()
	
	customizeMenuSavedArea = getWorkingArea(true)
	
	customizeSavedCamera = {...camera}
	camera = {x:0, y:0, scale:1}
	let savedLatestOpened = latestOpened
	let _latestSavedStation = latestSavedStation
	
	emptyWorkingArea(true)
	
	latestOpened = savedLatestOpened
	setLimitedGates(latestOpened)
	latestSavedStation = _latestSavedStation

	gateInputBox.style.visibility = "hidden"
	screen = 7
	findButton(saveScreenButtons, "CUSTOMIZE").highlight = false

	inputs = (customizingPuts.filter(obj => obj.ObjectName == "Input"))
	outputs = (customizingPuts.filter(obj => obj.ObjectName == "Output"))

	customizingGate.name = gateInputBox.value
	customizingGate.nameOrder = getBestDistribution(customizingGate.name)
	checkboxs[0].accessible = isCheckBoxAccessible()

	

	repositionCustomizingPuts()
	customizingGate.color = customizeMenuSavedPreferences.color

	// To snap the gate
	let savedIndex = preferences["SnapToGrid"].currentIndex
	preferences["SnapToGrid"].currentIndex = 2 // "Always"
	customizingGate.move(0, 0)
	preferences["SnapToGrid"].currentIndex = savedIndex

	//Creating Displays
	let tempDisplays = tempGateInfos.savedGate.filter(obj => obj.ObjectName == "Display" && obj.parentCode == null)
	
	for(let arr of customizeMenuSavedPreferences.displays) {
		let tempObject = new Display(customizingGate.x + arr[0], customizingGate.y + arr[1], tempDisplays[arr[2]].name, true)
		tempObject.customizeIndex = arr[2]
		tempObject.scale = arr[3]
		customizeDisplays.push(tempObject)
	}
		

	repositionTriangles()

	
}

function repositionTriangles() {
	let offset = 22.5
	let tri = customizingTriangles
	tri[0].x = customizingGate.x
	tri[0].y = customizingGate.y - customizingGate.height/2 - offset - tri[0].height/3

	tri[1].x = customizingGate.x + customizingGate.width/2 + offset + tri[1].height/3
	tri[1].y = customizingGate.y

	tri[2].x = customizingGate.x
	tri[2].y = customizingGate.y + customizingGate.height/2 + offset + tri[2].height/3

	tri[3].x = customizingGate.x - customizingGate.width/2 - offset - tri[3].height/3
	tri[3].y = customizingGate.y
}

function drawIsosceles(cx, cy, base, height, direction) {
	base *= camera.scale
	height *= camera.scale
	let scp = worldToScreen(cx, cy)
	cx = scp.x
	cy = scp.y
	c.beginPath();
	if (direction === 'N') {
		// taban yatay, tabanın orta noktası (cx,cy)
		c.moveTo(cx - base/2, cy); // sol taban
		c.lineTo(cx + base/2, cy); // sağ taban
		c.lineTo(cx, cy - height); // tepe (kuzey)
	} else if (direction === 'S') {
		c.moveTo(cx - base/2, cy);
		c.lineTo(cx + base/2, cy);
		c.lineTo(cx, cy + height);
	} else if (direction === 'E') {
		// taban dikey, tabanın orta noktası (cx,cy)
		c.moveTo(cx, cy - base/2);
		c.lineTo(cx, cy + base/2);
		c.lineTo(cx + height, cy);
	} else if (direction === 'W') {
		c.moveTo(cx, cy - base/2);
		c.lineTo(cx, cy + base/2);
		c.lineTo(cx - height, cy);
	}
	c.fill()
	c.closePath();
}

function repositionCustomizingPuts() {
	let totalInputHeight = 0;
	let totalOutputHeight = 0;

	for (let i = 0; i < inputs.length; i++) {
		let type = inputs[i].type
		totalInputHeight += radiusOfPuts[type] * 2;
	}
	for (let i = 0; i < outputs.length; i++) {
		let type = outputs[i].type
		totalOutputHeight += radiusOfPuts[type] * 2;
	}

	//Inputs
	let currentY = customizingGate.y - customizingGate.height/2 + putOffset;
	for(let i = 0; i < inputs.length; i++) {
		let inputY;
		let n = inputs.length;
		let availableSpace = customizingGate.height - 2 * putOffset - totalInputHeight;
		let gap = (n > 1) ? availableSpace / (n - 1) : 0;		
		let type = inputs[i].type
		inputY = currentY + radiusOfPuts[type];
		
		if(n == 1) {
			inputY = customizingGate.y
		}
		inputs[i].x = customizingGate.x - customizingGate.width/2
		inputs[i].y = inputY
		currentY += radiusOfPuts[type] * 2 + gap;
		inputs[i].updateAllPoints()
	}

	//Outputs
	currentY = customizingGate.y - customizingGate.height/2 + putOffset;
	for(let i = 0; i < outputs.length; i++) {
		let outputY;	
		let n = outputs.length;
		let availableSpace = customizingGate.height - 2 * putOffset - totalOutputHeight;
		let gap = (n > 1) ? availableSpace / (n - 1) : 0;		
		let type = outputs[i].type
		outputY = currentY + radiusOfPuts[type];

		if(n == 1) {
			outputY = customizingGate.y
		}
		outputs[i].x = customizingGate.x + customizingGate.width/2
		outputs[i].y = outputY
		currentY += radiusOfPuts[type] * 2 + gap;
		outputs[i].updateAllPoints()
	}
}

function getWheel(name) {
	if(typeof name == "string") {
		return wheels.filter(obj => obj.name == name)[0];
	}
	if(Array.isArray(name)) {
		return wheels.filter(obj => include(name, obj.name))
	}
}


let nameModePreferences = ["Middle", "Top", "Hidden"];
function changeNameModePreference(value) {
	customizingGate.nameMode = nameModePreferences[(findIndex(nameModePreferences, customizingGate.nameMode) + nameModePreferences.length + value) % nameModePreferences.length]
}

let customizingTriangles = [
	{x: 0, y: 0, height:30, base: 35, highlight: false, moving:false, direction: "N"}, 
	{x: 0, y: 0, height:30, base: 35, highlight: false, moving:false, direction: "E"}, 
	{x: 0, y: 0, height:30, base: 35, highlight: false, moving:false, direction: "S"}, 
	{x: 0, y: 0, height:30, base: 35, highlight: false, moving:false, direction: "W"}
]
let cRect = {x:0, y: 0, w: 410, h: canvas.height}
function drawCustomizeScreen() {
	let tempDisplays = tempGateInfos.savedGate.filter(obj => obj.ObjectName == "Display" && obj.parentCode == null)
	if(createButtonsForCustomizeScreen) {
		changeInputPos(colorPickerInput, cRect.x + 20, cRect.y + 460, 330, 30)
		colorPickerInput.style.visibility = "visible"

		//First Buttons
		customizeScreenButtons = []
		customizeScreenButtons.push(new Button(20, 10, "CANCEL", "subCustomizeButton", () => cancelCustomizeScreen(false)))
		customizeScreenButtons.push(new Button(210, 10, "CONFIRM", "subCustomizeButton", () => cancelCustomizeScreen(true)))
		customizeScreenButtons.push(new Button(20, 70, "<", "moveButton", ()=> changeNameModePreference(-1)))
		customizeScreenButtons.push(new Button(345, 70, ">", "moveButton", ()=> changeNameModePreference(1)))	
		for(let b of customizeScreenButtons) {
			if(b.style == "subCustomizeButton") {
				b.width = 180
				b.height = 50
			}
			if(b.style == "moveButton") {
				b.width = 45
				b.height = 50
			}
		}

		//Display Buttons
		let createdIndex = []
		for(let d of customizeDisplays) {
			createdIndex.push(d.customizeIndex)
		}
		let tempY = 620
		for(let d = 0; d < tempDisplays.length; d++) {
			let tempButton = new Button(40, tempY + d * 70, `${tempDisplays[d].name}`, "subCustomizeButtonDisplay", () => createCustomizeDisplay(d))
			customizeScreenButtons.push(tempButton)
			if(tempDisplays[d].tag != "") tempButton.name = tempDisplays[d].tag
			tempButton.width = 310
			tempButton.height = 60
			if(include(createdIndex, d)) {
				tempButton.isActive = false
			}
		}
		getWheel("customize").buttons = customizeScreenButtons.filter(obj => obj.style == "subCustomizeButtonDisplay")

		//ColorPicker
		colorPickers[0].x = cRect.x + 20  
		colorPickers[0].y = cRect.y + 130 
		colorPickers[0].updateSelectors()
		colorPickers[0].updateColor()
		//

		createButtonsForCustomizeScreen = false
	}

	for(let tr of customizingTriangles) {
		c.fillStyle = tr.moving ? "rgba(255,255,255,1)" : tr.highlight ? "rgba(177,177,177,1)" : "rgba(85,85,85,1)"
		drawIsosceles(tr.x, tr.y, tr.base, tr.height, tr.direction)
	}

	customizingGate.show()
	

	if(customizeDisplays.length > 0) {
		checkboxs[0].isActive = false
		checkboxs[0].accessible = false
	}
	

	if(mouseOccupation != "objectMoving") {
		//Big rect
		c.beginPath()
		c.fillStyle = "rgba(41,41,41,1)"
		c.rect(cRect.x, cRect.y, cRect.w, cRect.h)
		c.fill()
		c.closePath()

		//Name Area
		c.beginPath()
		c.fillStyle = "white"
		c.rect(cRect.x + 65, cRect.y + 70, 280, 50)
		c.fill()
		c.closePath()
		c.beginPath()
		c.font = `bold 28px ${myFont}`
		c.fillStyle = "black"
		c.textAlign = "center"
		c.textBaseline = "middle"
		let extraOffset = (customizingGate.nameMode == "Top") ? 3 : 0 // top yoksa çok kötü duruyor
		c.drawCenteredText("Name: " + customizingGate.nameMode, cRect.x + 205, cRect.y + 95 + extraOffset)
		c.fill()
		c.closePath()

		
		//Display Area
		c.beginPath()
		c.fillStyle = "rgba(38,38,38,1)"
		c.rect(20, 540, cRect.w - 40, 50)
		c.fill()
		c.closePath()

		c.lineWidth = 28
		c.textBaseline = "middle"
		c.beginPath()
		c.fillStyle = "white"
		c.drawCenteredText(`DISPLAYS (${tempDisplays.length}):`, cRect.w/2, 565)
		c.closePath()

		c.beginPath()
		c.rect(20, 600, cRect.w-60, 380)
		c.fillStyle = "rgba(30,30,30,1)"
		c.fill()
		c.closePath()


		//Wheel part
		let myWheel = getWheel("customize")
		myWheel.show();	

		//FastProcess
		c.beginPath()
		c.fillStyle = "rgba(30,30,30,1)"
		c.rect(20, 1000, cRect.w - 100, 60)
		c.fill()
		c.closePath()
		c.beginPath()
		c.fillStyle = "white"
		c.drawCenteredText("FAST PROCESS:", cRect.w/2 - 30, 1030)
		c.closePath()


		customizingGate.color = colorPickers[0].selectedColor
		customizingGate.nameColor = colorPickers[0].strokeStyle
		
		for(let b of customizeScreenButtons) {
			b.show()
		}

		if(colorPickerInput.matches(":focus")) {
			strokeInput(colorPickerInput, "black", 3)
		}

		colorPickers[0].show()
		checkboxs[0].show()
		colorPickerInput.style.visibility = "visible"
	} else {
		colorPickerInput.style.visibility = "hidden"
	}
}

let customizeDisplays = [];
function createCustomizeDisplay(index) {
	let tempDisplays = tempGateInfos.savedGate.filter(obj => obj.ObjectName == "Display" && obj.parentCode == null)
	
	
	tempObject = new Display(mouseX,mouseY, tempDisplays[index].name, true);
	tempObject.customizeIndex = index
	customizeDisplays.push(tempObject)
	mouseStartX = mouseScreenX 
	mouseStartY = mouseScreenY
	tempObject.move(0,0)
	tempObject.moving = true

	if(tempObject.name == "LED") tempObject.colorMode = tempDisplays[index].colorMode

	newClickedForObjectCreating = true
	mouseOccupation = "objectMoving"
	let tempButton = customizeScreenButtons.filter(b => b.style == "subCustomizeButtonDisplay")[index]
	tempButton.isActive = false
}

function setLimitedGates(name) {
	limitedGates = getUsedBy(name, [], [], true)
	limitedGates.push(latestOpened)
}

function cancelCustomizeScreen(applyChanges) {
	camera = customizeSavedCamera
	createButtonsForCustomizeScreen = true
	screen = 2
	gateInputBox.style.visibility = "visible"
	findButton(saveScreenButtons, "CUSTOMIZE").highlight = false
	let savedLatestOpened = latestOpened
	let _latestSavedStation = latestSavedStation
	loadWorkingStation(customizeMenuSavedArea)
	latestSavedStation = _latestSavedStation
	latestOpened = savedLatestOpened
	setLimitedGates(latestOpened)

	customizeMenuSavedArea = null
	colorPickerInput.style.visibility = "hidden"

	if(applyChanges) {
		customizeMenuSavedPreferences.color = colorPickers[0].selectedColor
		customizeMenuSavedPreferences.nameMode = customizingGate.nameMode
		customizeMenuSavedPreferences.width = customizingGate.width
		customizeMenuSavedPreferences.height = customizingGate.height
		customizeMenuSavedPreferences.checkBox = checkboxs[0].isActive && checkboxs[0].accessible

		customizeMenuSavedPreferences.displays = []
		for(let d of customizeDisplays) {
			customizeMenuSavedPreferences.displays.push([])
			let currArr = last(customizeMenuSavedPreferences.displays)
			currArr.push(d.x - customizingGate.x) //X
			currArr.push(d.y - customizingGate.y) //Y
			currArr.push(d.customizeIndex)        //Index
			currArr.push(d.scale) 				  //Scale
		}
	} else {
		colorPickers[0].setColor(rgbaToHSB(customizeMenuSavedPreferences.color))
		customizingGate.nameMode = customizeMenuSavedPreferences.nameMode
		checkboxs[0].isActive = customizeMenuSavedPreferences.checkBox && checkboxs[0].accessible
		
		customizingGate.width = customizeMenuSavedPreferences.width
		customizingGate.height = customizeMenuSavedPreferences.height
	}

	for(let D = customizeDisplays.length - 1; D >= 0; D--) {
		customizeDisplays[D].delete(customizeDisplays)
	}
}



let isCreateButtonsforOptionMenu = true;
function drawOptionMenu() {


	drawDarkener()

	let currentPreference;
	let startPoint = {x: canvas.width/2 - 550, y: canvas.height/2 - 407 - 20}
	c.textBaseline = "middle"
	c.letterSpacing = "1px"
	//Big rect
	c.beginPath()
	c.fillStyle = "rgba(41,41,41,1)"
	c.strokeStyle = "rgba(66,66,66,1)"
	c.rect(startPoint.x, startPoint.y, 1100, 814)
	c.lineWidth = 2
	c.fill()
	c.stroke()
	c.closePath()

	// DISPLAY
	c.beginPath()
	c.fillStyle = "rgba(117, 255, 138, 1)"	
	c.font = `bold 32px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("DISPLAY:", startPoint.x + 24, startPoint.y + 30)
	c.closePath()

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 60, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"	
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("Show I/O pin names", startPoint.x + 41, startPoint.y + 90)
	c.closePath()

	c.beginPath()
	c.rect(startPoint.x + 769, startPoint.y + 60, 262, 60)
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.fill()
	c.closePath()


	c.beginPath()
	c.font = `bold 28px ${myFont}`
	c.fillStyle = "rgba(0, 0, 0, 1)"
	c.textAlign = "center"
	currentPreference = preferences["ShowIOPinName"];
	c.drawCenteredText(currentPreference.arr[currentPreference.showIndex], startPoint.x + 900, startPoint.y + 90)
	c.closePath()
	//

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 130, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("Show chip pin names", startPoint.x + 41, startPoint.y + 160)
	c.textAlign = "left"
	c.closePath()

	c.beginPath()
	c.rect(startPoint.x + 769, startPoint.y + 130, 262, 60)
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.fill()
	c.closePath()


	c.beginPath()
	c.font = `bold 28px ${myFont}`
	c.fillStyle = "rgba(0, 0, 0, 1)"
	c.textAlign = "center"
	currentPreference = preferences["ShowChipPinName"];
	c.drawCenteredText(currentPreference.arr[currentPreference.showIndex], startPoint.x + 900, startPoint.y + 160)
	c.closePath()
	//

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 200, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("Show grid", startPoint.x + 41, startPoint.y + 230)
	c.closePath()

	c.beginPath()
	c.rect(startPoint.x + 769, startPoint.y + 200, 262, 60)
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.fill()
	c.closePath()


	c.beginPath()
	c.font = `bold 28px ${myFont}`
	c.fillStyle = "rgba(0, 0, 0, 1)"
	c.textAlign = "center"
	currentPreference = preferences["ShowGrid"];
	c.drawCenteredText(currentPreference.arr[currentPreference.showIndex], startPoint.x + 900, startPoint.y + 230)
	c.closePath()
	//

	//EDITING
	c.beginPath()
	c.fillStyle = "rgba(117, 255, 138, 1)"	
	c.font = `bold 32px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("EDITING:", startPoint.x + 24, startPoint.y + 300)
	c.closePath()

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 330, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.font = `28px ${myFont}`
	c.drawCenteredText("Snap to grid", startPoint.x + 41, startPoint.y + 360)
	c.textAlign = "left"
	c.closePath()

	c.beginPath()
	c.rect(startPoint.x + 769, startPoint.y + 330, 262, 60)
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.fill()
	c.closePath()


	c.beginPath()
	c.font = `bold 28px ${myFont}`
	c.fillStyle = "rgba(0, 0, 0, 1)"
	c.textAlign = "center"
	currentPreference = preferences["SnapToGrid"];
	c.drawCenteredText(currentPreference.arr[currentPreference.showIndex], startPoint.x + 900, startPoint.y + 360)
	c.closePath()
	//

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 400, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("Straight wires", startPoint.x + 41, startPoint.y + 430)
	c.closePath()

	c.beginPath()
	c.rect(startPoint.x + 769, startPoint.y + 400, 262, 60)
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.fill()
	c.closePath()


	c.beginPath()
	c.font = `bold 28px ${myFont}`
	c.fillStyle = "rgba(0, 0, 0, 1)"
	c.textAlign = "center"
	currentPreference = preferences["StraightWires"];
	c.drawCenteredText(currentPreference.arr[currentPreference.showIndex], startPoint.x + 900, startPoint.y + 430)
	c.closePath()
	//

	//SIMULATION
	c.beginPath()
	c.fillStyle = "rgba(117, 255, 138, 1)"	
	c.font = `bold 28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("SIMULATION:", startPoint.x + 24, startPoint.y + 500)
	c.closePath()

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 530, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("Sim Status", startPoint.x + 41, startPoint.y + 560)
	c.closePath()

	c.beginPath()
	c.rect(startPoint.x + 769, startPoint.y + 530, 262, 60)
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.fill()
	c.closePath()


	c.beginPath()
	c.font = `bold 28px ${myFont}`
	c.fillStyle = "rgba(0, 0, 0, 1)"
	c.textAlign = "center"
	currentPreference = preferences["SimStatus"];
	c.drawCenteredText(currentPreference.arr[currentPreference.showIndex], startPoint.x + 900, startPoint.y + 560)
	c.closePath()
	//

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 600, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("Steps per clock tick", startPoint.x + 41, startPoint.y + 630)
	c.closePath()

	spctInput.style.visibility = "visible"
	changeInputPos(spctInput, startPoint.x + 724, startPoint.y + 600, 332, 58)
	if(spctInput.matches(":focus")) {
		strokeInput(spctInput, "black", 3)
	}

	//

	//
	c.beginPath()
	c.rect(startPoint.x + 24, startPoint.y + 670, 700, 60)
	c.fillStyle = "rgba(37,37,37,1)"
	c.fill()
	c.closePath()
	
	c.beginPath()
	c.fillStyle = "rgba(255, 255, 255, 1)"
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("Steps per second (target - current)", startPoint.x + 41, startPoint.y + 700)
	c.closePath()

	c.beginPath()
	c.fillStyle = "rgba(20,20,20,1)"
	c.rect(startPoint.x + 844, startPoint.y + 671, 232, 60)
	c.fill()
	c.closePath()

	c.beginPath()
	c.fillStyle = targetStepsPerSecond * 9/10 < currentStepsPerSecond ? "rgba(59, 224, 26, 1)" : "rgba(224, 56, 26, 1)"
	c.font = `28px ${myFont}`
	c.textAlign = "left"
	c.drawCenteredText("/", startPoint.x + 890, startPoint.y + 700)
	c.drawCenteredText(`${Math.floor(currentStepsPerSecond)}`, startPoint.x + 724 + 230, startPoint.y + 700)
	c.closePath()

	spsInput.style.visibility = "visible"
	changeInputPos(spsInput, startPoint.x + 724, startPoint.y + 670, 120, 58)
	if(spsInput.matches(":focus")) {
		//strokeInput(spsInput, "black", 3)
	}
	//

	if(isCreateButtonsforOptionMenu) {
		spsInput.value = targetStepsPerSecond;
		spctInput.value = stepsPerClockTick;
		let cancelButton = new Button(startPoint.x + 24, startPoint.y + 740, "CANCEL", "subOptionButton", ()=> optionMenuCancel(false))
		buttons.push(cancelButton)
		let confirmButton = new Button(startPoint.x + 554, startPoint.y + 740, "CONFIRM", "subOptionButton", ()=> optionMenuCancel(true))
		buttons.push(confirmButton)
		buttons.push(new Button(startPoint.x+ 724, startPoint.y + 60, "<", "moveButton", () => {changePreferences("ShowIOPinName", -1, false)}))
		buttons.push(new Button(startPoint.x+ 1031, startPoint.y + 60, ">", "moveButton", () => {changePreferences("ShowIOPinName", +1, false)}))

		buttons.push(new Button(startPoint.x+ 724, startPoint.y + 130, "<", "moveButton",() => {changePreferences("ShowChipPinName", -1, false)}))
		buttons.push(new Button(startPoint.x+ 1031, startPoint.y + 130, ">", "moveButton", () => {changePreferences("ShowChipPinName", +1, false)}))

		buttons.push(new Button(startPoint.x+ 724, startPoint.y + 200, "<", "moveButton", () => {changePreferences("ShowGrid", -1, false)}))
		buttons.push(new Button(startPoint.x+ 1031, startPoint.y + 200, ">", "moveButton", () => {changePreferences("ShowGrid", +1, false)}))

		buttons.push(new Button(startPoint.x+ 724, startPoint.y + 330, "<", "moveButton", () => {changePreferences("SnapToGrid", -1, false)}))
		buttons.push(new Button(startPoint.x+ 1031, startPoint.y + 330, ">", "moveButton", () => {changePreferences("SnapToGrid", +1, false)}))

		buttons.push(new Button(startPoint.x+ 724, startPoint.y + 400, "<", "moveButton", () => {changePreferences("StraightWires", -1, false)}))
		buttons.push(new Button(startPoint.x+ 1031, startPoint.y + 400, ">", "moveButton", () => {changePreferences("StraightWires", +1, false)}))

		buttons.push(new Button(startPoint.x+ 724, startPoint.y + 530, "<", "moveButton", () => {changePreferences("SimStatus", -1, false)}))
		buttons.push(new Button(startPoint.x+ 1031, startPoint.y + 530, ">", "moveButton", () => {changePreferences("SimStatus", +1, false)}))
		

		for(let b of buttons) {
			if(b.style == "moveButton") {
				b.width = 45
				b.height = 60
			}
		}
	}

	for(let i = 1; i <= 14; i++) {
		buttons[buttons.length - i].show();
		
	}

	isCreateButtonsforOptionMenu = false;
	
}


let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

function getFPS() {
    const now = performance.now();
    frameCount++;

    if (now - lastFrameTime >= 1000) { // 1 saniye geçtiyse
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
    }

    return fps;
}

function LopenFunction() {
	let myFocus = last(focusedObjects)
	openGate(new Gate(0,0, myFocus.name), getConfirm())
}

function createNewCollection(isConfirmed) {
	if(!isConfirmed) {
		libraryMode = "newCollection"
	} else {
		let myValue = universalInput.value
		objectCreatingButtonWithChildNames.push(myValue)
		isCollectionOpen.push(0)
		childObjectCreatingButtonInfos.push([])
		repositionCollectionButtons()
		focusMe(findButton(libraryButtonsCollection, myValue))
		LcancelButton();
	}
}

function renameCollection(isConfirmed) {
	let myFocus = last(focusedObjects).name.slice()
	if(!isConfirmed) {
		libraryMode = "renameCollection"
	} else {
		const myValue = universalInput.value
		const index = findIndex(objectCreatingButtonWithChildNames, myFocus)
		objectCreatingButtonWithChildNames[index] = myValue
		if(include(starredButtons, myFocus)) {
			findButton(libraryButtonsStarred, myFocus).name = myValue
			let myB = findButton(buttons, myFocus)
			myB.name = myValue
			myB.width = myB.calcW()
			starredButtons[findIndex(starredButtons, myFocus)] = myValue
			organizeObjectCreatingButtons()
		}

		repositionCollectionButtons()	
		focusMe(findButton(libraryButtonsCollection, myValue))
		LcancelButton()
	}
}


function createButtonsLibraryMenu() {
	let namesOfButtons = ["DELETE", "RENAME", "CANCEL", "ADD TO STARRED", "REMOVE FROM STARRED", "MOVE UP", "MOVE DOWN","JUMP UP", "JUMP DOWN", "RENAME", "DELETE", "NEW COLLECTION", "EXIT LIBRARY", "USE", "OPEN", "DELETE", "CREATE"]
	let widthsOfButtons = [220,220, 220, 450,450, 220, 220,220, 220,220, 220, 450, 450, 430/3, 430/3, 430/3, 220]
	let functionsOfButtons = [
		()=>{confirmDelete()},
		()=>{renameCollection(true)},
		()=>{LcancelButton()},
		()=>{library_AddToStarred()},
		()=>{removeFromStarred()}, 
		()=>{moveUpFunction()}, 
		()=>{moveDownFunction()}, 
		()=>{jumpUpFunction()}, 
		()=>{jumpDownFunction()}, 
		()=>{renameCollection(false)},
		()=>{bigDeleteButton()}, 
		()=>{createNewCollection(false)}, 
		()=>{cancelLibraryMenu()}, 
		()=>{useButtonFunction()}, 
		()=>{LopenFunction()}, 
		()=>{smallDeleteButton()},
		()=>{createNewCollection(true)}
	]


	for(let i = 0; i < namesOfButtons.length; i++) {
		let tempButton = new Button(-1000, -1000, namesOfButtons[i], "libraryButtonOrganize", functionsOfButtons[i])
		if(i == 0 || i == 1) {
			tempButton.specialTag = "special"
		}
		libraryButtonsOrganize.push(tempButton)
		libraryButtons.push(tempButton)
		tempButton.width = widthsOfButtons[i]
		tempButton.height = 50
	}

	for(let i = 0; i < starredButtons.length; i++) {
		let tempY = sr.y + 80 + i*(spaceBetweenLibraryButtons + 40)
		let tempStyle = include(gateNames, starredButtons[i]) ? "libraryButtonStarred" : "libraryButtonStarredC"
		let tempButton = new Button(sr.x + 40, tempY, starredButtons[i], tempStyle, () =>  focusMe(tempButton))
		libraryButtonsStarred.push(tempButton)
		libraryButtons.push(tempButton)
		tempButton.width = 510
		tempButton.height = 40
		if(focusedObjects.length == 0 && i == 0) {
			focusMe(tempButton)
		}
	}

	for(let i = 0; i < objectCreatingButtonWithChildNames.length; i++) {
		let tempY = cr.y + 80 + i * (spaceBetweenLibraryButtons + 40)
		let tempButton = new Button(cr.x + 40, tempY, objectCreatingButtonWithChildNames[i], "libraryButtonCollectionC", () =>  {openCollection(tempButton)})
		libraryButtons.push(tempButton)
		libraryButtonsCollection.push(tempButton)
		tempButton.width = 550
		tempButton.height = 40
	}

	if(isCollectionOpen.length != objectCreatingButtonWithChildNames.length) {
		isCollectionOpen = Array(objectCreatingButtonWithChildNames.length).fill(0)
	}
}

let libraryButtonsStarred = [];
let libraryButtonsCollection = [];
let libraryButtonsOrganize = [];
let libraryButtons = [];
let focusedObjects = [];
let isCollectionOpen = [];
let spaceBetweenLibraryButtons = 10;
let sr  = {x: 60, y:30, w: 610, h:980}
let cr = {x: 695, y:30, w: 650, h:980}
let br1 = {x: 1370, y:30, w:490, h:0}
let br2 = {x: br1.x, y: br1.y + br1.h + 20, w: br1.w, h: 150}
let libraryMode = null
function drawLibraryMenu() {
	drawDarkener()

	let lw = 3
	c.lineWidth = lw
	c.letterSpacing = "0.5px"

	/////////// STARRED RECT ///////////
	
	//Outer Rect
	c.beginPath()
	c.fillStyle = "rgba(41,41,41,1)" 
	c.strokeStyle = "rgba(66,66,66,1)"
	c.rect(sr.x - lw/2, sr.y - lw/2, sr.w + lw, sr.h + lw)
	c.fill()
	c.stroke()
	c.closePath()

	//Writing
	c.beginPath()
	c.rect(sr.x, sr.y, sr.w, 40)
	c.fillStyle =  "rgba(29,29,29,1)"
	c.fill()
	c.fillStyle = "rgba(60,209,104)"
	c.textAlign = "left"
	c.textBaseline = "middle"
	c.font = `bold 28px ${myFont}`
	c.drawCenteredText("STARRED", sr.x + 20, sr.y + 20)
	c.closePath()
	//

	//Inner Rect
	c.save()
	c.beginPath()
	c.rect(sr.x + 20, sr.y + 60, sr.w - 60, sr.h-80)
	c.fillStyle =  "rgba(29,29,29,1)"
	c.fill()
	c.closePath()

	
	//Buttons
	for(let b of libraryButtonsStarred) {
		b.show()
	}
	//

	//Wheel
	if(1) {
		getWheel("starred").buttons = libraryButtonsStarred
		getWheel("starred").show()
	}
	//


	/////////// COLLECTIONS RECT ///////////
	

	//Outer Rect
	c.beginPath()
	c.fillStyle = "rgba(41,41,41,1)"
	c.strokeStyle = "rgba(66,66,66,1)"
	c.rect(cr.x - lw/2, cr.y - lw/2, cr.w + lw, cr.h + lw)
	c.fill()
	c.stroke()
	c.closePath()

	//Writing
	c.beginPath()
	c.rect(cr.x, cr.y, cr.w, 40)
	c.fillStyle =  "rgba(29,29,29,1)"
	c.fill()
	c.fillStyle = "rgba(60,209,104)"
	c.textAlign = "left"
	c.textBaseline = "middle"
	c.font = `bold 28px ${myFont}`
	c.drawCenteredText("COLLECTIONS", cr.x + 20, cr.y + 20)
	c.closePath()
	//

	//Inner Rect
	
	c.beginPath()
	c.rect(cr.x + 20, cr.y + 60, cr.w - 60, cr.h-80)	
	c.fillStyle =  "rgba(29,29,29,1)"
	c.fill()
	c.closePath()

	for(let b of libraryButtonsCollection) {
		b.show()
	}
	//

	// Wheel
	if(1) {
		getWheel("collection").buttons = libraryButtonsCollection
		getWheel("collection").show()
	}
	//


	/////////// BUTTONS RECT ///////////
	organizeButtons()
	//Upper Outer Rect
	
	if(focusedObjects.length != 0) {
		c.beginPath()
		c.fillStyle = "rgba(41,41,41,1)"
		c.strokeStyle = "rgba(66,66,66,1)"
		c.rect(br1.x - lw/2, br1.y - lw/2, br1.w + lw, br1.h + lw)
		c.fill()
		c.stroke()
		c.closePath()
	} 
	
	//Bottom Outer Rect
	c.beginPath()
	c.fillStyle = "rgba(41,41,41,1)"
	c.strokeStyle = "rgba(66,66,66,1)"
	c.rect(br2.x - lw/2, br2.y - lw/2, br1.w + lw, br2.h)
	c.fill()
	c.stroke()
	c.closePath()
	if(libraryMode != null) {
		
		if(libraryMode == "bigDelete") {
			let tempParagraph = `Are you sure you want to delete this collection? The chips inside of it will be moved to "OTHER".`
			c.beginPath()
			c.font = `28px ${myFont}`
			c.fillStyle = "rgba(219,166,49,1)"
			c.drawParagraph(tempParagraph, br2.x + 20, br2.y + 20, br2.w - 40, 40)
			c.closePath()
		}
		if(libraryMode == "smallDelete") {
			
			let tempParagraph = getParagraph()
			c.beginPath()
			c.font = `28px ${myFont}`
			c.drawParagraph(tempParagraph, br2.x + 20, br2.y + 20, br2.w - 40, 40)
			c.closePath()
		}
		if(libraryMode == "renameCollection") {
			let r2Button = findButton(libraryButtonsOrganize, "RENAME", b => (b.width == 220  && b.specialTag == "special"))
			let myValue = universalInput.value
			r2Button.isActive = !include(gateNames, myValue) && !(include(objectCreatingButtonWithChildNames, myValue)) && myValue != ""
			strokeInput(universalInput, "black", 4)
		}
		if(libraryMode == "newCollection") {
			let crButton = findButton(libraryButtonsOrganize, "CREATE")
			let myValue = universalInput.value
			crButton.isActive = isValidName(myValue)
			strokeInput(universalInput, "black", 4)
		}
	}

	if(focusedObjects.length >= 1) {
		//Upper Focus
		c.beginPath()
		c.rect(br1.x + 20, br1.y + 20, br1.w - 40, 40)
		c.fillStyle = focusedObjects[0].style == "libraryButtonStarred" ? "rgba(82,156,217,1)" : "rgba(247,120,120,1)"
		c.fill()
		c.fillStyle = "black"
		c.textAlign = "center"
		c.textBaseline = "middle"
		c.font = `28px ${myFont}`
		c.drawCenteredText(focusedObjects[0].name, br1.x + 20 + ( br1.w - 40)/2, br1.y + 40)
		c.closePath()
	}
	if(focusedObjects.length == 2) {
		//Bottom Focus
		c.beginPath()
		c.rect(br1.x + 20, br1.y + 70, br1.w - 40, 40)
		c.fillStyle = "rgba(82,156,217,1)"
		c.fill()
		c.fillStyle = "black"
		c.textAlign = "center"
		c.textBaseline = "middle"
		c.font = `28px ${myFont}`
		c.drawCenteredText(focusedObjects[1].name, br1.x + 20 + ( br1.w - 40)/2, br1.y + 90)
		c.closePath()
	}

	for(let b of libraryButtonsOrganize) {
		b.show();
	}
}

let findButtons = []
let sortedFindButtons = []
let createButtonsForFindScreen = true
let fRect = {x: canvas.width/2 - 500, y: canvas.height/2 - 470, w: 1000, h: 940}
function drawFindScreen() {
	if(createButtonsForFindScreen) {
		let allButtonNames = gateNames.concat(busNames).concat(IONames)
		allButtonNames.sort()

		let tempY = fRect.y + 180
		for(let i = 0; i< allButtonNames.length; i++) {
			let name = allButtonNames[i]
			let decorButton = new Button(fRect.x + 40, tempY, name.toUpperCase(), "subFindButtonDecor", () => {})
			decorButton.findName = name
			findButtons.push(decorButton)

			let useB = new Button(fRect.x + 470, tempY, "USE", "subFindButton", () => find_UseButton(name))
			useB.findName = name
			findButtons.push(useB)
			if(include(limitedGates, name)) {
				useB.isActive = false
			}

			let openB = new Button(fRect.x + 630, tempY, "OPEN", "subFindButton", () => find_OpenButton(name))
			openB.findName = name
			findButtons.push(openB)
			if(include(busNames.concat(IONames).concat(defaultGates), name)) {
				openB.isActive = false
			}

			let starB = new Button(fRect.x + 790, tempY, "STAR", "subFindButton", () => find_ChangeStar(name))
			starB.findName = name
			findButtons.push(starB)
			if(include(starredButtons, name)) {
				starB.name = "UN-STAR"
			}

			tempY += 60
		}

		sortedFindButtons = [...findButtons]
		createButtonsForFindScreen = false
	}

	drawDarkener()
	//Main rect
	let lw = 3
	c.beginPath()
	c.fillStyle = "rgba(41, 41, 41, 1)"
	c.rect(fRect.x - lw/2, fRect.y - lw/2, fRect.w + lw, fRect.h + lw)
	c.fill()
	c.strokeStyle = "rgba(66,66,66,1)"
	c.stroke()
	c.closePath()

	//Inner rect
	c.beginPath()
	c.fillStyle = "rgba(30,30,30,1)"
	c.rect(fRect.x + 20, fRect.y + 160, 940, 760)
	c.fill()
	c.closePath()

	let myWheel = getWheel("find")
	myWheel.buttons = sortedFindButtons
	myWheel.show()
	


	for(let b of findButtons) {
		b.show()
	}

	findInput.style.visibility = "visible"
	changeInputPos(findInput, fRect.x + 20 + 2, fRect.y + 20, fRect.w - 40 - 20 - 4, 100)
	strokeInput(findInput, "black", 4)
}

function find_UseButton(name) {
	spawnObject(name)
	cancelFindScreen()
}

function find_OpenButton(name) {
	cancelFindScreen()
	openGate(new Gate(0,0, name), getConfirm())
}

function find_ChangeStar(name) {
	let tempButton;
	for(let b of sortedFindButtons) {
		if(b.x == fRect.x + 790 && b.findName == name) {
			tempButton = b
			break;
		}
	}
	if(include(starredButtons, name)) {
		removeFromStarred(name)
		tempButton.name = "STAR"
	} else {
		addToStarred(name)
		tempButton.name = "UN-STAR"
	}	
}

function repositionFindButtons() {
	sortedFindButtons = []
	let value = findInput.value.toUpperCase()
	let allButtonNames = gateNames.concat(busNames).concat(IONames)
	allButtonNames.sort()
	let tempY = fRect.y + 180
	for(let n = 0; n < allButtonNames.length; n++) {
		let name = allButtonNames[n]
		let tempButtons = getTempButtons(name)
		if(!name.toUpperCase().includes(value)) {
			for(let b of tempButtons) {
				b.y = -1000		
			}
		} else {
			for(let b of tempButtons) {
				b.y = tempY
				sortedFindButtons.push(b)
			}
			tempY += 60
		}
	}

	function getTempButtons(name) {
		let tempButtons = []
		for(let b of findButtons) {
			if(b.findName == name) {
				tempButtons.push(b)
			}
		}
		if(tempButtons.length != 4) console.log("Hata?", tempButtons)
		return tempButtons
	}
}

function cancelFindScreen() {
	screen = 0
	findButtons = []
	createButtonsForFindScreen = true
	findInput.value = ""
	findInput.style.visibility = "hidden"
}

let rebindButtons = []
let createButtonsForRebindScreen = true
let rRect = {x: canvas.width/2 - 200, y: canvas.height/2 - 135 - gateCreatingAreaMetrics.height, w: 400, h: 270}
let changingKeyValue = null
function drawRebindScreen() {

	if(createButtonsForRebindScreen) {
		let cancelButton = new Button(rRect.x + 20, rRect.y + 200, "CANCEL", "subRebindButton", () => cancelRebindScreen(false))
		rebindButtons.push(cancelButton)

		let confirmButton = new Button(rRect.x + 205, rRect.y + 200, "CONFIRM", "subRebindButton", () => cancelRebindScreen(true))
		rebindButtons.push(confirmButton)

		createButtonsForRebindScreen = false
	}

	drawDarkener()

	//Main Area
	let lw = 3
	c.beginPath()
	c.fillStyle = "rgba(41, 41, 41, 1)"
	c.rect(rRect.x - lw/2, rRect.y - lw/2, rRect.w + lw, rRect.h + lw)
	c.fill()
	c.strokeStyle = "rgba(66,66,66,1)"
	c.stroke()
	c.closePath()

	//Writings
	c.textAlign = "center"
	c.beginPath()
	c.fillStyle = "rgba(171,171,171,1)"
	c.font = `bold 26px ${myFont}`
	c.fillText("Press a key to rebind", rRect.x + 200, rRect.y + 30)
	c.fillText("(alphanumeric only)", rRect.x + 200, rRect.y + 65)
	c.closePath()


	//Little Area
	c.beginPath()
	c.fillStyle = "rgba(25, 25, 25, 1)"
	c.rect(rRect.x + 167.5, rRect.y + 100, 65, 65)
	c.fill()
	c.closePath()

	c.beginPath()
	c.fillStyle = "white"
	c.textBaseline = "middle"
	c.font = `42px ${myFont}`
	c.drawCenteredText(changingKeyValue, rRect.x + 200, rRect.y + 132.5)
	c.closePath()


	

	for(let b of rebindButtons) {
		b.show()
	}
}

function createROMInputs() {
	///// Creates Inputs
	let tempY = 0
	romContainer.style.left = `${roRect.x + 20}px`
	romContainer.style.top = `${roRect.y + 20}px`
	romContainer.style.height = `820px`
	for(let addr = 0; addr < 256; addr++) {
		let row = document.createElement("div");
		row.classList.add("romRow");
		row.style.top = tempY + "px";

		let indexSpan = document.createElement("span");
		indexSpan.classList.add("index");
		indexSpan.textContent = String(addr).padStart(3, "0") + ":";

		let input = document.createElement("input");
		input.type = "input";
		input.min = 0;
		input.max = 16;
		input.value = 0;
		input.classList.add("romInput");

		input.addEventListener("focus", () => {
			row.classList.add("focused");
		});

		input.addEventListener("blur", () => {
			row.classList.remove("focused");
			fixROMInputValue(input)
		});

		input.addEventListener("input", ()=> {
			filterROMInput(input)
		})

		
		row.appendChild(indexSpan);
		row.appendChild(input);
		romContainer.appendChild(row);

		let tempH = (addr%2 == 0 || 1) ? 50 : 45 // yani normalde yarısı 45, ama 50 olunca hepsi daha iyi duruyor
		row.style.height = tempH+"px"
		input.style.height = tempH+"px"
		input.style.top = 0+"px"
		tempY += tempH;
	}

	const rows = romContainer.querySelectorAll(".romRow");
	rows.forEach(row => {
		row.style.display = "none";
	});
	//////////////////
}

let ROMButtons = []
let createButtonsForROMScreen = true
let changingROM = {display: null, displayTypes: ["Unsigned Decimal", "Signed Decimal", "Binary", "HEX"], copiedROM: Array(256).fill("0000000000000000")}
let roRect = {x: canvas.width / 2 - 385, y: canvas.height/2 - 430 - gateCreatingAreaMetrics.height, w: 770, h: 860}
let roRect2 = {x: canvas.width/2 + 455, y: canvas.height/2 - 430 - gateCreatingAreaMetrics.height, w: 430, h: 300}
function drawROMScreen() {
	if(createButtonsForROMScreen) {
		let m1 = new Button(roRect2.x + 20, roRect2.y + 20, "<", "moveButton", ()=>changeROMDisplayMode(-1))
		ROMButtons.push(m1)

		let m2 = new Button(roRect2.x + 365, roRect2.y + 20, ">", "moveButton", ()=>changeROMDisplayMode(+1))
		ROMButtons.push(m2)

		let b1 = new Button(roRect2.x + 20, roRect2.y + 85, "COPY ALL", "subROMButton", ()=>copyROM())
		ROMButtons.push(b1)

		let b2 = new Button(roRect2.x + 220, roRect2.y + 85, "PASTE ALL", "subROMButton", ()=>pasteROM())
		ROMButtons.push(b2)

		let b3 = new Button(roRect2.x + 20, roRect2.y + 150, "CLEAR ALL", "subROMButton", ()=>clearAllROM())
		ROMButtons.push(b3)

		let b4 = new Button(roRect2.x + 20, roRect2.y + 230, "CANCEL", "subROMButton", ()=>cancelROMScreen(false))
		ROMButtons.push(b4)

		let b5 = new Button(roRect2.x + 220, roRect2.y + 230, "CONFIRM", "subROMButton", ()=>cancelROMScreen(true))
		ROMButtons.push(b5)

		for(let b of ROMButtons) {
			if(b.style == "moveButton") {
				b.width = 45
				b.height = 50
			} else {
				b.height = 50
				b.width = 190
			}
			
		}
		b3.width = 390
		createButtonsForROMScreen = false
	}

	drawDarkener()

	//Main Area
	let lw = 3
	c.beginPath()
	c.fillStyle = "rgba(30, 30, 30, 1)"
//	c.fillStyle = "red"
	c.rect(roRect.x - lw/2, roRect.y - lw/2, roRect.w + lw, roRect.h + lw)
	c.fill()
	c.strokeStyle = "rgba(66,66,66,1)"
	c.stroke()
	c.closePath()

	//Button Area
	c.beginPath()
	c.fillStyle = "rgba(41, 41, 41, 1)"
	c.rect(roRect2.x - lw/2, roRect2.y - lw/2, roRect2.w + lw, roRect2.h + lw)
	c.fill()
	c.strokeStyle = "rgba(66,66,66,1)"
	c.stroke()
	c.closePath()

	//Mode Area
	c.beginPath()
	c.fillStyle = "white"
	c.rect(roRect2.x + 65, roRect2.y + 20, 300, 50)
	c.fill()
	c.closePath()
	c.beginPath()
	c.fillStyle = "black"
	c.textAlign = "center"
	c.font = `bold 26px ${myFont}`
	c.textBaseline = "middle"
	c.drawCenteredText(changingROM.display, roRect2.x + 215, roRect2.y + 45)
	c.closePath()


	let myWheel = getWheel("rom")
	myWheel.show()

	for(let b of ROMButtons) {
		b.show()
	}
}


let createButtonsForQuitScreen = true
let quitButtons = []
let quitMode = "mainMenu"
let quitModeExtra = null;
let npRect = {x: canvas.width/2 - 810/2, y: canvas.height/2 - 230/2, w: 810, h:230}
let opRect = {x: 300, y: 250, w: 1300, h: 600}
let fdRect = {x: canvas.width/2 - 810/2, y: 505, w: 810, h: 140}
let focusedFile = null;
let confirmState = null
let isQuotaExceed = false
function drawQuitScreen() {
	if(createButtonsForQuitScreen) {
		let tempVariables = [
			["NEW PROJECT", ()=> quitMode = "newProject", "mainMenu"], 
			["OPEN PROJECT", ()=> quitMode = "openProject", "mainMenu"], 
			["SETTINGS", ()=> {}, "mainMenu"] ,
			["ABOUT", ()=> quitMode = "about", "mainMenu"], 
			["QUIT", ()=> {}, "mainMenu"],
			["CANCEL", ()=> quit_ProjectCancel(), "newProject"],
			["CONFIRM", ()=> quit_ProjectConfirm(), "newProject"],
			["BACK", ()=> quitMode = "mainMenu", "openProject"],
			["DELETE", ()=> quitModeExtra = "fileDelete", "openProject"],
			["DUPLICATE", ()=> {quitModeExtra = "newProject"; confirmState = "duplicate"}, "openProject"],
			["RENAME", ()=> {quitModeExtra = "newProject"; confirmState = "rename"}, "openProject"],
			["OPEN", ()=> startLoadingFile(focusedFile), "openProject"],
			["BACK", ()=> quitMode = "mainMenu", "about"],
			["CANCEL", () => removeQuitModeExtra(), "fileDelete"],
			["DELETE", () => startDeletingFile(focusedFile), "fileDelete"]
		]
		let modeVariables = {
			"mainMenu": {width: 285, height:50, x: canvas.width/2 - 285/2, y: 400},
			"newProject": {width: 380, height:50, x: npRect.x + 20, y: npRect.y + 160},
			"openProject": {width: (opRect.w - 40)/5, height: 50, x: opRect.x, y: opRect.y + opRect.h + 20},
			"about": {width: 90, height: 50, x: canvas.width/2 - 50, y: 630},
			"fileDelete": {width: 380, height: 50, x: fdRect.x + 20, y: fdRect.y + 70}
		}

		let inactiveNames = ["SETTINGS", "QUIT"]
		for(let v of tempVariables) {
			let tempMode = v[2]
			let tempVariables = modeVariables[tempMode]

			let tempButton = new Button(tempVariables.x, tempVariables.y, v[0], "subQuitButton", v[1])
			tempButton.realX = tempVariables.x
			tempButton.realY = tempVariables.y
			tempButton.width = tempVariables.width
			tempButton.height = tempVariables.height
			tempButton.mode = tempMode
			quitButtons.push(tempButton)
			if(tempMode == "mainMenu") { tempVariables.y += tempVariables.height + 20} 
			if(tempMode == "newProject") { tempVariables.x += tempVariables.width + 10} 
			if(tempMode == "openProject") { tempVariables.x += tempVariables.width + 10}
			if(tempMode == "fileDelete") { tempVariables.x += tempVariables.width + 10}
			if(include(inactiveNames, v[0])) tempButton.isActive = false		
		}

		
		let tempY = opRect.y + 20
		for(let n of fileNames) {
			let tempButton = new Button(opRect.x + 20, tempY, n, "subQuitButtonFile", () => focusFileButton(tempButton))
			tempButton.realX = opRect.x + 20
			tempButton.realY = tempY
			tempButton.width = opRect.w - 40
			tempButton.height = 50
			tempButton.mode = "openProject"	
			tempY += tempButton.height
			quitButtons.push(tempButton)
		}
		getWheel("quit").buttons = quitButtons.filter(obj => obj.style == "subQuitButtonFile")
		createButtonsForQuitScreen = false
	}
	

	//Main Background
	c.beginPath()
	c.fillStyle = "rgba(47, 47, 53, 1)"
	c.rect(0,0, canvas.width, canvas.height)
	c.fill()
	c.closePath()
	//

	//Image
	if(images["icon"] != null) {
		c.beginPath()
		c.drawImage(images["icon"], canvas.width/2 - 695, 80)
		c.closePath()
	}
	

	//Bottom Rect
	c.beginPath()
	c.fillStyle = "rgba(37, 37, 43, 1)"
	c.rect(0, canvas.height - 75, canvas.width, 75)
	c.fill()
	c.closePath()
	//

	//Bottom Writings
	c.textBaseline = "middle"
	let textOffset = 15
	c.font = `28px ${myFont}`
	c.beginPath()
	c.textAlign = "left"
	c.fillStyle = "rgba(146, 146 , 149, 1) "
	c.drawCenteredText("Created By: Demir Saygı", textOffset, canvas.height - 37.5)
	c.closePath()

	c.beginPath()
	c.textAlign = "right"
	c.fillStyle = "rgba(146, 146 , 149, 1) "
	c.drawCenteredText("Version: " + codeVersion, canvas.width - textOffset, canvas.height - 37.5)
	c.closePath()
	//


	//Special Cases
	if(quitMode == "newProject") {
		drawDarkener()
		c.beginPath()
		c.fillStyle = "rgba(37,37,43, 1)"
		c.rect(npRect.x, npRect.y, npRect.w, npRect.h)
		c.fill()
		c.closePath()
	}
	if(quitMode == "openProject") {
		c.beginPath()
		c.fillStyle = "rgba(30,30,30, 1)"
		c.rect(opRect.x, opRect.y, opRect.w, opRect.h)
		c.fill()
		c.closePath()
		getWheel("quit").show()
	}
	if(quitMode == "about") {
		c.beginPath()
		c.font = `24px ${myFont}`
		c.textAlign = "center"
		c.fillStyle = "white"
		c.drawCenteredText("To Do: Write Something helpful here...", canvas.width/2, 525)
		c.closePath()
	}

	repositionQuitButtons()
	for(let b of quitButtons) {
		b.show();
	}

	//Extras
	if(quitModeExtra == "fileDelete") {
		drawDarkener()
		c.beginPath()
		c.fillStyle = "rgba(37,37,43, 1)"
		c.rect(fdRect.x, fdRect.y, fdRect.w, fdRect.h)
		c.fill()
		c.closePath()

		c.beginPath()
		c.fillStyle = "rgba(235,255,4, 1)"
		c.textAlign = "center"
		c.font = `27px ${myFont}`
		let tempText = "Are you sure you want to delete this project?"
		c.drawCenteredText(tempText, fdRect.x + fdRect.w / 2, fdRect.y + 35)
		c.fill()
		c.closePath()
		for(let b of quitButtons) {
			if(b.mode == "fileDelete") {
				b.x = b.realX 
				b.y = b.realY
				b.show()
			} 
		}
	} else if(quitModeExtra == "newProject") {
		drawDarkener()
		c.beginPath()
		c.fillStyle = "rgba(37,37,43, 1)"
		c.rect(npRect.x, npRect.y, npRect.w, npRect.h)
		c.fill()
		c.closePath()
		for(let b of quitButtons) {
			if(b.mode == "newProject") {
				b.x = b.realX 
				b.y = b.realY
				b.show()
			} 
		}
		strokeInput(newProjectInput, "black", 3)
	}
}

function startLoadingFile(button) {
	screen = 0
	let tempFile = findFileWithName(button.name);
	tempFile.load()
	currentFile = tempFile
	createDefaultButtons();
	createButtonsLibraryMenu()
	createButtonsForQuitScreen = true
	quitButtons = []
	latestSavedStation = []
	quitMode = "mainMenu"
}

function startDeletingFile(button) {
	removeQuitModeExtra()
	Splice(quitButtons, button)
	focusedFile = null
	findFileWithName(button.name).delete()

	let tempY = opRect.y + 20
	for(let n of fileNames) {
		let tempButton = findButton(quitButtons, n, (obj)=> obj.style == "subQuitButtonFile")
		tempButton.realY = tempY
		tempY += tempButton.height
	}
}

function findFileWithName(name) {
	for(let file of saveFiles) {
		if(file.name == name) {
			return file
		}
	}
	console.log("Hata")
}

function quit_ProjectCancel() {
	if(quitModeExtra != null) {
		removeQuitModeExtra()
	} else {
		quitMode = "mainMenu"
	}
	confirmState = null
	newProjectInput.value = "";
}

function quit_ProjectConfirm() {
	if(quitModeExtra == null) {
		//Meaning it is project creating
		let tempName = newProjectInput.value
		saveFile.createNewFile(tempName)

		//Creates the new Button
		let tempFileButtons = quitButtons.filter(obj=> obj.style == "subQuitButtonFile")
		let tempY = tempFileButtons.length == 0 ? opRect.y + 20 : last(tempFileButtons).realY + last(tempFileButtons).height
		let tempButton = new Button(opRect.x + 20, tempY, tempName, "subQuitButtonFile", () => focusFileButton(tempButton))
		tempButton.realX = opRect.x + 20
		tempButton.realY = tempY
		tempButton.width = opRect.w - 40
		tempButton.height = 50
		tempButton.mode = "openProject"	
		quitButtons.push(tempButton)
		//
		quit_ProjectCancel()
		repositionQuitButtons()
		startLoadingFile(tempButton)
	}
	if(confirmState == "rename") {
		let tempName = newProjectInput.value
		findFileWithName(focusedFile.name).rename(tempName)
		focusedFile.name = tempName
		quit_ProjectCancel()
		repositionQuitButtons()
	}
	if(confirmState == "duplicate") {
		let tempName = newProjectInput.value
		findFileWithName(focusedFile.name).duplicate(tempName)

		//Creates the new Button
		let tempFileButtons = quitButtons.filter(obj=> obj.style == "subQuitButtonFile")
		let tempY = tempFileButtons.length == 0 ? opRect.y + 20 : last(tempFileButtons).realY + last(tempFileButtons).height
		let tempButton = new Button(opRect.x + 20, tempY, tempName, "subQuitButtonFile", () => focusFileButton(tempButton))
		tempButton.realX = opRect.x + 20
		tempButton.realY = tempY
		tempButton.width = opRect.w - 40
		tempButton.height = 50
		tempButton.mode = "openProject"	
		quitButtons.push(tempButton)
		//
		quit_ProjectCancel()
		repositionQuitButtons()
	}
}

function removeQuitModeExtra() {
	quitModeExtra = null
}

function focusFileButton(button) {
	focusedFile = button
}

function quit_checkConfirmActive() {
	//Test For Storage
	let tempInfo = null
	if(quitModeExtra == null) tempInfo = saveFile.getDefaultInfos()
	if(confirmState == "duplicate") tempInfo = findFileWithName(focusedFile.name).globalInfos
	isQuotaExceed = tempInfo != null ? willExceedQuota(JSON.stringify(tempInfo)): false


	if(!include(fileNames, newProjectInput.value) && newProjectInput.value != "" && !isQuotaExceed) {
		return true
	} else {
		return false
	}
}

function willExceedQuota(newStringData, limitMB = 4.5) {
    const limitBytes = limitMB * 1024 * 1024;
    const newBytes = new Blob([newStringData]).size;

    let usedBytes = getLocalStorageTotalBytes();
    return (usedBytes + newBytes) > limitBytes;
}

function repositionQuitButtons() {
	if(quitMode == "newProject" || quitModeExtra == "newProject") {
		changeInputPos(newProjectInput, npRect.x + 20, npRect.y + 20, npRect.w - 40 - 20, 120)
		newProjectInput.style.visibility = "visible"
		strokeInput(newProjectInput, "black", 3)
		findButton(quitButtons, "CONFIRM").isActive = quit_checkConfirmActive()
	} else {
		newProjectInput.style.visibility = "hidden"
	}
	if(quitMode == "openProject") {
		for(let b of quitButtons) {
			if(b.mode == "openProject" && b.name != "BACK" && b.style == "subQuitButton") {
				b.isActive = focusedFile != null
			}
		}
	} else {
		focusedFile = null
	}
	for(let b of quitButtons) {
		if(b.mode == quitMode) {
			b.x = b.realX 
			b.y = b.realY
		} else {
			b.x = -1000
			b.y = -1000
		}
	}
}


function getUsedBy(name, tested, limited, isNested = true) {
	for(let n of gateNames) {	
		if(include(gateInfos[n].createdFrom, name)) {
			if(!include(limited, n)) {
				limited.push(n)
			}
			if(!include(tested, n)) {
				if(isNested) {
					getUsedBy(n, tested, limited, isNested)	
				}
				tested.push(n)			
			}
		}		
	}
	return limited
}

function getParagraph() {
	//Paragraph
	
	let myFocus = last(focusedObjects)
	let limiters = getUsedBy(myFocus.name, [], [], false)
	let isOnCurrent = false
	for(let g of gates) {
		if(g.name == myFocus.name) {
			isOnCurrent = true
			break;
		}
	}
	
	let tempParagraph;
	if(!isOnCurrent && latestOpened != myFocus.name && limiters.length == 0) {
		tempParagraph = "Are you sure you want to delete this chip? It is not used anywhere."
		c.fillStyle = "rgba(219,166,49,1)"
	} else {
		c.fillStyle = "rgba(242,89,89,1)"
		if(latestOpened == myFocus.name) {
			tempParagraph = "Are you sure you want to delete the chip that you are CURRENTLY EDITTING?"
			if(limiters.length == 1) {
				tempParagraph = tempParagraph.concat(` It is used by "${limiters[0]}".`)
			} else if(limiters.length == 2) {
				tempParagraph = tempParagraph.concat(` It is used by "${limiters[0]}" and "${limiters[1]}".`)	
			}
			else if(limiters.length > 2) {
				tempParagraph = tempParagraph.concat(` It is used by "${limiters[0]}" and ${limiters.length-1} others.`)
			}	
		} else {
			if(isOnCurrent) {
				tempParagraph = "Are you sure you want to delete this chip? It is used by the CURRENT CHIP"
				if(limiters.length == 0) {
					tempParagraph = tempParagraph.concat(".")
				} else if (limiters.length == 1) {
					tempParagraph = tempParagraph.concat(` and "${limiters[0]}".`)
				} else if(limiters.length >= 2) {
					tempParagraph = tempParagraph.concat(` and ${limiters.length} others.`)
				}
				
			} else {
				tempParagraph = "Are you sure you want to delete this chip?"
				if(limiters.length == 1) {
					tempParagraph = tempParagraph.concat(` It is used by "${limiters[0]}".`)
				} else if(limiters.length == 2) {
					tempParagraph = tempParagraph.concat(` It is used by "${limiters[0]}" and "${limiters[1]}".`)
				}
				else if(limiters.length > 2) {
					tempParagraph = tempParagraph.concat(` It is used by "${limiters[0]}" and ${limiters.length-1} others.`)
				}	
			}				
		}			
	}
	return tempParagraph
}


function rectHitboxCollision(r1, r2) {

	// normalize 1
    let a = {
        x: r1.w < 0 ? r1.x + r1.w : r1.x,
        y: r1.h < 0 ? r1.y + r1.h : r1.y,
        w: Math.abs(r1.w),
        h: Math.abs(r1.h)
    };

    // normalize 2
    let b = {
        x: r2.w < 0 ? r2.x + r2.w : r2.x,
        y: r2.h < 0 ? r2.y + r2.h : r2.y,
        w: Math.abs(r2.w),
        h: Math.abs(r2.h)
    };

    // çakışma kontrolü
    return (
        a.x + a.w >= b.x &&
        a.x <= b.x + b.w &&
        a.y + a.h >= b.y &&
        a.y <= b.y + b.h
    );
}

function openCollection(button) {
	let index = findIndex(objectCreatingButtonWithChildNames, button.name)
	isCollectionOpen[index] = +!isCollectionOpen[index]
	repositionCollectionButtons(button)
}

function repositionCollectionButtons(button = {name :null}) {
	libraryButtons = libraryButtons.filter(btn => 
		!libraryButtonsCollection.includes(btn)
	);
	focusedObjects = focusedObjects.filter(btn => 
		!libraryButtonsCollection.includes(btn)
	);
	libraryButtonsCollection = []
	
	let sum = 0
	for(let i = 0; i < objectCreatingButtonWithChildNames.length; i++) {
		let tempY = cr.y + 80 + sum
		let tempButton = new Button(cr.x + 40, tempY, objectCreatingButtonWithChildNames[i], "libraryButtonCollectionC", () =>  {openCollection(tempButton)})
		if(objectCreatingButtonWithChildNames[i] === button.name) {
			focusMe(tempButton)
		}
		libraryButtons.push(tempButton)
		libraryButtonsCollection.push(tempButton)
		tempButton.width = 550
		tempButton.height = 40
		sum += spaceBetweenLibraryButtons + 40


		if(isCollectionOpen[i]) {
			for(let a = 0; a < childObjectCreatingButtonInfos[i].length; a++) {
				//Creates the buttons
				let tempY = cr.y + 80 + sum
				let tempButton2 = new Button(cr.x + 75, tempY, childObjectCreatingButtonInfos[i][a], "libraryButtonCollection", () =>  {focusMe(tempButton2)})			
				libraryButtons.push(tempButton2)
				libraryButtonsCollection.push(tempButton2)
				if(childObjectCreatingButtonInfos[i][a] === button.name) {
					focusMe(tempButton2)
				}
				tempButton2.width = 515	
				tempButton2.height = 40
				sum += spaceBetweenLibraryButtons + 40
			}	
		}	
	}
}

function focusMe(button) {
	focusedObjects = [];
	if(include(libraryButtonsCollection, button)) {
		if(button.style == "libraryButtonCollection") {
			for(let i = 0; i < objectCreatingButtonWithChildNames.length; i++) {
				if(include(childObjectCreatingButtonInfos[i], button.name)) {
					for(let b of libraryButtonsCollection) {
						if(b.name == objectCreatingButtonWithChildNames[i]) {
							focusedObjects.push(b)
							break;
						}
					}
				}
			}
		}
	}
	
	focusedObjects.push(button)


	organizeButtons()
}

function useButtonFunction() {
	let myFocus = last(focusedObjects)
	cancelLibraryMenu()
	spawnObject(myFocus.name)
}

function organizeButtons() {
	let myFocus = last(focusedObjects) ?? {name: null}

	for(let b of libraryButtonsOrganize) {
		b.x = -1000
		b.y = -1000
		b.isActive = true
	}

	for(let b of libraryButtons) {
		if(libraryMode != null) {
			b.isActive = false
		} else {
			b.isActive = true
		}
	}
	

	let sButton = findButton(libraryButtonsOrganize, "ADD TO STARRED");
	for(let i = 0; i < libraryButtonsStarred.length; i++) {
		if(myFocus.name == libraryButtonsStarred[i].name) {
			sButton = findButton(libraryButtonsOrganize, "REMOVE FROM STARRED")
			break;
		}	
	}

	let muButton = findButton(libraryButtonsOrganize, "MOVE UP")	
	let mdButton = findButton(libraryButtonsOrganize, "MOVE DOWN")
	let uButton  = findButton(libraryButtonsOrganize, "USE")
	let oButton  = findButton(libraryButtonsOrganize, "OPEN")
	let d1Button  = findButton(libraryButtonsOrganize, "DELETE", b => (b.width == 430/3))
	let d2Button  = findButton(libraryButtonsOrganize, "DELETE", b => (b.width == 220 && b.specialTag != "special"))
	let d3Button = findButton(libraryButtonsOrganize, "DELETE", b => (b.width == 220  && b.specialTag == "special"))
	let rButton = findButton(libraryButtonsOrganize, "RENAME", b => (b.width == 220  && b.specialTag != "special"))
	let juButton = findButton(libraryButtonsOrganize, "JUMP UP")
	let jdButton = findButton(libraryButtonsOrganize, "JUMP DOWN")
	let ncButton = findButton(libraryButtonsOrganize, "NEW COLLECTION")
	let elButton = findButton(libraryButtonsOrganize, "EXIT LIBRARY")
	let cButton = findButton(libraryButtonsOrganize, "CANCEL")
	let r2Button = findButton(libraryButtonsOrganize, "RENAME", b => (b.width == 220  && b.specialTag == "special"))
	let crButton = findButton(libraryButtonsOrganize, "CREATE")
	 
	
	if(focusedObjects.length == 1) {
		if(focusedObjects[0].style == "libraryButtonStarred") {

			br1.h = 260
			sButton.x = br1.x + 20
			sButton.y = br1.y + 70

			muButton.x = br1.x + 20
			muButton.y = br1.y + 130

			mdButton.x = br1.x + 250
			mdButton.y = br1.y + 130

			uButton.x = br1.x + 20
			uButton.y = br1.y + 190

			oButton.x = br1.x + 20 + uButton.width + 10
			oButton.y = br1.y + 190

			d1Button.x = oButton.x + oButton.width + 10
			d1Button.y = br1.y + 190

			if(include(defaultGates, myFocus.name) || !include(gateNames, myFocus.name)) {
				d1Button.isActive = false
				rButton.isActive = false
				oButton.isActive = false
			}

			br2 = {x: br1.x, y: br1.y + br1.h + 20, w: br1.w, h: 150}

			if(libraryButtonsStarred[0] == myFocus) {
				muButton.isActive = false
			}
			if(last(libraryButtonsStarred) == myFocus) {
				mdButton.isActive = false
			}

		}
		if(focusedObjects[0].style == "libraryButtonStarredC") {

			br1.h = 260
			sButton.x = br1.x + 20
			sButton.y = br1.y + 70

			muButton.x = br1.x + 20
			muButton.y = br1.y + 130

			mdButton.x = br1.x + 250
			mdButton.y = br1.y + 130

			rButton.x = br1.x + 20
			rButton.y = br1.y + 190

			d2Button.x = br1.x + 250
			d2Button.y = br1.y + 190

			br2 = {x: br1.x, y: br1.y + br1.h + 20, w: br1.w, h: 150}

			if(libraryButtonsStarred[0] == myFocus) {
				muButton.isActive = false
			}
			if(last(libraryButtonsStarred) == myFocus) {
				mdButton.isActive = false
			}

			if(myFocus.name == "OTHER") {
				rButton.isActive = false
				d2Button.isActive = false
			}
		}
		if(focusedObjects[0].style == "libraryButtonCollectionC") {

			br1.h = 260
			sButton.x = br1.x + 20
			sButton.y = br1.y + 70

			muButton.x = br1.x + 20
			muButton.y = br1.y + 130

			mdButton.x = br1.x + 250
			mdButton.y = br1.y + 130

			rButton.x = br1.x + 20
			rButton.y = br1.y + 190

			d2Button.x = br1.x + 250
			d2Button.y = br1.y + 190

			br2 = {x: br1.x, y: br1.y + br1.h + 20, w: br1.w, h: 150}

			if(libraryButtonsCollection[0] == myFocus) {
				muButton.isActive = false
			}
			if(last(objectCreatingButtonWithChildNames) == myFocus.name) {
				mdButton.isActive = false
			}
			if(myFocus.name == "OTHER") {
				rButton.isActive = false
				d2Button.isActive = false
			}
		}
	} else if(focusedObjects.length == 2) {

		br1.h = 370

		sButton.x = br1.x + 20
		sButton.y = br1.y + 120

		muButton.x = br1.x + 20
		muButton.y = br1.y + 180

		mdButton.x = br1.x + 250
		mdButton.y = br1.y + 180

		juButton.x = br1.x + 20
		juButton.y = br1.y + 240

		jdButton.x = br1.x + 250
		jdButton.y = br1.y + 240

		uButton.x = br1.x + 20
		uButton.y = br1.y + 300

		oButton.x = br1.x + 20 + uButton.width + 10
		oButton.y = br1.y + 300

		d1Button.x = oButton.x + oButton.width + 10
		d1Button.y = br1.y + 300

		if(include(defaultGates, myFocus.name) || !include(gateNames, myFocus.name)) {
			d1Button.isActive = false
			rButton.isActive = false
			oButton.isActive = false
		}

		br2 = {x: br1.x, y: br1.y + br1.h + 20, w: br1.w, h: 150}

		if(libraryButtonsCollection[1] == myFocus) {
			muButton.isActive = false
			juButton.isActive = false
		}
		if(last(libraryButtonsCollection) == myFocus) {
			mdButton.isActive = false
			jdButton.isActive = false
		}

	} else {
		br2 = {x: br1.x, y: br1.y, w: br1.w, h: 150}
	}

	
	if(libraryMode == null) {
		
		ncButton.x = br2.x + 20
		ncButton.y = br2.y + 20

		
		elButton.x = br2.x + 20
		elButton.y = ncButton.y + ncButton.height + 10	
	} else {
		if(libraryMode == "bigDelete") {
			let tempParagraph = `Are you sure you want to delete this collection? The chips inside of it will be moved to "OTHER".`
			let paragraphHeight = c.drawParagraph(tempParagraph, br2.x + 20, br2.y + 20, br2.w - 40, 40)
			br2.h = paragraphHeight + 110
			d3Button.x = br2.x + 250
			d3Button.y = br2.y + 40 + paragraphHeight

			cButton.x = br2.x + 20
			cButton.y = br2.y + 40 + paragraphHeight

			d3Button.isActive = true
			cButton.isActive = true
		} else if(libraryMode == "smallDelete") {

			let tempParagraph = getParagraph()
			let paragraphHeight = c.drawParagraph(tempParagraph, br2.x + 20, br2.y + 20, br2.w - 40, 40)


			br2.h = paragraphHeight + 110
			d3Button.x = br2.x + 250
			d3Button.y = br2.y + 40 + paragraphHeight

			cButton.x = br2.x + 20
			cButton.y = br2.y + 40 + paragraphHeight

			d3Button.isActive = true
			cButton.isActive = true
		} else if(libraryMode == "renameCollection") {
			br2.h = 160	
			changeInputPos(universalInput, br2.x + 20, br2.y + 20, br2.w - 40 - 40, 50 - 20)
			
			universalInput.style.visibility = "visible"
			universalInput.style.fontSize = "30px";

			cButton.x = br2.x + 20
			cButton.y = br2.y + 90

			r2Button.x = br2.x + 250
			r2Button.y = br2.y + 90

			r2Button.isActive = true
			cButton.isActive = true
		} else if(libraryMode == "newCollection") {
			br2.h = 230	
			changeInputPos(universalInput, br2.x + 20, br2.y + 90, br2.w - 40 - 40, 50 - 20)
			
			universalInput.style.visibility = "visible"
			universalInput.style.fontSize = "30px";

			ncButton.x = br2.x + 20
			ncButton.y = br2.y + 20

			cButton.x = br2.x + 20
			cButton.y = br2.y + 160

			crButton.x = br2.x + 250
			crButton.y = br2.y + 160

			cButton.isActive = true
			crButton.isActive = true
		}
	}
}

function strokeInput(input, color, lineW) {
    const canvasRect = canvas.getBoundingClientRect();
    const rect = input.getBoundingClientRect();

    const x = rect.left - canvasRect.left;
	const y = rect.top - canvasRect.top;
    const w = rect.width;
    const h = rect.height;

    c.beginPath();
    c.strokeStyle = color;
    c.lineWidth = lineW;
    c.rect(
    x - lineW / 2,
    y - lineW / 2,
    w + lineW,
    h + lineW
);
    c.stroke();
    c.closePath();
}

function changeInputPos(input, x, y, w, h) {
	if(x != undefined) input.style.left = `${x}px`
	if(y != undefined) input.style.top = `${y}px`
	if(w != undefined) input.style.width = `${w}px`
	if(h != undefined) input.style.height = `${h}px`
}

function findButton(arr, name, conditionFn = (b => true)) {
	let found = false
	let myButton = null
	for(let b of arr) {
		if(b.name == name && conditionFn(b)) {
			if(!found) {
				myButton = b
				found = true
			} else {
				console.log(arr, name)
				console.log("Aynı özelliklerden birden fazla var")
			}		
		}
	}
	return myButton
}

function swapProperty(obj1, obj2, prop) {
    if (obj1 && obj2 && prop in obj1 && prop in obj2) {
        const temp = obj1[prop];
        obj1[prop] = obj2[prop];
        obj2[prop] = temp;
    }
}

function swapArrayItems(arr, index1, index2) {
    const temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
}

function confirmDelete() {
	let myFocus = last(focusedObjects)
	if(libraryMode == "bigDelete") {
		let index = findIndex(objectCreatingButtonWithChildNames, myFocus.name)
		Splice(objectCreatingButtonWithChildNames, myFocus.name)
		let OTHERindex = findIndex(objectCreatingButtonWithChildNames, "OTHER")
		isCollectionOpen.splice(index, 1)
		let arr = childObjectCreatingButtonInfos.splice(index, 1)
		
		arr[0].forEach( (i) => childObjectCreatingButtonInfos[OTHERindex].push(i))
		Splice(buttons, findButton(buttons, myFocus.name, (b) => {b.style == "libraryButtonCollectionC"}))

		if(include(starredButtons, myFocus.name)) {
			let sIndex = findIndex(starredButtons, myFocus.name)
			starredButtons.splice(sIndex, 1)

			let sButton =  findButton(libraryButtons, myFocus.name, (b) => (b.style == "libraryButtonStarredC"))
			console.log(sButton)
			Splice(libraryButtonsStarred, sButton)
			Splice(libraryButtons, sButton)

			Splice(buttons, findButton(buttons, myFocus.name))
			organizeObjectCreatingButtons()
			repositionStarredButtons()
		}
		isCollectionOpen[OTHERindex] = 1
		focusedObjects = [];
		repositionCollectionButtons(findButton(libraryButtonsCollection, "OTHER"))	
	}


	if(libraryMode == "smallDelete") {
		for(let i = 0; i < childObjectCreatingButtonInfos.length ; i++) {
			if(include(childObjectCreatingButtonInfos[i], myFocus.name)) {
				Splice(childObjectCreatingButtonInfos[i], myFocus.name)
			}
		}
		//Finding Focus Index
		let focusIndex
		if(myFocus.style == "libraryButtonStarred") {	
			if(libraryButtonsStarred.length > 0) {
				focusIndex = findIndex(libraryButtonsStarred, myFocus)
			}
		} else {
			focusIndex = findIndex(libraryButtonsCollection, myFocus)
		}
		
		//Deletes from starred
		if(include(starredButtons, myFocus.name)) {
			Splice(starredButtons, myFocus.name)
			Splice(libraryButtonsStarred, findButton(libraryButtonsStarred, myFocus.name))
			Splice(buttons, findButton(buttons, myFocus.name))
			repositionStarredButtons()
			organizeObjectCreatingButtons()
		}

		//Deletes it's infos
		deleteFastProcessInfos(myFocus.name)
		Splice(gateNames, myFocus.name)
		delete gateInfos[myFocus.name]
		
		
		//Deletes usedBy infos
		let usedByNested = getUsedBy(myFocus.name, [], [], true)
		for(let i = 0; i < usedByNested.length; i++) {
			deleteFastProcessInfos(usedByNested[i])
		}

		//////////
		//Creates the visualObjects in savedGates
		for(let n of usedByNested) {
			let tempGates = gateInfos[n].savedGate.filter(obj=> obj.ObjectName == "Gate")
			createVisualObjects(usedByNested, tempGates) /// !!! burasının olmaması lazım fast processte değiştirdin !!!
		}

		//Current area create
		createVisualObjects(usedByNested, gates)	
		

		function createVisualObjects(usedNames, tempGates) {
			for(let obj of tempGates) {
				if(include(usedNames, obj.name)) {
					if(gateInfos[obj.name].isMemoryHolder) {
						obj.memory = []
					}
					obj.visualObjects = obj.createVisualObjects() //Not this function gates' function
				}		
			}
			for(let obj of tempGates) {
				if(include(usedNames, obj.name)) {
					createVisualObjects(obj.name, obj.visualObjects.filter(obj=> obj.ObjectName == "Gate"))
				}		
			}
		}
		////////////////
		
		

		// Deletion from usedByNested
		for(let n of usedByNested) {
			deleteFromVisualObjects(myFocus.name, gateInfos[n].savedGate)
			calculateCreatedFrom(n)	
		}
		deleteFromVisualObjectsReal(myFocus.name)

		function deleteFromVisualObjects(name, tempObjects) {
			for(let Obj = tempObjects.length - 1; Obj >= 0; Obj--) {
				let obj = tempObjects[Obj]
				if(obj.ObjectName == "Gate" && obj.name == name) {
					obj.delete(tempObjects, tempObjects, tempObjects, tempObjects)
				}		
			}
			for(let Obj = tempObjects.length - 1; Obj >= 0; Obj--) {
				let obj = tempObjects[Obj]
				if(obj.ObjectName == "Gate" && include(usedByNested, obj.name)) {
					deleteFromVisualObjects(name, obj.visualObjects)
				}		
			}
		}

		function deleteFromVisualObjectsReal(name) {
			for(let obj of gates) {
				if(obj.name == name) {
					obj.delete()
				}		
			}
			for(let obj of gates) {
				if(include(usedByNested, obj.name)) {
					deleteFromVisualObjects(name, obj.visualObjects)
				}		
			}
		}
		///////////////////////////////

		//Makes something to focus	
		if(myFocus.style == "libraryButtonStarred") {	
			if(libraryButtonsStarred.length > 0) {
				focusMe(libraryButtonsStarred[Math.min(focusIndex, libraryButtonsStarred.length - 1)])
			}
			repositionCollectionButtons()
		} else {
			repositionCollectionButtons(libraryButtonsCollection[Math.min(focusIndex - 1, libraryButtonsCollection.length - 1)])
		}
	}
	
	LcancelButton()
}


function deleteFastProcessInfos(name) {
	if(include(fastProcessedGates, name)) {
		Splice(fastProcessedGates, name)
		delete fastProcessInfos[name]
		gateInfos[name].isLooping = false
		gateInfos[name].isMemoryHolder = false
		gateInfos[name].isFastProcessed = false
		// !!! buraya inital memory'i silme eklenmeli sanırım
	} else if(include(fastProcessQueue, name) || currentFastProcess == name) {
		console.log("a")
		abortFastProcess(name)
	} 
}

function loadWorkingStation(arr) {
	emptyWorkingArea(true)
	for(let s of arr) {
		if(s.ObjectName == "Output") {
			outputs.push(s)
		}
		if(s.ObjectName == "Input") {
			inputs.push(s)
		}
		if(s.ObjectName == "Gate") {
			gates.push(s)
		}
		if(s.ObjectName == "Display") {
			displays.push(s)
		}
		if(s.ObjectName == "Bus") {
			busses.push(s)
		}
		if(s.ObjectName == "Cable") {
			cables.push(s)
		}
	}
}

function repositionStarredButtons() {
	for(let i = 0; i < starredButtons.length; i++) {
		let tempY = sr.y + 80 + i*(spaceBetweenLibraryButtons + 40)
		libraryButtonsStarred[i].y = tempY
	}
}


function moveUpFunction() {
	let myFocus = last(focusedObjects)
	if(myFocus.style == "libraryButtonStarred" || myFocus.style == "libraryButtonStarredC") {
		let indexS = findIndex(libraryButtonsStarred, myFocus)
		let upperButtonS = libraryButtonsStarred[indexS - 1]
		swapProperty(upperButtonS, myFocus, "y")

		swapArrayItems(libraryButtonsStarred, indexS, indexS-1)
		swapArrayItems(starredButtons, indexS, indexS-1)

		let indexG
		let nextIndexG
		for(let b = 0; b < buttons.length; b++) {
			if(buttons[b].style == "gateButton" || buttons[b].style == "objectCreatingButtonWithChild") {
				if(indexG == null) {
					if(buttons[b].name == myFocus.name) {
						indexG = b
					}
				} 			
			}
		}
		for(let b = indexG -1; b >= 0; b--) {
			if(buttons[b].style == "gateButton" || buttons[b].style == "objectCreatingButtonWithChild") {
				nextIndexG = b
				break;
			}
		}
		swapArrayItems(buttons, indexG, nextIndexG)
		organizeObjectCreatingButtons()	
	} else {
		if(myFocus.style == "libraryButtonCollectionC") {
			let indexC = findIndex(objectCreatingButtonWithChildNames, myFocus.name)
			swapArrayItems(objectCreatingButtonWithChildNames, indexC, indexC-1)
			swapArrayItems(isCollectionOpen, indexC, indexC-1)
			swapArrayItems(childObjectCreatingButtonInfos, indexC, indexC -1 )
		}
		if(myFocus.style == "libraryButtonCollection") {
			let indexOfInfos
			for(let i = 0; i < childObjectCreatingButtonInfos.length; i++) {
				let temp_ = findIndex(childObjectCreatingButtonInfos[i], myFocus.name)
				if(temp_ != null) {
					indexOfInfos = {index1: i, index2: temp_}
					break
				}
			}
			if(indexOfInfos.index2 == 0) {
				childObjectCreatingButtonInfos[indexOfInfos.index1 - 1].push(childObjectCreatingButtonInfos[indexOfInfos.index1].splice(0,1)[0])
				isCollectionOpen[indexOfInfos.index1 - 1] = 1
			} else {
				swapArrayItems(childObjectCreatingButtonInfos[indexOfInfos.index1], indexOfInfos.index2, indexOfInfos.index2 - 1)			
			}
		}
		repositionCollectionButtons(myFocus)
	}
	organizeButtons()
}

function moveDownFunction() {
	let myFocus = last(focusedObjects)
	if(myFocus.style == "libraryButtonStarred" || myFocus.style == "libraryButtonStarredC") {
		let indexS = findIndex(libraryButtonsStarred, myFocus)
		let bottomButtonS = libraryButtonsStarred[indexS + 1]
		swapProperty(bottomButtonS, myFocus, "y")

		swapArrayItems(libraryButtonsStarred, indexS, indexS+1)
		swapArrayItems(starredButtons, indexS, indexS+1)

		let indexG
		let prevIndexG
		for(let b = 0; b < buttons.length; b++) {
			if(buttons[b].style == "gateButton" || buttons[b].style == "objectCreatingButtonWithChild") {
				if(indexG == null) {
					if(buttons[b].name == myFocus.name) {
						indexG = b
					}
				} 			
			}
		}
		for(let b = indexG +1; b < buttons.length; b++) {
			if(buttons[b].style == "gateButton" || buttons[b].style == "objectCreatingButtonWithChild") {
				prevIndexG = b
				break;
			}
		}
		swapArrayItems(buttons, indexG, prevIndexG)
		organizeObjectCreatingButtons()	
	} else {
		if(myFocus.style == "libraryButtonCollectionC") {
			let indexC = findIndex(objectCreatingButtonWithChildNames, myFocus.name)
			swapArrayItems(objectCreatingButtonWithChildNames, indexC, indexC+1)
			swapArrayItems(isCollectionOpen, indexC, indexC+1)
			swapArrayItems(childObjectCreatingButtonInfos, indexC, indexC+1 )
		}
		if(myFocus.style == "libraryButtonCollection") {
			let indexOfInfos
			for(let i = 0; i < childObjectCreatingButtonInfos.length; i++) {
				let temp_ = findIndex(childObjectCreatingButtonInfos[i], myFocus.name)
				if(temp_ != null) {
					indexOfInfos = {index1: i, index2: temp_}
					break
				}
			}
			if(indexOfInfos.index2 == childObjectCreatingButtonInfos[indexOfInfos.index1].length - 1) {
				childObjectCreatingButtonInfos[indexOfInfos.index1 + 1].unshift(childObjectCreatingButtonInfos[indexOfInfos.index1].splice(indexOfInfos.index2,1)[0])
				isCollectionOpen[indexOfInfos.index1 + 1] = 1
			} else {
				swapArrayItems(childObjectCreatingButtonInfos[indexOfInfos.index1], indexOfInfos.index2, indexOfInfos.index2 + 1)
			}
		}
		repositionCollectionButtons(myFocus)
	}
	organizeButtons()
}

function jumpUpFunction() {
	let myFocus = last(focusedObjects)
	for(let i = 0; i < childObjectCreatingButtonInfos.length; i++) {
		let temp_ = findIndex(childObjectCreatingButtonInfos[i], myFocus.name)
		if(temp_ != null) {
			indexOfInfos = {index1: i, index2: temp_}
			break
		}
	}
	if(indexOfInfos.index1 == 0) {
		childObjectCreatingButtonInfos[0].unshift(childObjectCreatingButtonInfos[0].splice(indexOfInfos.index2, 1)[0])
	} else {
		childObjectCreatingButtonInfos[indexOfInfos.index1 - 1].push(childObjectCreatingButtonInfos[indexOfInfos.index1].splice(indexOfInfos.index2,1)[0])
		isCollectionOpen[indexOfInfos.index1 - 1] = 1		
	}
	repositionCollectionButtons(myFocus)
}

function jumpDownFunction() {
	let myFocus = last(focusedObjects)
	for(let i = 0; i < childObjectCreatingButtonInfos.length; i++) {
		let temp_ = findIndex(childObjectCreatingButtonInfos[i], myFocus.name)
		if(temp_ != null) {
			indexOfInfos = {index1: i, index2: temp_}
			break
		}
	}
	if(indexOfInfos.index1 == childObjectCreatingButtonInfos.length - 1) { 
		childObjectCreatingButtonInfos[indexOfInfos.index1].push(childObjectCreatingButtonInfos[indexOfInfos.index1].splice(indexOfInfos.index2, 1)[0])
	} else {
		childObjectCreatingButtonInfos[indexOfInfos.index1 + 1].unshift(childObjectCreatingButtonInfos[indexOfInfos.index1].splice(indexOfInfos.index2, 1)[0])
		isCollectionOpen[indexOfInfos.index1 + 1] = 1	
	}
	repositionCollectionButtons(myFocus)
}

function bigDeleteButton() {
	libraryMode = "bigDelete"
}

function smallDeleteButton() {
	libraryMode = "smallDelete"
}

function addToStarred(name) {
	starredButtons.push(name)
	let lastGateButton = buttons.filter(b => b.style == ("gateButton") || b.style == ("objectCreatingButtonWithChild")).reduce((last, curr) => 
		curr.x > last.x ? curr : last, {x: buttons[0].width + spaceBetweenEveryButton, width:0}
	);
	
	let lastStarredButton = libraryButtonsStarred.reduce((last, curr) => 
		curr.y > last.y ? curr : last,  {y: sr.y + 30}
	);
	
	let tempButton
	let starredButton
	if(!include(objectCreatingButtonWithChildNames, name)) {
		tempButton = new Button(lastGateButton.x + lastGateButton.width + spaceBetweenEveryButton, gateCreatingAreaMetrics.y + spaceBetweenEveryButton, name, "gateButton", ()=>{spawnObject(name)})
		starredButton = new Button(sr.x + 40, lastStarredButton.y + spaceBetweenLibraryButtons + 40, name, "libraryButtonStarred", ()=>{focusMe(starredButton)})
	} else {
		tempButton = new Button(lastGateButton.x + lastGateButton.width + spaceBetweenEveryButton , gateCreatingAreaMetrics.y + spaceBetweenEveryButton, name, "objectCreatingButtonWithChild", ()=>{createChildObjectCreatingButtons(name)})
		starredButton = new Button(sr.x + 40, lastStarredButton.y + spaceBetweenLibraryButtons + 40, name, "libraryButtonStarredC", ()=>{focusMe(starredButton)})
	}
	starredButton.width = 510
	starredButton.height = 40
	buttons.push(tempButton)
	libraryButtons.push(starredButton)
	libraryButtonsStarred.push(starredButton)
	organizeButtons()

	currentFile.save();
}

function library_AddToStarred() {
	let myFocus = last(focusedObjects)
	starredButtons.push(myFocus.name)
	let lastGateButton = buttons.filter(b => b.style == ("gateButton") || b.style == ("objectCreatingButtonWithChild")).reduce((last, curr) => 
		curr.x > last.x ? curr : last, {x: buttons[0].width + spaceBetweenEveryButton, width:0}
	);
	
	let lastStarredButton = libraryButtonsStarred.reduce((last, curr) => 
		curr.y > last.y ? curr : last,  {y: sr.y + 30}
	);
	
	let tempButton
	let starredButton
	if(myFocus.style == "libraryButtonCollection") {
		tempButton = new Button(lastGateButton.x + lastGateButton.width + spaceBetweenEveryButton, gateCreatingAreaMetrics.y + spaceBetweenEveryButton, myFocus.name, "gateButton", ()=>{spawnObject(myFocus.name)})
		starredButton = new Button(sr.x + 40, lastStarredButton.y + spaceBetweenLibraryButtons + 40, myFocus.name, "libraryButtonStarred", ()=>{focusMe(starredButton)})
	} else {
		tempButton = new Button(lastGateButton.x + lastGateButton.width + spaceBetweenEveryButton , gateCreatingAreaMetrics.y + spaceBetweenEveryButton, myFocus.name, "objectCreatingButtonWithChild", ()=>{createChildObjectCreatingButtons(myFocus.name)})
		starredButton = new Button(sr.x + 40, lastStarredButton.y + spaceBetweenLibraryButtons + 40, myFocus.name, "libraryButtonStarredC", ()=>{focusMe(starredButton)})
	}
	starredButton.width = 510
	starredButton.height = 40
	buttons.push(tempButton)
	libraryButtons.push(starredButton)
	libraryButtonsStarred.push(starredButton)
	organizeButtons()
}

function organizeObjectCreatingButtons() {
	let sum = 0
	for(let i = 0; i < buttons.length; i++) {
		if(buttons[i].style == "gateButton" || buttons[i].style == "objectCreatingButtonWithChild") {
			let tempX = buttons[0].width + 2*spaceBetweenEveryButton + sum
			buttons[i].x = tempX
			sum += buttons[i].width	+ spaceBetweenEveryButton
		}	
	}
}

function removeFromStarred(name) {
	let myFocus = (name == null) ? last(focusedObjects) : findButton(libraryButtonsStarred, name)
	let tempButton = findButton(buttons, myFocus.name, b => (b.style == "gateButton" || b.style == "objectCreatingButtonWithChild"))
	let focusIndex;
	if(myFocus.style == "libraryButtonStarred" || myFocus.style == "libraryButtonStarredC") {
		focusIndex = findIndex(libraryButtonsStarred, myFocus) 
	}

	
	
	Splice(starredButtons, myFocus.name)
	Splice(buttons, tempButton)

	organizeObjectCreatingButtons();	

	let starredButton = findButton(libraryButtonsStarred, myFocus.name)
	Splice(libraryButtons, starredButton)
	Splice(libraryButtonsStarred, starredButton)

	
	for(let i = 0; i < libraryButtonsStarred.length; i++) {
		let tempY = sr.y + 80 + i*(spaceBetweenLibraryButtons + 40)
		libraryButtonsStarred[i].y = tempY
	}

	if((myFocus.style == "libraryButtonStarred" || myFocus.style == "libraryButtonStarredC")) {
		if(libraryButtonsStarred.length > 0) {
			focusMe(libraryButtonsStarred[Math.min(focusIndex, libraryButtonsStarred.length - 1)])
		} else {
			focusedObjects = [];
		}
	}
	organizeButtons()

	currentFile.save()
}

function resetInput() {
	universalInput.style.visibility = "hidden"
	universalInput.value = ""
}

function LcancelButton() {
	libraryMode = null
	universalInput.style.visibility = "hidden"
	resetInput()
}

function cancelLibraryMenu() {
	screen = 0
	libraryMode = null
	resetInput()
	currentFile.save()
}

function changePreferences(option, value, changeBoth = true) {
	let myPreference = preferences[option]
	myPreference.showIndex = (myPreference.showIndex + myPreference.arr.length + value) % myPreference.arr.length
	if(changeBoth) myPreference.currentIndex = myPreference.showIndex
	if(changeBoth) currentFile.save()
}

function optionMenuCancel(applyChanges) {
	screen = 0
	buttons.splice(buttons.length-14,14)
	isCreateButtonsforOptionMenu = true
	spsInput.style.visibility = "hidden"
	spctInput.style.visibility = "hidden"

	if(applyChanges) {
		for(let i = 0; i < Object.entries(preferences).length; i++) {
			let myKey = Object.entries(preferences)[i][0]	
			preferences[myKey].currentIndex = preferences[myKey].showIndex 
		}
		stepsPerClockTick = spctInput.value != "" ? spctInput.value : 0
		targetStepsPerSecond = spsInput.value != "" ? spsInput.value : 1
		accumulatedTime = 0
		simulatedStepsPerSecond = 0
		currentFile.save()
	} else {
		for(let i = 0; i < Object.entries(preferences).length; i++) {
			let myKey = Object.entries(preferences)[i][0]	
			preferences[myKey].showIndex  = preferences[myKey].currentIndex
		}
	}

}

function labelMenu(put) {
	defaultScreenChanger()
	let constant = labelMenuConstant
	let bigBoxMetrics = {height: constant, width: constant * 2.5, x: (canvas.width - constant*2.5)/2, y:(canvas.height - constant)/2 - gateCreatingAreaMetrics.height}
	screen = 3
	changingLabelObject = put;
	put.highlight = true
	highlightedObjects.push(put)
	newClickedForHighlight = true;

	

	changingDecimalDisplayMode = changingLabelObject.decimalDisplay;
	
	pinInputBox.value = put.tag
 	pinInputBox.style.visibility = 'visible';
	focusInput(pinInputBox)
	newClickedForTag = true;
}

function log(str, time) {
	if (now - lastLogTime >= time * 1000) {
		console.log(str);
		lastLogTime = now;
	}
}

function changeDecimalDisplay(value) {
	changingDecimalDisplayMode = decimalDisplayTypes[(findIndex(decimalDisplayTypes, changingDecimalDisplayMode) + decimalDisplayTypes.length + value) % decimalDisplayTypes.length]
}



function preloadImages() {
    return new Promise((resolve) => {
        let loaded = 0;

        let names = ["lock", "icon"];
        const total = names.length;

        for (let n of names) {

            images[n] = new Image(); // her adı kendi key’iyle kaydet

            images[n].onload = () => {
                loaded++;
                if (loaded === total) resolve();
            };

            images[n].onerror = () => {
                console.warn(`${n}.png yüklenemedi, atlanıyor.`);
                loaded++;
                if (loaded === total) resolve();
            };

            // src burada veriliyor → yükleme başlıyor
            images[n].src = `./images/${n}.png`;
        }
    });
}


///!!! bence bu kısmında hiçbir madde değişmöediyse o kadar işe kalkışmama yapabilrisin
function renameSavedGate() {
	let oldName = latestOpened
	let newName = gateInputBox.value

	// Self info delete
	deleteFastProcessInfos(oldName)
	Splice(gateNames, oldName)
	delete gateInfos[oldName]
	
	if(include(starredButtons, oldName)) {
		Splice(starredButtons, oldName)
		Splice(buttons, findButton(buttons, oldName, b=>(b.style == "gateButton")))
		let sButton = findButton(libraryButtonsStarred, oldName)
		Splice(libraryButtonsStarred, sButton)
		Splice(libraryButtons, sButton)
		repositionStarredButtons()
		organizeObjectCreatingButtons()
	}

	for(let a of childObjectCreatingButtonInfos) {
		if(include(a, oldName)) {
			Splice(a, oldName)
		}
	}
	/////

	//
	createNewGate()
	//	

	//For Focusing
	let focusedType = null
	if(focusedObjects.length > 0) {
		if(last(focusedObjects).name == oldName) {
			if(focusedObjects.length == 1) {
				focusedType = "starred"	
			} else if(focusedObjects.length == 2) {
				focusedType = "collection"	
			}
		} 
	}
	
	if(focusedType == "starred") {
		focusMe(findButton(libraryButtonsStarred, newName))
	} else if(focusedType == "collection") {
		focusMe(findButton(libraryButtonsCollection, newName))
	}
	//


	//////////
	//Creates the visualObjects in savedGates
	let usedByNested = getUsedBy(oldName, [], [], true)
	for(let n of usedByNested) {
		let tempGates = gateInfos[n].savedGate.filter(obj=> obj.ObjectName == "Gate")
		createVisualObjects(usedByNested, tempGates) 
	}
	
	function createVisualObjects(usedNames, tempGates) {
		for(let obj of tempGates) {
			if(include(usedNames, obj.name)) {
				//console.log(obj.name)
				if(gateInfos[obj.name].isMemoryHolder) {
					obj.memory = []
				}
				obj.visualObjects = obj.createVisualObjects() //Not this function gates' function
			}		
		}
		for(let obj of tempGates) {
			if(include(usedNames, obj.name)) {
				createVisualObjects(obj.name, obj.visualObjects.filter(obj=> obj.ObjectName == "Gate"))
			}		
		}
	}
	////////////////
		
		

	// Deletion from usedByNested
	for(let n of usedByNested) {
		deleteFromVisualObjects(oldName, gateInfos[n].savedGate)
		calculateCreatedFrom(n)	
	}

	function deleteFromVisualObjects(name, tempObjects) {
		for(let Obj = tempObjects.length - 1; Obj >= 0; Obj--) {
			let obj = tempObjects[Obj]
			if(obj.ObjectName == "Gate" && obj.name == name) {
				if(obj.name == oldName) {
					let oldGate = obj
					let gateInputConnectedTo = []
					let gateOutputConnectedTo = []

					for(let I = 0; I < oldGate.inputs.length; I++) {
						let i = oldGate.inputs[I];
						let tempInput = decode(tempObjects, i)
						for(let c of tempInput.inputs) {
							let tempCable = decode(tempObjects, c)
							let tempOutput = decode(tempObjects, tempCable.inputCode)
							gateInputConnectedTo.push({inputIndex: I, output: tempOutput})			
						}
					}

					for(let O = 0; O < oldGate.outputs.length; O++) {
						let o = oldGate.outputs[O];
						let tempOutput = decode(tempObjects, o)
						for(let c of tempOutput.outputs) {
							let tempCable = decode(tempObjects, c)
							let tempInput = decode(tempObjects, tempCable.outputCode)
							gateOutputConnectedTo.push({outputIndex: O, input: tempInput})		
						}
					}
					
					let newGate = new Gate(oldGate.x, oldGate.y, newName, [tempObjects, tempObjects], tempObjects)
					tempObjects.push(newGate)
					oldGate.delete(tempObjects, tempObjects, tempObjects, tempObjects, tempObjects)
					

					//Reconnects every cable
					for(let a of gateInputConnectedTo) {
						if(newGate.inputs.length - 1 >= a.inputIndex) {
							let tempInput = decode(tempObjects, newGate.inputs[a.inputIndex])
							tempObjects.push(Cable.fastConnect(a.output, tempInput, tempInput.type, false))
						}
					}

					for(let a of gateOutputConnectedTo) {
						if(newGate.outputs.length - 1 >= a.outputIndex) {
							let tempOutput = decode(tempObjects, newGate.outputs[a.outputIndex])
							tempObjects.push(Cable.fastConnect(tempOutput, a.input, tempOutput.type, false))
						}
					}
					////////////////////////////
					
				}
			}		
		}
		for(let Obj = tempObjects.length - 1; Obj >= 0; Obj--) {
			let obj = tempObjects[Obj]
			if(obj.ObjectName == "Gate" && include(usedByNested, obj.name)) {
				deleteFromVisualObjects(name, obj.visualObjects)
			}		
		}
	}
	///////////////////////////////



	//Used By Infos Deletion
	for(let i = 0; i < usedByNested.length; i++) {
		deleteFastProcessInfos(usedByNested[i])
	}

	currentFile.save()
}


function debugD() {
	// findButton(libraryButtonsCollection, "OTHER").clickFunction()
	// focusMe(findButton(libraryButtonsCollection, "D LATCH"))
	// smallDeleteButton()
	// confirmDelete()

	// openGate(new Gate(0, 0, "D LATCH"), true)
	// handleSaveScreen()
	// drawSaveScreen()
	// gateInputBox.value = "D LATCH1"
	// findButton(saveScreenButtons, "RENAME").clickFunction()

	//createDefaultPuts();
	gates.push(new Gate(500, 140, "On_FlipVisual"))
	startFastConnecting(last(gates),1, 1)
	gates.push(new Gate(500, 250, "On_Flip"))
	startFastConnecting(last(gates),1, 1)
}


function getTempGateInfos() {
	let tempArea = getWorkingArea(true) 
	tempArea = clone_Objects(tempArea)
	
	
	let tempIOCount = [[],[]];
	let tempUseableIO = [0, 0]
	let isLooping = isLoopingGate();
	console.log("Looping: ", isLooping)
	let isThreeState = false;
	let isMemoryHolder = false || isLooping;
	const sortedOutputs = tempArea
	.filter(item => item.ObjectName === "Output")
	.sort((a, b) => a.y - b.y);

	
	const sortedInputs = tempArea
	.filter(item => item.ObjectName === "Input")
	.sort((a, b) => a.y - b.y);

	// tempArea üzerinde Output’ları yerleştir
	let outputIdx = 0;
	let inputIdx = 0;

	for (let i = 0; i < tempArea.length; i++) {
		if(tempArea[i].ObjectName === "Output") {
			tempArea[i] = sortedOutputs[outputIdx];
			outputIdx++;
		}
		if(tempArea[i].ObjectName === "Input") {
			tempArea[i] = sortedInputs[inputIdx];
			inputIdx++;
		}
	}
	////


	for(let i = 0; i < tempArea.length; i++) {
		if(tempArea[i].ObjectName == "Output" && tempArea[i].parentCode == null) {
			tempIOCount[0].push(tempArea[i].type)
			if(tempArea[i].outputs.length != 0) {
				tempArea[i].FP_useable = true
				tempUseableIO[0] += tempArea[i].type
			} else {
				tempArea[i].FP_useable = false
			}
		}
		if(tempArea[i].ObjectName == "Input" && tempArea[i].parentCode == null) {
			tempIOCount[1].push(tempArea[i].type)
			if(tempArea[i].inputs.length != 0) {
				tempArea[i].FP_useable = true
				tempUseableIO[1] += tempArea[i].type
			} else {
				tempArea[i].FP_useable = false
			}
		}
		if(tempArea[i].ObjectName == "Gate") {
			if(gateInfos[tempArea[i].name].isThreeState) {
				isThreeState = true;
			}
			if(gateInfos[tempArea[i].name].isMemoryHolder) {
				isMemoryHolder = true
			}
		}
	}
	
	tempGateInfos.gateIO = tempIOCount
	tempGateInfos.camera = {...camera}
	tempGateInfos.savedGate = tempArea
	tempGateInfos.useableIO = tempUseableIO
	tempGateInfos.isThreeState = isThreeState
	tempGateInfos.isLooping = isLooping
	tempGateInfos.isMemoryHolder = isMemoryHolder
	tempGateInfos.isFastProcessed = false
}

gateInputBox.addEventListener("input", ()=>{
	let tempWH = calculateGateWH(gateInputBox.value, tempGateInfos)
	customizeMenuSavedPreferences.width = Math.max(customizeMenuSavedPreferences.width, tempWH.width)
	customizingGate.width = Math.max(customizeMenuSavedPreferences.width, tempWH.width)
	customizingGate.calculateHitbox()
})

function createNewGate() {
	let tempName = tempGateInfos.name

	//isMemoryHolders and isLooping depends on FP so : no FP --> false
	if(!checkboxs[0].isActive) {
		tempGateInfos.isMemoryHolder = false
		tempGateInfos.isLooping = false
	}
	gateInfos[tempName] = {...tempGateInfos}
	//
	
	gateInfos[tempName].color = customizeMenuSavedPreferences.color
	gateInfos[tempName].width = customizeMenuSavedPreferences.width
	gateInfos[tempName].height = customizeMenuSavedPreferences.height
	gateInfos[tempName].nameMode = customizeMenuSavedPreferences.nameMode
	gateInfos[tempName].nameColor = customizeMenuSavedPreferences.strokeStyle
	gateInfos[tempName].displays = customizeMenuSavedPreferences.displays
	gateNames.push(tempName)

	
	if(tempGateInfos.isMemoryHolder && checkboxs[0].isActive) {createInitialMemory(tempName)}
	if(checkboxs[0].isActive) {fastProcessQueue.push(tempName)};

	saveScreenCancel();

	let lastGateButton = null
	for(let i = 0; i < buttons.length; i++) {
		if(buttons[i].style == "gateButton" || buttons[i].style == "objectCreatingButtonWithChild") {
			lastGateButton = buttons[i];
		}
	}
	
	if(!include(starredButtons, tempName)) {
		starredButtons.push(tempName)
		childObjectCreatingButtonInfos[findIndex(objectCreatingButtonWithChildNames, "OTHER")].push(tempName)
		buttons.push(new Button(lastGateButton.x + lastGateButton.width + spaceBetweenEveryButton, gateCreatingAreaMetrics.y + spaceBetweenEveryButton, tempName, "gateButton", () => spawnObject(tempName)));
	}
	

	//Creates Library Buttons
	let tempY = last(libraryButtonsStarred).y + (spaceBetweenLibraryButtons + 40)
	let librarySButton = new Button(sr.x + 40, tempY, tempName, "libraryButtonStarred", () =>  focusMe(librarySButton))
	libraryButtonsStarred.push(librarySButton)
	libraryButtons.push(librarySButton)
	librarySButton.width = 510
	librarySButton.height = 40
	repositionCollectionButtons();
	//

	//Calculates createdFrom
	calculateCreatedFrom(tempName)
	latestSavedStation = getWorkingArea(true)
	
	latestOpened = null
	limitedGates = []

	currentFile.save()
}

function isStraight() {
	let myPreference = getPreference("StraightWires")
	if(
		(myPreference == "Hold Shift" && shiftKeyActive) ||
		(myPreference == "If Grid Shown" && (getPreference("ShowGrid") == "On" || (mouseOccupation == "cableCreating" && controlKeyActive))) ||
		(myPreference == "Always")
	)  {
		return true
	}
	return false
}

function doesSnap() {
	let myPreference = getPreference("SnapToGrid") 
	if(
		(myPreference == "Hold Ctrl" && controlKeyActive) ||
		(myPreference == "If Grid Shown" && getPreference("ShowGrid") == "On") ||
		(myPreference == "Always")
	) {
		return true
	}
	return false
}

function getPage(gate) {
	if(include(fastProcessedGates, gate.name) || include(defaultGates, gate.name)) {
		return clone_Objects(gateInfos[gate.name].savedGate)
	} else {
		return clone_Objects(gate.visualObjects);
	}
}

let savedScreen = 0;
function openGate(gate, isConfirmed = true) {
	if(!isConfirmed) {
		savedScreen = screen
		defaultScreenChanger()
		screen = 6	
		requestedConfirm = () => openGate(gate, true)
	} else {
		if(currentPage != -1) {
			currentPage = -1
			pageNames = []
			Splice(buttons, findButton(buttons, "BACK", (b)=>(b.style == "backButton")))
			workingAreas = [];
		}
		
		emptyWorkingArea(true)
		latestOpened = gate.name
		currentCustomizedDisplayArray = cloneArray(gateInfos[latestOpened].displays)
		limitedGates = getUsedBy(gate.name, [], [], true)
		limitedGates.push(gate.name)
		let tempStation = getPage(gate)
		latestSavedStation = clone_Objects(tempStation, false)

		for(s of tempStation) {
			if(s.ObjectName == "Output") {
				outputs.push(s)
			}
			if(s.ObjectName == "Input") {
				inputs.push(s)
			}
			if(s.ObjectName == "Gate") {
				gates.push(s)
				if(include(fastProcessedGates, s.name)) {
					if(s.visualObjects.length > 0) {
						console.log("Hata var!")
					}	
				}
			}
			if(s.ObjectName == "Display") {
				displays.push(s)
			}
			if(s.ObjectName == "Cable") {
				cables.push(s)
			}
		}

		camera = {...gateInfos[gate.name].camera}
	}
	if(latestOpened == null) {
		savedCamera = {...camera} 
	}
	
}

let savedLatestOpened = null
function changePage(objects, gate = "nothing", isSaved = false) {

	//console.log(objects, gate, isSaved)

	let page = -1
	if(gate != "nothing") {	
		for(i = 0; i < Object.entries(gateInfos).length; i++) {
			if(Object.entries(gateInfos)[i][0] == gate.name) {
				page = i
			}
		}			
	}

	if(!isSaved) {
		workingAreas.push(getWorkingArea(true));
		pageNames.push(gate);
	} else {
		workingAreas.pop()
		pageNames.pop();
		if(workingAreas.length == 0) {
			for(let b = 0; b < buttons.length; b++) {
				if(buttons[b].style == "backButton") {
					buttons.splice(b, 1)
					break;
				}
			}
		} else {
			for(i = 0; i < Object.entries(gateInfos).length; i++) {
				if(Object.entries(gateInfos)[i][0] == last(pageNames).name) {
					page = i
				}
			}
		}
	}

	if(currentPage == -1) {
		//First View
		buttons.push(new Button(canvas.width - 175, 10, "BACK", "backButton", () => {changePage(last(workingAreas), "nothing", true)}))
		savedCamera = { ...camera }
		savedLatestOpened = latestOpened
	}

	if(workingAreas.length > 0) {		
		camera = {...gateInfos[last(pageNames).name].camera}
	} else {
		camera = {...savedCamera}
	}

	let previousStation = getWorkingArea(false)
	let tempStation = objects;
	let _latestSavedStation = latestSavedStation
	loadWorkingStation(tempStation)
	latestSavedStation = _latestSavedStation

	if(workingAreas.length == 0) {
		latestOpened = savedLatestOpened
		setLimitedGates(latestOpened)
	}

	currentPage = page
	if(workingAreas.length == 0) {
		currentPage = -1
	} else {
		if(gate != "nothing") {
			setPageAreaInputs(gate, previousStation, tempStation)
		} 
	}
}

function hammingDistance(a, b) {
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

function darkenRGBA(rgba, amount) {
  // rgba() içinden sayıları çekelim
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgba; // geçersiz format

  let [_, r, g, b, a] = match;
  r = Math.round(parseInt(r) * (1 - amount));
  g = Math.round(parseInt(g) * (1 - amount));
  b = Math.round(parseInt(b) * (1 - amount));
  a = a !== undefined ? parseFloat(a) : 1;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function setRGBAAlpha(rgbaString, newAlpha) {
  // Parantez içindeki sayıları yakalar (rgb veya rgba destekli)
  const match = rgbaString.match(
    /rgba?\s*\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:\s*,\s*([0-9]*\.?[0-9]+))?\s*\)/i
  );

  if (!match) {
    console.warn("Geçersiz RGBA formatı:", rgbaString);
    return rgbaString;
  }

  const r = parseInt(match[1]);
  const g = parseInt(match[2]);
  const b = parseInt(match[3]);
  const a = newAlpha !== undefined ? newAlpha : (match[4] ? parseFloat(match[4]) : 1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}


function lightenRGBA(rgba, amount) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgba;

  let [_, r, g, b, a] = match;
  r = Math.min(255, Math.round(parseInt(r) + (255 - parseInt(r)) * amount));
  g = Math.min(255, Math.round(parseInt(g) + (255 - parseInt(g)) * amount));
  b = Math.min(255, Math.round(parseInt(b) + (255 - parseInt(b)) * amount));
  a = a !== undefined ? parseFloat(a) : 1;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function turnOffMainOutputs(arrOutput = outputs) {
	for(let o of arrOutput) {
		o.lit = Array(o.type).fill(false);
	}
}

function getAllObjectsThatHaveHitboxs() {
	return gates.concat(busses).concat(inputs.filter(o => o.parentCode == null)).concat(outputs.filter(o => o.parentCode == null)).concat(displays.filter(o => o.parentCode == null))
}

function setInputLitValues(mainOutputs, str) {

	
	//Hata verir
	let totalSwitch = 0
	for(let o of mainOutputs) {
		if(o.parentCode == null) {
			totalSwitch += o.lit.length
		}	
	}
	if(totalSwitch != str.length) {
		console.log("-----------")
		console.log("Hatalı Main Output Değiştirme sayılar eşit değil")
		console.log(totalSwitch, str.length)
		console.log("-----------")
		return;
	}
	////////////

	let counter = 0
	for(let o of mainOutputs) {
		if(o.parentCode == null) {
			for(let t = 0; t < o.lit.length; t++) {
				o.lit[t] = !!+str[counter]
				counter++
			}
		}
	}
}

function changeColor(obj, colorMode) {
	obj.colorMode = colorMode
	if(obj.ObjectName == "Output") {
		for(let c of obj.outputs) {
			let tempCable = decode(cables, c)
			changeColor(tempCable, colorMode)
		}
	}
	if(obj.ObjectName == "Cable") {
		for(let child of obj.childs) {
			let tempCable = decode(cables, child)
			changeColor(tempCable, colorMode)
		}
		let tempObject = decode(inputs.concat(cables), obj.outputCode) //Cable's output
		changeColor(tempObject, colorMode)
	}
}



async function calculateFastProcessValues(name, giveProgress) {
	let isFinished = false

	// Calculates all fastProcessValues by trying each different combination and writes it down.
	let tempArea = clone_Objects(gateInfos[name].savedGate, true)	
	stabilizeArea(tempArea)

	let tempValues = []

	let useableInputLength = gateInfos[name].useableIO[0]
	let useableOutputLength = gateInfos[name].useableIO[1]
	let savedWS = []
	if(showFP) savedWS = getWorkingArea()
	// Calculates for normal gates
	if(!gateInfos[name].isMemoryHolder) {

		let mainInputs = tempArea.filter(obj => obj.ObjectName == "Input" && obj.FP_useable && obj.parentCode == null)
		let mainOutputs = tempArea.filter(obj => obj.ObjectName == "Output" && obj.FP_useable && obj.parentCode == null)
		
		
		BenchmarkManager.start(name)
		if(showFP) {
			loadWorkingStation(tempArea)
		}

		for(let n = 0; n < Math.pow(2, useableInputLength); n++) { 		
			if (fastProcessAbortController) break; //Breaks if aborted

			if (giveProgress && n % 10 == 0) await new Promise(r => setTimeout(r, 0));
			let binaryInputs = n.toString(2);

			while(binaryInputs.length < useableInputLength) {
				binaryInputs = "0".concat(binaryInputs);
			}

			
			// Sets every input and adds to the "tempValues"
			setInputLitValues(mainOutputs, binaryInputs)
			for(let i = 0; i < binaryInputs.length; i++) {
				tempValues.push(parseInt(binaryInputs[i]));
			}
			
			
			

			// //Processes the main gate

			processArea(tempArea)
			
			
			// Adds "tempGates'" output values to the "tempValues"
			for(let i of mainInputs) {
				for(let l = 0; l < i.type; l++) {
					tempValues.push(+i.lit[l]);
				}
			}
			
			if(giveProgress) {
            	let progress = Math.floor((n / Math.pow(2, mainOutputs.length)) * 100);
           		//console.log(progress);	
        	}
		}
		isFinished = true
	}
	
	//////////////////////////////////

	let totalIteration = 0
	// Calculates for looping gates 
	if(gateInfos[name].isMemoryHolder) {	
		// Memory: All of the my visual looping gates' memory + tempGate's outputs
		function rewriteMemory(name, objects, mainInputs) {
			if (!gateInfos[name]) return []
			let areaMemory = [];
			if(gateInfos[name].isLooping) {
				for(let i of mainInputs) {
					for(let t = 0; t < i.type; t++) {
						areaMemory.push(+i.lit[t]);
					}
				}
			}
			

			for(let obj of objects) {
				// Problem şu diyelim ki fastprocess olmamış bir gate var (A) onu kullanarak başka bir fastprocess gate yaparsan (B),A'nın memorysi olmadığı için B de memory eksikliği oluyor / Artık olmuyor çünkü böyle bir şey yapmayı yaskaldım
				if(obj.ObjectName == "Gate" && gateInfos[obj.name].isMemoryHolder) {
					for(let m of obj.memory) {
						areaMemory.push(m);					
					}
				}
			}

			return areaMemory;
		}
		///////////////

		
		//Important Infos
		let tempLengthArr = getTruthTableLength(name)
		let inputTruthTableLength = tempLengthArr[0]
		let outputTruthTableLength = tempLengthArr[1]
		let oneTruthTableLength = tempLengthArr[2]
		/////
			 	
		// Making the tempValues template
		for(let n = 0; n < Math.pow(2, inputTruthTableLength); n++) {
			let binaryInputs = n.toString(2);
			while(binaryInputs.length < inputTruthTableLength) {
				binaryInputs = "0".concat(binaryInputs);
			}
			for(let m = 0; m < binaryInputs.length; m++) {
				tempValues.push(+binaryInputs[m]);
			}

			for(let m = 0; m < outputTruthTableLength; m++) {
				tempValues.push("?")
			}
		}
		////////////

		

		
		
		let finishedIterations = new Set();
		let timeOutCounter  = 0	

		BenchmarkManager.start(name)

		let toDoList = []	
		isFinished = await magic([], tempArea);

		async function magic(inputOrder, objects) {
			if (fastProcessAbortController) return
			totalIteration++ //For debugging	
				
			let mainInputs = objects.filter(obj => obj.ObjectName == "Input" && obj.FP_useable && obj.parentCode == null)
			let mainOutputs = objects.filter(obj => obj.ObjectName == "Output" && obj.FP_useable && obj.parentCode == null)

			if(showFP) {
				loadWorkingStation(objects)
			}
				
			if (timeOutCounter % 10 === 0 && giveProgress) await new Promise(r => setTimeout(r, 0));
			timeOutCounter++	

			// Helper function to decide which switch to change
			function findSwitch(arr, targetSwitch) {
				let counter = 0
				for(let i = 0; i < arr.length; i++) {
					if(arr[i].parentCode == null && arr[i].outputs.length != 0) {
						if(arr[i].type + counter > targetSwitch) {
							return {output: arr[i], switchNumber: (targetSwitch - counter)}
						} else {
							counter += arr[i].type
						}
					}  else {
						console.log("Hata 2")
					}
				}
				console.log("HATA")
				return null
			}

				

			// tempTruthTable is for calculating iteration later
			let tempTruthTable = ""
			
			let tempMemory = rewriteMemory(name, objects, mainInputs).slice();
			for(let m of tempMemory) {
				tempTruthTable = tempTruthTable.concat(m);
			}

			
			// The main processing happens here
			if(inputOrder.length > 0) {
				if(last(inputOrder) != "wait") {		
					let switchValues = findSwitch(mainOutputs, last(inputOrder))
					switchValues.output.lit[switchValues.switchNumber] = !switchValues.output.lit[switchValues.switchNumber];
				}
			}
			
			stabilizeArea(objects)
			///////////////


			for(let o of mainOutputs) {
				for(let t = 0; t < o.type; t++) {
					tempTruthTable = tempTruthTable.concat(+o.lit[t]);
				}
			}

					
			let iteration = parseInt(tempTruthTable, 2);
			if(!finishedIterations.has(iteration)) {
				//For the first iteration other than useless
				finishedIterations.add(iteration);
			}

			
			let postTempTruthTable = tempTruthTable.slice();	
			let postMemory = rewriteMemory(name, objects, mainInputs).slice();

			for(let m = 0; m < postMemory.length; m++) {
				postTempTruthTable = setCharAt(postTempTruthTable, m, postMemory[m]);
			}
		
			//Writes gates Output lit values and also memory to tempValues 
			if(!gateInfos[name]?.isLooping) {
				let counter = 0
				for(let i of mainInputs) {
					for(let t = 0; t < i.type; t++) {
						tempValues[oneTruthTableLength*iteration + tempTruthTable.length + counter] = +i.lit[t];
						counter++
					}
				}
				for(let m = 0; m < tempMemory.length; m++) {		
					tempValues[oneTruthTableLength*iteration + tempTruthTable.length + useableOutputLength + m] = postMemory[m];
				}
			} else {
				for(let m = 0; m < tempMemory.length; m++) {
					tempValues[oneTruthTableLength*iteration + tempTruthTable.length + m] = postMemory[m];
				}
			}

			//await awaitSpacePress()

			// Recursion starts here 
			let counter = 0		
			for(let o = 0; o < mainOutputs.length; o++) {
				for(let t = 0; t < mainOutputs[o].type; t++) {
					let changedTruthTable = setCharAt(postTempTruthTable, tempMemory.length + counter, +!+postTempTruthTable[tempMemory.length + counter]);
					if(!finishedIterations.has(parseInt(changedTruthTable, 2))) {
						finishedIterations.add(parseInt(changedTruthTable, 2))
						let newInputOrder = inputOrder.slice();
						newInputOrder.push(counter);
						toDoList.push([newInputOrder, clone_Objects(objects)])
					}
					counter++
				}
			}
 			if(!finishedIterations.has(parseInt(postTempTruthTable, 2))) {
				finishedIterations.add(parseInt(postTempTruthTable, 2))
 				let newInputOrder = inputOrder.slice();
				newInputOrder.push("wait");
				toDoList.push([newInputOrder, clone_Objects(objects)])
 			}
			
			while(toDoList.length > 0) {
				if (fastProcessAbortController) return
				let tempArr = toDoList.shift()
				await magic(tempArr[0], tempArr[1], tempArr[2])
			}
			return true
		}

		//Debug
		if(0) {
			let questionMark = 0
			for(let t = 0; t < tempValues.length; t++) {
				if(tempValues[t] == "?") {
					questionMark++
				}
			}
			console.log("Useless--> %", Math.floor((questionMark/tempValues.length)*100))
		}	
	}
	//////////////////////////////////



	////////////////////////////////////Finishes the FastProcess//////////////////////////////////////
	if(isFinished && !fastProcessAbortController) {
		currentFastProcess = null
		if(showFP) loadWorkingStation(savedWS)
		if(0 && gateInfos[name].isMemoryHolder) console.log(totalIteration)
		//Log: 8, 14, 24, 2704 // D LATCH, D FLIP-FLOP, 1 BIT REGISTER, 4 BIT REGISTER
		BenchmarkManager.stop(name)

		gateInfos[name].isFastProcessed = true
		fastProcessInfos[name] = {}
		fastProcessInfos[name].values = tempValues;
		fastProcessedGates.push(name);

		// If a gate has this name, then deletes its visualObjects from everywhere searching in savedGates
		let usedByNested = getUsedBy(name, [], [], true)

		for(let n of usedByNested) {
			let tempGates = gateInfos[n].savedGate.filter(obj=> obj.ObjectName == "Gate") 
			deleteVisualObjects(name, tempGates)
		}

		//For page changing
		for(let areas of workingAreas) {
			let tempGates = areas.filter(obj=> obj.ObjectName == "Gate")
			deleteVisualObjects(name, tempGates)
		}

		deleteVisualObjects(name, gates) // For current area

		function deleteVisualObjects(name, tempGates) {
			for(let obj of tempGates) {
				if(obj.name == name) {
					if(gateInfos[name].isMemoryHolder) {
						obj.memory = getCurrentMemory(obj)
					}
					obj.visualObjects = []
				}		
			}
			for(let obj of tempGates) {
				if(include(usedByNested, obj.name)) {
					deleteVisualObjects(name, obj.visualObjects.filter(obj=> obj.ObjectName == "Gate"))
				}		
			}

			//Gets the area's memory
			function getCurrentMemory(gate) {
				//console.log(gate, gate.visualObjects.length)
				let areaMemory = [];
				let objects = gate.visualObjects;
				let mainInputs = objects.filter(obj => obj.ObjectName == "Input" && obj.parentCode == null)
				if(gateInfos[gate.name].isLooping) {
					for(let i of mainInputs) {
						for(let t = 0; t < i.type; t++) {
							areaMemory.push(+i.lit[t]);
						}
					}
				}
			
				for(let obj of objects) {
					if(obj.ObjectName == "Gate" && gateInfos[obj.name].isMemoryHolder) {
						for(let m of obj.memory) {
							areaMemory.push(m);					
						}
					}
				}

				return areaMemory;
			}
			//
		}
			
		
		
	} else if(fastProcessAbortController) {
		console.log("FastProcess Aborted: " + name)
		currentFastProcess = null
		if(showFP) loadWorkingStation(savedWS)
		BenchmarkManager.stop(name, false)
		fastProcessAbortController = false
	}
}

function abortFastProcess(name) {
	let didSomething = false
	if(include(fastProcessQueue, name)) {
		Splice(fastProcessQueue, name)
		didSomething = true
	}
	if(currentFastProcess == name) {
		fastProcessAbortController = true;
		didSomething = true
	}

	if(!didSomething) console.log("There is no Fast Process with this name: " + name)
}

function awaitSpacePress() {
	return new Promise(resolve => {
		function onKey(e) {
			if (e.code === "Space") {
				window.removeEventListener("keydown", onKey);
				resolve();
			}
		}
		window.addEventListener("keydown", onKey);
	});
}

function getTruthTableLength(name, infos = gateInfos[name]) {
	//console.log(name, infos)
	let useableInputLength = infos.useableIO[0]
	let useableOutputLength = infos.useableIO[1]
	let memoryLength = infos.isMemoryHolder ? getInitialMemoryLength(name, infos) : 0

	let oneTruthTableLength;
	let inputTruthTableLength = useableInputLength +memoryLength
	let outputTruthTableLength;

	if(infos.isLooping)  {
		oneTruthTableLength = useableInputLength + memoryLength * 2; //Actually this one longer --> Memory Input -> Memory (Memory includes output here)
		outputTruthTableLength = memoryLength
	}

	if(!infos.isLooping) {
		oneTruthTableLength = useableInputLength + useableOutputLength + memoryLength * 2; // Actually this one shorter --> Memory Input -> Memory Output (Memory does not include output here)
		outputTruthTableLength = memoryLength + useableOutputLength;
	}
	
	//Safety check: Checks for inputTruthTableLength + outputTruthTableLength == oneTruthTableLength
	if(oneTruthTableLength != outputTruthTableLength + inputTruthTableLength) {
		console.log(oneTruthTableLength == outputTruthTableLength + inputTruthTableLength, name)
		console.log("Bir şey çok kötü gitti!")
	}

	
	return [inputTruthTableLength, outputTruthTableLength, oneTruthTableLength]
}

// ---- Global Benchmark Manager ----
const BenchmarkManager = {
    sessions: {},

    start(name) {
        this.sessions[name] = performance.now();
    },

    stop(name, doesLog = true) {
        if (!(name in this.sessions)) {
            console.warn(`Benchmark "${name}" başlatılmadı!`);
            return null;
        }
        const elapsed = performance.now() - this.sessions[name];
        if(doesLog) console.log(`${name} : ${elapsed.toFixed(2)} ms`);
        delete this.sessions[name];
        return elapsed;
    }
};

function getInitialMemoryLength(name, infos = gateInfos[name]) {
	let tempLength = 0
	let tempArea = infos.savedGate
	if(infos.isLooping) {
		for(let obj of tempArea) {
			if(obj.ObjectName == "Input" && obj.parentCode == null && obj.FP_useable) {		
				tempLength += obj.type
			}			
		}
	}

	for(let g of tempArea.filter(obj => obj.ObjectName == "Gate")) {
		if(gateInfos[g.name].isMemoryHolder) tempLength += gateInfos[g.name].initialMemory.length
	}

	return tempLength
}

function createInitialMemory(name) {
	console.log(name)
	let myInputs = []
	let myOutputs = []
	let tempGate = new Gate(0, 0, name, [myInputs, myOutputs])
	let myObjects = startFastConnecting(tempGate, true, true, true, myOutputs, myInputs ,false);
	myInputs = myObjects["inputs"].concat(myInputs)
	myOutputs = myObjects["outputs"].concat(myOutputs)
	let myCables = myObjects["cables"]


	/// !!! burayı da calcfastProcess'teki gibi yapabilirisn işte gateInfos dan working area yı alıp onu direkt işlemek ondan sonra da startFastConnecting kısmı gereksiz kalıyor onun büyük bir kısmını silebilirisn! 
	for(let c of myCables) {
		c.transfer(myOutputs, myInputs, myCables);
	}

	tempGate.process(myOutputs, myInputs);

	let tempMemory = [];
	if(gateInfos[name].isLooping) {
		for(let o of tempGate.outputs) {
			let tempOutput = decode(myOutputs, o)
			if(tempOutput.FP_useable) {
				for(let t = 0; t < tempOutput.type; t++) {
					tempMemory.push(+tempOutput.lit[t]);
				}
			}				
		}
	}

	getSubMemories(tempGate)
	function getSubMemories(gate) {
		for(let v of gate.visualObjects) {
			if(v.ObjectName == "Gate") {
				if(gateInfos[v.name].isMemoryHolder) {
					for(let m of v.memory) {
						tempMemory.push(m);
					}
				} else if(v.visualObjects.length > 0) {
					getSubMemories(v);
				}
			}
		}
	}
	
	
	gateInfos[name].initialMemory = tempMemory;
}

function getDefaultGateString() {
	console.log(JSON.stringify(getWorkingArea(true)))
}

function hsbToHex(h, s, b) {

    let k = (n) => (n + h / 60) % 6;
    let f = (n) => b - b * s * Math.max(Math.min(k(n), 4 - k(n), 1), 0);

    let r = Math.round(f(5) * 255);
    let g = Math.round(f(3) * 255);
    let bl = Math.round(f(1) * 255);

    return "#" + [r, g, bl]
        .map(x => x.toString(16).padStart(2, "0"))
        .join("");
}
function normalizeHex(val) {
    if (!val) return "#000000";

    // Başında # yoksa ekle
    if (val[0] !== "#") {
        val = "#" + val;
    }

    // # işareti hariç kalan kısmı al
    let hex = val.slice(1);

    // 3 haneli hex (#abc) → #aabbcc
    // if (hex.length === 3) {
	// 	hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	// }

    // Eksikse 0 ile doldur (#12 → #120000)
    if (hex.length < 6) {
        hex = hex.padEnd(6, "0");
    }

    // Fazlaysa kes (#12345678 → #123456)
    if (hex.length > 6) {
        hex = hex.slice(0, 6);
    }

    return "#" + hex;
}

function hexToHsb(hex) {
    // Normalize ve # kaldır
    hex = normalizeHex(hex).replace(/^#/, "");

    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }

    // R, G, B değerlerini 0–1 aralığında al
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let delta = max - min;

    let h = 0, s = 0, v = max;

    // Hue hesaplama
    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }

    // Saturation (0–1)
    s = max === 0 ? 0 : delta / max;

    // Brightness zaten max
    v = max;

    // HSB olarak döndür (s ve b 0–1 float)
    return { h: h, s: s, b: v };
}


function rgbaToHSB(rgbaStr) {
    // rgba(r,g,b,a) formatından değerleri ayıkla
    const match = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return null;

    let r = parseInt(match[1], 10);
    let g = parseInt(match[2], 10);
    let b = parseInt(match[3], 10);
    let a = match[4] !== undefined ? parseFloat(match[4]) : 1;

    // Normalize et (0-1 aralığına)
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    // Hue hesapla
    let h = 0;
    if (delta !== 0) {
        if (max === r) {
            h = ((g - b) / delta) % 6;
        } else if (max === g) {
            h = (b - r) / delta + 2;
        } else {
            h = (r - g) / delta + 4;
        }
        h *= 60;
        if (h < 0) h += 360;
    }

    // Saturation (0–255 ölçeğine çevir)
    let s = max === 0 ? 0 : (delta / max);

    // Brightness (0–255)
    let v = max ;

    return { h, s, b: v, a };
}

function rewriteDefaultGates(arr) {
	for(let i = 0; i < arr.length; i++) {
		if(arr[i].ObjectName == "Gate") {
			applyPrototype(arr[i])
			if(arr[i].visualObjects.length > 0) {
				rewriteDefaultGates(arr[i].visualObjects);
			}
		}
		applyPrototype(arr[i])
	}

	for(let i = 0; i < arr.length; i++) {
		fixTheObject(arr[i], arr)
	}

	rewriteUsedCodes()
}

function applyPrototype(obj) {
    switch(obj.ObjectName) {
        case "Gate":    Object.setPrototypeOf(obj, Gate.prototype); break;
        case "Input":   Object.setPrototypeOf(obj, Input.prototype); break;
        case "Output":  Object.setPrototypeOf(obj, Output.prototype); break;
        case "Cable":   Object.setPrototypeOf(obj, Cable.prototype); break;
        case "Display": Object.setPrototypeOf(obj, Display.prototype); break;
        case "Bus":     Object.setPrototypeOf(obj, Bus.prototype); break;
    }
}


function defaultScreenChanger() {
	for(let h of highlightedObjects) {
		h.highlight = false
		h.moving = false
	}
	highlightedObjects = [];
	cancelObjectCreating()
}

function cancelObjectCreating() {
	mouseOccupation = "nothing"
	highlightedObjects = [];
	spaceBetweenGatesWhenCreating = 30;
	for(let Obj = creatingObjects.length -1; Obj >= 0; Obj --) {
		let obj = creatingObjects[Obj]
		obj.delete();
		if(obj.ObjectName == "Bus") {Obj--}
	}
	creatingObjects = []
	creatingObjectType = null;
}

function fixTheObject(obj, arr) {
	let tempObject 
	obj.highlight = false
	if(obj.ObjectName == "Gate") {
		//console.log(obj)
		tempObject = new Gate(obj.x, obj.y, obj.name)
		obj.numberOfIO = gateInfos[obj.name].gateIO
		obj.nameColor = tempObject.nameColor
		obj.nameOrder = tempObject.nameOrder
		obj.displays = []
		if(obj.name == "D LATCH") {
			obj.memory = [0]
		}
		if(obj.name == "D FLIP-FLOP") {
			obj.memory = [0, 0]
		}
		if(obj.name == "1 BIT REGISTER") {
			obj.memory = [0, 0, 0]
		}
		obj.width = tempObject.width
		obj.height = tempObject.height
		obj.hitbox = tempObject.hitbox

		for(let i = 0; i < tempObject.inputs.length; i++) {
			let tempInput = decode(inputs, tempObject.inputs[i])
			let objInput = decode(arr, obj.inputs[i])
			objInput.x = tempInput.x
			objInput.y = tempInput.y
			objInput.updateAllPoints()
		}

		for(let i = 0; i < tempObject.outputs.length; i++) {
			let tempOutput = decode(outputs, tempObject.outputs[i])
			let objOutput = decode(arr, obj.outputs[i])
			objOutput.x = tempOutput.x
			objOutput.y = tempOutput.y
			objOutput.updateAllPoints()
		}

		obj.nameOrder = tempObject.nameOrder
		obj.nameMode = "Middle"
		obj.useableIO = [Array(obj.inputs.length).fill(true),[Array(obj.outputs.length).fill(true)]]
	}
	if(obj.ObjectName == "Display") {
		tempObject = new Display(obj.x, obj.y)
		if(obj.name == undefined) obj.name = "7 SEGMENT"
		obj.hitbox = tempObject.hitbox
	}
	if(obj.ObjectName == "Input") {
		tempObject = new Input(obj.x, obj.y, obj.parentCode, obj.type)
		
		obj.cableConnectionPoint = {...tempObject.cableConnectionPoint};		
		obj.switchPoints = {...tempObject.switchPoints};
		obj.moveablePart = {...tempObject.moveablePart};

		if(obj.type == undefined) obj.type = 1
		
		if(!(obj.lit instanceof Array)) {
			obj.lit = [obj.lit]
		}
		if(obj.basePower == undefined) {
			obj.basePower = tempObject.basePower.slice()
		} else {
			if(!(obj.basePower instanceof Array)) {
				obj.basePower = [obj.basePower]
			}
		}
		
		if(!(obj.isPowered instanceof Array)) {
			obj.isPowered = [obj.isPowered]
		}
		obj.FP_useable = true
		obj.colorMode = "red"
		if(obj.tag == undefined) obj.tag = obj.parentCode == null ? "OUT" : "IN"
		obj.hitbox = tempObject.hitbox
	}
	if(obj.ObjectName == "Output") {
		tempObject = new Output(obj.x, obj.y, obj.parentCode, obj.type)
		obj.cableConnectionPoint = {...tempObject.cableConnectionPoint};
		obj.switchPoints = {...tempObject.switchPoints};
		obj.moveablePart = {...tempObject.moveablePart};

		if(obj.type == undefined) obj.type = 1
		
		if(!(obj.lit instanceof Array)) {
			obj.lit = [obj.lit]
		}
		if(obj.basePower == undefined) {
			obj.basePower = tempObject.basePower.slice()
		} else {
			if(!(obj.basePower instanceof Array)) {
				obj.basePower = [obj.basePower]
			}
		}
		if(!(obj.isPowered instanceof Array)) {
			obj.isPowered = [obj.isPowered]
		}
		obj.FP_useable = true
		obj.colorMode = "red"
		if(obj.tag == undefined) obj.tag = obj.parentCode == null ? "IN" : "OUT"
		obj.hitbox = tempObject.hitbox
	}
	if(obj.ObjectName == "Cable") {
		tempObject = new Cable(obj.x1, obj.y1,obj.x2, obj.y2, null,null, obj.type)
		if(obj.type == undefined) obj.type = 1
		if(!(obj.basePower instanceof Array)) {
			if(obj.basePower == undefined) {
				obj.basePower = Array(obj.type).fill(false)
			} else {
				obj.basePower = [obj.basePower]
			}	
		}
		if(!(obj.isPowered instanceof Array)) {
			if(obj.isPowered == undefined) {
				obj.isPowered = Array(obj.type).fill(false)
			} else {
				obj.isPowered = [obj.isPowered]
			}
		}
		if(obj.createdFrom == undefined) {
			obj.createdFrom = "output"
		}
		if(obj.connectionPoints == undefined) obj.connectionPoints = []
		if(obj.connectionPoints.length == 0) {
			obj.connectionPoints.push([obj.x1, obj.y1], [obj.x2, obj.y2])  
		}

		let tempInput = decode(arr, obj.inputCode)
		let tempOutput = decode(arr, obj.outputCode)
		if(obj.connectionTypes == undefined) {
			
			obj.connectionPoints[0][0] = tempInput.cableConnectionPoint.x
			obj.connectionPoints[0][1] = tempInput.cableConnectionPoint.y
			last(obj.connectionPoints)[0] = tempOutput.cableConnectionPoint.x
			last(obj.connectionPoints)[1] = tempOutput.cableConnectionPoint.y
		}
		

		if(obj.connectionTypes == undefined) {
			obj.connectionTypes = {start: {ObjectName: null, isBus: null}, end: {ObjectName: null, isBus: null}}
			obj.connectionTypes.start.ObjectName = tempInput.ObjectName
			obj.connectionTypes.end.ObjectName = tempOutput.ObjectName
			obj.connectionTypes.start.isBus = false
			obj.connectionTypes.end.isBus = false
		}
		if(obj.childs == undefined) {
			obj.childs = []
			obj.childAnchors = []
		}
		

		obj.updatePoints();
	}
	tempObject.delete();
	
}

// function findIO(gate, visualGate, IsInput, IsOutput) { /// ??? silienbilir
// 	let gateCode = visualGate.code;
// 	let tempArray = [];

// 	for(let v of gate.visualObjects) {
// 		if(IsInput) {
// 			if(v.ObjectName == "Input" && v.parentCode == gateCode) {
// 				tempArray.push(v);
// 			}
// 		}
// 		if(IsOutput) {
// 			if(v.ObjectName == "Output" && v.parentCode == gateCode) {
// 				tempArray.push(v);
// 			}
// 		}
// 	}
// 	return tempArray;
// }



function clone_Objects(arr, doesChangeCodes = true) {
	let newArray = [];
	for(let i = 0; i < arr.length; i++) {
		newArray.push(cloneClass(arr[i]));
	}

	if(doesChangeCodes) {
		reconnectCodes(newArray);
	}
	return newArray;
}

function cloneClass(object) {
	let newObject = null;

	if(object instanceof Gate) newObject = new Gate();
	if(object instanceof Input) newObject = new Input();
	if(object instanceof Output) newObject = new Output();
	if(object instanceof Cable) newObject = new Cable();
	if(object instanceof Display) newObject = new Display();
	if(object instanceof Bus) newObject = new Bus();

	for (let key of Object.keys(object)) {
		let value = object[key];

		if (value == null) {
			newObject[key] = value;
		}
		else if (Array.isArray(value)) {
			newObject[key] = cloneArray(value);
		} 
		else if (value.constructor === Object) {
			newObject[key] = cloneObjectLiteral(value);
		}
		else if (isClassInstance(value)) {
			console.log(key, value)
			newObject[key] = cloneClass(value);
		}
		else {
			newObject[key] = value;
		}
	}

	return newObject;
}


function cloneAnyObject(obj) {

    // 1 — null veya primitive (string, number, boolean, undefined)
    if (obj === null || typeof obj !== "object") {
        return obj; 
    }

    // 2 — Array
    if (Array.isArray(obj)) {
        return cloneArray(obj);
    }

    // 3 — Class instance (Gate, Input vs)
    if (isClassInstance(obj)) {
        return cloneClass(obj);
    }

    // 4 — Plain object literal
    if (obj.constructor === Object) {
        return cloneObjectLiteral(obj);
    }

    // 5 — Tanımsız başka constructor (ör: Date, Map vs) varsa:
    console.warn("cloneAnyObject: desteklenmeyen obje türü:", obj);
    return obj; // en azından çökmemesi için
}


function cloneObjectLiteral(obj) {
    const newObj = {};

    for (const key of Object.keys(obj)) {
        const value = obj[key];

        if (value === null || typeof value !== "object") {
            newObj[key] = value;
        }
        else if (Array.isArray(value)) {
            newObj[key] = cloneArray(value);
        }
        else if (isClassInstance(value)) {
            newObj[key] = cloneClass(value);
        }
        else {
            newObj[key] = cloneObjectLiteral(value);
        }
    }

    return newObj;
}

function isClassInstance(value) {
    return (
        typeof value === "object" &&        // string vs engellenir
        value !== null &&                  // null engellenir
        !Array.isArray(value) &&           // array engellenir
        value.constructor !== Object       // plain object engellenir
    );
}

function cloneArray(object) {
	const newObject = [];

	for (let i = 0; i < object.length; i++) {
		let value = object[i];

		if (value === null || typeof value !== "object") {
			newObject.push(value);
		}
		else if (Array.isArray(value)) {
			newObject.push(cloneArray(value));
		}
		else if (value.constructor === Object) {
			newObject.push(cloneObjectLiteral(value));
		}
		else {
			newObject.push(cloneClass(value));
		}
	}

	if (object.length > 0 && isClassInstance(object[0])) {
		reconnectCodes(newObject);
	}

	return newObject;
}
/// Cloning End


function reconnectCodes(arr) {
	// Finds every code in an object and replaces all codes with a new one after cloning
	
	let objectsCodes = [];
	let newObjectsCodes = [];

	// Finding
	for(let i = 0; i < arr.length; i++) {
		if(arr[i].code != null) {
			if(!include(objectsCodes, arr[i].code)) {
				objectsCodes.push(arr[i].code);
				let newCode = generateCode();
				newObjectsCodes.push(newCode);
			} 
		}
	}	

	if(0) {
		console.log("--------------") 
		for(let i = 0; i < objectsCodes.length; i++) {
			console.log(objectsCodes[i] +" --> " + newObjectsCodes[i])
		}
		console.log("--------------")
	}

	// Replacing

	for(let a = 0; a < arr.length; a++) {
		let object = arr[a];

		// Every object has its code
		

		object.code = changeCode(object.code)

		// Every object has its special codes
		if(object instanceof Gate) {
			for(let o = 0; o < object.outputs.length; o++) {
				object.outputs[o] = changeCode(object.outputs[o]);
			}

			for(let i = 0; i < object.inputs.length; i++) {
				object.inputs[i] = changeCode(object.inputs[i]);
			}

			for(let i = 0; i < object.displays.length; i++) {
				object.displays[i] = changeCode(object.displays[i]);
			}
		}

		if(object instanceof Display) {
			for(let o = 0; o < object.outputs.length; o++) {
				object.outputs[o] = changeCode(object.outputs[o]);
			}

			for(let i = 0; i < object.inputs.length; i++) {
				object.inputs[i] = changeCode(object.inputs[i]);
			}

			if(object.parentCode != null) {
				object.parentCode = changeCode(object.parentCode);
			}
		}

		if(object instanceof Bus) {
			for(let o = 0; o < object.outputs.length; o++) {
				object.outputs[o] = changeCode(object.outputs[o]);
			}

			for(let i = 0; i < object.inputs.length; i++) {
				object.inputs[i] = changeCode(object.inputs[i]);
			}

			object.pairCode = changeCode(object.pairCode)
		}

		if(object instanceof Input) {	
			if(object.parentCode != null) {
				object.parentCode = changeCode(object.parentCode);
			}

			for(let i = 0; i < object.inputs.length; i++) {
				object.inputs[i] = changeCode(object.inputs[i]);
			}

		}

		if(object instanceof Output) {
			if(object.parentCode != null) {
				object.parentCode = changeCode(object.parentCode);
			}

			for(let o = 0; o < object.outputs.length; o++) {
				object.outputs[o] = changeCode(object.outputs[o]);
			}
		}

		if(object instanceof Cable) {
			object.inputCode = changeCode(object.inputCode);
			object.outputCode = changeCode(object.outputCode);
			for(let i = 0; i < object.childs.length; i++) {
				object.childs[i] = changeCode(object.childs[i]);
			}
		}
	}

	function changeCode(code) {
		if(newObjectsCodes[findIndex(objectsCodes, code)] == null) return "HATALI KOD"
		return newObjectsCodes[findIndex(objectsCodes, code)];
	}

	rewriteUsedCodes();

}

function drawBackground() {
	// Background
	c.beginPath();
	c.lineWidth = 0;
	c.fillStyle = "rgba(66, 66, 68, 1)";
	c.rect(0,0,canvas.width,canvas.height);
	c.fill();
	c.closePath();


	//Draws the Grid
	drawGrid()

	// Building Area
	c.beginPath();
	c.lineWidth = 5;
	c.strokeStyle = "rgba(110,110,110,1)";
	let offsetX = 50
	let offsetY = 20
	c.rect(offsetX, offsetY, canvas.width - offsetX*2, canvas.height - offsetY*2 - 70)
	c.stroke();
	c.closePath();

	
}


function drawGrid() {
	if(getPreference("ShowGrid") == "On" || (mouseOccupation == "cableCreating" && controlKeyActive)) {
		
		//
		let multiplier = 1
		if(between(camera.scale, 0.20, 0.55)) {
			multiplier = 5
		} else if(between(camera.scale, 0.1, 0.19)) {
			multiplier = 10
		}
		
		const scaledSpacing = gridInfos.spacing * camera.scale;
		const drawSpacing = scaledSpacing * multiplier;

		gridInfos.x = (-camera.x * camera.scale) % scaledSpacing;
		gridInfos.y = (-camera.y * camera.scale) % scaledSpacing;

		let offsetX = (-camera.x * camera.scale) % drawSpacing;
		let offsetY = (-camera.y * camera.scale) % drawSpacing;	
		//
		
		//
		c.strokeStyle = "rgba(49, 49, 49, 1)";
		if(screen == 7) {
			c.strokeStyle = "rgba(20, 20, 20, 0.4)";
		}
		c.lineWidth = 1 * multiplier * camera.scale;
		//

		for (let x = offsetX; x < canvas.width; x += drawSpacing) {
			c.beginPath();
			c.moveTo(x, 0);
			c.lineTo(x, canvas.height);
			c.stroke();
		}

		for (let y = offsetY; y < canvas.height; y += drawSpacing) {
			c.beginPath();
			c.moveTo(0, y);
			c.lineTo(canvas.width, y);
			c.stroke();
		}
	}
}

function getDefaultMove() {
	let worldStart = screenToWorld(mouseStartX, mouseStartY);
	let addX = mouseX - worldStart.x
	let addY = mouseY - worldStart.y	
	return {x: addX, y: addY}
}

function getPreference(option) {
	let myPreference = preferences[option]
	return myPreference.arr[myPreference.currentIndex]
}


function include(arr, n) {
	for(let i = 0; i < arr.length; i++) {
		if(arr[i] == n) {
			return true
		}
	}
	return false
}

function between(n, lowerBound, upperBound) {
	return (n >= lowerBound && n <= upperBound);
}

function dist(x1,y1,x2,y2) {
	return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

function last(arr) {
	return arr[arr.length - 1];
}


function findIndex(arr, n) {
	for(let i = arr.length - 1; i >= 0; i--) {
		if(arr[i] == n) {
			return i; 
		}
	}
	return null;
}

function setCharAt(str, index, chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function equals(arr1, arr2) {
	if(arr1.length != arr2.length) {
		return false
	}

	for(let i = 0; i < arr1.length; i++) {
		if(arr1[i] != arr2[i]) {
			return false;
		}
	}

	return true;
}

function generateCode() {
	let codeChars = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","r","s","t","u","v","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","R","S","T","U","V","Y","Z","1","2","3","4","5","6","7","8","9","0"];
	return createCode();
	function createCode() {
		let tempCode = "";
		for(let i = 0; i < 10; i++) {
			let randomChar = codeChars[Math.floor(Math.random()*codeChars.length)];
			tempCode += randomChar;
		}
		if(!include(usedCodes, tempCode)) {
			usedCodes.push(tempCode)
			return tempCode;
		} else {
			console.log("Bu kod daha önce kullanıldı! Çok düşük bir ihtimal")
			return createCode();
		}
	}
}

function decode(arr, code, message = true) {
	// Returns the owner of the code by searching every element of given array
	for(let L = 0; L < arr.length; L++) {
		if(arr[L].code == code) {
			return arr[L];
		} 
	}
	if(message) {
		console.trace()
		console.log(`"${code}" adlı kod bulunamadı!`, arr);
	}
}

function rewriteUsedCodes() {
	// When the code deletes something such as a cable or a gate, splice from "usedCodes" array
	let newUsedCodes = [];
	let codeHolders = [gates,inputs,outputs,cables,displays, busses];
	for(let L = 0; L < codeHolders.length; L++) {
		let currentArray = codeHolders[L];
		for(let i = 0; i < currentArray.length; i++) {
			newUsedCodes.push(currentArray[i].code);
		}
		if(currentArray == gates) {
			for(let i = 0; i < gates.length; i++) {
				for(let v = 0; v < gates[i].visualObjects.length; v++) {
					newUsedCodes.push(gates[i].visualObjects[v].code);
				}
			}
		}
	}
	for(let i = 0; i < gateNames.length; i++) {
		for(let j = 0; j < gateInfos[gateNames[i]].savedGate; j++) {
			newUsedCodes.push(gateInfos[gateNames[i]].savedGate[j].code);
		}
	}
	usedCodes = newUsedCodes;
}


const fastConnectValues = {inputOffsetX: -200, outputOffsetX: 200, inputSpace: 50, outputSpace: 50}
function startFastConnecting(g, doesConnectInput, doesConnectOutput, isCreatePut = false, arrOutput = outputs, arrInput = inputs) {
	let inputCount = inputs.filter(i => i.parentCode == null).length
	let outputCount = outputs.filter(o => o.parentCode == null).length

	if(isCreatePut) {
		let createdObjects = {"outputs": [], "inputs" : [], "cables": []}
		if(doesConnectInput)  {
			let tempY = g.y + g.height/2 - (gateInfos[g.name].useableIO[0] - 1) * (55 + fastConnectValues.outputSpace)/2
			for(let i = 0; i < g.numberOfIO[0].length; i++) {
				let tempInput = decode(arrInput, g.inputs[i]);
				if(tempInput.FP_useable) {
					let tempOutput= new Output(g.x + fastConnectValues.inputOffsetX, tempY, null, g.numberOfIO[0][i])
					createdObjects["outputs"].push(tempOutput)
					createdObjects["cables"].push(Cable.fastConnect(tempOutput, tempInput, tempOutput.type, false));
				}
				tempY += (55 + fastConnectValues.outputSpace)
			}
		}
		if(doesConnectOutput)  {
			let tempY = g.y + g.height/2 - (gateInfos[g.name].useableIO[1] - 1) * (55 + fastConnectValues.inputSpace)/2
			for(let i = 0; i < g.numberOfIO[1].length; i++) {
				let tempOutput = decode(arrOutput, g.outputs[i]);
				if(tempOutput.FP_useable) {
					let tempInput = new Input(g.x + g.width + fastConnectValues.outputOffsetX, tempY, null, g.numberOfIO[1][i])	
					createdObjects["inputs"].push(tempInput)
					createdObjects["cables"].push(Cable.fastConnect(tempOutput, tempInput, tempOutput.type, false));
				}
				tempY += (55 + fastConnectValues.inputSpace)
			} 
		}
		return createdObjects
	} else {
		
		if(doesConnectInput)  {
			for(let i = 0; i < g.numberOfIO[0].length; i++) {		
				if(outputCount >= i + 1) {
					let tempInput = decode(inputs, g.inputs[i]);				
					if(tempInput.inputs.length == 0) {
						let tempOutput;
						for(let o = 0; o < outputs.length; o++) {
							if( outputs[o].parentCode == null  && outputs[o].type == tempInput.type) {
								if(outputs[o].outputs.length == 0) {
									tempOutput = outputs[o];
									break;
								}		
							}
						}
						
						let tempCable = Cable.fastConnect(tempOutput, tempInput, tempInput.type, false)
						if(tempCable != null) cables.push(tempCable);
					}
				}
			}
		}
		
		if(doesConnectOutput) {
			for(let o = 0; o < g.numberOfIO[1].length; o++) {
				if(inputCount >= o + 1) {
					let tempOutput = decode(outputs, g.outputs[o]);
					let tempInput;
					for(let i = 0; i < inputs.length; i++) {
						if(inputs[i].parentCode == null && inputs[i].type == tempOutput.type) {
							if(inputs[i].inputs.length == 0) {
								tempInput = inputs[i];
								break;
							}
						}
					}

					if(tempInput != null) {
						let tempCable = Cable.fastConnect(tempOutput, tempInput, tempInput.type, false)
						if(tempCable != null) cables.push(tempCable);
					}
				}
			}
		}
	}
}

function createDefaultPuts() {
	// Draws default outputs (the left hand side)
	let offset = 80
	for (let i = 0; i < defaultOutputCount; i++) {
    	let tempY = (((canvas.height - 80) - ((defaultOutputCount - 1) * offset)) / 2) + i * offset;
    	outputs.push(new Output(50, tempY, null, 1));
  	}

  	// Draws default inputs (the right hand side)
	for (let i = 0; i < defaultInputCount; i++) {
    	let tempY = (((canvas.height - 80) - ((defaultInputCount - 1) * offset)) / 2) + i * offset;
    	inputs.push(new Input(canvas.width - 50, tempY, null, 1));
  	}
}

function createDefaultButtons() {
	if(buttons.length == 0) buttons.push(new Button(spaceBetweenEveryButton, gateCreatingAreaMetrics.y + spaceBetweenEveryButton, "MENU", "menuButton", () => menuFunction()))
	
	let sum = 0
	for(let i = 0; i < starredButtons.length; i++) {
		let tempX = buttons[0].width + 2*spaceBetweenEveryButton + sum + i * spaceBetweenEveryButton;
		let name = starredButtons[i]
		if(include(objectCreatingButtonWithChildNames, name)) {
			buttons.push(new Button(tempX, gateCreatingAreaMetrics.y + spaceBetweenEveryButton, name, "objectCreatingButtonWithChild", ()=>{createChildObjectCreatingButtons(name)}))
		} else {
			buttons.push(new Button(tempX, gateCreatingAreaMetrics.y + spaceBetweenEveryButton, name, "gateButton", () => {spawnObject(name)}))
		}
		
		
		sum = 0
		for(let j = 1; j < buttons.length; j++) {
			if(buttons[j].style == "objectCreatingButtonWithChild" || buttons[j].style == "gateButton") {
				sum += buttons[j].width;
			}		
		}
	}
}

function spawnObject(name, extraInfos = {}) {

	let objectType = "Gate"
	if(include(displayNames, name)) {
		objectType = "Display"
	} else {
		if(name == "IN-1" || name == "IN-4" || name == "IN-8") {
			objectType = "Output"
		}
		if(name == "OUT-1" || name == "OUT-4" || name == "OUT-8") {
			objectType = "Input"
		}
		if(name == "BUS-1" || name == "BUS-4" || name == "BUS-8") {
			objectType = "Bus"
		}
	}

	//console.log(name)

	let tempObject;
	for(let g of gates) {
		if(!g.moving) {
			g.highlight = false
			Splice(highlightedObjects, g)
		}			
	}
	for(let d of displays) {
		if(!d.moving) {
			d.highlight = false
			Splice(highlightedObjects, d)
		}			
	}
	for(let i of inputs) {
		if(!i.moving) {
			i.highlight = false
			Splice(highlightedObjects, i)
		}			
	}
	for(let o of outputs) {
		if(!o.moving) {
			o.highlight = false
			Splice(highlightedObjects, o)
		}			
	}
	for(let b of busses) {
		if(!b.moving) {
			b.highlight = false
			Splice(highlightedObjects, b)
		}			
	}

	if(objectType == "Display") {
		tempObject = new Display(mouseX,mouseY, name, false);
		displays.push(tempObject)
		mouseStartX = mouseScreenX 
		mouseStartY = mouseScreenY + ((highlightedObjects.length) * (spaceBetweenGatesWhenCreating + tempObject.height))* camera.scale;
	}
	

	if(objectType == "Gate") {
		tempObject = new Gate(mouseX,mouseY, name);
		gates.push(tempObject);
		mouseStartX = mouseScreenX
		mouseStartY = mouseScreenY + ((highlightedObjects.length) * (spaceBetweenGatesWhenCreating + tempObject.height))* camera.scale;	
	}

	if(objectType == "Bus") {
		let busDirection = 1
		if(extraInfos?.busDirection == -1) {
			busDirection = -1
		}

		let spaceBetweenBusses = 120/2
		tempObject = new Bus(mouseX + (-busDirection * spaceBetweenBusses), mouseY, parseInt(last(name)), busDirection);
		
		//Calculates the spacing
		let totalHeight = 0;
		for(let H = 0; H < highlightedObjects.length; H++) {
			let h = highlightedObjects[H]
			if(h.direction == -1) {
				totalHeight += spaceBetweenGatesWhenCreating + h.height
			}		
		}
		
		mouseStartX = mouseScreenX
		mouseStartY = mouseScreenY + totalHeight * camera.scale
		busses.push(tempObject);
		
		if(busDirection == -1) {
			Bus.connectPair();
		}
	}
	
	if(objectType == "Input") {
		mouseStartX = mouseScreenX
		tempObject = new Input(mouseX, mouseY, null, parseInt(last(name)))
		inputs.push(tempObject)
		mouseStartY = mouseScreenY + ((highlightedObjects.length) * (spaceBetweenGatesWhenCreating + tempObject.height))*camera.scale;
	}
	if(objectType == "Output") {
		mouseStartX = mouseScreenX	
		tempObject = new Output(mouseX, mouseY, null, parseInt(last(name)))
		outputs.push(tempObject);
		mouseStartY = mouseScreenY + ((highlightedObjects.length) * (spaceBetweenGatesWhenCreating + tempObject.height))*camera.scale;
	}

	
	
	mouseOccupation = "objectCreating"
	newClickedForObjectCreating = true;

	
	
	tempObject.highlight = true;
	highlightedObjects.push(tempObject)
	tempObject.moving = true;

	
	tempObject.move();
	mouseStartX = mouseScreenX;
	mouseStartY = mouseScreenY;

	creatingObjects = [];
	creatingObjectType = null;
	let objectsThatCreatedWithButtons = [gates,inputs,outputs,displays, busses]
	for(let obj of objectsThatCreatedWithButtons) {
		for(let i = 0; i < obj.length; i++) {
			if(obj[i].moving && ((obj != inputs && obj != outputs) || obj[i].parentCode == null)) {
				creatingObjects.push(obj[i])
				if(creatingObjectType == null) {
					creatingObjectType = obj;
				} else if(creatingObjectType != obj) {
					console.log("hata oldu birden fazla tipte obje yaratılıyor")
				}
			}
		}
	}

	if(extraInfos?.busDirection == null && objectType == "Bus") spawnObject(name, {busDirection: -1})
}

function Splice(arr, n) {
	for(let i = arr.length - 1; i >= 0; i--) {
		if(arr[i] ==  n) {
			arr.splice(i, 1)
		}
	}
}

function constrain(x, minimum, maximum) {
	return Math.min(Math.max(minimum, x), maximum)
}

function deleteContextMenus() {
	for(let i = contextMenus.length-1; i >= 0; i--) {				
		let cm = contextMenus[i]
		if(cm.buttonStyles != "childObjectCreatingButton") {
			// Can click only one time
			//contextMenus.splice(i, 1) ???
			contextMenus = []
			latestUsedObjectCreatingButtonWithChild = null;
			if(mouseOccupation != "cableEditting") mouseOccupation = "nothing"
			return true
		} else {
			// Can click multiple times
			let isOnButton = false
			if(shiftKeyActive) {
				for(let b of cm.buttons) {
					if(b.highlight == true) {
						isOnButton = true
					}
				}
			}		
			if(!isOnButton) {
				//contextMenus.splice(i, 1)
				contextMenus = []
				latestUsedObjectCreatingButtonWithChild = null;
				if(mouseOccupation == "contextSelecting") {		
					mouseOccupation = "nothing"
				}
				return true
			}
		}	
	}
	return false
}

function menuFunction() {
	let cm = new contextMenu(5, canvas.height - 275 - gateCreatingAreaMetrics.height, "", ["NEW CHIP", "SAVE CHIP","FIND CHIP", "LIBRARY", "PREFS", "QUIT"],[() => emptyWorkingArea(getConfirm()),() => handleSaveScreen(),()=>handleFindScreen(),() => handleLibraryScreen(),() => handleOptionScreen(),() => handleQuitScreen(getConfirm())], "subMenuButton", [])
	contextMenus.push(cm)
	let rightSideContexts = ["CTRL+N", "CTRL+S", "CTRL+F", "CTRL+L", "CTRL+P", "CTRL+Q"]
	for(let B = 0; B < cm.buttons.length; B++) {
		let b = cm.buttons[B]
		b.rightSideContext = rightSideContexts[B]
	}
	if(currentPage != -1) {
		cm.buttons[0].isActive = false
		cm.buttons[1].isActive = false
		cm.buttons[2].isActive = false
		cm.buttons[3].isActive = false
	}
}

function getConfirm() {
	if(currentPage != -1) isInSamePlace(latestSavedStation, workingAreas[0]) // aslında bu her zaman false yerecek istersen dene belki kaldırabilirisn
	return isInSamePlace(latestSavedStation, getWorkingArea(true))

	function isInSamePlace(arr1, arr2) {
		if(arr1.length != arr2.length) return false
		for(let a of arr1) {
			let isCodeFound = false
			for(let b of arr2) {
				if(a.code == b.code) {
					isCodeFound = true
					if(a.ObjectName == "Gate" && (a.x != b.x || a.y != b.y)) {
						console.log(a, b, " Gate")
						return false
					}
					if(a.ObjectName == "Display" && (a.x != b.x || a.y != b.y)) {
						console.log(a, b, " Display")
						return false
					}
					if(a.ObjectName == "Input" && (a.x != b.x || a.y != b.y)) {
						console.log(a, b, " Input")
						return false
					}
					if(a.ObjectName == "Output" && (a.x != b.x || a.y != b.y)) {
						console.log(a, b, " Output")
						return false
					}
					if(a.ObjectName == "Cable") {
						if(a.connectionPoints.length != b.connectionPoints.length) {
							return false
						}
						for(let cp = 0; cp < a.connectionPoints.length; cp++) {
							if(!equals(a.connectionPoints[cp], b.connectionPoints[cp])) {
								console.log(a, b, " Cable")
								return false
							}
						}		
					}
				}
			}
			if(!isCodeFound) {
				console.log("Kod bulunmadı")
				return false
			}
		}
		return true
	}
}

function createChildObjectCreatingButtons(buttonName) {
	let myButton;
	for(let b of buttons) {
		if(b.name == buttonName) {
			myButton = b;
			break
		}
	}
	latestUsedObjectCreatingButtonWithChild = latestUsedObjectCreatingButtonWithChild == null ? buttonName : null
	let cm;
	let info = childObjectCreatingButtonInfos[findIndex(objectCreatingButtonWithChildNames, buttonName)].slice().reverse()
	cm = new contextMenu(myButton.x, canvas.height - gateCreatingAreaMetrics.height, "", info, info.map(name => () => spawnObject(name)), "childObjectCreatingButton")
	//cm.y -= cm.height
	for(let b of cm.buttons) {
		//b.y -= cm.height
		if(include(limitedGates, b.name)) {
			b.isActive = false
		}
	}
	contextMenus.push(cm);
	mouseOccupation = "contextSelecting"
}

function emptyWorkingArea(isConfirmed = true) {
	if(!isConfirmed) {
		savedScreen = screen
		defaultScreenChanger()
		screen = 6
		requestedConfirm = () => emptyWorkingArea(true)
	} else {
		latestSavedStation = [];
		gates = []; 
		displays = []; 
		cables = []; 
		inputs = []; 
		outputs = []; 
		busses = [];
		if(latestOpened != null) {
			//camera = {...savedCamera} ???
			latestOpened = null
			limitedGates = []
		}
	}	
}


function isLoopingGate() {
	let visitableObjects = gates.concat(displays)
	let visitedGates = [];
	for(let g of visitableObjects) {
		if(!include(visitedGates, g)) {
			if(searchForLoop(g, [], visitedGates)) {
				return true;
			}
		}
	}
	return false


	function searchForLoop(gate, visiting, visited) {
		if(include(visited, gate)) return false;
		if(include(visiting, gate)) return true;
		visiting.push(gate);
		for(let o of gate.outputs) {
			tempOutput = decode(outputs, o)
			let nextInputs = findNextInputs(tempOutput)
			for(let i of nextInputs) {
				let tempGate = decode(visitableObjects, i.parentCode)
				let isLooping = searchForLoop(tempGate, visiting, visited)
				if(isLooping) {
					return true
				}
			}		
		}
		Splice(visiting, gate)
   		visited.push(gate)     
    	return false
	}

	function findNextInputs(output) {
		let tempInputs = []
		for(let outputCode of output.outputs) {
			let tempCable = decode(cables, outputCode)
			if(tempCable.connectionTypes.end.ObjectName != "Cable") {
				let tempInput = decode(inputs, tempCable.outputCode)
				if(tempInput.parentCode != null) {
					tempInputs.push(tempInput)
				}
			} else {
				//It means it is bus cable
				let busCable = decode(cables, tempCable.outputCode)
				for(let childCode of busCable.childs) {
					let child = decode(cables, childCode)
					if(child.connectionTypes.end.ObjectName == "Input") {			
						let tempInput = decode(inputs, child.outputCode)
						if(tempInput.parentCode != null) {
							tempInputs.push(tempInput)
						}

						let inputsOfBusCable = getChildInputs(child)
						tempInputs = tempInputs.concat(inputsOfBusCable)
					}
				}
			}

			let childInputs = getChildInputs(tempCable)
			tempInputs = tempInputs.concat(childInputs)
		}
		return tempInputs
	}

	function getChildInputs(tempCable) {
		let tempInputs = []
		for(let childCode of tempCable.childs) {
			let child = decode(cables, childCode)
			if(child.connectionTypes.end.ObjectName == "Input") {
				let tempInput = decode(inputs, child.outputCode)
				if(tempInput.parentCode != null) {
					tempInputs.push(tempInput)
				}
			}

			let childInputs = getChildInputs(child)
			tempInputs = tempInputs.concat(childInputs)
		}

		return tempInputs
	}

}



function screenToWorld(x, y) {
    return {
        x: (x) / camera.scale + camera.x,
        y: (y) / camera.scale + camera.y	
    }
}

function worldToScreen(x, y) {
    return {
        x: (x - camera.x) * camera.scale,
        y: (y - camera.y) * camera.scale
    }
}




function handleOptionScreen() {
	defaultScreenChanger()
	screen = 4
}

function handleLibraryScreen() {
	defaultScreenChanger()
	screen = 5
}

function handleFindScreen() {
	defaultScreenChanger()
	screen = 9
	focusInput(findInput)
}


function abortAllFastProcess() {
	fastProcessQueue = []
	if(currentFastProcess != null) {
		fastProcessAbortController = true
	}
}



function handleQuitScreen(isConfirmed = true) {
	if(isConfirmed) {
		defaultScreenChanger()
		screen = 12
		abortAllFastProcess()
		emptyWorkingArea(true)
		buttons.splice(1)

		libraryButtons = []
		libraryButtonsCollection = []
		libraryButtonsOrganize = []
		libraryButtonsStarred = []
		myFocus = []
		workingAreas = []
		latestOpened = null
		latestUsedObjectCreatingButtonWithChild = null
		currentPage = -1
		camera = {x: 0, y: 0, scale:1}	
		deleteContextMenus()
		if(currentFile != null) currentFile.save()
		currentFile = null
		stepsTakenWhenPaused = 0
		lastUpdateTime = performance.now();
		accumulatedTime = 0;
		clockStepCounter = 0;
		clockState = false;
		edittingCable = null
	} else {
		savedScreen = screen
		defaultScreenChanger()
		screen = 6	
		requestedConfirm = () => handleQuitScreen(true)
	}
}

//return request == "boolean" ? true : [curP[0],curP[1],nextP[0],nextP[1], i];
function cableHitboxTest(cable, request = "boolean") {
	let tolerance = cableBoldness[cable.type]*1.1/2
	let minDist = Infinity
	let minDistIndex = null
	if(cable.connectionPoints.length >= 2) {
		for(let i = 0 ; i < cable.connectionPoints.length - 1; i++) {
			let curP = cable.connectionPoints[i]
			let nextP = cable.connectionPoints[i+1]
			let distance = pointToLineDistance([curP[0],curP[1]], [nextP[0],nextP[1]],[mouseX, mouseY]);
			let rectanglePoints = getRectanglePoints([curP[0],curP[1]], [nextP[0],nextP[1]], tolerance)
			if(distance <= tolerance && rectangleBoundaryTest(rectanglePoints[0], rectanglePoints[1], rectanglePoints[2], rectanglePoints[3], [mouseX, mouseY])) {
				if(request == "boolean") {
					return true
				}
				if(request == "array") {
					if(distance < minDist) {
						minDist = distance
						minDistIndex = i
					}
				}
			}	
		}
	}
	if(request == "boolean") {
		return false
	}
	if(request == "array") {
		return minDistIndex
	}
}

function getClosestLinePoint(linePoints) {
	//Finds the closest Line
	let minDist = Infinity
	let minDistIndex = null
	for(let i = 0; i < linePoints.length - 1; i++) {
		let p1 = turnObject(linePoints[i])
		let p2 = turnObject(linePoints[i + 1])
		let distance = clampedPointToLineDistance(p1, p2, {x: mouseX, y: mouseY});
		if(distance < minDist) {
			minDist = distance
			minDistIndex = i
		}
	}

	//Finds the closest point

	let p1 = turnObject(linePoints[minDistIndex])
	let p2 = turnObject(linePoints[minDistIndex + 1])

    // p1-p2 vektörü
	let v1 = getVector(p1, p2)

    // p1-mouse vektörü
	let v2 = getVector(p1, {x: mouseX, y: mouseY})

    // Projeksiyon oranı (t)
    const length = vectorLength(v1) ** 2
    const dot = dotProduct(v1, v2)
    let t = clamp(dot / length, 0, 1);

    return {x: p1.x + v1.x * t, y: p1.y + v1.y * t, index: minDistIndex};
}


function findClosestPointOnLine(cable, index) {
	//For perfect connection
	let lineStart = cable.connectionPoints[index]
	let lineEnd = cable.connectionPoints[index + 1]
	let targetPoint = [mouseX, mouseY]
	let lineVector = []
	lineVector.push(lineEnd[0] - lineStart[0]) 
	lineVector.push(lineEnd[1] - lineStart[1])
	let lineLengthSquared = lineVector[0] * lineVector[0] + lineVector[1] * lineVector[1];
	let targetVector = []
	targetVector.push(targetPoint[0] - lineStart[0])
	targetVector.push(targetPoint[1] - lineStart[1])
	let projection = (targetVector[0] * lineVector[0] + targetVector[1] * lineVector[1]) / lineLengthSquared;		
	let t = Math.max(0, Math.min(1, projection));
	let closestPoint = {x: lineStart[0] + t * lineVector[0], y:lineStart[1] + t * lineVector[1]}
	return closestPoint;
}

function map(value, oldStart, oldEnd, newStart, newEnd) {
	let theta = (value - oldStart) / (oldEnd - oldStart);
	return theta * (newEnd - newStart) + newStart;
}

function getRandomNumber(minimum, maximum) {
	return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}


function pointToLineDistance(p1, p2, targetPoint) {
	let x1 = p1[0]
	let y1 = p1[1]
	let x2 = p2[0]
	let y2 = p2[1]
	if(x2 != x1) {
		let m = (y2 - y1) / (x2 - x1)
		return Math.abs((m * targetPoint[0] + y1 - m*x1 - targetPoint[1])) / Math.sqrt(m ** 2 + 1)
	} else {
		return Math.abs(x1 - targetPoint[0]);
	}
}

function clampedPointToLineDistance(p1, p2, targetPoint) {
	let v1 = getVector(p1, p2)
    let v2 =  getVector(p1, targetPoint)

    let c1 = dotProduct(v1, v2); // dot product

    if (c1 <= 0) {
        return Math.hypot(targetPoint.x - p1.x, targetPoint.y - p1.y); // p1'e en yakın
    }

    let c2 = vectorLength(v1) ** 2
    if (c2 <= c1) {
        return Math.hypot(targetPoint.x - p2.x, targetPoint.y - p2.y); // p2'ye en yakın
    }

    let t = c1 / c2; // segment üzerindeki nokta
    let proj = {x:p1.x + t * v1.x, y:p1.y + t * v1.y}

    return Math.hypot(targetPoint.x - proj.x, targetPoint.y - proj.y);
}


function isInRect(rectX, rectY, width, height, x, y, mode = "center") {
	if(Number.isNaN(rectX)) return true
	if (mode == "center") {
		let x1 = rectX - width / 2;
		let x2 = rectX + width / 2;
		let y1 = rectY - height / 2;
		let y2 = rectY + height / 2;

		return (
			between(x, Math.min(x1, x2), Math.max(x1, x2)) &&
			between(y, Math.min(y1, y2), Math.max(y1, y2))
		);
	}

	if (mode == "corner") {
		let x1 = rectX;
		let x2 = rectX + width;
		let y1 = rectY;
		let y2 = rectY + height;

		return (
			between(x, Math.min(x1, x2), Math.max(x1, x2)) &&
			between(y, Math.min(y1, y2), Math.max(y1, y2))
		);
	}
}

function clamp(n, min, max) {
	if(min > max) console.log("HATA!")
	return Math.max(Math.min(n, max), min)
}

function isRectInside(inner, outer) {
	//console.log(inner, outer)
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.w <= outer.x + outer.w &&
		inner.y + inner.h <= outer.y + outer.h
	);
}

function isInTriangle(p1, p2, p3, px, py) {
  // Alanları (veya yönlü alan oranlarını) karşılaştırır
  const areaOrig = Math.abs((p2.x - p1.x)*(p3.y - p1.y) - (p3.x - p1.x)*(p2.y - p1.y));
  const area1 = Math.abs((p1.x - px)*(p2.y - py) - (p2.x - px)*(p1.y - py));
  const area2 = Math.abs((p2.x - px)*(p3.y - py) - (p3.x - px)*(p2.y - py));
  const area3 = Math.abs((p3.x - px)*(p1.y - py) - (p1.x - px)*(p3.y - py));

  return Math.abs(area1 + area2 + area3 - areaOrig) < 0.01;
}

function getTrianglePoints(tri) {
	let cx = tri.x
	let cy = tri.y
	let base = tri.base 
	let height = tri.height 
	let direction = tri.direction
	if (direction === 'N') {
		return [
		{x: cx - base/2, y: cy},
		{x: cx + base/2, y: cy},
		{x: cx, y: cy - height}
		];
	} else if (direction === 'S') {
		return [
		{x: cx - base/2, y: cy},
		{x: cx + base/2, y: cy},
		{x: cx, y: cy + height}
		];
	} else if (direction === 'E') {
		return [
		{x: cx, y: cy - base/2},
		{x: cx, y: cy + base/2},
		{x: cx + height, y: cy}
		];
	} else if (direction === 'W') {
		return [
		{x: cx, y: cy - base/2},
		{x: cx, y: cy + base/2},
		{x: cx - height, y: cy}
		];
	}
}

function isInCircle(circleX, circleY, x, y, radius) {
	return dist(circleX, circleY, x, y) <= radius;
}

function closestDistPointToRect(rectX, rectY, width, height, x, y) {
	//The angle of rectangle must be 0; For cable connection
	let minX = rectX - width/2
	let maxX =  rectX + width/2
	let minY = rectY - height/2
	let maxY =  rectY + height/2

	let clampedX = Math.max(minX, Math.min(x, maxX));
    let clampedY = Math.max(minY, Math.min(y, maxY));
	return dist(x, y, clampedX, clampedY);
}

function rectangleBoundaryTest(p1, p2, p3, p4, targetPoint) {
	let dist1 = pointToLineDistance(p1, p2, targetPoint);
	let dist2 = pointToLineDistance(p2, p3, targetPoint);
	let dist3 = pointToLineDistance(p3, p4, targetPoint);
	let dist4 = pointToLineDistance(p4, p1, targetPoint);
	let sumDistance = dist1 + dist2 + dist3 + dist4;
	let side1Distance = dist(p1[0], p1[1], p2[0], p2[1]);
	let side2Distance = dist(p2[0], p2[1], p3[0], p3[1]);
	return (sumDistance <= side1Distance + side2Distance);
}

function getRectanglePoints(p1, p2, r) {
	let distance = dist(p1[0], p1[1], p2[0], p2[1]);
	let sinTheta = (p2[1] - p1[1]) / distance;
	let cosTheta = (p2[0] - p1[0]) / distance;
	let dX = r * sinTheta;
	let dY = r * cosTheta;
	let rectP1 = [p1[0] - dX, p1[1] + dY];
	let rectP2 = [p1[0] + dX, p1[1] - dY];
	let rectP3 = [p2[0] - dX, p2[1] + dY];
	let rectP4 = [p2[0] + dX, p2[1] - dY];
	return [rectP1, rectP2, rectP3, rectP4];
}

function Splice(arr, n) {
	for(let i = arr.length -1 ; i>= 0; i--) {
		if(arr[i] == n) {
			arr.splice(i, 1)
		}
	}
}

function removePX(str) {
    return parseInt(str.replace('px',''));
}

pinInputBox.addEventListener("focus", () => {
  	pinInputBox.select();
});

peInput.addEventListener("focus", () => {
  	peInput.select();
});

colorPickerInput.addEventListener("input", () => {
  let val = colorPickerInput.value;

  // Sadece # ve hex karakterlerini bırak
  val = val.replace(/[^#0-9a-fA-F]/g, '').toUpperCase();

  // # işareti sadece başta olabilir
  if (val.length > 1) {
    val = "#" + val.slice(1).replace(/#/g, "");
  }

  // # ile başlamıyorsa başa ekle
  if (val.length > 0 && val[0] !== "#") {
    val = "#" + val.replace(/#/g, "");
  }

  // 7 karakterden uzun olmasın (# + 6 hane)
  if (val.length > 7) {
    val = val.slice(0, 7);
  }

  colorPickerInput.value = val;


  let hsbVal = hexToHsb(val)
  colorPickers[0].setColor(hsbVal)
});


spctInput.addEventListener("input", () => {
 	let val = spctInput.value;
	val = val.replace(/[^0-9]/g, '');

	if(val.length > 1 && val[0] === '0') {
		val = val.replace(/^0+/, '') || '0';
	}
	spctInput.value = val;
});

spsInput.addEventListener("input", () => {
 	let val = spsInput.value;
	val = val.replace(/[^0-9]/g, '');

	if(val.length > 1 && val[0] === '0') {
		val = val.replace(/^0+/, '') || '0';
	}
	spsInput.value = val;
});

peInput.addEventListener("input", () => {
 	let val = peInput.value;
	val = val.replace(/[^0-9]/g, '');

	if(val.length > 1 && val[0] === '0') {
		val = val.replace(/^0+/, '') || '0';
	}
	peInput.value = val;
});

findInput.addEventListener("input", () => {
	repositionFindButtons()
})

function changeTag() {
	changingLabelObject.tag = pinInputBox.value;
	changingLabelObject.decimalDisplay = changingDecimalDisplayMode
	removeInputBox();
}

function removeInputBox() {
	screen = 0;
	pinInputBox.style.visibility = "hidden"
	changingLabelObject.highlight = false
	changingLabelObject = changingDecimalDisplayMode	
	changingLabelObject = null;
	createButtonsForLabelMenu = true
	let spliceAmount = labelMenuType == "Big" ? 4 : 2
	buttons.splice(buttons.length - spliceAmount, spliceAmount);
	mouseStartX = mouseScreenX
	mouseStartY = mouseScreenY
}

function roundRect(x, y, width, height, radius) {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + width - radius, y);
    c.quadraticCurveTo(x + width, y, x + width, y + radius);
    c.lineTo(x + width, y + height - radius);
    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    c.lineTo(x + radius, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
}

function swapLastNWithBeforeInPlace(arr, n) {
    const len = arr.length;

    if (2 * n > len) {
        throw new Error("Dizi yeterince uzun değil");
    }

    const midStart = len - 2 * n;
    const middle = arr.splice(midStart, n);
    const last = arr.splice(midStart, n);

    arr.splice(midStart, 0, ...last, ...middle);

    return arr;
}

function getBestDistribution(name) {
	if(typeof name != "string") {return []}
	if(name == "") return []
	let words = name.trim().split(/\s+/);
	let bestScore = Infinity;
	let bestCase;

	for(let i = 0; i < Math.pow(2,words.length-1); i++) {
		let spreader = i.toString(2);
		while(spreader.length < words.length-1) {
			spreader = "0".concat(spreader);
		}
		//console.log(spreader)

		let tempDistribution = [[words[0]]];
		if(words.length > 1) {
			for(let s = 0; s < spreader.length; s++) {
				if(spreader[s] == "0") {
					last(tempDistribution)[0] = last(tempDistribution)[0].concat(" ")
					last(tempDistribution)[0] = last(tempDistribution)[0].concat(words[s+1])
				}
				if(spreader[s] == "1") {
					tempDistribution.push([])
					last(tempDistribution).push(words[s+1])
				}
			}
		}
		//console.log(...tempDistribution)


		let maxWidth = -Infinity
		let maxHeight = 0
		for(let line of tempDistribution) { 
			c.textAlign = "center";
			c.letterSpacing = "1px";
			c.font = `bold 32px ${myFont}` 
			let metrics = c.measureText(...line)
			maxWidth = Math.max(Math.floor(metrics.width), maxWidth);	
			maxHeight +=  metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		}
		//maxWidth += gateWidthOffset;
	
		//console.log(...tempDistribution,maxWidth,maxHeight)
		//console.log(...tempDistribution, maxWidth * maxHeight)

		let aspectRatio = maxWidth / maxHeight;
		const goldenRatio = 1.618;
		let area = maxWidth * maxHeight;

		const score = Math.abs(aspectRatio - goldenRatio) + 0.001 * area;

		if(score < bestScore) {
   		 	bestScore = score;
    		bestCase = tempDistribution.slice();
		}
	}
	//console.log(...bestCase, bestScore)
	//console.log("------------------------------")
	return bestCase;
}