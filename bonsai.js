//expose bonsai generation configuration
const config = {
    renderMode: "ascii",    //"ascii" or "line"
    startingEnergy: 100,
    crownPoint: 15,
    forkPoint: 10,
    branchChance: 12,    // %
    entropy: 8,
    shyDist: 4,
    shyEffect: 50,
    minSize: 50,
    maxBranches: 80
}

const world = {
    scale: 20,  //pixels per square cell
    width: 30,  //in cells
    height: 30  //in cells
}

const dirs = ["down-left", "left", "up-left", "up", "up-right", "right", "down-right"];

const cellChanges = [
    {
        dir: "down-left",
        symbol: "}",
        dx: -1,
        dy: 1
    },
    {
        dir: "left",
        symbol: "~",
        dx: -1,
        dy: 0
    },
    {
        dir: "up-left",
        symbol: "\\",
        dx: -1,
        dy: -1
    },
    {
        dir: "up",
        symbol: "|",
        dx: 0,
        dy: -1
    },
    {
        dir: "up-right",
        symbol: "/",
        dx: 1,
        dy: -1
    },
    {
        dir: "right",
        symbol: "~",
        dx: 1,
        dy: 0
    },
    {
        dir: "down-right",
        symbol: "{",
        dx: 1,
        dy: 1
    }
]

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = world.width * world.scale;
canvas.height = world.height * world.scale
document.getElementById("canvas-container").appendChild(canvas);

const ctx = canvas.getContext("2d");
ctx.font = world.scale + "px monospace";
ctx.strokeStyle = "brown"
ctx.lineWidth = 1;
ctx.textAlign = "center"

let tree = new Map();
const treeKey = (cell) => `${cell.x},${cell.y}`;
let cells = [];
let frame = 0;
let branches = 0;

let cell = (symbol = "~", x = 0, y = null, energy = null) => {
    if (y == null) y = world.height;
    if (energy == null) energy = config.startingEnergy;
    return {
        symbol,
        x,
        y,
        priorX: x,
        priorY: y,
        energy,
        branchId: 0,
        dirIndex: Math.round((cellChanges.length - 1) / 2),
        age: 0,
        draw() {
            ctx.fillStyle = this.symbol == "&" ? "green" : "brown";
            if(config.renderMode === "line") {
                ctx.beginPath();
                if(this.symbol == "&") {
                    //green leaf circle
                    ctx.arc(this.x * world.scale, this.y * world.scale, world.scale, 0, 2 * Math.PI);
                    ctx.fill();
                }
                else {
                    ctx.moveTo(this.priorX * world.scale, this.priorY * world.scale);
                    ctx.lineTo(this.x * world.scale, this.y * world.scale);
                    ctx.stroke();
                }
            }
            else if (config.renderMode === "ascii") {
                ctx.fillText(this.symbol, this.x * world.scale, (this.y - 1) * world.scale);
            }
        }
    }
}

growBonsai()
function growBonsai() {
    //init tree
    document.getElementById("msg").innerText = "";
    branches = 0;
    frame = 0;
    tree = new Map();
    let startCell = cell("~", Math.floor(world.width / 2));
    startCell.branchId = 1;
    tree.set(treeKey(startCell), startCell);

    growBranch(startCell, 1);
    
    if(tree.size < config.minSize || branches > config.maxBranches) {
        growBonsai();
    }
    else {
        console.debug("Cells: " + tree.size);
        console.debug("Branches: " + branches);
        cells = tree = [...tree.values()].sort((c1, c2) => c1.age - c2.age);
    
        animate();
    }
}

function animate() {
    //clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //draw tree one cell at a time
    ctx.textBaseline = "top";
    let max = Math.floor(frame / 5);

    for (let n = 0; n < max && n < tree.length; n++) {
        cells[n].draw();
    }
    frame++;

    if (max >= cells.length) {
        max = cells.length;
        document.getElementById("msg").innerText = "Tree Finished";
        return;
    }
    window.requestAnimationFrame(animate);
}

function shouldSpawnBranch(cell) {
    return rand(0, 100) < config.branchChance || 
    (cell.energy < config.crownPoint + config.entropy / 2 && cell.energy > config.crownPoint - config.entropy / 2) || 
    (cell.energy < config.forkPoint + config.entropy / 2 && cell.energy > config.forkPoint - config.entropy / 2)
}

function growBranch(priorCell, branchId) {
    let newCell = cell("~", priorCell.x, priorCell.y, priorCell.energy - rand(1, config.entropy));
    newCell.age = priorCell.age + 1;
    newCell.branchId = branchId;

    // The direction formula:
    // Each cell scans for sunlight, weighting directions with sunlight more than without (with == no cells above, without == cells within N positions above)

    //get light levels of possible new directions (left one, current, right one);
    let newDirIndexes = [priorCell.dirIndex - 1, priorCell.dirIndex, priorCell.dirIndex + 1].filter(dir => dir >= 0 && dir < dirs.length);

    let lightLevels = newDirIndexes.map(dirIndex => getLightAt(newCell.x + cellChanges[dirIndex].dx, newCell.y + cellChanges[dirIndex].dy));

    //convert the series of values into probability ranges, and thus a direction
    let odds = [0];
    for(let n = 1; n <= lightLevels.length; n++) {
        odds.push(odds[n-1] + lightLevels[n - 1]);
    }

    let chance = Math.random() * odds[odds.length - 1];

    if(chance == 0) {
        newCell.symbol = "&";
        return;
    }

    let newDir = odds.filter(odd => odd < chance).length - 1;

    newCell.dirIndex = newDirIndexes[newDir];

    newCell.symbol = cellChanges[newCell.dirIndex].symbol;
    newCell.x += cellChanges[newCell.dirIndex].dx;
    newCell.y += cellChanges[newCell.dirIndex].dy;
    
    if(newCell.energy < 1) newCell.symbol = "&";
    
    if (newCell.x <= 1 || newCell.x >= world.width - 1 || newCell.y > world.height - 1 || newCell.y < 1) {
        newCell.symbol = "&";
        return
    }
    
    tree.set(treeKey(newCell), newCell);
    
    if (newCell.energy < 1) return
    
    if (shouldSpawnBranch(newCell)) {
        branches++;
        growBranch(newCell, branches + 1)
    }

    growBranch(newCell);
}

function getLightAt(x, y) {
    if (tree.has(`${x},${y}`)) return 0;

    let light = 100;

    for (let dx = -config.shyDist; dx <= config.shyDist; dx++) {
        for (let dy = -config.shyDist; dy <= config.shyDist; dy++) {
            const neighbour = tree.get(`${x+dx},${y+dy}`);
            if (!neighbour) continue;
            const dist = Math.max(Math.abs(dx), Math.abs(dy));
            
            light -= config.shyEffect / (dist || 1); // shade from neighbouring cell
        }
    }

    return light;
}

function rand(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}