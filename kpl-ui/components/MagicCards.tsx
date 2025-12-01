
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MagicCardsProps {
    hiddenWords?: string[];
}

const defaultHiddenWords = ["COURAGE", "WISDOM", "FORTUNE", "LOVE", "PEACE"];

export default function MagicCards({ hiddenWords = defaultHiddenWords }: MagicCardsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Configuration
        const HIDDEN_WORDS = hiddenWords;
        const ACCENT_COLOR = "#00ffcc";
        abortControllerRef.current = new AbortController();

        // Responsive configuration - calculate once at the start
        const screenWidth = window.innerWidth;
        const isMobile = screenWidth < 768;
        const isTablet = screenWidth >= 768 && screenWidth < 1024;
        
        let cols = 5;
        if (isMobile) {
            cols = Math.min(2, HIDDEN_WORDS.length); // 2 columns on mobile
        } else if (isTablet) {
            cols = Math.min(3, HIDDEN_WORDS.length); // 3 columns on tablet
        }
        
        const rows = Math.ceil(HIDDEN_WORDS.length / cols);

        // Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);
        scene.fog = new THREE.FogExp2(0x050505, 0.005);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Dynamic camera position based on screen size and number of cards
        if (isMobile) {
            camera.position.z = 18 + (rows * 2); // Move camera further back on mobile
        } else if (isTablet) {
            camera.position.z = 15 + (rows * 1.5);
        } else {
            camera.position.z = 12 + (rows * 0.5);
        }
        
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 2);
        spotLight.position.set(0, 20, 20);
        spotLight.angle = 0.5;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        scene.add(spotLight);

        const pointLight = new THREE.PointLight(0x00ffff, 25, 150);
        pointLight.position.set(0, 0, 5);
        scene.add(pointLight);

        // Helper: Create Text Texture
        function createTextTexture(text: string, cardNumber: number): THREE.CanvasTexture {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const width = 512;
            const height = 768;
            canvas.width = width;
            canvas.height = height;

            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#232323');
            gradient.addColorStop(1, '#0a0a0a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = ACCENT_COLOR;
            ctx.lineWidth = 20;
            ctx.strokeRect(20, 20, width - 40, height - 40);

            // Draw card number at top
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = ACCENT_COLOR;
            ctx.shadowColor = ACCENT_COLOR;
            ctx.shadowBlur = 5;
            ctx.fillText(`#${cardNumber}`, width / 2, 80);

            // Draw main text in center
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = ACCENT_COLOR;
            ctx.shadowColor = ACCENT_COLOR;
            ctx.shadowBlur = 8;
            ctx.fillText(text, width / 2, height / 2);

            return new THREE.CanvasTexture(canvas);
        }

        // Helper: Create Cover Texture
        function createCoverTexture(cardNumber: number): THREE.CanvasTexture {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const size = 512;
            canvas.width = size;
            canvas.height = size;

            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, size, size);

            ctx.strokeStyle = '#333';
            ctx.lineWidth = 5;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size, size);
            ctx.moveTo(size, 0);
            ctx.lineTo(0, size);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 100, 0, Math.PI * 2);
            ctx.fillStyle = '#222';
            ctx.fill();
            ctx.stroke();

            // Add card number
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = ACCENT_COLOR;
            ctx.shadowColor = ACCENT_COLOR;
            ctx.shadowBlur = 8;
            ctx.fillText(cardNumber.toString(), size / 2, size / 2);

            return new THREE.CanvasTexture(canvas);
        }

        // Create Cards
        const cards: THREE.Mesh[] = [];
        
        // Responsive card size
        const cardWidth = isMobile ? 2 : (isTablet ? 2.5 : 3);
        const cardHeight = isMobile ? 3 : (isTablet ? 3.75 : 4.5);
        const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, 0.1);

        const spacingX = isMobile ? 2.5 : (isTablet ? 3 : 3.5);
        const spacingY = isMobile ? 3.5 : (isTablet ? 4.25 : 5);
        const startX = -((cols - 1) * spacingX) / 2;
        const startY = ((rows - 1) * spacingY) / 2;

        let wordIndex = 0;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (wordIndex >= HIDDEN_WORDS.length) break;

                const word = HIDDEN_WORDS[wordIndex];
                const cardNumber = wordIndex + 1;
                const textTexture = createTextTexture(word, cardNumber);
                const coverTexture = createCoverTexture(cardNumber);

                const materials = [
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({ color: 0x111111 }),
                    new THREE.MeshStandardMaterial({
                        color: 0xffffff,
                        map: coverTexture,
                        roughness: 0.5,
                        metalness: 0.7,
                        emissive: 0x333333,
                        emissiveIntensity: 0.5
                    }),
                    new THREE.MeshBasicMaterial({ map: textTexture })
                ];

                const card = new THREE.Mesh(geometry, materials);

                card.position.set(
                    startX + j * spacingX,
                    startY - i * spacingY,
                    0
                );

                card.userData = {
                    isFlipped: false,
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

        // Background Particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 700;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 40;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.05,
            color: 0x00ffff,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true,
            map: createCircleTexture()
        });
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Helper: Create Circle Texture for particles
        function createCircleTexture(): THREE.CanvasTexture {
            const canvas = document.createElement('canvas');
            const size = 32;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            
            const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);
            
            return new THREE.CanvasTexture(canvas);
        }

        // Interactivity
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const targetMouse = new THREE.Vector2();
        let hoveredCard: THREE.Mesh | null = null;

        const handleMouseMove = (event: MouseEvent) => {
            targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        const handleClick = () => {
            if (hoveredCard) {
                const data = hoveredCard.userData;
                data.isFlipped = !data.isFlipped;
                data.targetRotationY = data.isFlipped ? Math.PI : 0;
            }
        };

        const canvasElement = renderer.domElement;
        window.addEventListener('mousemove', handleMouseMove, { signal: abortControllerRef.current.signal });
        canvasElement.addEventListener('click', handleClick, { signal: abortControllerRef.current.signal });

        // Animation Loop
        const clock = new THREE.Clock();

        function animate() {
            animationFrameRef.current = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            mouse.x += (targetMouse.x - mouse.x) * 0.1;
            mouse.y += (targetMouse.y - mouse.y) * 0.1;

            pointLight.position.x = mouse.x * 10;
            pointLight.position.y = mouse.y * 10;

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

            cards.forEach(card => {
                const data = card.userData;

                let targetScale = 1;
                let targetZ = 0;
                let targetTiltX = 0;
                let targetTiltY = 0;

                if (card === hoveredCard) {
                    targetScale = 1.1;
                    targetZ = 0.5;
                    targetTiltX = mouse.y * 0.2;
                    targetTiltY = -mouse.x * 0.2;
                }

                const lerpSpeed = 0.1;

                const targetRotY = data.targetRotationY + targetTiltY;
                card.rotation.y += (targetRotY - card.rotation.y) * lerpSpeed;
                card.rotation.x += (targetTiltX - card.rotation.x) * lerpSpeed;

                const zOffset = data.isFlipped ? 0.2 : 0;
                card.position.z += ((targetZ + zOffset) - card.position.z) * lerpSpeed;

                card.scale.setScalar(
                    card.scale.x + (targetScale - card.scale.x) * lerpSpeed
                );

                if (!data.isFlipped && card !== hoveredCard) {
                    card.position.y = data.baseY + Math.sin(elapsedTime * 2 + data.id) * 0.05;
                } else {
                    card.position.y += (data.baseY - card.position.y) * 0.1;
                }
            });

            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.02;

            renderer.render(scene, camera);
        }

        // Resize Handler
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Update camera position on resize
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

        // Cleanup
        return () => {
            // window.removeEventListener('mousemove', handleMouseMove);
            // if (rendererRef.current) {
            //     rendererRef.current.domElement.removeEventListener('click', handleClick);
            // }
            // window.removeEventListener('resize', handleResize);

            abortControllerRef.current?.abort();

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            if (rendererRef.current && containerRef.current) {
                containerRef.current.removeChild(rendererRef.current.domElement);
                rendererRef.current.dispose();
            }

            // Dispose geometries and materials
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
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#050505]">
            {/* <div className="absolute top-5 left-0 w-full text-center z-10 pointer-events-none text-white/80 uppercase tracking-[4px] text-sm">
                <div className="inline-block bg-black/50 px-5 py-2.5 rounded-[30px] border border-white/10 backdrop-blur-[5px]">
                    Select a card to reveal your destiny
                </div>
            </div> */}
            <div ref={containerRef} className="w-full h-full absolute top-0 left-0 z-[1]" />
        </div>
    );
}