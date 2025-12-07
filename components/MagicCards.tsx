import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CardItem {
    text: string;
    image?: string;
}

interface MagicCardsProps {
    items?: CardItem[];
    hiddenWords?: string[]; // Kept for backward compatibility
    onBack?: () => void;
}

const defaultItems: CardItem[] = [
    { text: "ALEX", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Alex" },
    { text: "SARAH", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah" },
    { text: "JORDAN", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Jordan" },
    { text: "EMMA", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Emma" },
    { text: "RYAN", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=Ryan" }
];

/**
 * MagicCards Component - Optimized 3D Card Animation with Avatars
 */
const MagicCards = ({ items = defaultItems, hiddenWords, onBack }: MagicCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const clockRef = useRef<THREE.Clock>(new THREE.Clock());
    const textureCacheRef = useRef<Map<string, THREE.CanvasTexture>>(new Map());
    const lastFrameTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        // Configuration
        // Merge hiddenWords into items if items aren't provided but hiddenWords are
        let activeItems: CardItem[] = items;
        if (items === defaultItems && hiddenWords) {
            activeItems = hiddenWords.map(word => ({ 
                text: word, 
                image: `https://api.dicebear.com/9.x/initials/svg?seed=${word}` // Fallback avatar
            }));
        }

        const ACCENT_COLOR = "#00ffcc";
        const SECONDARY_COLOR = "#004433"; 
        const BG_COLOR = "#050505";
        
        abortControllerRef.current = new AbortController();

        // Responsive configuration
        const screenWidth = window.innerWidth;
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
        const isMobile = screenWidth < 768;
        const isTablet = screenWidth >= 768 && screenWidth < 1024;
        const targetFPS = isLowEndDevice || isMobile ? 30 : 60;
        const frameInterval = 1000 / targetFPS;
        
        let cols = 5;
        if (isMobile) {
            cols = Math.min(2, activeItems.length);
        } else if (isTablet) {
            cols = Math.min(3, activeItems.length);
        }
        
        const rows = Math.ceil(activeItems.length / cols);

        // Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(BG_COLOR);
        scene.fog = new THREE.FogExp2(BG_COLOR, 0.005);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        if (isMobile) {
            camera.position.z = 18 + (rows * 2);
        } else if (isTablet) {
            camera.position.z = 15 + (rows * 1.5);
        } else {
            camera.position.z = 12 + (rows * 0.5);
        }
        
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ 
            antialias: !isLowEndDevice && !isMobile,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, isLowEndDevice ? 1 : 2));
        renderer.shadowMap.enabled = !isLowEndDevice;
        renderer.shadowMap.type = isLowEndDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 5);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 2.5);
        spotLight.position.set(0, 20, 20);
        spotLight.angle = 0.5;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        scene.add(spotLight);

        const pointLight = new THREE.PointLight(ACCENT_COLOR, 10, 150);
        pointLight.position.set(0, 0, 5);
        scene.add(pointLight);

        // --- Helper: Draw Decorative Corner ---
        function drawCorner(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, scaleX: number, scaleY: number) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(scaleX, scaleY);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size, 0);
            ctx.lineTo(0, size);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // --- Helper: Draw Card Content (Abstracted for Async Image Loading) ---
        function drawCardFaceContent(
            ctx: CanvasRenderingContext2D, 
            width: number, 
            height: number, 
            scale: number, 
            text: string, 
            cardNumber: number,
            image?: HTMLImageElement
        ) {
            // 1. Background
            const gradient = ctx.createRadialGradient(width/2, height/2, 100 * scale, width/2, height/2, height);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // 2. Borders
            const margin = 50 * scale;
            ctx.strokeStyle = ACCENT_COLOR;
            ctx.lineWidth = 15 * scale;
            ctx.strokeRect(margin, margin, width - margin*2, height - margin*2);
            
            ctx.strokeStyle = SECONDARY_COLOR;
            ctx.lineWidth = 5 * scale;
            ctx.strokeRect(margin + 20 * scale, margin + 20 * scale, width - (margin + 20 * scale)*2, height - (margin + 20 * scale)*2);

            // 3. Corners
            ctx.fillStyle = ACCENT_COLOR;
            const cornerSize = 60 * scale;
            drawCorner(ctx, margin, margin, cornerSize, 1, 1);
            drawCorner(ctx, width - margin, margin, cornerSize, -1, 1);
            drawCorner(ctx, margin, height - margin, cornerSize, 1, -1);
            drawCorner(ctx, width - margin, height - margin, cornerSize, -1, -1);

            // 4. Circular Avatar
            const avatarRadius = 350 * scale; // Increased from 250
            const avatarY = height * 0.4; // Adjusted position slightly down

            ctx.save();
            ctx.beginPath();
            ctx.arc(width/2, avatarY, avatarRadius, 0, Math.PI * 2);
            ctx.closePath();
            
            // Avatar Glow
            ctx.shadowColor = ACCENT_COLOR;
            ctx.shadowBlur = 30 * scale;
            ctx.strokeStyle = ACCENT_COLOR;
            ctx.lineWidth = 10 * scale;
            ctx.stroke();
            ctx.shadowBlur = 0; // Reset for clip

            ctx.clip(); // Clip subsequent drawing to circle

            if (image && image.complete && image.naturalWidth > 0) {
                // Draw Image
                // Calculate aspect ratio to cover
                const aspect = image.naturalWidth / image.naturalHeight;
                let drawW = avatarRadius * 2;
                let drawH = avatarRadius * 2;
                if (aspect > 1) {
                    drawH = drawW / aspect; // Fit width
                    if (drawH < avatarRadius * 2) { // If height is too small, scale by height
                         drawH = avatarRadius * 2;
                         drawW = drawH * aspect;
                    }
                } else {
                    drawW = drawH * aspect;
                    if (drawW < avatarRadius * 2) {
                        drawW = avatarRadius * 2;
                        drawH = drawW / aspect;
                    }
                }
                ctx.drawImage(image, width/2 - drawW/2, avatarY - drawH/2, drawW, drawH);
            } else {
                // Placeholder
                ctx.fillStyle = '#222';
                ctx.fillRect(width/2 - avatarRadius, avatarY - avatarRadius, avatarRadius*2, avatarRadius*2);
                
                // Initials as placeholder
                ctx.font = `bold ${200 * scale}px Georgia`; // Increased font size for bigger circle
                ctx.fillStyle = SECONDARY_COLOR;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text.substring(0, 1).toUpperCase(), width/2, avatarY);
            }
            ctx.restore();

            // 5. Card Number (Moved to top)
            ctx.font = `italic ${80 * scale}px Georgia`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.shadowBlur = 0;
            ctx.fillText(`#${cardNumber}`, width / 2, margin + 40 * scale);

            // 6. Name / Text (Below Avatar)
            const textY = height * 0.8; // Moved text down further
            ctx.font = `bold ${120 * scale}px Georgia`; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = ACCENT_COLOR;
            ctx.shadowColor = ACCENT_COLOR;
            ctx.shadowBlur = 15 * scale;
            
            const maxWidth = width - 150 * scale; 
            ctx.fillText(text.toUpperCase(), width/2, textY, maxWidth);
        }

        // --- Helper: Create Texture with Async Image ---
        function createCardFaceTexture(item: CardItem, cardNumber: number): THREE.CanvasTexture {
            const cacheKey = `face_${item.text}_${cardNumber}_${isMobile}`;
            
            // We don't return cached texture immediately if we want to handle image loading 
            // unless we cache the Loaded state too. For simplicity, we recreate or check cache.
            if (textureCacheRef.current.has(cacheKey)) {
                return textureCacheRef.current.get(cacheKey)!;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const scale = isMobile ? 0.5 : 1;
            const width = Math.floor(1024 * scale);
            const height = Math.floor(1536 * scale);
            canvas.width = width;
            canvas.height = height;

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = isLowEndDevice ? 1 : renderer.capabilities.getMaxAnisotropy();

            // Initial Draw (Placeholder)
            drawCardFaceContent(ctx, width, height, scale, item.text, cardNumber);
            texture.needsUpdate = true;

            // Load Image Asynchronously
            if (item.image) {
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = () => {
                    drawCardFaceContent(ctx, width, height, scale, item.text, cardNumber, img);
                    texture.needsUpdate = true;
                };
                img.src = item.image;
            }

            textureCacheRef.current.set(cacheKey, texture);
            return texture;
        }

        // --- Helper: Create Cover Texture ---
        function createCoverTexture(cardNumber: number): THREE.CanvasTexture {
            const cacheKey = `cover_${cardNumber}_${isMobile}`;
            if (textureCacheRef.current.has(cacheKey)) {
                return textureCacheRef.current.get(cacheKey)!;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const scale = isMobile ? 0.5 : 1;
            const size = Math.floor(1024 * scale);
            canvas.width = size;
            canvas.height = size;

            const gradient = ctx.createRadialGradient(size/2, size/2, 50 * scale, size/2, size/2, size/1.2);
            gradient.addColorStop(0, '#0a2a2a');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            const centerX = size / 2;
            const centerY = size / 2;

            ctx.strokeStyle = ACCENT_COLOR;
            ctx.shadowColor = ACCENT_COLOR;
            ctx.shadowBlur = 10 * scale;

            ctx.beginPath();
            ctx.arc(centerX, centerY, 380 * scale, 0, Math.PI * 2);
            ctx.lineWidth = 10 * scale;
            ctx.stroke();

            ctx.beginPath();
            ctx.setLineDash([40 * scale, 30 * scale]);
            ctx.arc(centerX, centerY, 320 * scale, 0, Math.PI * 2);
            ctx.lineWidth = 5 * scale;
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            const points = 8; 
            const outerRadius = 280 * scale;
            const innerRadius = 200 * scale;
            for (let i = 0; i <= points * 2; i++) {
                const angle = (Math.PI * i) / points;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.lineWidth = 4 * scale;
            ctx.fillStyle = 'rgba(0, 255, 204, 0.1)';
            ctx.fill();
            ctx.stroke();

            ctx.font = `bold ${180 * scale}px Georgia`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = ACCENT_COLOR;
            ctx.shadowBlur = 20 * scale;
            ctx.fillText(cardNumber.toString(), centerX, centerY + 10 * scale);

            const margin = 60 * scale;
            const cornerLen = 100 * scale;
            ctx.lineWidth = 6 * scale;
            ctx.shadowBlur = 0; 
            
            ctx.beginPath();
            ctx.moveTo(margin, margin + cornerLen);
            ctx.lineTo(margin, margin);
            ctx.lineTo(margin + cornerLen, margin);
            ctx.moveTo(size - margin - cornerLen, margin);
            ctx.lineTo(size - margin, margin);
            ctx.lineTo(size - margin, margin + cornerLen);
            ctx.moveTo(size - margin, size - margin - cornerLen);
            ctx.lineTo(size - margin, size - margin);
            ctx.lineTo(size - margin - cornerLen, size - margin);
            ctx.moveTo(margin + cornerLen, size - margin);
            ctx.lineTo(margin, size - margin);
            ctx.lineTo(margin, size - margin - cornerLen);
            ctx.stroke();

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = isLowEndDevice ? 1 : renderer.capabilities.getMaxAnisotropy();
            
            textureCacheRef.current.set(cacheKey, texture);
            return texture;
        }

        // Create Cards
        const cards: THREE.Mesh[] = [];
        
        const cardWidth = isMobile ? 2 : (isTablet ? 2.5 : 3);
        const cardHeight = isMobile ? 3 : (isTablet ? 3.75 : 4.5);
        const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, 0.15); 

        const spacingX = isMobile ? 2.5 : (isTablet ? 3 : 3.5);
        const spacingY = isMobile ? 3.5 : (isTablet ? 4.25 : 5);
        const startX = -((cols - 1) * spacingX) / 2;
        const startY = ((rows - 1) * spacingY) / 2;

        let wordIndex = 0;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (wordIndex >= activeItems.length) break;

                const item = activeItems[wordIndex];
                const cardNumber = wordIndex + 1;
                const textTexture = createCardFaceTexture(item, cardNumber);
                const coverTexture = createCoverTexture(cardNumber);

                const materials = [
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
                    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
                    new THREE.MeshStandardMaterial({ // Front (Cover)
                        color: 0xffffff,
                        map: coverTexture,
                        roughness: 0.3,
                        metalness: 0.6,
                    }),
                    new THREE.MeshStandardMaterial({ // Back (Text + Avatar)
                        color: 0xffffff,
                        map: textTexture,
                        roughness: 0.4,
                        metalness: 0.2,
                    })
                ];

                const card = new THREE.Mesh(geometry, materials);

                card.position.set(
                    startX + j * spacingX,
                    startY - i * spacingY,
                    0
                );

                card.userData = {
                    isFlipped: false,
                    isShaking: false,    // New state for shake animation
                    shakeStartTime: 0,   // Timestamp when shake started
                    targetRotationY: 0,
                    targetScale: 1,
                    baseY: card.position.y,
                    id: wordIndex
                };

                scene.add(card);
                cards.push(card);
                wordIndex++;
            }
        }

        // Particles
        function createCircleTexture(): THREE.CanvasTexture {
            const cacheKey = 'particle_circle';
            if (textureCacheRef.current.has(cacheKey)) {
                return textureCacheRef.current.get(cacheKey)!;
            }

            const canvas = document.createElement('canvas');
            const size = 32;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            
            const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, 'rgba(0, 255, 204, 1)');
            gradient.addColorStop(0.5, 'rgba(0, 255, 204, 0.4)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            
            const texture = new THREE.CanvasTexture(canvas);
            textureCacheRef.current.set(cacheKey, texture);
            return texture;
        }

        const particlesCount = isLowEndDevice ? 200 : isMobile ? 400 : 700;
        const particlesGeometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 40;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: isMobile ? 0.06 : 0.08,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            map: createCircleTexture(),
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Interactivity
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const targetMouse = new THREE.Vector2();
        let hoveredCard: THREE.Mesh | null = null;
        let mouseMoveTimeout: number | null = null;
        
        const vec = new THREE.Vector3(); 
        const pos = new THREE.Vector3();

        const handleMouseMove = (event: MouseEvent) => {
            targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Debounce raycasting for performance
            if (mouseMoveTimeout) clearTimeout(mouseMoveTimeout);
            mouseMoveTimeout = window.setTimeout(() => {
                mouse.x = targetMouse.x;
                mouse.y = targetMouse.y;
            }, isLowEndDevice ? 32 : 16);
        };

        const handleClick = () => {
            if (hoveredCard) {
                const data = hoveredCard.userData;
                
                // If already flipping or shaking, ignore interactions
                if (data.isShaking) return;

                if (!data.isFlipped) {
                    // Start Reveal Sequence: Shake -> Flip
                    data.isShaking = true;
                    data.shakeStartTime = clockRef.current.getElapsedTime();
                } else {
                    // Close Sequence: Instant
                    data.isFlipped = false;
                    data.targetRotationY = 0;
                }
            }
        };

        const canvasElement = renderer.domElement;
        window.addEventListener('mousemove', handleMouseMove, { signal: abortControllerRef.current.signal });
        canvasElement.addEventListener('click', handleClick, { signal: abortControllerRef.current.signal });

        // Animation Loop
        let frameCount = 0;
        let lastRaycastTime = 0;
        const raycastInterval = isLowEndDevice ? 50 : 32;

        function animate(currentTime: number = 0) {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Frame rate limiting for low-end devices
            const deltaTime = currentTime - lastFrameTimeRef.current;
            if (deltaTime < frameInterval) {
                return;
            }
            lastFrameTimeRef.current = currentTime;
            frameCount++;

            const elapsedTime = clockRef.current.getElapsedTime();

            // Smooth mouse interpolation
            mouse.x += (targetMouse.x - mouse.x) * 0.1;
            mouse.y += (targetMouse.y - mouse.y) * 0.1;

            // Precise Light Tracking
            vec.set(mouse.x, mouse.y, 0.5);
            vec.unproject(camera);
            vec.sub(camera.position).normalize();
            const lightZ = 8;
            const distance = (lightZ - camera.position.z) / vec.z;
            pos.copy(camera.position).add(vec.multiplyScalar(distance));
            pointLight.position.copy(pos);

            // Throttle raycasting using time-based interval
            if (currentTime - lastRaycastTime > raycastInterval) {
                lastRaycastTime = currentTime;
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(cards);

                if (intersects.length > 0) {
                    const object = intersects[0].object as THREE.Mesh;
                    if (hoveredCard !== object) {
                        hoveredCard = object;
                        renderer.domElement.style.cursor = 'pointer';
                    }
                } else {
                    if (hoveredCard) {
                        hoveredCard = null;
                        renderer.domElement.style.cursor = 'default';
                    }
                }
            }

            // Update all cards every frame
            cards.forEach(card => {
                const data = card.userData;

                let targetScale = 1;
                let targetZ = 0;
                let targetTiltX = 0;
                let targetTiltY = 0;

                // Shake Logic
                if (data.isShaking) {
                    const shakeDuration = 0.4;
                    const timeShaking = elapsedTime - data.shakeStartTime;

                    if (timeShaking < shakeDuration) {
                        const shakeIntensity = 0.1;
                        const shakeSpeed = 40;
                        card.rotation.z = Math.sin(timeShaking * shakeSpeed) * shakeIntensity;
                        targetScale = 1.05;
                    } else {
                        data.isShaking = false;
                        card.rotation.z = 0;
                        data.isFlipped = true;
                        data.targetRotationY = Math.PI;
                    }
                } else if (Math.abs(card.rotation.z) > 0.001) {
                    card.rotation.z = THREE.MathUtils.lerp(card.rotation.z, 0, 0.1);
                }

                if (card === hoveredCard) {
                    targetScale = 1.05;
                    targetZ = 0.5;
                    targetTiltX = mouse.y * 0.3;
                    targetTiltY = -mouse.x * 0.3;
                }

                const lerpSpeed = isLowEndDevice ? 0.08 : 0.1;

                // Rotation Logic
                const targetRotY = data.targetRotationY + targetTiltY;
                card.rotation.y += (targetRotY - card.rotation.y) * lerpSpeed;
                card.rotation.x += (targetTiltX - card.rotation.x) * lerpSpeed;

                const zOffset = data.isFlipped ? 0.2 : 0;
                const targetFinalZ = targetZ + zOffset;
                card.position.z += (targetFinalZ - card.position.z) * lerpSpeed;

                card.scale.setScalar(card.scale.x + (targetScale - card.scale.x) * lerpSpeed);

                // Idle Float
                if (!data.isFlipped && !data.isShaking && card !== hoveredCard) {
                    card.position.y = data.baseY + Math.sin(elapsedTime * 1.5 + data.id) * 0.05;
                } else {
                    card.position.y += (data.baseY - card.position.y) * 0.1;
                }
            });

            // Particles
            particlesMesh.rotation.y = elapsedTime * 0.02;
            particlesMesh.position.y = Math.sin(elapsedTime * 0.1) * 0.5;

            renderer.render(scene, camera);
        }

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            const isMobile = window.innerWidth < 768;
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            
            if (isMobile) {
                camera.position.z = 18 + (rows * 2);
            } else if (isTablet) {
                camera.position.z = 15 + (rows * 1.5);
            } else {
                camera.position.z = 12 + (rows * 0.5);
            }
        };

        window.addEventListener('resize', handleResize, { signal: abortControllerRef.current.signal });

        animate();

        return () => {
            abortControllerRef.current?.abort();

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (mouseMoveTimeout) {
                clearTimeout(mouseMoveTimeout);
            }

            if (rendererRef.current && containerRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            textureCacheRef.current.forEach(texture => texture.dispose());
            textureCacheRef.current.clear();

            cards.forEach(card => {
                if (card.geometry) card.geometry.dispose();
                if (Array.isArray(card.material)) {
                    card.material.forEach(mat => mat.dispose());
                } else if (card.material) {
                    card.material.dispose();
                }
            });

            if (particlesGeometry) particlesGeometry.dispose();
            if (particlesMaterial) particlesMaterial.dispose();
        };
    }, [items, hiddenWords]); // Re-run if props change

    return (
        <div className="fixed inset-0 w-full h-screen overflow-hidden bg-[#050505] z-40">
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-20 left-5 z-50 px-6 py-3 bg-gradient-to-r from-teal-800 to-teal-900 hover:from-teal-700 hover:to-teal-800 rounded-lg font-serif tracking-widest text-sm transition-all transform hover:scale-105 shadow-lg text-white flex items-center gap-2 border border-teal-500/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    RETURN
                </button>
            )}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}

export default MagicCards;