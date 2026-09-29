import { QUEUE_CAPACITY } from "./config/settings";
import { WAVE_DESIGNS } from "./config/waves";
import { CombatSystem } from "./game/CombatSystem";
import { EnemyRoster } from "./game/EnemyRoster";
import { Game } from "./game/Game";
import { GameLoop } from "./game/GameLoop";
import { PlacementController } from "./game/PlacementController";
import { PlacementRules } from "./game/PlacementRules";
import { PlayerState } from "./game/PlayerState";
import { SpecialAttack } from "./game/SpecialAttack";
import { TowerHistory } from "./game/TowerHistory";
import { TowerRoster } from "./game/TowerRoster";
import { UnlockManager } from "./game/UnlockManager";
import { WaveManager } from "./game/WaveManager";
import { PathMap } from "./map/PathMap";
import { VoiceService } from "./services/VoiceService";
import { ControlPanel } from "./ui/ControlPanel";
import { EndScreen } from "./ui/EndScreen";
import { Hud } from "./ui/Hud";
import { MessageBoard } from "./ui/MessageBoard";
import { SpecialAttackView } from "./ui/SpecialAttackView";
import { TowerPalette } from "./ui/TowerPalette";
import { DamageFloatView } from "./views/DamageFloatView";
import { MapView } from "./views/MapView";
import { ProjectileView } from "./views/ProjectileView";

/**
 * COMPOSITION ROOT: el único lugar donde se crean (new) las piezas y se conectan.
 * Reemplaza a initGame() y a las variables globales del game.js original.
 */
function bootstrap(): void {
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
        mapView, panel, new PlacementRules(path), towers, new TowerHistory(), messages, voice,
    );
    const palette = new TowerPalette((key) => placement.enter(key));

    let game: Game;
    const specialView = new SpecialAttackView(special, () => game.useSpecialAttack());

    game = new Game({
        path, player, unlocks, enemies, towers, waves, special, placement, voice, mapView, panel, messages,
        combat: new CombatSystem(new ProjectileView(mapView.mapEl)),
        loop: new GameLoop(),
        damageFloats: new DamageFloatView(mapView.enemiesEl),
        hud: new Hud(),
        palette,
        endScreen: new EndScreen(),
        specialView,
    });
    game.start();
}

window.addEventListener("load", bootstrap);
