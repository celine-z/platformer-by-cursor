const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');

// Add score display
const scoreDisplay = document.createElement('div');
scoreDisplay.style.position = 'absolute';
scoreDisplay.style.top = '10px';
scoreDisplay.style.left = '10px';
scoreDisplay.style.color = 'black';
scoreDisplay.style.fontSize = '20px';
gameContainer.appendChild(scoreDisplay);

// Add start button with z-index
const startButton = document.createElement('button');
startButton.textContent = 'Start Game';
startButton.style.position = 'absolute';
startButton.style.left = '50%';
startButton.style.top = '50%';
startButton.style.transform = 'translate(-50%, -50%)';
startButton.style.padding = '10px 20px';
startButton.style.fontSize = '20px';
startButton.style.cursor = 'pointer';
startButton.style.zIndex = '1000';
gameContainer.appendChild(startButton);

let score = 0;

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

// Add game state
let gameRunning = false;
let animationFrameId = null;

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
    
    // Create ground
    createPlatform(0, 370, 800);
    
    // Create starting platforms
    createPlatform(300, 250);
    createPlatform(500, 150);
    createPlatform(700, 200);
}

// Controls
document.addEventListener('keydown', function(e) {
    if (!gameRunning) return;
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

function checkCollision(player, platform) {
    return player.left < platform.right &&
           player.right > platform.left &&
           player.bottom > platform.top &&
           player.top < platform.bottom;
}

function gameLoop() {
    if (!gameRunning) return;  // Only run if game is active
    
    // Apply gravity
    playerPos.velocityY += gravity;
    
    // Update position
    playerPos.x += playerPos.velocityX;
    let nextY = playerPos.y + playerPos.velocityY;

    // Check boundaries
    if (playerPos.x < 0) playerPos.x = 0;
    if (playerPos.x > 770) playerPos.x = 770;

    // Create player hitbox for next position
    const playerHitbox = {
        left: playerPos.x,
        right: playerPos.x + 30,
        top: nextY,
        bottom: nextY + 30
    };

    // Move platforms and check collisions
    let onPlatform = false;
    const platforms = document.querySelectorAll('.platform');
    
    platforms.forEach(platform => {
        // Move platform
        let left = parseInt(platform.style.left) - platformSpeed;
        platform.style.left = left + 'px';
        
        // Remove and create new platforms
        if (left < -200) {
            platform.remove();
            createPlatform(800, Math.random() * 200 + 100);
        }

        // Get platform hitbox
        const platformRect = platform.getBoundingClientRect();
        const gameRect = gameContainer.getBoundingClientRect();
        const platformHitbox = {
            left: platformRect.left - gameRect.left,
            right: platformRect.right - gameRect.left,
            top: platformRect.top - gameRect.top,
            bottom: platformRect.bottom - gameRect.top
        };

        // Check collision
        if (checkCollision(playerHitbox, platformHitbox)) {
            if (playerPos.y + 30 <= platformRect.top - gameRect.top && playerPos.velocityY > 0) {
                nextY = platformRect.top - gameRect.top - 30;
                playerPos.velocityY = 0;
                isJumping = false;
                onPlatform = true;
            }
        }
    });

    // Update player Y position
    playerPos.y = nextY;

    // Check for game over
    if (playerPos.y > 400) {
        gameOver();
        return;
    }

    // Update player position
    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px';

    // Update score
    score += 0.1;
    scoreDisplay.textContent = 'Score: ' + Math.floor(score);

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Add start game function
function startGame() {
    gameRunning = true;
    score = 0;
    playerPos = {
        x: 100,
        y: 300,
        velocityX: 0,
        velocityY: 0
    };
    isJumping = false;
    
    initPlatforms();
    startButton.style.display = 'none';
    scoreDisplay.textContent = 'Score: 0';
    
    if (!animationFrameId) {
        gameLoop();
    }
}

// Add game over function
function gameOver() {
    gameRunning = false;
    alert('Game Over! Score: ' + Math.floor(score));
    startButton.style.display = 'block';
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
}

// Add click listener for start button
startButton.addEventListener('click', startGame);

// Initialize game state but don't start automatically
initPlatforms();
player.style.left = '100px';
player.style.top = '300px';
