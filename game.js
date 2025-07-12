// Configuração do jogo
const GAME_CONFIG = {
    width: 1200,
    height: 600,
    gravity: 0.5,
    jumpPower: 12,
    playerSpeed: 5,
    enemySpeed: 2
};

// Estados do jogo
const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_COMPLETE: 'levelComplete',
    GAME_OVER: 'gameOver',
    VICTORY: 'victory'
};

// Dados dos níveis
const LEVELS = {
    1: {
        name: "A Cidade em Ruínas",
        description: "Apollo deve navegar pela cidade em ruínas, coletando pedras de fé e lutando contra inimigos.",
        background: "#8B4513",
        enemyCount: 3,
        faithStonesNeeded: 5,
        platforms: [
            { x: 0, y: 550, width: 200, height: 50 },
            { x: 300, y: 450, width: 150, height: 20 },
            { x: 600, y: 350, width: 200, height: 20 },
            { x: 900, y: 250, width: 150, height: 20 },
            { x: 1000, y: 550, width: 200, height: 50 }
        ]
    },
    2: {
        name: "O Mercado das Sombras",
        description: "Apollo deve atravessar o mercado, evitando armadilhas e inimigos.",
        background: "#4B0082",
        enemyCount: 4,
        faithStonesNeeded: 6,
        platforms: [
            { x: 0, y: 550, width: 150, height: 50 },
            { x: 200, y: 480, width: 100, height: 20 },
            { x: 350, y: 400, width: 100, height: 20 },
            { x: 500, y: 320, width: 100, height: 20 },
            { x: 650, y: 400, width: 100, height: 20 },
            { x: 800, y: 480, width: 100, height: 20 },
            { x: 950, y: 550, width: 250, height: 50 }
        ]
    },
    3: {
        name: "A Igreja em Perigo",
        description: "Apollo deve defender a igreja contra uma horda de inimigos.",
        background: "#191970",
        enemyCount: 6,
        faithStonesNeeded: 8,
        platforms: [
            { x: 0, y: 550, width: 300, height: 50 },
            { x: 350, y: 400, width: 200, height: 20 },
            { x: 600, y: 300, width: 200, height: 20 },
            { x: 850, y: 400, width: 200, height: 20 },
            { x: 1000, y: 550, width: 200, height: 50 }
        ]
    },
    4: {
        name: "O Deserto da Dúvida",
        description: "Apollo deve atravessar um deserto, enfrentando desafios e inimigos.",
        background: "#8B4513",
        enemyCount: 5,
        faithStonesNeeded: 10,
        platforms: [
            { x: 0, y: 550, width: 150, height: 50 },
            { x: 200, y: 450, width: 100, height: 20 },
            { x: 400, y: 350, width: 100, height: 20 },
            { x: 600, y: 250, width: 100, height: 20 },
            { x: 800, y: 350, width: 100, height: 20 },
            { x: 1000, y: 550, width: 200, height: 50 }
        ]
    },
    5: {
        name: "A Montanha da Fé",
        description: "Apollo deve subir a montanha para restaurar a fé em Nova Jerusalém.",
        background: "#2F4F4F",
        enemyCount: 7,
        faithStonesNeeded: 12,
        platforms: [
            { x: 0, y: 550, width: 200, height: 50 },
            { x: 250, y: 480, width: 120, height: 20 },
            { x: 450, y: 400, width: 120, height: 20 },
            { x: 650, y: 320, width: 120, height: 20 },
            { x: 850, y: 240, width: 120, height: 20 },
            { x: 1000, y: 160, width: 200, height: 20 }
        ]
    }
};

// Classe principal do jogo
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.state = GAME_STATES.MENU;
        this.currentLevel = 1;
        this.score = 0;
        this.faithStones = 0;
        
        this.player = new Player(100, 500);
        this.enemies = [];
        this.collectibles = [];
        this.platforms = [];
        this.angels = [];
        
        this.keys = {};
        this.lastTime = 0;
        
        this.initializeEvents();
        this.showStartScreen();
    }

    initializeEvents() {
        // Controles do teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Botões da interface
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    startGame() {
        this.state = GAME_STATES.PLAYING;
        this.showGameScreen();
        this.loadLevel(this.currentLevel);
        this.gameLoop();
    }

    loadLevel(levelNum) {
        const level = LEVELS[levelNum];
        if (!level) return;
        
        // Limpar arrays
        this.enemies = [];
        this.collectibles = [];
        this.platforms = [];
        this.angels = [];
        
        // Resetar jogador
        this.player.x = 100;
        this.player.y = 500;
        this.player.health = 100;
        this.player.faith = 100;
        
        // Carregar plataformas
        this.platforms = level.platforms.map(p => new Platform(p.x, p.y, p.width, p.height));
        
        // Gerar inimigos
        for (let i = 0; i < level.enemyCount; i++) {
            const platform = level.platforms[Math.floor(Math.random() * level.platforms.length)];
            this.enemies.push(new Enemy(
                platform.x + Math.random() * (platform.width - 30),
                platform.y - 40
            ));
        }
        
        // Gerar pedras de fé
        for (let i = 0; i < level.faithStonesNeeded; i++) {
            const platform = level.platforms[Math.floor(Math.random() * level.platforms.length)];
            this.collectibles.push(new FaithStone(
                platform.x + Math.random() * (platform.width - 20),
                platform.y - 30
            ));
        }
        
        // Adicionar anjos em níveis específicos
        if (levelNum === 3 || levelNum === 5) {
            this.angels.push(new Angel(600, 200));
        }
        
        this.updateHUD();
        this.showLevelInfo(level);
    }

    showLevelInfo(level) {
        const levelInfo = document.createElement('div');
        levelInfo.className = 'level-info';
        levelInfo.innerHTML = `
            <h3>Nível ${this.currentLevel}</h3>
            <h4>${level.name}</h4>
            <p>${level.description}</p>
            <p>Colete ${level.faithStonesNeeded} pedras de fé para completar o nível</p>
        `;
        document.body.appendChild(levelInfo);
        
        setTimeout(() => {
            levelInfo.remove();
        }, 4000);
    }

    gameLoop(currentTime = 0) {
        if (this.state !== GAME_STATES.PLAYING) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Atualizar jogador
        this.player.update(this.keys, this.platforms);
        
        // Atualizar inimigos
        this.enemies.forEach(enemy => {
            enemy.update(this.platforms);
            
            // Verificar colisão com jogador
            if (this.checkCollision(this.player, enemy)) {
                this.player.takeDamage(10);
                if (this.player.health <= 0) {
                    this.gameOver();
                }
            }
        });
        
        // Verificar coleta de itens
        this.collectibles.forEach((item, index) => {
            if (this.checkCollision(this.player, item)) {
                this.collectibles.splice(index, 1);
                this.faithStones++;
                this.score += 100;
                this.player.faith = Math.min(100, this.player.faith + 10);
                
                // Verificar se coletou todas as pedras de fé
                const level = LEVELS[this.currentLevel];
                if (this.faithStones >= level.faithStonesNeeded) {
                    this.levelComplete();
                }
            }
        });
        
        // Atualizar anjos
        this.angels.forEach(angel => {
            angel.update();
            
            // Verificar colisão com jogador (cura)
            if (this.checkCollision(this.player, angel)) {
                this.player.health = Math.min(100, this.player.health + 20);
                this.player.faith = Math.min(100, this.player.faith + 30);
            }
        });
        
        // Verificar ataques do jogador
        if (this.keys['Enter'] && this.player.canAttack) {
            this.player.attack();
            this.enemies.forEach((enemy, index) => {
                if (this.checkCollision(this.player, enemy)) {
                    this.enemies.splice(index, 1);
                    this.score += 50;
                }
            });
        }
        
        this.updateHUD();
    }

    render() {
        // Limpar tela
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar fundo do nível
        const level = LEVELS[this.currentLevel];
        this.ctx.fillStyle = level.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenhar plataformas
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Desenhar coletáveis
        this.collectibles.forEach(item => item.render(this.ctx));
        
        // Desenhar anjos
        this.angels.forEach(angel => angel.render(this.ctx));
        
        // Desenhar inimigos
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // Desenhar jogador
        this.player.render(this.ctx);
    }

    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    levelComplete() {
        this.state = GAME_STATES.LEVEL_COMPLETE;
        document.getElementById('levelMessage').textContent = 
            `Você coletou ${this.faithStones} pedras de fé e restaurou a esperança!`;
        this.showLevelCompleteScreen();
    }

    nextLevel() {
        this.currentLevel++;
        this.faithStones = 0;
        
        if (this.currentLevel > 5) {
            this.victory();
        } else {
            this.state = GAME_STATES.PLAYING;
            this.showGameScreen();
            this.loadLevel(this.currentLevel);
            this.gameLoop();
        }
    }

    victory() {
        this.state = GAME_STATES.VICTORY;
        this.showVictoryScreen();
    }

    gameOver() {
        this.state = GAME_STATES.GAME_OVER;
        document.getElementById('gameOverMessage').textContent = 
            `Você perdeu toda a sua fé... Tente novamente com mais esperança!`;
        this.showGameOverScreen();
    }

    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.faithStones = 0;
        this.startGame();
    }

    updateHUD() {
        document.getElementById('healthFill').style.width = this.player.health + '%';
        document.getElementById('faithFill').style.width = this.player.faith + '%';
        document.getElementById('faithStones').textContent = this.faithStones;
        document.getElementById('currentLevel').textContent = this.currentLevel;
        document.getElementById('score').textContent = this.score;
    }

    showStartScreen() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('startScreen').classList.add('active');
    }

    showGameScreen() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('gameScreen').classList.add('active');
    }

    showLevelCompleteScreen() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('levelComplete').classList.add('active');
    }

    showGameOverScreen() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('gameOver').classList.add('active');
    }

    showVictoryScreen() {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        document.getElementById('victory').classList.add('active');
    }
}

// Classe do jogador Apollo
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 100;
        this.faith = 100;
        this.onGround = false;
        this.canAttack = true;
        this.attackCooldown = 0;
        this.direction = 1; // 1 para direita, -1 para esquerda
    }

    update(keys, platforms) {
        // Movimento horizontal
        if (keys['ArrowLeft']) {
            this.velocityX = -GAME_CONFIG.playerSpeed;
            this.direction = -1;
        } else if (keys['ArrowRight']) {
            this.velocityX = GAME_CONFIG.playerSpeed;
            this.direction = 1;
        } else {
            this.velocityX = 0;
        }

        // Pulo
        if (keys['Space'] && this.onGround) {
            this.velocityY = -GAME_CONFIG.jumpPower;
            this.onGround = false;
        }

        // Aplicar gravidade
        this.velocityY += GAME_CONFIG.gravity;

        // Atualizar posição
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Verificar colisões com plataformas
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Colisão por cima
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
            }
        });

        // Limites da tela
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > GAME_CONFIG.width) this.x = GAME_CONFIG.width - this.width;
        if (this.y > GAME_CONFIG.height) {
            this.takeDamage(20);
            this.y = 100;
            this.velocityY = 0;
        }

        // Cooldown do ataque
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        } else {
            this.canAttack = true;
        }
    }

    attack() {
        if (this.canAttack) {
            this.canAttack = false;
            this.attackCooldown = 30;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        this.faith = Math.max(0, this.faith - damage / 2);
    }

    render(ctx) {
        // Corpo
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x + 8, this.y + 15, 14, 20);

        // Cabeça
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 10, this.y, 10, 12);

        // Olhos
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 12, this.y + 3, 2, 2);
        ctx.fillRect(this.x + 16, this.y + 3, 2, 2);

        // Boca
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 13, this.y + 7, 4, 1);

        // Braços
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 5, this.y + 18, 5, 10);
        ctx.fillRect(this.x + 20, this.y + 18, 5, 10);

        // Pernas
        ctx.fillStyle = '#000080';
        ctx.fillRect(this.x + 10, this.y + 35, 4, 5);
        ctx.fillRect(this.x + 16, this.y + 35, 4, 5);

        // Auréola (se a fé estiver alta)
        if (this.faith > 80) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x + 15, this.y - 5, 8, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Indicador de ataque
        if (!this.canAttack) {
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(this.x + this.direction * 25, this.y + 10, 15, 3);
        }
    }
}

// Classe dos inimigos
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 30;
        this.velocityX = GAME_CONFIG.enemySpeed * (Math.random() < 0.5 ? -1 : 1);
        this.velocityY = 0;
        this.health = 50;
        this.onGround = false;
    }

    update(platforms) {
        // Aplicar gravidade
        this.velocityY += GAME_CONFIG.gravity;

        // Atualizar posição
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Verificar colisões com plataformas
        this.onGround = false;
        platforms.forEach(platform => {
            if (this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                if (this.velocityY > 0 && this.y < platform.y) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.onGround = true;
                }
            }
        });

        // Inverter direção nas bordas das plataformas
        if (this.onGround) {
            let onPlatform = false;
            platforms.forEach(platform => {
                if (this.x + this.width/2 >= platform.x && 
                    this.x + this.width/2 <= platform.x + platform.width &&
                    Math.abs(this.y + this.height - platform.y) < 5) {
                    onPlatform = true;
                }
            });
            
            if (!onPlatform) {
                this.velocityX *= -1;
            }
        }

        // Limites da tela
        if (this.x < 0 || this.x + this.width > GAME_CONFIG.width) {
            this.velocityX *= -1;
        }
    }

    render(ctx) {
        // Corpo (sombrio)
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(this.x + 6, this.y + 12, 13, 15);

        // Cabeça
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(this.x + 8, this.y, 9, 10);

        // Olhos vermelhos
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(this.x + 10, this.y + 3, 2, 2);
        ctx.fillRect(this.x + 13, this.y + 3, 2, 2);

        // Braços
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(this.x + 3, this.y + 15, 4, 8);
        ctx.fillRect(this.x + 18, this.y + 15, 4, 8);

        // Pernas
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(this.x + 8, this.y + 27, 3, 3);
        ctx.fillRect(this.x + 14, this.y + 27, 3, 3);
    }
}

// Classe dos anjos
class Angel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 45;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
    }

    update() {
        this.floatOffset += this.floatSpeed;
        this.y += Math.sin(this.floatOffset) * 0.5;
    }

    render(ctx) {
        // Corpo branco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 10, this.y + 15, 15, 25);

        // Cabeça
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 12, this.y, 11, 12);

        // Olhos
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(this.x + 14, this.y + 3, 2, 2);
        ctx.fillRect(this.x + 19, this.y + 3, 2, 2);

        // Auréola
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.x + 17, this.y - 5, 10, 0, 2 * Math.PI);
        ctx.stroke();

        // Asas
        ctx.fillStyle = '#E6E6FA';
        ctx.fillRect(this.x, this.y + 10, 8, 20);
        ctx.fillRect(this.x + 27, this.y + 10, 8, 20);

        // Braços
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 6, this.y + 18, 5, 10);
        ctx.fillRect(this.x + 24, this.y + 18, 5, 10);

        // Pernas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 12, this.y + 40, 4, 5);
        ctx.fillRect(this.x + 19, this.y + 40, 4, 5);
    }
}

// Classe das pedras de fé
class FaithStone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.glow = 0;
        this.glowSpeed = 0.1;
    }

    render(ctx) {
        this.glow += this.glowSpeed;
        
        // Efeito de brilho
        const glowIntensity = Math.sin(this.glow) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(135, 206, 235, ${glowIntensity})`;
        ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        
        // Pedra
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Símbolo da cruz
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.x + 8, this.y + 4, 4, 12);
        ctx.fillRect(this.x + 4, this.y + 8, 12, 4);
    }
}

// Classe das plataformas
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(ctx) {
        // Plataforma principal
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Borda superior
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(this.x, this.y, this.width, 3);
        
        // Sombra
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 2, this.y + this.height - 5, this.width - 2, 5);
    }
}

// Inicializar o jogo
let game;
window.addEventListener('load', () => {
    game = new Game();
});