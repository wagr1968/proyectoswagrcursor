// ========================================
// JUEGO DE LA CULEBRITA (SNAKE GAME)
// ========================================

// Variables globales del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const countdownElement = document.getElementById('countdown');

// Configuración del juego
const GRID_SIZE = 20; // Tamaño de cada celda del tablero
const CANVAS_SIZE = 400;
const GAME_SPEED = 100; // Velocidad en milisegundos

// Variables del estado del juego
let snake = [{ x: 200, y: 200 }]; // Posición inicial de la serpiente
let direction = { x: 0, y: 0 }; // Dirección actual (inicialmente parada)
let food = { x: 0, y: 0 }; // Posición de la comida
let score = 0; // Puntuación actual
let gameRunning = false; // Estado del juego
let gameLoop; // Referencia al bucle del juego

// Sistema de colores neon para la serpiente
const snakeColors = [
    '#00ffff', // Cyan brillante
    '#ff00ff', // Magenta
    '#ffff00', // Amarillo
    '#00ff00', // Verde
    '#ff6600', // Naranja
    '#ff0066', // Rosa
    '#6600ff', // Púrpura
    '#00ff66', // Verde lima
    '#ff3366', // Rosa coral
    '#33ffcc', // Turquesa
    '#ffcc00', // Dorado
    '#cc00ff'  // Violeta
];
let currentColorIndex = 0; // Índice del color actual
let colorChangeCounter = 0; // Contador para cambio de color

// ========================================
// INICIALIZACIÓN DEL JUEGO
// ========================================

/**
 * Inicializa el juego y configura los event listeners
 */
function initGame() {
    // Generar posición inicial de la comida
    generateFood();
    
    // Configurar event listeners para las teclas
    document.addEventListener('keydown', handleKeyPress);
    
    // Iniciar el juego
    startGame();
    
    console.log('Juego inicializado correctamente');
}

/**
 * Genera una nueva posición aleatoria para la comida
 */
function generateFood() {
    const maxX = (CANVAS_SIZE / GRID_SIZE) - 1;
    const maxY = (CANVAS_SIZE / GRID_SIZE) - 1;
    
    food.x = Math.floor(Math.random() * maxX) * GRID_SIZE;
    food.y = Math.floor(Math.random() * maxY) * GRID_SIZE;
    
    // Verificar que la comida no aparezca sobre la serpiente
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood(); // Regenerar si hay colisión
            return;
        }
    }
}

// ========================================
// CONTROL DE DIRECCIÓN
// ========================================

/**
 * Maneja las teclas presionadas para cambiar la dirección
 * @param {KeyboardEvent} event - Evento de tecla presionada
 */
function handleKeyPress(event) {
    if (!gameRunning) return;
    
    // Prevenir movimiento en dirección opuesta (evitar que la serpiente se muerda a sí misma)
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) { // Solo si no está moviéndose verticalmente
                direction = { x: 0, y: -GRID_SIZE };
            }
            break;
        case 'ArrowDown':
            if (direction.y === 0) {
                direction = { x: 0, y: GRID_SIZE };
            }
            break;
        case 'ArrowLeft':
            if (direction.x === 0) { // Solo si no está moviéndose horizontalmente
                direction = { x: -GRID_SIZE, y: 0 };
            }
            break;
        case 'ArrowRight':
            if (direction.x === 0) {
                direction = { x: GRID_SIZE, y: 0 };
            }
            break;
    }
    
    event.preventDefault(); // Prevenir scroll de la página
}

// ========================================
// LÓGICA DEL JUEGO
// ========================================

/**
 * Inicia el juego
 */
function startGame() {
    gameRunning = true;
    gameLoop = setInterval(updateGame, GAME_SPEED);
    console.log('Juego iniciado');
}

/**
 * Actualiza el estado del juego en cada frame
 */
function updateGame() {
    if (!gameRunning) return;
    
    // Mover la serpiente
    moveSnake();
    
    // Verificar colisiones
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    // Verificar si come la comida
    if (checkFoodCollision()) {
        eatFood();
    }
    
    // Dibujar todo en el canvas
    draw();
}

/**
 * Mueve la serpiente en la dirección actual
 */
function moveSnake() {
    if (direction.x === 0 && direction.y === 0) return; // No mover si no hay dirección
    
    // Crear nueva cabeza
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Agregar nueva cabeza al inicio del array
    snake.unshift(head);
    
    // Si no comió comida, remover la cola
    if (head.x !== food.x || head.y !== food.y) {
        snake.pop();
    }
}

/**
 * Verifica si hay colisiones con bordes o consigo misma
 * @returns {boolean} true si hay colisión
 */
function checkCollisions() {
    const head = snake[0];
    
    // Colisión con bordes del canvas
    if (head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE) {
        return true;
    }
    
    // Colisión consigo misma (verificar desde el segundo segmento)
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

/**
 * Verifica si la serpiente comió la comida
 * @returns {boolean} true si comió la comida
 */
function checkFoodCollision() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

/**
 * Maneja cuando la serpiente come la comida
 */
function eatFood() {
    // Incrementar puntuación
    score += 10;
    scoreElement.textContent = score;
    
    // Cambiar color de la serpiente cada vez que come
    changeSnakeColor();
    
    // Generar nueva comida
    generateFood();
    
    console.log('¡Comida comida! Puntuación:', score, 'Color actual:', snakeColors[currentColorIndex]);
}

/**
 * Cambia el color de la serpiente al siguiente color en la paleta
 */
function changeSnakeColor() {
    currentColorIndex = (currentColorIndex + 1) % snakeColors.length;
    colorChangeCounter++;
    
    // Efecto visual adicional: hacer que el canvas parpadee brevemente
    createColorChangeEffect();
}

/**
 * Crea un efecto visual cuando cambia el color
 */
function createColorChangeEffect() {
    // Crear un efecto de parpadeo en el canvas
    const originalBackground = ctx.fillStyle;
    
    // Parpadeo rápido con el nuevo color
    ctx.fillStyle = snakeColors[currentColorIndex] + '20'; // 20% de opacidad
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Restaurar después de un breve momento
    setTimeout(() => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        draw(); // Redibujar todo
    }, 50);
}

// ========================================
// RENDERIZADO
// ========================================

/**
 * Dibuja todos los elementos del juego en el canvas
 */
function draw() {
    // Limpiar el canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Dibujar la serpiente
    drawSnake();
    
    // Dibujar la comida
    drawFood();
}

/**
 * Dibuja la serpiente en el canvas con colores neon dinámicos
 */
function drawSnake() {
    const currentColor = snakeColors[currentColorIndex];
    
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Cabeza de la serpiente con efecto neon brillante
            const headGradient = ctx.createRadialGradient(
                segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, 0,
                segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, GRID_SIZE/2
            );
            headGradient.addColorStop(0, currentColor);
            headGradient.addColorStop(0.7, currentColor + 'cc');
            headGradient.addColorStop(1, currentColor + '66');
            
            ctx.fillStyle = headGradient;
            ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
            
            // Borde brillante de la cabeza
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
            
            // Efecto de brillo adicional en el centro
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(segment.x + 6, segment.y + 6, 8, 8);
            
        } else {
            // Cuerpo de la serpiente con gradiente
            const bodyGradient = ctx.createLinearGradient(
                segment.x, segment.y, 
                segment.x + GRID_SIZE, segment.y + GRID_SIZE
            );
            bodyGradient.addColorStop(0, currentColor + 'dd');
            bodyGradient.addColorStop(0.5, currentColor + 'aa');
            bodyGradient.addColorStop(1, currentColor + '77');
            
            ctx.fillStyle = bodyGradient;
            ctx.fillRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
            
            // Borde del cuerpo
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 1;
            ctx.strokeRect(segment.x, segment.y, GRID_SIZE, GRID_SIZE);
            
            // Efecto de brillo sutil en el centro del cuerpo
            ctx.fillStyle = currentColor + '44';
            ctx.fillRect(segment.x + 4, segment.y + 4, GRID_SIZE - 8, GRID_SIZE - 8);
        }
    });
}

/**
 * Dibuja la comida en el canvas con efectos neon
 */
function drawFood() {
    // Crear gradiente radial para la comida
    const foodGradient = ctx.createRadialGradient(
        food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, 0,
        food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, GRID_SIZE/2
    );
    foodGradient.addColorStop(0, '#ff0000');
    foodGradient.addColorStop(0.5, '#ff3333');
    foodGradient.addColorStop(1, '#cc0000');
    
    // Cuerpo de la comida con gradiente
    ctx.fillStyle = foodGradient;
    ctx.fillRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
    
    // Borde brillante de la comida
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(food.x, food.y, GRID_SIZE, GRID_SIZE);
    
    // Efecto de brillo en el centro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(food.x + 6, food.y + 6, 8, 8);
    
    // Efecto de pulso (cambia de tamaño sutilmente)
    const pulseSize = Math.sin(Date.now() * 0.01) * 2;
    ctx.fillStyle = '#ff6666' + '88';
    ctx.fillRect(food.x + 2 + pulseSize, food.y + 2 + pulseSize, 
                 GRID_SIZE - 4 - pulseSize*2, GRID_SIZE - 4 - pulseSize*2);
}

// ========================================
// GAME OVER Y REINICIO
// ========================================

/**
 * Maneja el fin del juego
 */
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    // Mostrar puntuación final
    finalScoreElement.textContent = score;
    
    // Mostrar mensaje de Game Over
    gameOverElement.classList.remove('hidden');
    
    // Iniciar countdown para reiniciar
    startCountdown();
    
    console.log('Game Over! Puntuación final:', score);
}

/**
 * Inicia el countdown para reiniciar el juego
 */
function startCountdown() {
    let timeLeft = 3;
    countdownElement.textContent = timeLeft;
    
    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            resetGame();
        }
    }, 1000);
}

/**
 * Reinicia el juego a su estado inicial
 */
function resetGame() {
    // Ocultar mensaje de Game Over
    gameOverElement.classList.add('hidden');
    
    // Resetear variables del juego
    snake = [{ x: 200, y: 200 }];
    direction = { x: 0, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    
    // Resetear colores de la serpiente
    currentColorIndex = 0;
    colorChangeCounter = 0;
    
    // Generar nueva comida
    generateFood();
    
    // Reiniciar el juego
    startGame();
    
    console.log('Juego reiniciado - Color inicial:', snakeColors[currentColorIndex]);
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', initGame);

// Mensaje de bienvenida en consola
console.log('🐍 Juego de la Culebrita NEON cargado correctamente!');
console.log('✨ Características nuevas:');
console.log('   - Diseño neon moderno y juvenil');
console.log('   - La serpiente cambia de color cada vez que come');
console.log('   - Efectos visuales mejorados');
console.log('   - 12 colores neon diferentes');
console.log('🎮 Usa las flechas del teclado para jugar');
console.log('🌈 Color inicial de la serpiente:', snakeColors[currentColorIndex]);
