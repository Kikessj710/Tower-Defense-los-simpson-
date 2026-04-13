// ============================================================
//  SPRINGFIELD DEFENSE — game.js
//  Estructuras: CircularQueue · Stack · Listas Secuenciales
// ============================================================

// ============================================================
//  1. ESTRUCTURAS DE DATOS
// ============================================================

class CircularQueue {
    constructor(size) {
        this.size  = size;
        this.queue = new Array(size).fill(null);
        this.front = -1;
        this.rear  = -1;
        this.count = 0;
    }
    enqueue(item) {
        if (this.isFull()) return false;
        this.rear = (this.rear + 1) % this.size;
        this.queue[this.rear] = item;
        if (this.front === -1) this.front = this.rear;
        this.count++;
        return true;
    }
    dequeue() {
        if (this.isEmpty()) return null;
        const item = this.queue[this.front];
        this.queue[this.front] = null;
        this.front = (this.front + 1) % this.size;
        this.count--;
        if (this.isEmpty()) { this.front = -1; this.rear = -1; }
        return item;
    }
    isEmpty() { return this.count === 0; }
    isFull()  { return this.count === this.size; }

    // Recorre todos los Cozy activos (quantum de tiempo)
    updateAll(callback) {
        if (this.isEmpty()) return;
        let idx = this.front;
        for (let i = 0; i < this.count; i++) {
            const e = this.queue[idx];
            if (e && !e.isDead && !e.reachedEnd) callback(e);
            idx = (idx + 1) % this.size;
        }
    }

    // Saca (dequeue) a Cozy con HP=0 o que llegaron al final
    purge() {
        if (this.isEmpty()) return;
        const kept = [];
        let idx = this.front;
        for (let i = 0; i < this.count; i++) {
            const e = this.queue[idx];
            if (e && !e.isDead && !e.reachedEnd) kept.push(e);
            idx = (idx + 1) % this.size;
        }
        this.queue = new Array(this.size).fill(null);
        this.front = -1; this.rear = -1; this.count = 0;
        for (const e of kept) this.enqueue(e);
    }

    getAll() {
        const arr = [];
        if (this.isEmpty()) return arr;
        let idx = this.front;
        for (let i = 0; i < this.count; i++) {
            arr.push(this.queue[idx]);
            idx = (idx + 1) % this.size;
        }
        return arr;
    }
}

class Stack {
    constructor() { this.items = []; }
    push(item)  { this.items.push(item); }
    pop()       { return this.items.pop(); }
    isEmpty()   { return this.items.length === 0; }
    size()      { return this.items.length; }
}

// ============================================================
//  2. LISTAS SECUENCIALES DE CONFIGURACIÓN
// ============================================================

// Lista secuencial de torres (orden de desbloqueo)
const TOWER_TYPES = ["homero", "lisa", "marge", "bart"];

// Lista secuencial de tipos de Cozy
const COZY_TYPES = ["burns", "nelson", "milhouse", "kang", "kodos", "skinner", "flanders"];

const TOWER_CONFIG = {
    homero: { name:"Homero",  icon:"🍩", damage:20,  range:110, delay:45, slow:false, unlockXP:0,
              sprite:"Personajes/Homero/HomerNormal.webm",  projectile:"Personajes/Homero/DonaAvanzando.webm",
              desc:"Lanza donas. Perfecto para empezar." },
    lisa:   { name:"Lisa",    icon:"🎷", damage:38,  range:155, delay:33, slow:false, unlockXP:500,
              sprite:"Personajes/Lisa/Lisa.webm",           projectile:"Personajes/Lisa/Notas.webm",
              desc:"Saxofón. Más daño y mayor alcance." },
    marge:  { name:"Marge",   icon:"👶", damage:18,  range:125, delay:38, slow:true,  unlockXP:1000,
              sprite:"Personajes/Marge/Marge.webm",         projectile:"Personajes/Marge/Maggie.webm",
              desc:"Lanza a Maggie. Ralentiza a los Cozy." },
    bart:   { name:"Bart",    icon:"💣", damage:55,  range:135, delay:44, slow:false, unlockXP:1500,
              sprite:"Personajes/Bart/Bart.webm",           projectile:"Personajes/Bart/BartExplotando.webm",
              desc:"Torre + bomba especial global." },
};

const COZY_CONFIG = {
    burns:    { name:"Sr. Burns",       icon:"🧓", hp:80,   speed:1.2, reward:100,  type:"normal", size:44,
                walk:"Personajes/Burns/BurnsCaminando.webm",            die:"Personajes/Burns/BurnsMuriendo.webm" },
    nelson:   { name:"Nelson",          icon:"😤", hp:110,  speed:1.8, reward:150,  type:"normal", size:44,
                walk:"Personajes/Milhouse-Nelson/NelsonCaminando.webm", die:"Personajes/Milhouse-Nelson/Nelson.webm" },
    milhouse: { name:"Milhouse",        icon:"🤓", hp:95,   speed:1.6, reward:130,  type:"normal", size:44,
                walk:"Personajes/Milhouse-Nelson/milhouse.webm",        die:"Personajes/Milhouse-Nelson/MilhouseParado.webm" },
    kang:    { name:"Kang",            icon:"👽", hp:160,  speed:2.0, reward:200,  type:"alien",  size:50,
                walk:"Personajes/Kang y Kodos/KangYKodos.webm",              die:"Personajes/Kang y Kodos/KangYKodosMuriendo.webm" },
    kodos:    { name:"Kodos",           icon:"👽", hp:200,  speed:4.0, reward:200,  type:"alien",  size:50,
                walk:"Personajes/Kang y Kodos/KangYKodos.webm",            die:"Personajes/Kang y Kodos/KangYKodosMuriendo.webm" },
    skinner:  { name:"Dir. Skinner",    icon:"👔", hp:220,  speed:1.0, reward:250,  type:"strong", size:50,
                walk:"Personajes/Skinner/SkinnerCaminando.webm",        die:"Personajes/Skinner/SkinnerCaida.webm" },
    flanders: { name:"DIABLO FLANDERS", icon:"😈", hp:2000, speed:1.1, reward:5000, type:"boss",   size:70,
                walk:"Personajes/Flanders/FlandersEntrada.webm",        die:"Personajes/Flanders/FlandersMuriendo.webm" },
};

// Lista secuencial de diseños de ola
// Los jefes siempre van al final de cada ola
const WAVE_DESIGNS = [
    // Ola 1 — presentación: Burns
    { label:"¡Burns ataca!",             enemies:[{key:"burns",count:4}] },
    // Ola 2 — Nelson se une
    { label:"Nelson entra al juego",     enemies:[{key:"burns",count:4},{key:"nelson",count:2}] },
    // Ola 3 — Milhouse también
    { label:"¡Milhouse también!",        enemies:[{key:"burns",count:3},{key:"nelson",count:3},{key:"milhouse",count:2}] },
    // Ola 4 — alienígenas (Kang y Kodos aparecen)
    { label:"👾 ¡Invasión alienígena!",  enemies:[{key:"burns",count:3},{key:"milhouse",count:2},{key:"kang",count:2},{key:"kodos",count:2}] },
    // Ola 5 — Skinner entra
    { label:"El Director Skinner llega", enemies:[{key:"nelson",count:3},{key:"kang",count:2},{key:"kodos",count:2},{key:"skinner",count:2}] },
    // Ola 6
    { label:"Más alienígenas",           enemies:[{key:"milhouse",count:3},{key:"kang",count:3},{key:"skinner",count:2}] },
    // Ola 7
    { label:"Ataque masivo alienígena",  enemies:[{key:"kang",count:3},{key:"kodos",count:3},{key:"skinner",count:3}] },
    // Ola 8
    { label:"¡Todos juntos!",            enemies:[{key:"nelson",count:4},{key:"kang",count:3},{key:"kodos",count:3},{key:"skinner",count:2}] },
    // Ola 9 — pre-jefe
    { label:"⚠️ El ejército final...",   enemies:[{key:"kang",count:4},{key:"kodos",count:4},{key:"skinner",count:3}] },
    // Ola 10 — JEFE FINAL
    { label:"😈 ¡DIABLO FLANDERS!",     enemies:[{key:"burns",count:3},{key:"skinner",count:2},{key:"flanders",count:1}], isFinal:true },
];


// ============================================================
//  3. WAYPOINTS (dinámicos)
// ============================================================
let WAYPOINTS = [];
function buildWaypoints() {
    const c = document.getElementById("mapContainer");
    const W = c.offsetWidth  || 800;
    const H = c.offsetHeight || 500;
    return [
        { x:-30,      y:H*0.18 },
        { x:W*0.28,   y:H*0.18 },
        { x:W*0.28,   y:H*0.50 },
        { x:W*0.65,   y:H*0.50 },
        { x:W*0.65,   y:H*0.82 },
        { x:W+30,     y:H*0.82 },
    ];
}

// ============================================================
//  4. CLASE COZY (enemigo)
// ============================================================
class Cozy {

    constructor(cfgKey, hpBonus, speedBonus) {
        const c         = COZY_CONFIG[cfgKey];
        this.cfgKey     = cfgKey;
        this.name       = c.name;
        this.icon       = c.icon;
        this.hp         = c.hp + hpBonus;
        this.maxHp      = this.hp;
        this.speed      = c.speed + speedBonus;
        this.reward     = c.reward;
        this.type       = c.type;
        this.size       = c.size;
        this.walkSrc    = c.walk;
        this.dieSrc     = c.die;

        this.wpIndex    = 1;
        this.x          = WAYPOINTS[0].x;
        this.y          = WAYPOINTS[0].y;
        this.isDead     = false;
        this.reachedEnd = false;
        this.slowed     = false;
        this.slowTick   = 0;
        this.dom        = null;
        this.hpBarEl    = null;
        this.vid        = null;
      reproducirVoz(cfgKey);  
    }

    spawn() {
        const wrap = document.createElement("div");
        wrap.style.cssText = `
            position:absolute; pointer-events:none; z-index:8;
            left:${this.x - this.size/2}px; top:${this.y - this.size/2}px;
            width:${this.size}px;
        `;

        const vid = document.createElement("video");
        vid.src = this.walkSrc;
        vid.autoplay = true; vid.loop = true; vid.muted = true;
        vid.width = this.size; vid.height = this.size;
        vid.style.display = "block";
        vid.onerror = () => {
            vid.style.display = "none";
            if (!wrap._fb) {
                const fb = document.createElement("div");
                fb.style.cssText = `
                    width:${this.size}px; height:${this.size}px;
                    background:rgba(200,60,60,0.85);
                    border-radius:8px; border:2px solid #000;
                    display:flex; align-items:center; justify-content:center;
                    font-size:${Math.floor(this.size*0.5)}px;
                `;
                fb.textContent = this.icon;
                wrap.insertBefore(fb, wrap.firstChild);
                wrap._fb = true;
            }
        };

        const hpWrap = document.createElement("div");
        hpWrap.style.cssText = `width:${this.size}px;height:5px;margin-top:2px;
            background:rgba(0,0,0,0.5);border-radius:3px;overflow:hidden;`;
        const hpFill = document.createElement("div");
        hpFill.style.cssText = `height:100%;width:100%;background:#22c55e;
            border-radius:3px;transition:width .1s;`;
        hpWrap.appendChild(hpFill);
        this.hpBarEl = hpFill;

        wrap.appendChild(vid);
        wrap.appendChild(hpWrap);
        this.dom = wrap;
        this.vid = vid;
        document.getElementById("enemies").appendChild(wrap);
    }

    // Quantum de tiempo: mueve al Cozy un paso
    step() {
        if (this.wpIndex >= WAYPOINTS.length) {
            if (!this.reachedEnd) { this.reachedEnd = true; this._onReachEnd(); }
            return;
        }
        const t   = WAYPOINTS[this.wpIndex];
        const dx  = t.x - this.x, dy = t.y - this.y;
        const dist = Math.hypot(dx, dy);
        const spd  = this.slowed ? this.speed * 0.45 : this.speed;

        if (dist <= spd) { this.x = t.x; this.y = t.y; this.wpIndex++; }
        else { const a = Math.atan2(dy, dx); this.x += Math.cos(a)*spd; this.y += Math.sin(a)*spd; }

        if (this.dom) {
            this.dom.style.left = (this.x - this.size/2) + "px";
            this.dom.style.top  = (this.y - this.size/2) + "px";
        }
        if (this.slowTick > 0 && --this.slowTick === 0) this.slowed = false;
    }

    takeDamage(amount, slow=false) {
        if (this.isDead) return;
        this.hp -= amount;
        if (this.vid) {
            this.vid.style.filter = "brightness(4) saturate(0)";
            setTimeout(() => { if (this.vid) this.vid.style.filter=""; }, 130);
        }
        if (slow) { this.slowed = true; this.slowTick = 130; }
        if (this.hpBarEl) {
            const pct = Math.max(0, this.hp/this.maxHp);
            this.hpBarEl.style.width = (pct*100)+"%";
            this.hpBarEl.style.background = pct>0.6?"#22c55e":pct>0.3?"#f59e0b":"#ef4444";
        }
        spawnDmgFloat(this.x, this.y, amount);
        if (this.hp <= 0) this._die();
    }

    _die() {
        this.isDead = true;
        score  += this.reward;
        xp     += this.reward;
        updateUI();
        checkUnlocks();

        const isFinalBoss = this.cfgKey === "flanders";
        if (this.vid) {
            this.vid.src  = this.dieSrc;
            this.vid.loop = false;
            this.vid.onended = () => { this.dom?.remove(); if (isFinalBoss) gameWin(); };
            this.vid.onerror  = () => { this.dom?.remove(); if (isFinalBoss) gameWin(); };
        } else {
            this.dom?.remove();
            if (isFinalBoss) gameWin();
        }
    }

    _onReachEnd() {
        const dmg = this.type==="boss" ? 30 : 15;
        playerHealth -= dmg;
        this.dom?.remove();
        updateUI();
        if (playerHealth <= 0) gameOver();
    }
}

// ============================================================
//  5. CLASE TOWER
// ============================================================
class Tower {
    constructor(typeKey, x, y, cellX, cellY) {
        const c       = TOWER_CONFIG[typeKey];
        this.typeKey  = typeKey;
        this.name     = c.name;
        this.damage   = c.damage;
        this.range    = c.range;
        this.delay    = c.delay;
        this.slow     = c.slow;
        this.spriteSrc= c.sprite;
        this.projSrc  = c.projectile;
        this.x=x; this.y=y; this.cellX=cellX; this.cellY=cellY;
        this.cooldown = 0;
        this.dom      = null;
        this.fbDom    = null;
    }

    placeDOM() {
        const vid = document.createElement("video");
        vid.src = this.spriteSrc;
        vid.autoplay=true; vid.loop=true; vid.muted=true;
        vid.width=50; vid.height=50;
        vid.style.cssText=`position:absolute;left:${this.cellX}px;top:${this.cellY}px;z-index:9;pointer-events:none;`;
        vid.onerror = () => {
            vid.style.display="none";
            const fb = document.createElement("div");
            fb.style.cssText=`position:absolute;left:${this.cellX}px;top:${this.cellY}px;
                width:50px;height:50px;z-index:9;
                background:#f59e0b;border-radius:10px;border:2px solid #000;
                display:flex;align-items:center;justify-content:center;font-size:24px;`;
            fb.textContent = TOWER_CONFIG[this.typeKey].icon;
            document.getElementById("map").appendChild(fb);
            this.fbDom = fb;
        };
        document.getElementById("map").appendChild(vid);
        this.dom = vid;
    }

    removeDOM() { this.dom?.remove(); this.fbDom?.remove(); this.dom=null; this.fbDom=null; }

    update(queue) {
        if (this.cooldown > 0) { this.cooldown--; return; }
        let target=null, bestWP=-1;
        for (const e of queue.getAll()) {
            if (e.isDead || e.reachedEnd) continue;
            if (Math.hypot(e.x-this.x, e.y-this.y) <= this.range && e.wpIndex > bestWP) {
                target=e; bestWP=e.wpIndex;
            }
        }
        if (!target) return;
        this._shoot(target);
        this.cooldown = this.delay;
    }

    _shoot(enemy) {
        const proj = document.createElement("video");
        proj.src=this.projSrc;
        proj.autoplay=true; proj.loop=false; proj.muted=true;
        proj.style.cssText=`position:absolute;width:22px;height:22px;
            left:${this.x-11}px;top:${this.y-11}px;z-index:20;pointer-events:none;`;
        proj.onerror=()=>{};
        document.getElementById("map").appendChild(proj);

        let t=0;
        const sx=this.x, sy=this.y, dmg=this.damage, slow=this.slow;
        const id = setInterval(()=>{
            t += 0.11;
            if (t >= 1) {
                clearInterval(id); proj.remove();
                if (!enemy.isDead) enemy.takeDamage(dmg, slow);
            } else {
                proj.style.left = (sx+(enemy.x-sx)*t-11)+"px";
                proj.style.top  = (sy+(enemy.y-sy)*t-11)+"px";
            }
        }, 25);
    }
}

// ============================================================
//  6. ESTADO GLOBAL
// ============================================================
let playerHealth  = 100;
let score         = 0;
let xp            = 0;
let currentWave   = 0;       // cuántas olas han COMENZADO (1-based al mostrar)
let gameRunning   = false;

// Control de spawn — FIX DEL BUG: separado del game loop
let spawning      = false;   // true mientras quedan Cozy por spawnear
let waveActive    = false;   // true mientras la ola no termina
let spawnList     = [];      // lista secuencial de Cozy de la ola actual
let spawnIdx      = 0;
let spawnTimerID  = null;

// Cola circular, torres, pilas
let cozyQueue     = null;
let activeTowers  = [];
let towerHistory  = new Stack();
let towerRedo     = new Stack();
let unlockedTowers= ["homero"];

// Lista secuencial histórica de olas lanzadas
let waveHistory   = [];

// Modo colocación
let placingMode   = false;
let selectedType  = "homero";

// Bart special
let specialCD     = 0;
let specialItvID  = null;

// ============================================================
//  7. INIT
// ============================================================
function initGame() {
    playerHealth=100; score=0; xp=0; currentWave=0;
    gameRunning=true; placingMode=false; specialCD=0;
    spawning=false; waveActive=false;
    spawnList=[]; spawnIdx=0; waveHistory=[];
    activeTowers=[]; unlockedTowers=["homero"];
    towerHistory=new Stack(); towerRedo=new Stack();
    cozyQueue=new CircularQueue(200);
    WAYPOINTS=buildWaypoints();

    document.getElementById("map").innerHTML="";
    document.getElementById("enemies").innerHTML="";

    _drawPath();
    _setupMapClick();
    _setupButtons();
    updateTowerButtons();
    updateUI();

    showStoryBanner(
        "🍩 ¡Springfield necesita tu ayuda!",
        "Sr. Burns lidera el ataque con sus secuaces.<br>Coloca a <b>Homero</b> en una torre y defiende la ciudad.<br>¡Elimina Cozy para desbloquear nuevos personajes!",
        3000,
        ()=>startNextWave()
    );

    requestAnimationFrame(_gameLoop);
}

// ============================================================
//  8. GAME LOOP
//     Solo mueve Cozy y dispara torres.
//     El spawn ocurre en _scheduleNextSpawn() con setTimeout.
// ============================================================
function _gameLoop() {
    if (!gameRunning) return;

    // Mueve cada Cozy en la cola circular (quantum de tiempo)
    cozyQueue.updateAll(e => e.step());

    // Saca de la cola a los que murieron o llegaron al final
    cozyQueue.purge();

    // Disparo de torres
    for (const t of activeTowers) t.update(cozyQueue);

    // ¿Terminó la ola? → solo cuando el spawn acabó Y la cola está vacía
    if (waveActive && !spawning && cozyQueue.isEmpty()) {
        waveActive = false;
        if (currentWave < WAVE_DESIGNS.length) {
            // Espera antes de la siguiente ola
            setTimeout(startNextWave, 3000);
        }
        // Si era la final, gameWin() lo llama _die() de Flanders
    }

    requestAnimationFrame(_gameLoop);
}

// ============================================================
//  9. WAVES
// ============================================================
function startNextWave() {
    if (!gameRunning || currentWave >= WAVE_DESIGNS.length) return;

    const design = WAVE_DESIGNS[currentWave];
    currentWave++;

    // Escalado de dificultad
    const hpBonus  = (currentWave-1) * 8;
    const spdBonus = (currentWave-1) * 0.05;

    // Construir lista secuencial de Cozy
    const normalCozys = [];
    const bossCozys   = [];
    for (const entry of design.enemies) {
        for (let i=0; i<entry.count; i++) {
            const c = new Cozy(entry.key, hpBonus, spdBonus);
            c.type==="boss" ? bossCozys.push(c) : normalCozys.push(c);
        }
    }
    _shuffle(normalCozys);
    spawnList = [...normalCozys, ...bossCozys]; // jefes siempre al final

    waveHistory.push({ wave:currentWave, total:spawnList.length });
    spawnIdx  = 0;
    spawning  = true;
    waveActive= true;

    updateUI();
    showWaveBanner(currentWave, spawnList.length, !!design.isFinal, design.label);

    // Iniciar spawn uno a uno
    _scheduleNextSpawn();
}

// Spawn individual con intervalo — CORRECCIÓN DEL BUG PRINCIPAL
function _scheduleNextSpawn() {
    if (!gameRunning) return;

    if (spawnIdx >= spawnList.length) {
        spawning = false;    // ya no quedan Cozy por spawnear
        return;
    }

    const cozy = spawnList[spawnIdx++];
    cozyQueue.enqueue(cozy);
    cozy.spawn();

    // Intervalo entre spawns (se reduce con las olas, mínimo 400ms)
    const interval = Math.max(400, 950 - currentWave * 22);
    spawnTimerID = setTimeout(_scheduleNextSpawn, interval);
}

// ============================================================
//  10. CAMINO
// ============================================================
function _drawPath() {
    const map = document.getElementById("map");
    const T   = 38;
    for (let i=0; i<WAYPOINTS.length-1; i++) {
        const a=WAYPOINTS[i], b=WAYPOINTS[i+1];
        const seg=document.createElement("div");
        seg.style.cssText="position:absolute;background:#8B7355;z-index:1;";
        if (Math.abs(b.y-a.y)<2) {
            const x1=Math.min(a.x,b.x);
            seg.style.left=(x1)+"px"; seg.style.top=(a.y-T/2)+"px";
            seg.style.width=(Math.abs(b.x-a.x)+T)+"px"; seg.style.height=T+"px";
        } else {
            const y1=Math.min(a.y,b.y);
            seg.style.left=(a.x-T/2)+"px"; seg.style.top=y1+"px";
            seg.style.width=T+"px"; seg.style.height=(Math.abs(b.y-a.y)+T)+"px";
        }
        map.appendChild(seg);
    }
    // Inicio
   // --- MARCADOR DE INICIO (Flecha verde) ---
const s = document.createElement("div");
s.textContent = "▶";
// Ajustado para que la flecha esté centrada en el primer punto
s.style.cssText = `
    position: absolute;
    left: ${WAYPOINTS[0].x - 12}px; 
    top: ${WAYPOINTS[0].y - 18}px;
    z-index: 3;
    font-size: 24px;
    color: #22c55e;
    text-shadow: 0 0 10px #22c55e;
`;
map.appendChild(s);

// --- MARCADOR DE FIN (Casita) ---
const wN = WAYPOINTS[WAYPOINTS.length - 1];
const e = document.createElement("div");
e.textContent = "🏠";
// Cambiamos -52 por -15 para que no se vea desplazada
e.style.cssText = `
    position: absolute;
    left: ${wN.x - 70}px; 
    top: ${wN.y - 40}px;
    z-index: 10;
    font-size: 45px;
    filter: drop-shadow(0 0 10px gold);
`;
map.appendChild(e);
}
function reproducirVoz(personaje) {
    // Este objeto busca en la carpeta de cada personaje
    // Asegúrate de que los nombres de los archivos coincidan con los que tienes
    const sonidos = {
        'homero': 'sonidos/presencia.mp3',
        'lisa': 'sonidos/saxo.mp3',
        'marge': 'sonidos/murmullo.mp3',
        'bart': 'sonidos/aycaramba.mp3',
  'burns': 'sonidos/burns.mp3', 
        'nelson': 'sonidos/nelson.mp3',
        'milhouse': 'sonidos/milhouse.mp3',
        'kang': 'sonidos/alien.mp3',
        'kodos': 'sonidos/alien.mp3',
        
    };
      const rutaFinal = sonidos[personaje];     
if (rutaFinal) {
        const audio = new Audio(rutaFinal);
        audio.volume = 0.5;
        
        audio.play().then(() => {
            console.log("Reproduciendo: " + rutaFinal);
        }).catch(error => {
            console.error("No se pudo reproducir. Revisa si el nombre es exacto: " + rutaFinal);
        });
    } else {
        console.warn("No hay sonido asignado para: " + personaje);
    }
}

// ============================================================
//  11. COLOCACIÓN DE TORRES
// ============================================================
function _setupMapClick() {
    document.getElementById("map").addEventListener("click", (e) => {
        if (!placingMode || !gameRunning) return;
        const rect  = document.getElementById("mapContainer").getBoundingClientRect();
        const mx=e.clientX-rect.left, my=e.clientY-rect.top;
        const cellX = Math.floor(mx/60)*60, cellY = Math.floor(my/60)*60;
        const tx=cellX+30, ty=cellY+30, HALF=26;

        for (let i=0; i<WAYPOINTS.length-1; i++) {
            const a=WAYPOINTS[i], b=WAYPOINTS[i+1];
            if (Math.abs(b.y-a.y)<2) {
                const x1=Math.min(a.x,b.x), x2=Math.max(a.x,b.x);
                if (tx>=x1-HALF && tx<=x2+HALF && Math.abs(ty-a.y)<HALF+10) { showToast("🚫 No puedes colocar torres en el camino."); return; }
            } else {
                const y1=Math.min(a.y,b.y), y2=Math.max(a.y,b.y);
                if (ty>=y1-HALF && ty<=y2+HALF && Math.abs(tx-a.x)<HALF+10) { showToast("🚫 No puedes colocar torres en el camino."); return; }
            }
        }
        if (activeTowers.some(t=>Math.abs(t.x-tx)<55&&Math.abs(t.y-ty)<55)) { showToast("⚠️ Ya hay una torre aquí."); return; }

        const tower=new Tower(selectedType, tx, ty, cellX, cellY);
        tower.placeDOM();
        activeTowers.push(tower);
        towerHistory.push(tower);
        towerRedo=new Stack();
    reproducirVoz(selectedType);


        _exitPlacing();
    });
}

function _enterPlacing(typeKey) {
    if (!gameRunning) return;
    selectedType=typeKey; placingMode=true;
    document.getElementById("map").style.cursor="crosshair";
    const btn=document.getElementById("placeTowerBtn");
    btn.textContent=`✅ Colocando ${TOWER_CONFIG[typeKey].name} — click en el mapa`;
    btn.style.background="#22c55e"; btn.style.color="#000";
}

function _exitPlacing() {
    placingMode=false;
    document.getElementById("map").style.cursor="default";
    const btn=document.getElementById("placeTowerBtn");
    btn.textContent="🗼 Colocar Torre";
    btn.style.background=""; btn.style.color="";
}

// ============================================================
//  12. UNDO / REDO
// ============================================================
function undoTower() {
    if (towerHistory.isEmpty()) { showToast("⚠️ No hay torres para deshacer."); return; }
    const t=towerHistory.pop();
    t.removeDOM();
    activeTowers.splice(activeTowers.indexOf(t),1);
    towerRedo.push(t);
}

function redoTower() {
    if (towerRedo.isEmpty()) { showToast("⚠️ No hay acciones para rehacer."); return; }
    const t=towerRedo.pop();
    t.placeDOM();
    activeTowers.push(t);
    towerHistory.push(t);
}

// ============================================================
//  13. ESPECIAL BART
// ============================================================
function specialAttack() {
    if (!gameRunning || specialCD>0) return;
    for (const e of cozyQueue.getAll()) if (!e.isDead) e.takeDamage(9999);

    const vfx=document.createElement("div");
    vfx.style.cssText=`position:fixed;top:50%;left:50%;width:320px;height:320px;
        transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;z-index:9999;
        background:radial-gradient(circle,rgba(255,220,0,.95),rgba(255,80,0,.6) 50%,transparent 75%);
        animation:explodeVFX .65s ease forwards;`;
    document.body.appendChild(vfx);
    setTimeout(()=>vfx.remove(),750);

    specialCD=300;
    if (specialItvID) clearInterval(specialItvID);
    const btn=document.getElementById("specialBtn");
    specialItvID=setInterval(()=>{
        specialCD--;
        if (!btn) return;
        if (specialCD<=0) { clearInterval(specialItvID); btn.disabled=false; btn.textContent="💣 BART — BOMBA GLOBAL"; }
        else { btn.disabled=true; btn.textContent=`💣 BART — ${Math.ceil(specialCD/60)}s`; }
    }, 1000/60);
}

// ============================================================
//  14. DESBLOQUEOS
// ============================================================
function checkUnlocks() {
    let changed=false;
    for (const key of TOWER_TYPES) {
        if (!unlockedTowers.includes(key) && xp>=TOWER_CONFIG[key].unlockXP) {
            unlockedTowers.push(key);
            showUnlockMsg(key);
            if (key==="bart") _ensureSpecialBtn();
            changed=true;
        }
    }
    if (changed) updateTowerButtons();
}

function _ensureSpecialBtn() {
    if (document.getElementById("specialBtn")) return;
    const btn=document.createElement("button");
    btn.id="specialBtn"; btn.textContent="💣 BART — BOMBA GLOBAL"; btn.onclick=specialAttack;
    document.getElementById("controls").appendChild(btn);
}

// ============================================================
//  15. UI
// ============================================================
function updateUI() {
    const hp=Math.max(0,playerHealth);
    document.getElementById("playerHealth").textContent=`❤️ Salud: ${hp}`;
    document.getElementById("score").textContent=`⭐ Score: ${score}`;
    document.getElementById("xp").textContent=`📈 XP: ${xp}`;
    document.getElementById("currentWave").textContent=`🌊 Wave: ${currentWave} / ${WAVE_DESIGNS.length}`;
    const fill=document.getElementById("xpFill");
    if (fill) fill.style.width=Math.min(xp/1500*100,100)+"%";
}

function updateTowerButtons() {
    const c=document.getElementById("towerButtons");
    c.innerHTML="";
    for (const key of TOWER_TYPES) {
        const cfg=TOWER_CONFIG[key], ok=unlockedTowers.includes(key);
        const btn=document.createElement("button");
        btn.disabled=!ok; btn.title=cfg.desc;
        btn.textContent=ok
            ? `${cfg.icon} ${cfg.name} | 💥${cfg.damage} 📡${cfg.range}${cfg.slow?" ❄️":""}`
            : `🔒 ${cfg.name} — ${cfg.unlockXP} XP`;
        if (ok) btn.onclick=()=>_enterPlacing(key);
        c.appendChild(btn);
    }
}

// ============================================================
//  16. BANNERS Y MENSAJES
// ============================================================
function showWaveBanner(waveNum, count, isFinal, label) {
    const div=document.createElement("div");
    div.style.cssText=`position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%);
        background:rgba(0,0,0,0.91);border:2px solid gold;
        padding:22px 44px;border-radius:16px;text-align:center;
        z-index:8000;color:#fff;font-size:24px;font-weight:bold;pointer-events:none;`;
    div.innerHTML=isFinal
        ? `😈 <span style="color:gold">OLA FINAL</span><br>
           <span style="font-size:32px">DIABLO FLANDERS</span><br>
           <small style="font-size:13px;opacity:0.8">¡El jefe final se aproxima! ¡No lo dejes pasar!</small>`
        : `🌊 <span style="color:gold">OLA ${waveNum}</span> de ${WAVE_DESIGNS.length} — ${label}<br>
           <small style="font-size:13px;opacity:0.8">${count} Cozy en camino</small>`;
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 2400);
}

function showStoryBanner(title, body, duration, callback) {
    const div=document.createElement("div");
    div.style.cssText=`position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%);
        background:rgba(0,0,0,0.93);border:2px solid gold;
        padding:28px 52px;border-radius:18px;text-align:center;
        z-index:8000;color:#fff;max-width:460px;pointer-events:none;`;
    div.innerHTML=`<div style="font-size:22px;font-weight:bold;margin-bottom:10px">${title}</div>
                   <div style="font-size:15px;opacity:0.88;line-height:1.6">${body}</div>`;
    document.body.appendChild(div);
    setTimeout(()=>{ div.remove(); if (callback) callback(); }, duration);
}

function showUnlockMsg(key) {
    const cfg=TOWER_CONFIG[key];
    const stories={
        lisa: `Su saxofón hace más daño y alcanza más lejos. ¡Úsala contra alienígenas!`,
        marge:`Lanza a Maggie. Hace menos daño pero <b>ralentiza</b> a los Cozy un 55%.`,
        bart: `Torre normal <b>y</b> botón de bomba global disponible (cooldown 5s).`,
    };
    const div=document.createElement("div");
    div.style.cssText=`position:fixed;top:18px;right:18px;
        background:rgba(0,0,0,0.93);border:2px solid gold;
        padding:16px 22px;border-radius:14px;z-index:8500;
        color:#fff;text-align:center;min-width:220px;max-width:300px;
        font-size:14px;line-height:1.5;animation:slideInRight .4s ease;`;
    div.innerHTML=`<div style="font-size:17px;font-weight:bold;margin-bottom:6px">🎉 ¡DESBLOQUEADO!</div>
        <div style="font-size:28px">${cfg.icon}</div>
        <div style="font-weight:bold">${cfg.name}</div>
        <div style="margin-top:6px;font-size:13px">${stories[key]||""}</div>`;
    document.body.appendChild(div);
    setTimeout(()=>div.remove(), 4200);
}

function showToast(msg) {
    const div=document.createElement("div");
    div.style.cssText=`position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%);
        background:rgba(0,0,0,0.88);border:1px solid #666;
        padding:12px 28px;border-radius:10px;color:#fff;
        font-size:15px;font-weight:bold;z-index:9000;pointer-events:none;`;
    div.textContent=msg;
    document.body.appendChild(div);
    setTimeout(()=>div.remove(),1700);
}

function spawnDmgFloat(x,y,amount) {
    const div=document.createElement("div");
    div.textContent=amount>=9999?"💥 KO":`-${amount}`;
    div.style.cssText=`position:absolute;left:${x-14}px;top:${y-16}px;
        color:#fff;font-weight:bold;font-size:14px;z-index:50;
        pointer-events:none;text-shadow:1px 1px 2px #000;
        animation:dmgFloat .85s ease forwards;`;
    document.getElementById("enemies").appendChild(div);
    setTimeout(()=>div.remove(),900);
}

// ============================================================
//  17. GAME OVER / WIN
// ============================================================
function gameOver() {
    if (!gameRunning) return;
    gameRunning=false;
    clearTimeout(spawnTimerID);
    const div=document.createElement("div");
    div.style.cssText=`position:fixed;inset:0;background:rgba(0,0,0,0.88);
        display:flex;align-items:center;justify-content:center;z-index:9999;`;
    div.innerHTML=`<div style="background:#1a0000;border:3px solid #dc2626;
            border-radius:20px;padding:44px 64px;text-align:center;color:#fff;">
        <div style="font-size:52px;font-weight:bold;color:#dc2626">💀 GAME OVER 💀</div>
        <p style="margin:14px 0;opacity:0.75">Springfield no pudo resistir...</p>
        <p>⭐ Score: <b>${score}</b></p>
        <p>🌊 Ola alcanzada: <b>${currentWave}</b> de ${WAVE_DESIGNS.length}</p>
        <button onclick="location.reload()" style="margin-top:22px;padding:12px 44px;
            background:gold;color:#000;border:none;border-radius:50px;
            font-size:18px;font-weight:bold;cursor:pointer;">🔄 REINTENTAR</button>
        </div>`;
    document.body.appendChild(div);
}

function gameWin() {
    if (!gameRunning) return;
    gameRunning=false;
    clearTimeout(spawnTimerID);
    const div=document.createElement("div");
    div.style.cssText=`position:fixed;inset:0;background:rgba(0,0,0,0.88);
        display:flex;align-items:center;justify-content:center;z-index:9999;`;
    div.innerHTML=`<div style="background:#0d2b0d;border:3px solid gold;
            border-radius:20px;padding:44px 64px;text-align:center;color:#fff;">
        <div style="font-size:52px;font-weight:bold;color:gold">🏆 ¡VICTORIA! 🏆</div>
        <div style="font-size:28px;margin:10px 0">😈 ¡Diablo Flanders derrotado!</div>
        <p style="margin:10px 0;opacity:0.75">¡Springfield está a salvo gracias a los Simpson!</p>
        <p>⭐ Score Final: <b style="color:gold">${score}</b></p>
        <p>💪 Sobreviviste las ${WAVE_DESIGNS.length} olas</p>
        <button onclick="location.reload()" style="margin-top:22px;padding:12px 44px;
            background:gold;color:#000;border:none;border-radius:50px;
            font-size:18px;font-weight:bold;cursor:pointer;">🔄 JUGAR DE NUEVO</button>
        </div>`;
    document.body.appendChild(div);
}

// ============================================================
//  18. SETUP BOTONES
// ============================================================
function _setupButtons() {
    document.getElementById("placeTowerBtn").onclick=()=>{
        if (placingMode) _exitPlacing();
        else _enterPlacing(unlockedTowers[unlockedTowers.length-1]);
    };
    document.getElementById("undoBtn").onclick=undoTower;
    document.getElementById("redoBtn").onclick=redoTower;
    const sb=document.getElementById("specialBtn");
    if (sb) sb.onclick=specialAttack;
}

// ============================================================
//  19. CSS (inyectado)
// ============================================================
(function(){
    const s=document.createElement("style");
    s.textContent=`
        @keyframes explodeVFX {
            0%   { transform:translate(-50%,-50%) scale(0); opacity:1; }
            70%  { transform:translate(-50%,-50%) scale(1); opacity:.85; }
            100% { transform:translate(-50%,-50%) scale(1.4); opacity:0; }
        }
        @keyframes dmgFloat {
            0%   { transform:translateY(0); opacity:1; }
            100% { transform:translateY(-40px); opacity:0; }
        }
        @keyframes slideInRight {
            from { transform:translateX(110%); opacity:0; }
            to   { transform:translateX(0); opacity:1; }
        }
    `;
    document.head.appendChild(s);
})();

function _shuffle(arr){
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
}

window.initGame=initGame;