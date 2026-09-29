"use strict";
(() => {
  // src/config/settings.ts
  var CELL_SIZE = 60;
  var STARTING_HEALTH = 100;
  var XP_BAR_MAX = 1500;
  var QUEUE_CAPACITY = 200;
  var INTRO_BANNER_MS = 3e3;
  var WAVE_BREAK_MS = 3e3;
  var DIFFICULTY = { hpPerWave: 8, speedPerWave: 0.05 };
  var SPAWN_INTERVAL = { baseMs: 950, reductionPerWaveMs: 22, minMs: 400 };
  var LEAK_DAMAGE = { boss: 30, default: 15 };
  var SPECIAL_COOLDOWN_FRAMES = 300;
  var SPECIAL_DAMAGE = 9999;

  // src/config/waves.ts
  var WAVE_DESIGNS = [
    { label: "\xA1Burns ataca!", enemies: [{ key: "burns", count: 4 }] },
    { label: "Nelson entra al juego", enemies: [{ key: "burns", count: 4 }, { key: "nelson", count: 2 }] },
    { label: "\xA1Milhouse tambi\xE9n!", enemies: [{ key: "burns", count: 3 }, { key: "nelson", count: 3 }, { key: "milhouse", count: 2 }] },
    { label: "\u{1F47E} \xA1Invasi\xF3n alien\xEDgena!", enemies: [{ key: "burns", count: 3 }, { key: "milhouse", count: 2 }, { key: "kang", count: 2 }, { key: "kodos", count: 2 }] },
    { label: "El Director Skinner llega", enemies: [{ key: "nelson", count: 3 }, { key: "kang", count: 2 }, { key: "kodos", count: 2 }, { key: "skinner", count: 2 }] },
    { label: "M\xE1s alien\xEDgenas", enemies: [{ key: "milhouse", count: 3 }, { key: "kang", count: 3 }, { key: "skinner", count: 2 }] },
    { label: "Ataque masivo alien\xEDgena", enemies: [{ key: "kang", count: 3 }, { key: "kodos", count: 3 }, { key: "skinner", count: 3 }] },
    { label: "\xA1Todos juntos!", enemies: [{ key: "nelson", count: 4 }, { key: "kang", count: 3 }, { key: "kodos", count: 3 }, { key: "skinner", count: 2 }] },
    { label: "\u26A0\uFE0F El ej\xE9rcito final...", enemies: [{ key: "kang", count: 4 }, { key: "kodos", count: 4 }, { key: "skinner", count: 3 }] },
    { label: "\u{1F608} \xA1DIABLO FLANDERS!", enemies: [{ key: "burns", count: 3 }, { key: "skinner", count: 2 }, { key: "flanders", count: 1 }], isFinal: true }
  ];

  // src/game/CombatSystem.ts
  var CombatSystem = class {
    constructor(projectiles) {
      this.projectiles = projectiles;
    }
    update(towers, enemies) {
      for (const tower of towers) {
        const target = tower.update(enemies);
        if (!target) continue;
        const { damage, slow } = tower;
        this.projectiles.launch(tower, target, tower.projSrc, () => {
          if (!target.isDead) target.takeDamage(damage, slow);
        });
      }
    }
  };

  // src/structures/CircularQueue.ts
  var CircularQueue = class {
    constructor(capacity) {
      this.capacity = capacity;
      this.front = -1;
      this.rear = -1;
      this.count = 0;
      this.queue = new Array(capacity).fill(null);
    }
    get length() {
      return this.count;
    }
    isEmpty() {
      return this.count === 0;
    }
    isFull() {
      return this.count === this.capacity;
    }
    enqueue(item) {
      if (this.isFull()) return false;
      this.rear = (this.rear + 1) % this.capacity;
      this.queue[this.rear] = item;
      if (this.front === -1) this.front = this.rear;
      this.count++;
      return true;
    }
    dequeue() {
      if (this.isEmpty()) return null;
      const item = this.queue[this.front];
      this.queue[this.front] = null;
      this.front = (this.front + 1) % this.capacity;
      this.count--;
      if (this.isEmpty()) {
        this.front = -1;
        this.rear = -1;
      }
      return item;
    }
    forEach(callback) {
      this.toArray().forEach(callback);
    }
    /** Saca de la cola todos los elementos que cumplan el predicado. */
    removeWhere(predicate) {
      const kept = this.toArray().filter((item) => !predicate(item));
      this.queue = new Array(this.capacity).fill(null);
      this.front = -1;
      this.rear = -1;
      this.count = 0;
      for (const item of kept) this.enqueue(item);
    }
    toArray() {
      const result = [];
      let idx = this.front;
      for (let i = 0; i < this.count; i++) {
        result.push(this.queue[idx]);
        idx = (idx + 1) % this.capacity;
      }
      return result;
    }
  };

  // src/game/EnemyRoster.ts
  var EnemyRoster = class {
    constructor(capacity) {
      this.queue = new CircularQueue(capacity);
    }
    add(cozy) {
      return this.queue.enqueue(cozy);
    }
    get count() {
      return this.queue.length;
    }
    toArray() {
      return this.queue.toArray();
    }
    /** Quantum de tiempo: mueve un paso a cada enemigo activo. */
    stepAll(waypoints) {
      this.queue.forEach((e) => {
        if (!e.isDead && !e.reachedEnd) e.step(waypoints);
      });
    }
    /** Saca de la cola a los que murieron o llegaron al final. */
    purge() {
      this.queue.removeWhere((e) => e.isDead || e.reachedEnd);
    }
  };

  // src/config/towers.ts
  var TOWER_TYPES = ["homero", "lisa", "marge", "bart"];
  var TOWER_CONFIG = {
    homero: {
      name: "Homero",
      icon: "\u{1F369}",
      damage: 20,
      range: 110,
      delay: 45,
      slow: false,
      unlockXP: 0,
      sprite: "Personajes/Homero/HomerNormal.webm",
      projectile: "Personajes/Homero/DonaAvanzando.webm",
      desc: "Lanza donas. Perfecto para empezar."
    },
    lisa: {
      name: "Lisa",
      icon: "\u{1F3B7}",
      damage: 38,
      range: 155,
      delay: 33,
      slow: false,
      unlockXP: 500,
      sprite: "Personajes/Lisa/Lisa.webm",
      projectile: "Personajes/Lisa/Notas.webm",
      desc: "Saxof\xF3n. M\xE1s da\xF1o y mayor alcance.",
      unlockStory: "Su saxof\xF3n hace m\xE1s da\xF1o y alcanza m\xE1s lejos. \xA1\xDAsala contra alien\xEDgenas!"
    },
    marge: {
      name: "Marge",
      icon: "\u{1F476}",
      damage: 18,
      range: 125,
      delay: 38,
      slow: true,
      unlockXP: 1e3,
      sprite: "Personajes/Marge/Marge.webm",
      projectile: "Personajes/Marge/Maggie.webm",
      desc: "Lanza a Maggie. Ralentiza a los Cozy.",
      unlockStory: "Lanza a Maggie. Hace menos da\xF1o pero <b>ralentiza</b> a los Cozy un 55%."
    },
    bart: {
      name: "Bart",
      icon: "\u{1F4A3}",
      damage: 55,
      range: 135,
      delay: 44,
      slow: false,
      unlockXP: 1500,
      sprite: "Personajes/Bart/Bart.webm",
      projectile: "Personajes/Bart/BartExplotando.webm",
      desc: "Torre + bomba especial global.",
      unlockStory: "Torre normal <b>y</b> bot\xF3n de bomba global disponible (cooldown 5s)."
    }
  };

  // src/core/Emitter.ts
  var Emitter = class {
    constructor() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.handlers = /* @__PURE__ */ new Map();
    }
    on(event, handler) {
      const list = this.handlers.get(event) ?? [];
      list.push(handler);
      this.handlers.set(event, list);
    }
    emit(event, ...args) {
      this.handlers.get(event)?.forEach((h) => h(...args));
    }
  };

  // src/views/CozyView.ts
  var CozyView = class {
    constructor(cozy, layer, floats) {
      this.cozy = cozy;
      this.floats = floats;
      this.events = new Emitter();
      this.fallbackShown = false;
      const size = cozy.size;
      this.wrap = document.createElement("div");
      this.wrap.style.cssText = `
            position:absolute; pointer-events:none; z-index:8;
            left:${cozy.x - size / 2}px; top:${cozy.y - size / 2}px;
            width:${size}px;`;
      this.video = document.createElement("video");
      this.video.src = cozy.walkSrc;
      this.video.autoplay = true;
      this.video.loop = true;
      this.video.muted = true;
      this.video.width = size;
      this.video.height = size;
      this.video.style.display = "block";
      this.video.onerror = () => this.showFallback();
      const hpWrap = document.createElement("div");
      hpWrap.style.cssText = `width:${size}px;height:5px;margin-top:2px;
            background:rgba(0,0,0,0.5);border-radius:3px;overflow:hidden;`;
      this.hpBar = document.createElement("div");
      this.hpBar.style.cssText = `height:100%;width:100%;background:#22c55e;
            border-radius:3px;transition:width .1s;`;
      hpWrap.appendChild(this.hpBar);
      this.wrap.appendChild(this.video);
      this.wrap.appendChild(hpWrap);
      layer.appendChild(this.wrap);
      cozy.events.on("moved", () => this.syncPosition());
      cozy.events.on("damaged", (_c, amount) => this.showDamage(amount));
      cozy.events.on("died", () => this.playDeathAnimation());
      cozy.events.on("reachedEnd", () => this.remove());
    }
    syncPosition() {
      this.wrap.style.left = this.cozy.x - this.cozy.size / 2 + "px";
      this.wrap.style.top = this.cozy.y - this.cozy.size / 2 + "px";
    }
    showDamage(amount) {
      this.video.style.filter = "brightness(4) saturate(0)";
      setTimeout(() => {
        this.video.style.filter = "";
      }, 130);
      const pct = Math.max(0, this.cozy.hp / this.cozy.maxHp);
      this.hpBar.style.width = pct * 100 + "%";
      this.hpBar.style.background = pct > 0.6 ? "#22c55e" : pct > 0.3 ? "#f59e0b" : "#ef4444";
      this.floats.show(this.cozy.x, this.cozy.y, amount);
    }
    playDeathAnimation() {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        this.remove();
        this.events.emit("deathAnimationEnded", this.cozy);
      };
      this.video.src = this.cozy.dieSrc;
      this.video.loop = false;
      this.video.onended = finish;
      this.video.onerror = finish;
    }
    showFallback() {
      this.video.style.display = "none";
      if (this.fallbackShown) return;
      const size = this.cozy.size;
      const fb = document.createElement("div");
      fb.style.cssText = `
            width:${size}px; height:${size}px;
            background:rgba(200,60,60,0.85);
            border-radius:8px; border:2px solid #000;
            display:flex; align-items:center; justify-content:center;
            font-size:${Math.floor(size * 0.5)}px;`;
      fb.textContent = this.cozy.icon;
      this.wrap.insertBefore(fb, this.wrap.firstChild);
      this.fallbackShown = true;
    }
    remove() {
      this.wrap.remove();
    }
  };

  // src/game/Game.ts
  var Game = class {
    constructor(p) {
      this.p = p;
      this.running = true;
      p.waves.events.on("waveStarted", (info) => {
        p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);
        p.messages.showWaveBanner(info.waveNumber, p.waves.totalWaves, info.total, info.isFinal, info.label);
      });
      p.waves.events.on("cozySpawned", (cozy) => this.onCozySpawned(cozy));
    }
    start() {
      const p = this.p;
      p.mapView.clear();
      p.mapView.drawPath(p.path);
      p.panel.bind({
        onTogglePlace: () => p.placement.toggle(p.unlocks.latest),
        onUndo: () => p.placement.undo(),
        onRedo: () => p.placement.redo()
      });
      p.palette.render(p.unlocks.all);
      p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);
      p.messages.showStoryBanner(
        "\u{1F369} \xA1Springfield necesita tu ayuda!",
        "Sr. Burns lidera el ataque con sus secuaces.<br>Coloca a <b>Homero</b> en una torre y defiende la ciudad.<br>\xA1Elimina Cozy para desbloquear nuevos personajes!",
        INTRO_BANNER_MS,
        () => p.waves.startNextWave()
      );
      p.loop.start(() => this.update());
    }
    /** Botón de la bomba de Bart. */
    useSpecialAttack() {
      if (!this.running) return;
      this.p.special.trigger(this.p.enemies.toArray());
    }
    update() {
      const p = this.p;
      p.enemies.stepAll(p.path.waypoints);
      p.enemies.purge();
      p.combat.update(p.towers.towers, p.enemies.toArray());
      p.waves.update(p.enemies.count);
    }
    onCozySpawned(cozy) {
      const p = this.p;
      const view = new CozyView(cozy, p.mapView.enemiesEl, p.damageFloats);
      p.enemies.add(cozy);
      p.voice.play(cozy.cfgKey);
      cozy.events.on("died", (c) => this.onCozyDied(c));
      cozy.events.on("reachedEnd", (c) => this.onCozyReachedEnd(c));
      view.events.on("deathAnimationEnded", (c) => {
        if (c.cfgKey === "flanders") this.win();
      });
    }
    onCozyDied(cozy) {
      const p = this.p;
      p.player.addReward(cozy.reward);
      p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);
      const newlyUnlocked = p.unlocks.check(p.player.xp);
      for (const key of newlyUnlocked) {
        p.messages.showUnlock(TOWER_CONFIG[key]);
        if (key === "bart") p.specialView.ensureButton();
      }
      if (newlyUnlocked.length > 0) p.palette.render(p.unlocks.all);
    }
    onCozyReachedEnd(cozy) {
      const p = this.p;
      p.player.takeDamage(cozy.type === "boss" ? LEAK_DAMAGE.boss : LEAK_DAMAGE.default);
      p.hud.render(p.player, p.waves.currentWave, p.waves.totalWaves);
      if (p.player.isDead) this.gameOver();
    }
    stopEverything() {
      if (!this.running) return false;
      this.running = false;
      this.p.loop.stop();
      this.p.waves.stop();
      this.p.placement.setEnabled(false);
      return true;
    }
    gameOver() {
      if (!this.stopEverything()) return;
      this.p.endScreen.showGameOver(this.p.player.score, this.p.waves.currentWave, this.p.waves.totalWaves);
    }
    win() {
      if (!this.stopEverything()) return;
      this.p.endScreen.showVictory(this.p.player.score, this.p.waves.totalWaves);
    }
  };

  // src/game/GameLoop.ts
  var GameLoop = class {
    constructor() {
      this.running = false;
    }
    start(update) {
      this.running = true;
      const frame = () => {
        if (!this.running) return;
        update();
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
    stop() {
      this.running = false;
    }
  };

  // src/entities/Tower.ts
  var Tower = class {
    constructor(typeKey, x, y, cellX, cellY) {
      this.typeKey = typeKey;
      this.x = x;
      this.y = y;
      this.cellX = cellX;
      this.cellY = cellY;
      this.cooldown = 0;
      const c = TOWER_CONFIG[typeKey];
      this.name = c.name;
      this.icon = c.icon;
      this.damage = c.damage;
      this.range = c.range;
      this.delay = c.delay;
      this.slow = c.slow;
      this.spriteSrc = c.sprite;
      this.projSrc = c.projectile;
    }
    /** Un "tick" de juego. Devuelve el enemigo al que dispara, o null. */
    update(enemies) {
      if (this.cooldown > 0) {
        this.cooldown--;
        return null;
      }
      let target = null;
      let bestWP = -1;
      for (const e of enemies) {
        if (e.isDead || e.reachedEnd) continue;
        if (Math.hypot(e.x - this.x, e.y - this.y) <= this.range && e.wpIndex > bestWP) {
          target = e;
          bestWP = e.wpIndex;
        }
      }
      if (!target) return null;
      this.cooldown = this.delay;
      return target;
    }
  };

  // src/game/PlacementController.ts
  var PlacementController = class {
    constructor(map, panel, rules, roster, history, messages, voice) {
      this.map = map;
      this.panel = panel;
      this.rules = rules;
      this.roster = roster;
      this.history = history;
      this.messages = messages;
      this.voice = voice;
      this.placing = false;
      this.enabled = true;
      this.selected = "homero";
      map.onClick((mx, my) => this.handleMapClick(mx, my));
    }
    setEnabled(enabled) {
      this.enabled = enabled;
    }
    enter(type) {
      if (!this.enabled) return;
      this.selected = type;
      this.placing = true;
      this.map.setCursor("crosshair");
      this.panel.showPlacing(TOWER_CONFIG[type].name);
    }
    exit() {
      this.placing = false;
      this.map.setCursor("default");
      this.panel.showPlacing(null);
    }
    toggle(defaultType) {
      if (this.placing) this.exit();
      else this.enter(defaultType);
    }
    undo() {
      const tower = this.history.undo();
      if (!tower) {
        this.messages.showToast("\u26A0\uFE0F No hay torres para deshacer.");
        return;
      }
      this.roster.remove(tower);
    }
    redo() {
      const tower = this.history.redo();
      if (!tower) {
        this.messages.showToast("\u26A0\uFE0F No hay acciones para rehacer.");
        return;
      }
      this.roster.add(tower);
    }
    handleMapClick(mx, my) {
      if (!this.placing || !this.enabled) return;
      const cellX = Math.floor(mx / CELL_SIZE) * CELL_SIZE;
      const cellY = Math.floor(my / CELL_SIZE) * CELL_SIZE;
      const tx = cellX + CELL_SIZE / 2, ty = cellY + CELL_SIZE / 2;
      const verdict = this.rules.check(tx, ty, this.roster.towers);
      if (!verdict.ok) {
        this.messages.showToast(verdict.message);
        return;
      }
      const tower = new Tower(this.selected, tx, ty, cellX, cellY);
      this.roster.add(tower);
      this.history.record(tower);
      this.voice.play(this.selected);
      this.exit();
    }
  };

  // src/game/PlacementRules.ts
  var PlacementRules = class {
    constructor(path) {
      this.path = path;
    }
    check(x, y, towers) {
      if (this.path.isOnPath(x, y)) {
        return { ok: false, message: "\u{1F6AB} No puedes colocar torres en el camino." };
      }
      if (towers.some((t) => Math.abs(t.x - x) < 55 && Math.abs(t.y - y) < 55)) {
        return { ok: false, message: "\u26A0\uFE0F Ya hay una torre aqu\xED." };
      }
      return { ok: true };
    }
  };

  // src/game/PlayerState.ts
  var PlayerState = class {
    constructor() {
      this.health = STARTING_HEALTH;
      this.score = 0;
      this.xp = 0;
    }
    get isDead() {
      return this.health <= 0;
    }
    takeDamage(amount) {
      this.health -= amount;
    }
    addReward(amount) {
      this.score += amount;
      this.xp += amount;
    }
  };

  // src/game/SpecialAttack.ts
  var SpecialAttack = class {
    constructor() {
      this.events = new Emitter();
      this.cooldown = 0;
      this.timer = null;
    }
    get isReady() {
      return this.cooldown <= 0;
    }
    trigger(targets) {
      if (!this.isReady) return false;
      for (const e of targets) if (!e.isDead) e.takeDamage(SPECIAL_DAMAGE);
      this.events.emit("triggered");
      this.cooldown = SPECIAL_COOLDOWN_FRAMES;
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.cooldown--;
        if (this.cooldown <= 0) {
          if (this.timer) clearInterval(this.timer);
          this.events.emit("ready");
        } else {
          this.events.emit("cooldownTick", this.cooldown);
        }
      }, 1e3 / 60);
      return true;
    }
  };

  // src/structures/Stack.ts
  var Stack = class {
    constructor() {
      this.items = [];
    }
    push(item) {
      this.items.push(item);
    }
    pop() {
      return this.items.pop();
    }
    isEmpty() {
      return this.items.length === 0;
    }
    size() {
      return this.items.length;
    }
    clear() {
      this.items = [];
    }
  };

  // src/game/TowerHistory.ts
  var TowerHistory = class {
    constructor() {
      this.undoStack = new Stack();
      this.redoStack = new Stack();
    }
    record(tower) {
      this.undoStack.push(tower);
      this.redoStack.clear();
    }
    undo() {
      const t = this.undoStack.pop();
      if (!t) return null;
      this.redoStack.push(t);
      return t;
    }
    redo() {
      const t = this.redoStack.pop();
      if (!t) return null;
      this.undoStack.push(t);
      return t;
    }
  };

  // src/views/TowerView.ts
  var TowerView = class {
    constructor(tower, layer) {
      this.tower = tower;
      this.layer = layer;
      this.video = null;
      this.fallback = null;
    }
    show() {
      const t = this.tower;
      const vid = document.createElement("video");
      vid.src = t.spriteSrc;
      vid.autoplay = true;
      vid.loop = true;
      vid.muted = true;
      vid.width = 50;
      vid.height = 50;
      vid.style.cssText = `position:absolute;left:${t.cellX}px;top:${t.cellY}px;z-index:9;pointer-events:none;`;
      vid.onerror = () => {
        vid.style.display = "none";
        const fb = document.createElement("div");
        fb.style.cssText = `position:absolute;left:${t.cellX}px;top:${t.cellY}px;
                width:50px;height:50px;z-index:9;
                background:#f59e0b;border-radius:10px;border:2px solid #000;
                display:flex;align-items:center;justify-content:center;font-size:24px;`;
        fb.textContent = t.icon;
        this.layer.appendChild(fb);
        this.fallback = fb;
      };
      this.layer.appendChild(vid);
      this.video = vid;
    }
    hide() {
      this.video?.remove();
      this.fallback?.remove();
      this.video = null;
      this.fallback = null;
    }
  };

  // src/game/TowerRoster.ts
  var TowerRoster = class {
    constructor(layer) {
      this.layer = layer;
      this.list = [];
      this.views = /* @__PURE__ */ new Map();
    }
    get towers() {
      return this.list;
    }
    add(tower) {
      let view = this.views.get(tower);
      if (!view) {
        view = new TowerView(tower, this.layer);
        this.views.set(tower, view);
      }
      view.show();
      this.list.push(tower);
    }
    remove(tower) {
      this.views.get(tower)?.hide();
      const idx = this.list.indexOf(tower);
      if (idx >= 0) this.list.splice(idx, 1);
    }
  };

  // src/game/UnlockManager.ts
  var UnlockManager = class {
    constructor() {
      this.unlocked = ["homero"];
    }
    get all() {
      return this.unlocked;
    }
    get latest() {
      return this.unlocked[this.unlocked.length - 1];
    }
    /** Devuelve las torres que se acaban de desbloquear con este XP. */
    check(xp) {
      const newly = [];
      for (const key of TOWER_TYPES) {
        if (!this.unlocked.includes(key) && xp >= TOWER_CONFIG[key].unlockXP) {
          this.unlocked.push(key);
          newly.push(key);
        }
      }
      return newly;
    }
  };

  // src/config/enemies.ts
  var COZY_CONFIG = {
    burns: {
      name: "Sr. Burns",
      icon: "\u{1F9D3}",
      hp: 80,
      speed: 1.2,
      reward: 100,
      type: "normal",
      size: 44,
      walk: "Personajes/Burns/BurnsCaminando.webm",
      die: "Personajes/Burns/BurnsMuriendo.webm"
    },
    nelson: {
      name: "Nelson",
      icon: "\u{1F624}",
      hp: 110,
      speed: 1.8,
      reward: 150,
      type: "normal",
      size: 44,
      walk: "Personajes/Milhouse-Nelson/NelsonCaminando.webm",
      die: "Personajes/Milhouse-Nelson/Nelson.webm"
    },
    milhouse: {
      name: "Milhouse",
      icon: "\u{1F913}",
      hp: 95,
      speed: 1.6,
      reward: 130,
      type: "normal",
      size: 44,
      walk: "Personajes/Milhouse-Nelson/milhouse.webm",
      die: "Personajes/Milhouse-Nelson/MilhouseParado.webm"
    },
    kang: {
      name: "Kang",
      icon: "\u{1F47D}",
      hp: 160,
      speed: 2,
      reward: 200,
      type: "alien",
      size: 50,
      walk: "Personajes/Kang y Kodos/KangYKodos.webm",
      die: "Personajes/Kang y Kodos/KangYKodosMuriendo.webm"
    },
    kodos: {
      name: "Kodos",
      icon: "\u{1F47D}",
      hp: 200,
      speed: 4,
      reward: 200,
      type: "alien",
      size: 50,
      walk: "Personajes/Kang y Kodos/KangYKodos.webm",
      die: "Personajes/Kang y Kodos/KangYKodosMuriendo.webm"
    },
    skinner: {
      name: "Dir. Skinner",
      icon: "\u{1F454}",
      hp: 220,
      speed: 1,
      reward: 250,
      type: "strong",
      size: 50,
      walk: "Personajes/Skinner/SkinnerCaminando.webm",
      die: "Personajes/Skinner/SkinnerCaida.webm"
    },
    flanders: {
      name: "DIABLO FLANDERS",
      icon: "\u{1F608}",
      hp: 2e3,
      speed: 1.1,
      reward: 5e3,
      type: "boss",
      size: 70,
      walk: "Personajes/Flanders/FlandersEntrada.webm",
      die: "Personajes/Flanders/FlandersMuriendo.webm"
    }
  };

  // src/entities/Cozy.ts
  var Cozy = class {
    constructor(cfgKey, hpBonus, speedBonus, spawnPoint) {
      this.cfgKey = cfgKey;
      this.events = new Emitter();
      this.wpIndex = 1;
      this.isDead = false;
      this.reachedEnd = false;
      this.slowed = false;
      this.slowTick = 0;
      const c = COZY_CONFIG[cfgKey];
      this.name = c.name;
      this.icon = c.icon;
      this.hp = c.hp + hpBonus;
      this.maxHp = this.hp;
      this.speed = c.speed + speedBonus;
      this.reward = c.reward;
      this.type = c.type;
      this.size = c.size;
      this.walkSrc = c.walk;
      this.dieSrc = c.die;
      this.x = spawnPoint.x;
      this.y = spawnPoint.y;
    }
    /** Mueve al enemigo un paso hacia el siguiente waypoint. */
    step(waypoints) {
      if (this.wpIndex >= waypoints.length) {
        if (!this.reachedEnd) {
          this.reachedEnd = true;
          this.events.emit("reachedEnd", this);
        }
        return;
      }
      const t = waypoints[this.wpIndex];
      const dx = t.x - this.x, dy = t.y - this.y;
      const dist = Math.hypot(dx, dy);
      const spd = this.slowed ? this.speed * 0.45 : this.speed;
      if (dist <= spd) {
        this.x = t.x;
        this.y = t.y;
        this.wpIndex++;
      } else {
        const a = Math.atan2(dy, dx);
        this.x += Math.cos(a) * spd;
        this.y += Math.sin(a) * spd;
      }
      this.events.emit("moved", this);
      if (this.slowTick > 0 && --this.slowTick === 0) this.slowed = false;
    }
    takeDamage(amount, slow = false) {
      if (this.isDead) return;
      this.hp -= amount;
      if (slow) {
        this.slowed = true;
        this.slowTick = 130;
      }
      this.events.emit("damaged", this, amount);
      if (this.hp <= 0) {
        this.isDead = true;
        this.events.emit("died", this);
      }
    }
  };

  // src/game/WaveManager.ts
  var WaveManager = class {
    constructor(designs, path) {
      this.designs = designs;
      this.path = path;
      this.events = new Emitter();
      this.currentWave = 0;
      this.history = [];
      this.spawning = false;
      this.waveActive = false;
      this.spawnList = [];
      this.spawnIdx = 0;
      this.spawnTimer = null;
      this.nextWaveTimer = null;
      this.running = true;
    }
    get totalWaves() {
      return this.designs.length;
    }
    startNextWave() {
      if (!this.running || this.currentWave >= this.designs.length) return;
      const design = this.designs[this.currentWave];
      this.currentWave++;
      const hpBonus = (this.currentWave - 1) * DIFFICULTY.hpPerWave;
      const spdBonus = (this.currentWave - 1) * DIFFICULTY.speedPerWave;
      const normal = [];
      const bosses = [];
      for (const entry of design.enemies) {
        for (let i = 0; i < entry.count; i++) {
          const c = new Cozy(entry.key, hpBonus, spdBonus, this.path.start);
          (c.type === "boss" ? bosses : normal).push(c);
        }
      }
      this.shuffle(normal);
      this.spawnList = [...normal, ...bosses];
      this.history.push({ wave: this.currentWave, total: this.spawnList.length });
      this.spawnIdx = 0;
      this.spawning = true;
      this.waveActive = true;
      this.events.emit("waveStarted", {
        waveNumber: this.currentWave,
        total: this.spawnList.length,
        isFinal: !!design.isFinal,
        label: design.label
      });
      this.spawnNext();
    }
    /** Se llama en cada frame con la cantidad de enemigos vivos. */
    update(activeEnemies) {
      if (this.waveActive && !this.spawning && activeEnemies === 0) {
        this.waveActive = false;
        if (this.currentWave < this.designs.length) {
          this.nextWaveTimer = setTimeout(() => this.startNextWave(), WAVE_BREAK_MS);
        }
      }
    }
    stop() {
      this.running = false;
      if (this.spawnTimer) clearTimeout(this.spawnTimer);
      if (this.nextWaveTimer) clearTimeout(this.nextWaveTimer);
    }
    spawnNext() {
      if (!this.running) return;
      if (this.spawnIdx >= this.spawnList.length) {
        this.spawning = false;
        return;
      }
      this.events.emit("cozySpawned", this.spawnList[this.spawnIdx++]);
      const interval = Math.max(
        SPAWN_INTERVAL.minMs,
        SPAWN_INTERVAL.baseMs - this.currentWave * SPAWN_INTERVAL.reductionPerWaveMs
      );
      this.spawnTimer = setTimeout(() => this.spawnNext(), interval);
    }
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  };

  // src/map/PathMap.ts
  var PathMap = class {
    constructor(width, height) {
      this.waypoints = [
        { x: -30, y: height * 0.18 },
        { x: width * 0.28, y: height * 0.18 },
        { x: width * 0.28, y: height * 0.5 },
        { x: width * 0.65, y: height * 0.5 },
        { x: width * 0.65, y: height * 0.82 },
        { x: width + 30, y: height * 0.82 }
      ];
    }
    get start() {
      return this.waypoints[0];
    }
    get end() {
      return this.waypoints[this.waypoints.length - 1];
    }
    isOnPath(x, y, half = 26) {
      for (let i = 0; i < this.waypoints.length - 1; i++) {
        const a = this.waypoints[i], b = this.waypoints[i + 1];
        if (Math.abs(b.y - a.y) < 2) {
          const x1 = Math.min(a.x, b.x), x2 = Math.max(a.x, b.x);
          if (x >= x1 - half && x <= x2 + half && Math.abs(y - a.y) < half + 10) return true;
        } else {
          const y1 = Math.min(a.y, b.y), y2 = Math.max(a.y, b.y);
          if (y >= y1 - half && y <= y2 + half && Math.abs(x - a.x) < half + 10) return true;
        }
      }
      return false;
    }
  };

  // src/config/voices.ts
  var VOICE_FILES = {
    homero: "sonidos/presencia.mp3",
    lisa: "sonidos/saxo.mp3",
    marge: "sonidos/murmullo.mp3",
    bart: "sonidos/aycaramba.mp3",
    burns: "sonidos/burns.mp3",
    nelson: "sonidos/nelson.mp3",
    milhouse: "sonidos/milhouse.mp3",
    kang: "sonidos/alien.mp3",
    kodos: "sonidos/alien.mp3"
  };

  // src/services/VoiceService.ts
  var VoiceService = class {
    play(character) {
      const file = VOICE_FILES[character];
      if (!file) {
        console.warn("No hay sonido asignado para: " + character);
        return;
      }
      const audio = new Audio(file);
      audio.volume = 0.5;
      audio.play().catch(() => {
        console.error("No se pudo reproducir. Revisa si el nombre es exacto: " + file);
      });
    }
  };

  // src/ui/ControlPanel.ts
  var ControlPanel = class {
    constructor() {
      this.placeBtn = document.getElementById("placeTowerBtn");
      this.undoBtn = document.getElementById("undoBtn");
      this.redoBtn = document.getElementById("redoBtn");
    }
    bind(handlers) {
      this.placeBtn.onclick = handlers.onTogglePlace;
      this.undoBtn.onclick = handlers.onUndo;
      this.redoBtn.onclick = handlers.onRedo;
    }
    /** Pasa el nombre de la torre que se está colocando, o null para el estado normal. */
    showPlacing(towerName) {
      if (towerName) {
        this.placeBtn.textContent = `\u2705 Colocando ${towerName} \u2014 click en el mapa`;
        this.placeBtn.style.background = "#22c55e";
        this.placeBtn.style.color = "#000";
      } else {
        this.placeBtn.textContent = "\u{1F5FC} Colocar Torre";
        this.placeBtn.style.background = "";
        this.placeBtn.style.color = "";
      }
    }
  };

  // src/ui/EndScreen.ts
  var EndScreen = class {
    showGameOver(score, wave, totalWaves) {
      this.show(`<div style="background:#1a0000;border:3px solid #dc2626;
                border-radius:20px;padding:44px 64px;text-align:center;color:#fff;">
            <div style="font-size:52px;font-weight:bold;color:#dc2626">\u{1F480} GAME OVER \u{1F480}</div>
            <p style="margin:14px 0;opacity:0.75">Springfield no pudo resistir...</p>
            <p>\u2B50 Score: <b>${score}</b></p>
            <p>\u{1F30A} Ola alcanzada: <b>${wave}</b> de ${totalWaves}</p>
            <button id="retryBtn" style="margin-top:22px;padding:12px 44px;
                background:gold;color:#000;border:none;border-radius:50px;
                font-size:18px;font-weight:bold;cursor:pointer;">\u{1F504} REINTENTAR</button>
            </div>`);
    }
    showVictory(score, totalWaves) {
      this.show(`<div style="background:#0d2b0d;border:3px solid gold;
                border-radius:20px;padding:44px 64px;text-align:center;color:#fff;">
            <div style="font-size:52px;font-weight:bold;color:gold">\u{1F3C6} \xA1VICTORIA! \u{1F3C6}</div>
            <div style="font-size:28px;margin:10px 0">\u{1F608} \xA1Diablo Flanders derrotado!</div>
            <p style="margin:10px 0;opacity:0.75">\xA1Springfield est\xE1 a salvo gracias a los Simpson!</p>
            <p>\u2B50 Score Final: <b style="color:gold">${score}</b></p>
            <p>\u{1F4AA} Sobreviviste las ${totalWaves} olas</p>
            <button id="retryBtn" style="margin-top:22px;padding:12px 44px;
                background:gold;color:#000;border:none;border-radius:50px;
                font-size:18px;font-weight:bold;cursor:pointer;">\u{1F504} JUGAR DE NUEVO</button>
            </div>`);
    }
    show(innerHtml) {
      const overlay = document.createElement("div");
      overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,0.88);
            display:flex;align-items:center;justify-content:center;z-index:9999;`;
      overlay.innerHTML = innerHtml;
      document.body.appendChild(overlay);
      overlay.querySelector("#retryBtn")?.addEventListener("click", () => location.reload());
    }
  };

  // src/ui/Hud.ts
  var Hud = class {
    constructor() {
      this.health = document.getElementById("playerHealth");
      this.wave = document.getElementById("currentWave");
      this.score = document.getElementById("score");
      this.xp = document.getElementById("xp");
      this.xpFill = document.getElementById("xpFill");
    }
    render(player, currentWave, totalWaves) {
      this.health.textContent = `\u2764\uFE0F Salud: ${Math.max(0, player.health)}`;
      this.score.textContent = `\u2B50 Score: ${player.score}`;
      this.xp.textContent = `\u{1F4C8} XP: ${player.xp}`;
      this.wave.textContent = `\u{1F30A} Wave: ${currentWave} / ${totalWaves}`;
      if (this.xpFill) this.xpFill.style.width = Math.min(player.xp / XP_BAR_MAX * 100, 100) + "%";
    }
  };

  // src/ui/MessageBoard.ts
  var MessageBoard = class {
    showToast(msg) {
      const div = document.createElement("div");
      div.style.cssText = `position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:rgba(0,0,0,0.88);border:1px solid #666;
            padding:12px 28px;border-radius:10px;color:#fff;
            font-size:15px;font-weight:bold;z-index:9000;pointer-events:none;`;
      div.textContent = msg;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 1700);
    }
    showWaveBanner(waveNum, totalWaves, count, isFinal, label) {
      const div = document.createElement("div");
      div.style.cssText = `position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:rgba(0,0,0,0.91);border:2px solid gold;
            padding:22px 44px;border-radius:16px;text-align:center;
            z-index:8000;color:#fff;font-size:24px;font-weight:bold;pointer-events:none;`;
      div.innerHTML = isFinal ? `\u{1F608} <span style="color:gold">OLA FINAL</span><br>
               <span style="font-size:32px">DIABLO FLANDERS</span><br>
               <small style="font-size:13px;opacity:0.8">\xA1El jefe final se aproxima! \xA1No lo dejes pasar!</small>` : `\u{1F30A} <span style="color:gold">OLA ${waveNum}</span> de ${totalWaves} \u2014 ${label}<br>
               <small style="font-size:13px;opacity:0.8">${count} Cozy en camino</small>`;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 2400);
    }
    showStoryBanner(title, body, duration, callback) {
      const div = document.createElement("div");
      div.style.cssText = `position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:rgba(0,0,0,0.93);border:2px solid gold;
            padding:28px 52px;border-radius:18px;text-align:center;
            z-index:8000;color:#fff;max-width:460px;pointer-events:none;`;
      div.innerHTML = `<div style="font-size:22px;font-weight:bold;margin-bottom:10px">${title}</div>
                         <div style="font-size:15px;opacity:0.88;line-height:1.6">${body}</div>`;
      document.body.appendChild(div);
      setTimeout(() => {
        div.remove();
        callback?.();
      }, duration);
    }
    showUnlock(cfg) {
      const div = document.createElement("div");
      div.style.cssText = `position:fixed;top:18px;right:18px;
            background:rgba(0,0,0,0.93);border:2px solid gold;
            padding:16px 22px;border-radius:14px;z-index:8500;
            color:#fff;text-align:center;min-width:220px;max-width:300px;
            font-size:14px;line-height:1.5;animation:slideInRight .4s ease;`;
      div.innerHTML = `<div style="font-size:17px;font-weight:bold;margin-bottom:6px">\u{1F389} \xA1DESBLOQUEADO!</div>
            <div style="font-size:28px">${cfg.icon}</div>
            <div style="font-weight:bold">${cfg.name}</div>
            <div style="margin-top:6px;font-size:13px">${cfg.unlockStory ?? ""}</div>`;
      document.body.appendChild(div);
      setTimeout(() => div.remove(), 4200);
    }
  };

  // src/ui/SpecialAttackView.ts
  var SpecialAttackView = class {
    constructor(special, onClick) {
      this.onClick = onClick;
      this.button = null;
      special.events.on("triggered", () => this.playExplosion());
      special.events.on("cooldownTick", (frames) => {
        if (!this.button) return;
        this.button.disabled = true;
        this.button.textContent = `\u{1F4A3} BART \u2014 ${Math.ceil(frames / 60)}s`;
      });
      special.events.on("ready", () => {
        if (!this.button) return;
        this.button.disabled = false;
        this.button.textContent = "\u{1F4A3} BART \u2014 BOMBA GLOBAL";
      });
    }
    ensureButton() {
      if (document.getElementById("specialBtn")) return;
      const btn = document.createElement("button");
      btn.id = "specialBtn";
      btn.textContent = "\u{1F4A3} BART \u2014 BOMBA GLOBAL";
      btn.onclick = this.onClick;
      document.getElementById("controls")?.appendChild(btn);
      this.button = btn;
    }
    playExplosion() {
      const vfx = document.createElement("div");
      vfx.style.cssText = `position:fixed;top:50%;left:50%;width:320px;height:320px;
            transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;z-index:9999;
            background:radial-gradient(circle,rgba(255,220,0,.95),rgba(255,80,0,.6) 50%,transparent 75%);
            animation:explodeVFX .65s ease forwards;`;
      document.body.appendChild(vfx);
      setTimeout(() => vfx.remove(), 750);
    }
  };

  // src/ui/TowerPalette.ts
  var TowerPalette = class {
    constructor(onSelect) {
      this.onSelect = onSelect;
      this.container = document.getElementById("towerButtons");
    }
    render(unlocked) {
      this.container.innerHTML = "";
      for (const key of TOWER_TYPES) {
        const cfg = TOWER_CONFIG[key];
        const ok = unlocked.includes(key);
        const btn = document.createElement("button");
        btn.disabled = !ok;
        btn.title = cfg.desc;
        btn.textContent = ok ? `${cfg.icon} ${cfg.name} | \u{1F4A5}${cfg.damage} \u{1F4E1}${cfg.range}${cfg.slow ? " \u2744\uFE0F" : ""}` : `\u{1F512} ${cfg.name} \u2014 ${cfg.unlockXP} XP`;
        if (ok) btn.onclick = () => this.onSelect(key);
        this.container.appendChild(btn);
      }
    }
  };

  // src/views/DamageFloatView.ts
  var DamageFloatView = class {
    constructor(layer) {
      this.layer = layer;
    }
    show(x, y, amount) {
      const div = document.createElement("div");
      div.textContent = amount >= 9999 ? "\u{1F4A5} KO" : `-${amount}`;
      div.style.cssText = `position:absolute;left:${x - 14}px;top:${y - 16}px;
            color:#fff;font-weight:bold;font-size:14px;z-index:50;
            pointer-events:none;text-shadow:1px 1px 2px #000;
            animation:dmgFloat .85s ease forwards;`;
      this.layer.appendChild(div);
      setTimeout(() => div.remove(), 900);
    }
  };

  // src/views/MapView.ts
  var MapView = class {
    constructor() {
      this.mapEl = document.getElementById("map");
      this.enemiesEl = document.getElementById("enemies");
      this.container = document.getElementById("mapContainer");
    }
    get width() {
      return this.container.offsetWidth || 800;
    }
    get height() {
      return this.container.offsetHeight || 500;
    }
    clear() {
      this.mapEl.innerHTML = "";
      this.enemiesEl.innerHTML = "";
    }
    drawPath(path) {
      const T = 38;
      const wp = path.waypoints;
      for (let i = 0; i < wp.length - 1; i++) {
        const a = wp[i], b = wp[i + 1];
        const seg = document.createElement("div");
        seg.style.cssText = "position:absolute;background:#8B7355;z-index:1;";
        if (Math.abs(b.y - a.y) < 2) {
          seg.style.left = Math.min(a.x, b.x) + "px";
          seg.style.top = a.y - T / 2 + "px";
          seg.style.width = Math.abs(b.x - a.x) + T + "px";
          seg.style.height = T + "px";
        } else {
          seg.style.left = a.x - T / 2 + "px";
          seg.style.top = Math.min(a.y, b.y) + "px";
          seg.style.width = T + "px";
          seg.style.height = Math.abs(b.y - a.y) + T + "px";
        }
        this.mapEl.appendChild(seg);
      }
      const start = document.createElement("div");
      start.textContent = "\u25B6";
      start.style.cssText = `position:absolute;left:${path.start.x - 12}px;top:${path.start.y - 18}px;
            z-index:3;font-size:24px;color:#22c55e;text-shadow:0 0 10px #22c55e;`;
      this.mapEl.appendChild(start);
      const end = document.createElement("div");
      end.textContent = "\u{1F3E0}";
      end.style.cssText = `position:absolute;left:${path.end.x - 70}px;top:${path.end.y - 40}px;
            z-index:10;font-size:45px;filter:drop-shadow(0 0 10px gold);`;
      this.mapEl.appendChild(end);
    }
    /** Entrega las coordenadas del click relativas al contenedor del mapa. */
    onClick(handler) {
      this.mapEl.addEventListener("click", (e) => {
        const rect = this.container.getBoundingClientRect();
        handler(e.clientX - rect.left, e.clientY - rect.top);
      });
    }
    setCursor(cursor) {
      this.mapEl.style.cursor = cursor;
    }
  };

  // src/views/ProjectileView.ts
  var ProjectileView = class {
    constructor(layer) {
      this.layer = layer;
    }
    launch(from, target, src, onArrive) {
      const proj = document.createElement("video");
      proj.src = src;
      proj.autoplay = true;
      proj.loop = false;
      proj.muted = true;
      proj.style.cssText = `position:absolute;width:22px;height:22px;
            left:${from.x - 11}px;top:${from.y - 11}px;z-index:20;pointer-events:none;`;
      proj.onerror = () => {
      };
      this.layer.appendChild(proj);
      let t = 0;
      const id = setInterval(() => {
        t += 0.11;
        if (t >= 1) {
          clearInterval(id);
          proj.remove();
          onArrive();
        } else {
          proj.style.left = from.x + (target.x - from.x) * t - 11 + "px";
          proj.style.top = from.y + (target.y - from.y) * t - 11 + "px";
        }
      }, 25);
    }
  };

  // src/main.ts
  function bootstrap() {
    const mapView = new MapView();
    const path = new PathMap(mapView.width, mapView.height);
    const player = new PlayerState();
    const unlocks = new UnlockManager();
    const enemies = new EnemyRoster(QUEUE_CAPACITY);
    const towers = new TowerRoster(mapView.mapEl);
    const waves = new WaveManager(WAVE_DESIGNS, path);
    const special = new SpecialAttack();
    const voice = new VoiceService();
    const messages = new MessageBoard();
    const panel = new ControlPanel();
    const placement = new PlacementController(
      mapView,
      panel,
      new PlacementRules(path),
      towers,
      new TowerHistory(),
      messages,
      voice
    );
    const palette = new TowerPalette((key) => placement.enter(key));
    let game;
    const specialView = new SpecialAttackView(special, () => game.useSpecialAttack());
    game = new Game({
      path,
      player,
      unlocks,
      enemies,
      towers,
      waves,
      special,
      placement,
      voice,
      mapView,
      panel,
      messages,
      combat: new CombatSystem(new ProjectileView(mapView.mapEl)),
      loop: new GameLoop(),
      damageFloats: new DamageFloatView(mapView.enemiesEl),
      hud: new Hud(),
      palette,
      endScreen: new EndScreen(),
      specialView
    });
    game.start();
  }
  window.addEventListener("load", bootstrap);
})();
