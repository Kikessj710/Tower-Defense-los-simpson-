// 🔊 SONIDOS
let loginMusic = new Audio("sonidos/The Simpsons Theme.mp3"); // música de fondo
let startSound = new Audio("sonidos/intro.mp3"); // sonido al presionar SPACE

// reproducir música al cargar
window.onload = () => {
    loginMusic.loop = true;
    loginMusic.play();
};

// 🎮 DETECTAR SPACE para ir al juego
document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        startGame();
    }
});

function startGame() {
    // parar música de login y reproducir sonido
    loginMusic.pause();
    startSound.play();

    // esperar un momento para que suene el efecto antes de cambiar de página
    setTimeout(() => {
        window.location.href = "game.html"; // <- aquí va tu página del juego
    }, 500); // medio segundo de delay
}