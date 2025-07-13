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

// Dados dos níveis com temas visuais inspirados em Alto's Odyssey
const LEVELS = {
    1: {
        name: "A Cidade em Ruínas",
        description: "Apollo deve navegar pela cidade em ruínas, coletando pedras de fé e lutando contra inimigos.",
        theme: {
            skyGradient: ["#FF6B6B", "#FF8E8E", "#FFB3B3"],
            groundColor: "#8B4513",
            accentColor: "#D2691E",
            lightColor: "#FFD700",
            particles: "dust"
        },
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
        theme: {
            skyGradient: ["#4B0082", "#663399", "#8A2BE2"],
            groundColor: "#2F2F2F",
            accentColor: "#4B0082",
            lightColor: "#9370DB",
            particles: "shadows"
        },
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
        theme: {
            skyGradient: ["#191970", "#4169E1", "#6495ED"],
            groundColor: "#708090",
            accentColor: "#4682B4",
            lightColor: "#FFD700",
            particles: "holy"
        },
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
        theme: {
            skyGradient: ["#FF4500", "#FF6347", "#FFA500"],
            groundColor: "#DEB887",
            accentColor: "#D2691E",
            lightColor: "#FFD700",
            particles: "sand"
        },
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
        theme: {
            skyGradient: ["#2F4F4F", "#4682B4", "#87CEEB"],
            groundColor: "#696969",
            accentColor: "#708090",
            lightColor: "#FFD700",
            particles: "divine"
        },
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
        this.particles = [];
        this.backgroundLayers = [];
        
        this.keys = {};
        this.mobileControls = {};
        this.lastTime = 0;
        this.cameraOffset = 0;
        this.time = 0;
        this.isMobile = this.detectMobile();
        
        this.initializeEvents();
        this.initializeBackground();
        this.setupCanvas();
        this.showStartScreen();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    setupCanvas() {
        // Ajustar canvas para dispositivos móveis
        if (this.isMobile) {
            const container = document.getElementById('gameContainer');
            const maxWidth = window.innerWidth - 20;
            const maxHeight = window.innerHeight - 180;
            
            // Manter proporção
            const aspectRatio = GAME_CONFIG.width / GAME_CONFIG.height;
            let canvasWidth = maxWidth;
            let canvasHeight = maxWidth / aspectRatio;
            
            if (canvasHeight > maxHeight) {
                canvasHeight = maxHeight;
                canvasWidth = maxHeight * aspectRatio;
            }
            
            this.canvas.style.width = canvasWidth + 'px';
            this.canvas.style.height = canvasHeight + 'px';
            
            // Ajustar escala interna
            this.canvasScale = Math.min(canvasWidth / GAME_CONFIG.width, canvasHeight / GAME_CONFIG.height);
        }
        
        // Prevenir zoom no iOS
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
    }

    initializeBackground() {
        // Camadas de parallax inspiradas em Alto's Odyssey
        this.backgroundLayers = [
            { speed: 0.1, elements: [] }, // Camada mais distante
            { speed: 0.3, elements: [] }, // Camada média
            { speed: 0.6, elements: [] }  // Camada mais próxima
        ];
        
        // Gerar elementos para cada camada
        for (let layer = 0; layer < 3; layer++) {
            const layerData = this.backgroundLayers[layer];
            for (let i = 0; i < 5; i++) {
                layerData.elements.push({
                    x: Math.random() * GAME_CONFIG.width * 2,
                    y: 100 + Math.random() * 200,
                    width: 50 + Math.random() * 100,
                    height: 30 + Math.random() * 60,
                    opacity: 0.3 + Math.random() * 0.4
                });
            }
        }
    }

    initializeEvents() {
        // Controles do teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
        
        // Controles móveis
        this.initializeMobileControls();
        
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

        // Redimensionamento de tela
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
        
        // Orientação para mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.setupCanvas();
            }, 100);
        });
    }

    initializeMobileControls() {
        // Botão esquerda
        const leftBtn = document.getElementById('leftBtn');
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileControls.left = true;
            });
            leftBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls.left = false;
            });
            leftBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls.left = false;
            });
        }

        // Botão direita
        const rightBtn = document.getElementById('rightBtn');
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileControls.right = true;
            });
            rightBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls.right = false;
            });
            rightBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls.right = false;
            });
        }

        // Botão pular
        const jumpBtn = document.getElementById('jumpBtn');
        if (jumpBtn) {
            jumpBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileControls.jump = true;
            });
            jumpBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls.jump = false;
            });
            jumpBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls.jump = false;
            });
        }

        // Botão atacar
        const attackBtn = document.getElementById('attackBtn');
        if (attackBtn) {
            attackBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.mobileControls.attack = true;
            });
            attackBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.mobileControls.attack = false;
            });
            attackBtn.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                this.mobileControls.attack = false;
            });
        }

        // Prevenir scroll durante toque
        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('control-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    getControls() {
        // Combinar controles de teclado e mobile
        return {
            left: this.keys['ArrowLeft'] || this.mobileControls.left,
            right: this.keys['ArrowRight'] || this.mobileControls.right,
            jump: this.keys['Space'] || this.mobileControls.jump,
            attack: this.keys['Enter'] || this.mobileControls.attack
        };
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
        this.particles = [];
        
        // Resetar jogador
        this.player.x = 100;
        this.player.y = 500;
        this.player.health = 100;
        this.player.faith = 100;
        this.player.animationFrame = 0;
        
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
        
        // Inicializar partículas do nível
        this.initializeLevelParticles(level.theme.particles);
        
        this.updateHUD();
        this.showLevelInfo(level);
    }

    initializeLevelParticles(particleType) {
        const particleCount = this.isMobile ? 10 : 20; // Menos partículas no mobile
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(
                Math.random() * GAME_CONFIG.width,
                Math.random() * GAME_CONFIG.height,
                particleType
            ));
        }
    }

    showLevelInfo(level) {
        const levelInfo = document.createElement('div');
        levelInfo.className = 'level-info fade-in';
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
        this.time += deltaTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        const controls = this.getControls();
        
        // Atualizar jogador
        this.player.update(controls, this.platforms, deltaTime);
        
        // Atualizar câmera (parallax suave)
        this.cameraOffset = this.player.x - GAME_CONFIG.width / 2;
        this.cameraOffset = Math.max(0, Math.min(this.cameraOffset, GAME_CONFIG.width));
        
        // Atualizar partículas
        this.particles.forEach(particle => particle.update(deltaTime));
        
        // Atualizar inimigos
        this.enemies.forEach(enemy => {
            enemy.update(this.platforms, deltaTime);
            
            // Verificar colisão com jogador
            if (this.checkCollision(this.player, enemy)) {
                this.player.takeDamage(10);
                this.createImpactParticles(this.player.x, this.player.y);
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
                this.createCollectParticles(item.x, item.y);
                
                // Verificar se coletou todas as pedras de fé
                const level = LEVELS[this.currentLevel];
                if (this.faithStones >= level.faithStonesNeeded) {
                    this.levelComplete();
                }
            }
        });
        
        // Atualizar anjos
        this.angels.forEach(angel => {
            angel.update(deltaTime);
            
            // Verificar colisão com jogador (cura)
            if (this.checkCollision(this.player, angel)) {
                this.player.health = Math.min(100, this.player.health + 20);
                this.player.faith = Math.min(100, this.player.faith + 30);
                this.createHealParticles(this.player.x, this.player.y);
            }
        });
        
        // Verificar ataques do jogador
        if (controls.attack && this.player.canAttack) {
            this.player.attack();
            this.enemies.forEach((enemy, index) => {
                if (this.checkCollision(this.player, enemy)) {
                    this.enemies.splice(index, 1);
                    this.score += 50;
                    this.createDefeatParticles(enemy.x, enemy.y);
                }
            });
        }
        
        this.updateHUD();
    }

    render() {
        // Limpar tela
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Renderizar fundo com parallax
        this.renderBackground();
        
        // Salvar contexto para aplicar offset da câmera
        this.ctx.save();
        this.ctx.translate(-this.cameraOffset * 0.5, 0);
        
        // Desenhar plataformas
        this.platforms.forEach(platform => platform.render(this.ctx));
        
        // Desenhar coletáveis
        this.collectibles.forEach(item => item.render(this.ctx, this.time));
        
        // Desenhar anjos
        this.angels.forEach(angel => angel.render(this.ctx, this.time));
        
        // Desenhar inimigos
        this.enemies.forEach(enemy => enemy.render(this.ctx, this.time));
        
        // Desenhar jogador
        this.player.render(this.ctx, this.time);
        
        // Restaurar contexto
        this.ctx.restore();
        
        // Desenhar partículas (sem offset da câmera)
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // Renderizar efeitos de luz
        this.renderLightingEffects();
    }

    renderBackground() {
        const level = LEVELS[this.currentLevel];
        const theme = level.theme;
        
        // Gradiente do céu
        const gradient = this.ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.height);
        gradient.addColorStop(0, theme.skyGradient[0]);
        gradient.addColorStop(0.5, theme.skyGradient[1]);
        gradient.addColorStop(1, theme.skyGradient[2]);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
        
        // Renderizar camadas de parallax
        this.backgroundLayers.forEach((layer, index) => {
            this.ctx.save();
            this.ctx.translate(-this.cameraOffset * layer.speed, 0);
            
            layer.elements.forEach(element => {
                this.ctx.fillStyle = `rgba(${this.hexToRgb(theme.accentColor)}, ${element.opacity})`;
                this.ctx.fillRect(element.x, element.y, element.width, element.height);
            });
            
            this.ctx.restore();
        });
    }

    renderLightingEffects() {
        // Efeito de luz suave
        const level = LEVELS[this.currentLevel];
        const lightGradient = this.ctx.createRadialGradient(
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 3, 0,
            GAME_CONFIG.width / 2, GAME_CONFIG.height / 3, GAME_CONFIG.width
        );
        
        lightGradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
        lightGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        this.ctx.fillStyle = lightGradient;
        this.ctx.fillRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
            '0, 0, 0';
    }

    createImpactParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, 'impact'));
        }
    }

    createCollectParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push(new Particle(x, y, 'collect'));
        }
    }

    createHealParticles(x, y) {
        for (let i = 0; i < 6; i++) {
            this.particles.push(new Particle(x, y, 'heal'));
        }
    }

    createDefeatParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, 'defeat'));
        }
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

// Classe do jogador Apollo com gráficos melhorados
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
        this.direction = 1;
        this.animationFrame = 0;
        this.walkCycle = 0;
        this.jumpAnimation = 0;
    }

    update(controls, platforms, deltaTime) {
        // Atualizar animações
        this.animationFrame += deltaTime * 0.01;
        
        // Movimento horizontal
        if (controls.left) {
            this.velocityX = -GAME_CONFIG.playerSpeed;
            this.direction = -1;
            this.walkCycle += deltaTime * 0.01;
        } else if (controls.right) {
            this.velocityX = GAME_CONFIG.playerSpeed;
            this.direction = 1;
            this.walkCycle += deltaTime * 0.01;
        } else {
            this.velocityX = 0;
            this.walkCycle = 0;
        }

        // Pulo
        if (controls.jump && this.onGround) {
            this.velocityY = -GAME_CONFIG.jumpPower;
            this.onGround = false;
            this.jumpAnimation = 1;
        }

        // Aplicar gravidade
        this.velocityY += GAME_CONFIG.gravity;
        
        // Reduzir animação de pulo
        if (this.jumpAnimation > 0) {
            this.jumpAnimation -= deltaTime * 0.02;
        }

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
                    this.jumpAnimation = 0;
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

    render(ctx, time) {
        ctx.save();
        
        // Aplicar balanço suave durante caminhada
        const walkOffset = Math.sin(this.walkCycle * 10) * 2;
        const jumpOffset = this.jumpAnimation * -5;
        
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.scale(this.direction, 1);
        ctx.translate(-this.width/2, -this.height/2 + walkOffset + jumpOffset);
        
        // Corpo com gradiente
        const bodyGradient = ctx.createLinearGradient(0, 15, 0, 35);
        bodyGradient.addColorStop(0, '#A0522D');
        bodyGradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(8, 15, 14, 20);

        // Cabeça com gradiente
        const headGradient = ctx.createLinearGradient(0, 0, 0, 12);
        headGradient.addColorStop(0, '#FDBCB4');
        headGradient.addColorStop(1, '#F4A460');
        ctx.fillStyle = headGradient;
        ctx.fillRect(10, 0, 10, 12);

        // Olhos com brilho
        ctx.fillStyle = '#000';
        ctx.fillRect(12, 3, 2, 2);
        ctx.fillRect(16, 3, 2, 2);
        
        // Brilho nos olhos
        ctx.fillStyle = '#FFF';
        ctx.fillRect(12.5, 3.5, 1, 1);
        ctx.fillRect(16.5, 3.5, 1, 1);

        // Boca
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(13, 7, 4, 1);

        // Braços com movimento
        const armSwing = Math.sin(this.walkCycle * 8) * 3;
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(5, 18 + armSwing, 5, 10);
        ctx.fillRect(20, 18 - armSwing, 5, 10);

        // Pernas com movimento
        const legSwing = Math.sin(this.walkCycle * 12) * 4;
        ctx.fillStyle = '#000080';
        ctx.fillRect(10, 35 + legSwing, 4, 5);
        ctx.fillRect(16, 35 - legSwing, 4, 5);

        // Auréola com efeito pulsante
        if (this.faith > 80) {
            const haloSize = 8 + Math.sin(time * 0.005) * 2;
            const haloOpacity = 0.6 + Math.sin(time * 0.003) * 0.3;
            
            ctx.strokeStyle = `rgba(255, 215, 0, ${haloOpacity})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(15, -5, haloSize, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Brilho interno
            ctx.strokeStyle = `rgba(255, 255, 255, ${haloOpacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(15, -5, haloSize - 2, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Indicador de ataque com efeito
        if (!this.canAttack) {
            const attackGradient = ctx.createLinearGradient(0, 0, 15, 0);
            attackGradient.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
            attackGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = attackGradient;
            ctx.fillRect(25, 10, 15, 3);
        }
        
        ctx.restore();
    }
}

// Classe dos inimigos com gráficos melhorados
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
        this.animationFrame = 0;
    }

    update(platforms, deltaTime) {
        this.animationFrame += deltaTime * 0.01;
        
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

        // Inverter direção nas bordas
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

        if (this.x < 0 || this.x + this.width > GAME_CONFIG.width) {
            this.velocityX *= -1;
        }
    }

    render(ctx, time) {
        ctx.save();
        
        // Efeito de sombra pulsante
        const shadowIntensity = 0.5 + Math.sin(time * 0.003) * 0.3;
        
        // Corpo sombrio com gradiente
        const bodyGradient = ctx.createLinearGradient(0, 12, 0, 27);
        bodyGradient.addColorStop(0, '#1C1C1C');
        bodyGradient.addColorStop(1, '#2F2F2F');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(this.x + 6, this.y + 12, 13, 15);

        // Cabeça
        ctx.fillStyle = '#0F0F0F';
        ctx.fillRect(this.x + 8, this.y, 9, 10);

        // Olhos vermelhos com brilho
        const eyeGlow = 0.7 + Math.sin(time * 0.008) * 0.3;
        ctx.fillStyle = `rgba(255, 0, 0, ${eyeGlow})`;
        ctx.fillRect(this.x + 10, this.y + 3, 2, 2);
        ctx.fillRect(this.x + 13, this.y + 3, 2, 2);
        
        // Brilho dos olhos
        ctx.fillStyle = `rgba(255, 100, 100, ${eyeGlow * 0.5})`;
        ctx.fillRect(this.x + 9, this.y + 2, 4, 4);
        ctx.fillRect(this.x + 12, this.y + 2, 4, 4);

        // Braços com movimento
        const armMovement = Math.sin(this.animationFrame * 5) * 2;
        ctx.fillStyle = '#2F2F2F';
        ctx.fillRect(this.x + 3, this.y + 15 + armMovement, 4, 8);
        ctx.fillRect(this.x + 18, this.y + 15 - armMovement, 4, 8);

        // Pernas
        ctx.fillStyle = '#1C1C1C';
        ctx.fillRect(this.x + 8, this.y + 27, 3, 3);
        ctx.fillRect(this.x + 14, this.y + 27, 3, 3);

        // Aura sombria
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowIntensity * 0.2})`;
        ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
        
        ctx.restore();
    }
}

// Classe dos anjos com gráficos melhorados
class Angel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 45;
        this.floatOffset = 0;
        this.floatSpeed = 0.05;
        this.wingAnimation = 0;
        this.baseY = y;
    }

    update(deltaTime) {
        this.floatOffset += this.floatSpeed;
        this.wingAnimation += deltaTime * 0.02;
        this.y = this.baseY + Math.sin(this.floatOffset) * 3;
    }

    render(ctx, time) {
        ctx.save();
        
        // Efeito de luz divina
        const lightIntensity = 0.3 + Math.sin(time * 0.003) * 0.2;
        const lightGradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, 50
        );
        lightGradient.addColorStop(0, `rgba(255, 255, 255, ${lightIntensity})`);
        lightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = lightGradient;
        ctx.fillRect(this.x - 20, this.y - 20, this.width + 40, this.height + 40);

        // Corpo branco com gradiente
        const bodyGradient = ctx.createLinearGradient(0, this.y + 15, 0, this.y + 40);
        bodyGradient.addColorStop(0, '#FFFFFF');
        bodyGradient.addColorStop(1, '#F0F8FF');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(this.x + 10, this.y + 15, 15, 25);

        // Cabeça
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 12, this.y, 11, 12);

        // Olhos azuis celestiais
        ctx.fillStyle = '#4682B4';
        ctx.fillRect(this.x + 14, this.y + 3, 2, 2);
        ctx.fillRect(this.x + 19, this.y + 3, 2, 2);
        
        // Brilho nos olhos
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.x + 14.5, this.y + 3.5, 1, 1);
        ctx.fillRect(this.x + 19.5, this.y + 3.5, 1, 1);

        // Auréola com efeito pulsante
        const haloSize = 10 + Math.sin(time * 0.005) * 2;
        const haloOpacity = 0.8 + Math.sin(time * 0.003) * 0.2;
        
        ctx.strokeStyle = `rgba(255, 215, 0, ${haloOpacity})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x + 17, this.y - 5, haloSize, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Brilho interno da auréola
        ctx.strokeStyle = `rgba(255, 255, 255, ${haloOpacity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + 17, this.y - 5, haloSize - 2, 0, 2 * Math.PI);
        ctx.stroke();

        // Asas com movimento
        const wingFlap = Math.sin(this.wingAnimation * 15) * 3;
        const wingGradient = ctx.createLinearGradient(0, this.y + 10, 0, this.y + 30);
        wingGradient.addColorStop(0, 'rgba(230, 230, 250, 0.9)');
        wingGradient.addColorStop(1, 'rgba(230, 230, 250, 0.6)');
        ctx.fillStyle = wingGradient;
        
        // Asa esquerda
        ctx.fillRect(this.x - wingFlap, this.y + 10, 8, 20);
        // Asa direita
        ctx.fillRect(this.x + 27 + wingFlap, this.y + 10, 8, 20);

        // Braços
        ctx.fillStyle = '#FDBCB4';
        ctx.fillRect(this.x + 6, this.y + 18, 5, 10);
        ctx.fillRect(this.x + 24, this.y + 18, 5, 10);

        // Pernas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(this.x + 12, this.y + 40, 4, 5);
        ctx.fillRect(this.x + 19, this.y + 40, 4, 5);
        
        ctx.restore();
    }
}

// Classe das pedras de fé com gráficos melhorados
class FaithStone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.glow = 0;
        this.glowSpeed = 0.1;
        this.rotation = 0;
        this.baseY = y;
    }

    render(ctx, time) {
        this.glow += this.glowSpeed;
        this.rotation += 0.02;
        
        // Flutuação suave
        const floatY = this.baseY + Math.sin(time * 0.003) * 2;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, floatY + this.height/2);
        ctx.rotate(this.rotation);
        
        // Efeito de brilho externo
        const glowIntensity = 0.4 + Math.sin(this.glow) * 0.3;
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
        glowGradient.addColorStop(0, `rgba(135, 206, 235, ${glowIntensity})`);
        glowGradient.addColorStop(1, 'rgba(135, 206, 235, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(-25, -25, 50, 50);
        
        // Pedra principal com gradiente
        const stoneGradient = ctx.createLinearGradient(-10, -10, 10, 10);
        stoneGradient.addColorStop(0, '#87CEEB');
        stoneGradient.addColorStop(0.5, '#4682B4');
        stoneGradient.addColorStop(1, '#5F9EA0');
        ctx.fillStyle = stoneGradient;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Brilho interno
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, 3);
        
        // Símbolo da cruz com brilho
        const crossGradient = ctx.createLinearGradient(0, -6, 0, 6);
        crossGradient.addColorStop(0, '#FFD700');
        crossGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = crossGradient;
        ctx.fillRect(-2, -6, 4, 12);
        ctx.fillRect(-6, -2, 12, 4);
        
        // Brilho da cruz
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-1, -6, 2, 12);
        ctx.fillRect(-6, -1, 12, 2);
        
        ctx.restore();
    }
}

// Classe das plataformas com gráficos melhorados
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(ctx) {
        // Plataforma principal com gradiente
        const platformGradient = ctx.createLinearGradient(0, this.y, 0, this.y + this.height);
        platformGradient.addColorStop(0, '#DEB887');
        platformGradient.addColorStop(0.3, '#D2691E');
        platformGradient.addColorStop(1, '#8B4513');
        ctx.fillStyle = platformGradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Borda superior brilhante
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(this.x, this.y, this.width, 3);
        
        // Textura da plataforma
        ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        for (let i = 0; i < this.width; i += 10) {
            ctx.fillRect(this.x + i, this.y + 5, 1, this.height - 10);
        }
        
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x + 2, this.y + this.height - 5, this.width - 2, 5);
    }
}

// Classe de partículas para efeitos visuais
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1;
        this.maxLife = 1;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = (Math.random() - 0.5) * 4;
        this.size = 2 + Math.random() * 4;
        this.color = this.getColorByType(type);
        this.gravity = 0.1;
    }

    getColorByType(type) {
        switch(type) {
            case 'dust': return '#D2691E';
            case 'shadows': return '#4B0082';
            case 'holy': return '#FFD700';
            case 'sand': return '#DEB887';
            case 'divine': return '#87CEEB';
            case 'impact': return '#FF4500';
            case 'collect': return '#FFD700';
            case 'heal': return '#00FF00';
            case 'defeat': return '#FF0000';
            default: return '#FFFFFF';
        }
    }

    update(deltaTime) {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        this.life -= deltaTime * 0.001;
        
        if (this.life <= 0) {
            this.life = 0;
        }
    }

    render(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
        
        ctx.restore();
    }
}

// Inicializar o jogo
let game;
window.addEventListener('load', () => {
    game = new Game();
});