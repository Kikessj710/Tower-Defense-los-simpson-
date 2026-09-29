/** Pantalla de inicio: música de fondo y paso al juego con la tecla SPACE. */
class LoginScreen {
    private readonly music = new Audio("sonidos/The Simpsons Theme.mp3");
    private readonly startSound = new Audio("sonidos/intro.mp3");

    init(): void {
        this.music.loop = true;
        this.music.play().catch(() => { /* el navegador puede bloquear el autoplay */ });
        document.addEventListener("keydown", (e) => {
            if (e.code === "Space") this.startGame();
        });
    }

    private startGame(): void {
        this.music.pause();
        this.startSound.play().catch(() => {});
        setTimeout(() => { window.location.href = "game.html"; }, 500);
    }
}

window.addEventListener("load", () => new LoginScreen().init());
