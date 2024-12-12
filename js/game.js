// DOM Elements
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');

// Add score display
const scoreDisplay = document.createElement('div');
scoreDisplay.id = 'score-display';
gameContainer.appendChild(scoreDisplay);

// Add message display
const messageDisplay = document.createElement('div');
messageDisplay.id = 'message-display';
messageDisplay.textContent = 'press any key to start';
gameContainer.appendChild(messageDisplay);

// Player physics
let playerPos = {
    x: 100,
    y: 300,
    velocityX: 0,
    velocityY: 0
};

// Game constants
const gravity = 0.5;
const jumpForce = 12;
const moveSpeed = 5;
const platformSpeed = 2;
let isJumping = false;
let gameRunning = false;
let animationFrameId = null;
let canDoubleJump = true;
let score = 0;

// Platform generation
function createPlatform(x, y, width = 100) {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = x + 'px';
    platform.style.top = y + 'px';
    platform.style.width = width + 'px';
    gameContainer.appendChild(platform);
}

// Initialize platforms
function initPlatforms() {
    document.querySelectorAll('.platform').forEach(p => p.remove());
    createPlatform(0, 370, 300);
    createPlatform(300, 250);
    createPlatform(500, 180);
    createPlatform(700, 220);
}

// Controls
document.addEventListener('keydown', function(e) {
    if (!gameRunning) {
        startGame();
        return;
    }
    
    switch(e.key) {
        case 'ArrowLeft':
            playerPos.velocityX = -moveSpeed;
            break;
        case 'ArrowRight':
            playerPos.velocityX = moveSpeed;
            break;
        case ' ':
        case 'ArrowUp':
            if (!isJumping) {
                playerPos.velocityY = -jumpForce;
                isJumping = true;
                canDoubleJump = true;
            } else if (canDoubleJump) {
                playerPos.velocityY = -jumpForce;
                canDoubleJump = false;
            }
            break;
    }
});

document.addEventListener('keyup', function(e) {
    if (!gameRunning) return;
    if (e.key === 'ArrowLeft' && playerPos.velocityX < 0) {
        playerPos.velocityX = 0;
    }
    if (e.key === 'ArrowRight' && playerPos.velocityX > 0) {
        playerPos.velocityX = 0;
    }
});

// Collision detection
function checkCollision(player, platform) {
    return player.left < platform.right &&
           player.right > platform.left &&
           player.bottom > platform.top &&
           player.top < platform.bottom;
}

// Distraction creation
function createDistraction() {
    const distraction = document.createElement('div');
    distraction.className = 'distraction';
    
    const startFromSide = Math.random() < 0.5;
    if (startFromSide) {
        console.log('Creating airplane distraction!');
        console.log('Using image path:', './assets/airplane.png');
        distraction.style.width = '150px';
        distraction.style.height = '150px';
        distraction.style.backgroundImage = 'url("./assets/airplane.png")';
        const startLeft = Math.random() < 0.5;
        distraction.style.left = (startLeft ? -150 : 800) + 'px';
        distraction.style.transform = startLeft ? 'scaleX(-1)' : 'scaleX(1)';
        distraction.style.top = Math.random() * 300 + 'px';
    } else {
        console.log('Creating hot air balloon distraction!');
        console.log('Using image path:', './assets/hot-air-balloon.png');
        distraction.style.width = '255px';
        distraction.style.height = '255px';
        distraction.style.backgroundImage = 'url("./assets/hot-air-balloon.png")';
        distraction.style.left = Math.random() * 800 + 'px';
        distraction.style.top = '400px';
    }
    
    gameContainer.appendChild(distraction);
    
    let speedX, speedY;
    if (startFromSide) {
        const startLeft = distraction.style.left === '-150px';
        speedX = startLeft ? 3 : -3;
        speedY = 0;
    } else {
        speedX = (Math.random() - 0.5) * 4;
        speedY = -2 - Math.random() * 3;
    }
    
    return { element: distraction, speedX, speedY };
}

// Game state array
let distractions = [];

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    if (score > 100) {
        if (distractions.length < 3 && Math.random() < 0.002) {
            distractions.push(createDistraction());
        }
    }
    
    distractions = distractions.filter(distraction => {
        const element = distraction.element;
        const left = parseFloat(element.style.left);
        const top = parseFloat(element.style.top);
        
        element.style.left = (left + distraction.speedX) + 'px';
        element.style.top = (top + distraction.speedY) + 'px';
        
        if (element.style.width === '255px') {
            if (top < -255 || left < -255 || left > 850) {
                element.remove();
                return false;
            }
        } else {
            if (top < -50 || left < -150 || left > 850) {
                element.remove();
                return false;
            }
        }
        return true;
    });
    
    playerPos.velocityY += gravity;
    playerPos.x += playerPos.velocityX;
    let nextY = playerPos.y + playerPos.velocityY;

    if (playerPos.x < 0) playerPos.x = 0;
    if (playerPos.x > 770) playerPos.x = 770;

    const playerHitbox = {
        left: playerPos.x,
        right: playerPos.x + 30,
        top: nextY,
        bottom: nextY + 30
    };

    let onPlatform = false;
    const platforms = document.querySelectorAll('.platform');
    
    platforms.forEach(platform => {
        let left = parseInt(platform.style.left) - platformSpeed;
        platform.style.left = left + 'px';
        
        if (left < -200) {
            platform.remove();
            createPlatform(800, Math.random() * 200 + 100);
        }

        const platformRect = platform.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        const platformHitbox = {
            left: platformRect.left - gameRect.left,
            right: platformRect.right - gameRect.left,
            top: platformRect.top - gameRect.top,
            bottom: platformRect.bottom - gameRect.top
        };

        if (checkCollision(playerHitbox, platformHitbox)) {
            if (playerPos.y + 30 <= platformRect.top - gameRect.top && playerPos.velocityY > 0) {
                nextY = platformRect.top - gameRect.top - 30;
                playerPos.velocityY = 0;
                isJumping = false;
                canDoubleJump = true;
                onPlatform = true;
            }
        }
    });

    playerPos.y = nextY;

    if (playerPos.y > 400) {
        gameOver();
        return;
    }

    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px';

    score += 0.1;
    scoreDisplay.textContent = 'Score: ' + Math.floor(score);

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Game state functions
function startGame() {
    gameRunning = true;
    messageDisplay.style.display = 'none';
    score = 0;
    playerPos = {
        x: 100,
        y: 300,
        velocityX: 0,
        velocityY: 0
    };
    isJumping = false;
    canDoubleJump = true;
    
    initPlatforms();
    scoreDisplay.textContent = 'Score: 0';
    
    if (!animationFrameId) {
        gameLoop();
    }
    
    distractions.forEach(d => d.element.remove());
    distractions = [];
}

function gameOver() {
    gameRunning = false;
    alert('Game Over! Score: ' + Math.floor(score));
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    
    player.style.left = '100px';
    player.style.top = '300px';
    
    initPlatforms();
    distractions.forEach(d => d.element.remove());
    distractions = [];
    
    scoreDisplay.textContent = 'Score: 0';
    messageDisplay.style.display = 'block';
}

// Initialize game
initPlatforms();
player.style.left = '100px';
player.style.top = '300px';
