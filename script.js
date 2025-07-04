const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
const messages = Array.from(document.querySelectorAll('.message'));
const countdownElement = document.getElementById('countdown');
const initialMessage = document.getElementById('initial-message');
let particles = [];
let rockets = [];
let animationStarted = false;

let frame = 0;
let messageIndex = 0;
let finaleStarted = false;
let finaleEnded = false;

const startDate = new Date('2025-04-06T00:00:00+07:00');

// Mobile detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isLandscape = window.innerHeight < window.innerWidth;

function updateCountdown() {
    const now = new Date();
    const thailandOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const thailandTime = new Date(now.getTime() + (localOffset + thailandOffset) * 60 * 1000);
    
    const timeDiff = thailandTime - startDate;
    
    const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30.44));
    const days = Math.floor((timeDiff % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    let timeString = '';
    if (years > 0) timeString += `${years} year `;
    if (days > 0) timeString += `${days} day `;
    if (months > 0) timeString += `${months} month `;
    timeString += `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    countdownElement.innerHTML = timeString;
}

updateCountdown();
setInterval(updateCountdown, 1000);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Rocket {
    constructor(x = null) {
        this.x = x ?? Math.random() * canvas.width;
        this.y = canvas.height;
        this.targetY = canvas.height * 0.2 + Math.random() * canvas.height * 0.2;
        this.speed = isMobile ? (12 + Math.random() * 4) : (15 + Math.random() * 5);
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.velocity = {
            x: (Math.random() - 0.5) * (isMobile ? 1.5 : 2),
            y: -this.speed
        };
        this.trailLength = isMobile ? 8 : 10;
        this.trail = []; 
        this.shape = Math.random() < 0.3 ? 'heart' : (Math.random() < 0.6 ? 'star' : 'circle');
    }

    draw() {
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = isMobile ? 1.5 : 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, isMobile ? 2 : 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;
        return this.y <= this.targetY;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * (isMobile ? 6 : 8),
            y: (Math.random() - 0.5) * (isMobile ? 6 : 8)
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008; 
        this.friction = 0.99; 
        this.gravity = 0.08; 
        this.trail = [];
        this.trailLength = isMobile ? 4 : 5;
    }

    draw() {
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, isMobile ? 1.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }

        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
    }
}

function createFireworkShape(x, y, color, shape = 'circle') {
    const colors = [color, '#ff69b4', '#ff1493', '#ff00ff', '#ff66ff', '#ff0000', '#ffd700'];
    const particleCount = isMobile ? 
        (shape === 'heart' ? 60 : 45) : 
        (shape === 'heart' ? 80 : 60);
    
    ctx.save();
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(x, y, isMobile ? 6 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    if (shape === 'heart') {
        const heartPoints = createHeartPoints(x, y, isMobile ? 1.5 : 2);
        heartPoints.forEach(point => {
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            const particle = new Particle(x, y, particleColor);
            const angle = Math.atan2(point.y - y, point.x - x);
            const velocity = isMobile ? (3 + Math.random() * 1.5) : (4 + Math.random() * 2);
            particle.velocity.x = Math.cos(angle) * velocity;
            particle.velocity.y = Math.sin(angle) * velocity;
            particles.push(particle);
        });
    } else if (shape === 'star') {
        for (let i = 0; i < particleCount; i++) {
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = i % 2 === 0 ? 
                (isMobile ? 6 + Math.random() * 1.5 : 8 + Math.random() * 2) : 
                (isMobile ? 3 + Math.random() * 1.5 : 4 + Math.random() * 2);
            const particle = new Particle(x, y, particleColor);
            particle.velocity.x = Math.cos(angle) * velocity;
            particle.velocity.y = Math.sin(angle) * velocity;
            particles.push(particle);
        }
    } else {
        for (let i = 0; i < particleCount; i++) {
            const particleColor = colors[Math.floor(Math.random() * colors.length)];
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = isMobile ? (4.5 + Math.random() * 1.5) : (6 + Math.random() * 2);
            const particle = new Particle(x, y, particleColor);
            particle.velocity.x = Math.cos(angle) * velocity;
            particle.velocity.y = Math.sin(angle) * velocity;
            particles.push(particle);
        }
    }
}

function createFirework(x, y, color) {
    const shapes = ['heart', 'star', 'circle'];
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    createFireworkShape(x, y, color, randomShape);
}

function showMessage(index, x, y) {
    const message = messages[index];
    if (!message) return;

    // Get message dimensions for mobile positioning
    const messageWidth = isMobile ? 250 : 300;
    const messageHeight = isMobile ? 100 : 120;
    
    // Calculate safe position for mobile
    let posX = Math.max(10, Math.min(x - messageWidth/2, window.innerWidth - messageWidth - 10));
    let posY = Math.max(10, Math.min(y - messageHeight/2, window.innerHeight - messageHeight - 10));
    
    // Ensure message doesn't overlap with countdown on mobile
    if (isMobile && posY < 80) {
        posY = 80;
    }

    message.style.display = 'block';
    message.style.left = `${posX}px`;
    message.style.top = `${posY}px`;
    message.style.animation = 'messageAppear 1s forwards';

    setTimeout(() => {
        message.style.animation = 'messageFade 1s forwards';
        setTimeout(() => {
            message.style.display = 'none';
        }, 1000);
    }, 2000);
}

function startSequence() {
    initialMessage.style.display = 'block';

    setTimeout(() => {
        initialMessage.style.animation = 'initialMessageFade 1s forwards';
        setTimeout(() => {
            initialMessage.style.display = 'none';
            animationStarted = true;
            animate();
        }, 1000);
    }, 3000);
}

function animate() {
    if (!animationStarted) return;

    ctx.fillStyle = 'rgba(26, 26, 26, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    rockets = rockets.filter(rocket => {
        rocket.draw();
        const shouldExplode = rocket.update();
        
        if (shouldExplode) {
            createFirework(rocket.x, rocket.y, rocket.color);
            showMessage(messageIndex, rocket.x, rocket.y);
            messageIndex = (messageIndex + 1) % messages.length;
            
            if (messageIndex === 0 && !finaleStarted) {
                finaleStarted = true;
                setTimeout(() => {
                    createFinaleFireworks();
                    showAllMessages();
                    finaleEnded = true;
                }, 2000);
            }
            return false;
        }
        return true;
    });


    const remainingParticles = [];
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        if (particle.alpha <= 0) continue;
        particle.update();
        particle.draw();
        remainingParticles.push(particle);
    }
    particles = remainingParticles;

    frame++;
    if (!finaleStarted && frame % (isMobile ? 150 : 120) === 0) {
        rockets.push(new Rocket());
    }

    if (!finaleEnded || particles.length > 0) {
        requestAnimationFrame(animate);
    }
}

startSequence();

function createHeartPoints(x, y, size) {
    const points = [];
    const numberOfPoints = isMobile ? 25 : 30;
    for (let i = 0; i < numberOfPoints; i++) {
        const t = (i / numberOfPoints) * 2 * Math.PI;
        const x1 = 16 * Math.pow(Math.sin(t), 3);
        const y1 = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        points.push({
            x: x + x1 * size,
            y: y + y1 * size
        });
    }
    return points;
}

function createFinaleFireworks() {
    const centerX = canvas.width / 2;
    const numberOfFireworks = isMobile ? 8 : 12;
    let delay = 0;

    for (let i = 0; i < numberOfFireworks; i++) {
        setTimeout(() => {
            const rocket = new Rocket(centerX + (Math.random() - 0.5) * (isMobile ? 150 : 200));
            rocket.shape = i % 3 === 0 ? 'heart' : (i % 3 === 1 ? 'star' : 'circle');
            rocket.velocity.x *= 0.3;
            rockets.push(rocket);
        }, delay);
        delay += isMobile ? 400 : 300;
    }

    setTimeout(() => {
        const heartPoints = createHeartPoints(centerX, canvas.height * 0.4, isMobile ? 4 : 6);
        const heartColors = ['#ff1493', '#ff69b4', '#ff0000'];
        
        heartPoints.forEach((point, index) => {
            setTimeout(() => {
                const particle = new Particle(point.x, point.y, heartColors[index % heartColors.length]);
                particle.velocity.x *= 0.15;
                particle.velocity.y *= 0.15;
                particle.decay *= 0.2;
                particle.gravity *= 0.4;
                particles.push(particle);
            }, index * (isMobile ? 40 : 30));
        });
    }, delay + 1000);
}

function showAllMessages() {
    const messagePositions = [];
    const messageWidth = isMobile ? 250 : 300;
    const messageHeight = isMobile ? 100 : 120;
    const padding = 30; // Increased padding for better spacing
    
    // Calculate available area
    const topOffset = isMobile ? 120 : 100;
    const availableWidth = window.innerWidth - padding * 2;
    const availableHeight = window.innerHeight - topOffset - padding * 2;
    
    // Create a spiral pattern for better distribution
    const centerX = window.innerWidth / 2;
    const centerY = topOffset + availableHeight / 2;
    const maxRadius = Math.min(availableWidth, availableHeight) / 2 - Math.max(messageWidth, messageHeight) / 2;
    
    for (let i = 0; i < messages.length; i++) {
        let position;
        let attempts = 0;
        const maxAttempts = 200;
        
        do {
            // Try spiral positioning first
            if (attempts < 100) {
                const angle = (i * 137.5) * (Math.PI / 180); // Golden angle for better distribution
                const radius = (i / messages.length) * maxRadius;
                position = {
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius
                };
            } else if (attempts < 150) {
                // Try grid-based positioning
                const cols = Math.floor(availableWidth / (messageWidth + padding));
                const col = i % cols;
                const row = Math.floor(i / cols);
                position = {
                    x: padding + col * (messageWidth + padding),
                    y: topOffset + padding + row * (messageHeight + padding)
                };
            } else {
                // Fallback to random positioning
                position = {
                    x: padding + Math.random() * (availableWidth - messageWidth),
                    y: topOffset + padding + Math.random() * (availableHeight - messageHeight)
                };
            }
            
            // Ensure position is within bounds
            position.x = Math.max(padding, Math.min(position.x, window.innerWidth - messageWidth - padding));
            position.y = Math.max(topOffset + padding, Math.min(position.y, window.innerHeight - messageHeight - padding));
            
            // Check for overlaps with existing messages
            let overlap = false;
            for (let j = 0; j < messagePositions.length; j++) {
                const existingPos = messagePositions[j];
                const distanceX = Math.abs(position.x - existingPos.x);
                const distanceY = Math.abs(position.y - existingPos.y);
                
                // Check if messages overlap (including padding)
                if (distanceX < (messageWidth + padding) && distanceY < (messageHeight + padding)) {
                    overlap = true;
                    break;
                }
            }
            
            if (!overlap) break;
            attempts++;
        } while (attempts < maxAttempts);
        
        // If we still have overlap after max attempts, force position with slight adjustment
        if (attempts >= maxAttempts) {
            // Find the best available position by checking corners and edges
            const positions = [
                { x: padding, y: topOffset + padding },
                { x: window.innerWidth - messageWidth - padding, y: topOffset + padding },
                { x: padding, y: window.innerHeight - messageHeight - padding },
                { x: window.innerWidth - messageWidth - padding, y: window.innerHeight - messageHeight - padding },
                { x: centerX - messageWidth / 2, y: topOffset + padding },
                { x: centerX - messageWidth / 2, y: window.innerHeight - messageHeight - padding }
            ];
            
            let bestPosition = positions[0];
            let minOverlap = Infinity;
            
            for (let pos of positions) {
                let overlapCount = 0;
                for (let existingPos of messagePositions) {
                    const distanceX = Math.abs(pos.x - existingPos.x);
                    const distanceY = Math.abs(pos.y - existingPos.y);
                    if (distanceX < (messageWidth + padding) && distanceY < (messageHeight + padding)) {
                        overlapCount++;
                    }
                }
                if (overlapCount < minOverlap) {
                    minOverlap = overlapCount;
                    bestPosition = pos;
                }
            }
            
            position = bestPosition;
        }
        
        messagePositions.push(position);
    }

    messages.forEach((message, index) => {
        setTimeout(() => {
            message.style.display = 'block';
            message.style.left = `${messagePositions[index].x}px`;
            message.style.top = `${messagePositions[index].y}px`;
            message.style.animation = 'messageAppear 1s forwards';

            if (index === messages.length - 1) {
                setTimeout(() => {
                    messages.forEach(msg => {
                        msg.style.animation = 'messageFade 1s forwards';
                    });

                    setTimeout(() => {
                        const titleContainer = document.querySelector('.title-container');
                        titleContainer.style.display = 'block';
                        titleContainer.classList.add('show');
                    }, 1000);
                }, 4000);
            }
        }, index * (isMobile ? 600 : 500));
    });
}