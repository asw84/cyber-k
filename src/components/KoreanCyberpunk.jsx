import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, invalidate } from "@react-three/fiber";
import {
    Float,
    MeshTransmissionMaterial,
    Html,
    PerspectiveCamera,
    Environment,
    Text,
    PerformanceMonitor,
} from "@react-three/drei";
import {
    EffectComposer,
    Bloom,
    Vignette,
    Noise,
    ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const KOREAN_WORDS = ["사랑", "꿈", "빛", "밤", "하늘", "영원"];
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

function CyberRain() {
    const count = 100;
    const lines = useMemo(() => {
        return Array.from({ length: count }, () => ({
            position: [
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30 - 10,
            ],
            speed: 0.1 + Math.random() * 0.2,
            scale: [0.02, 2 + Math.random() * 5, 0.02],
        }));
    }, []);

    return (
        <group>
            {lines.map((line, i) => (
                <RainLine key={i} {...line} />
            ))}
        </group>
    );
}

function RainLine({ position, speed, scale }) {
    const ref = useRef();
    const lastTime = useRef(0);
    useFrame((state, delta) => {
        if (isMobile) {
            const time = state.clock.getElapsedTime();
            if (time - lastTime.current < 1 / 30) return;
            lastTime.current = time;
        }

        if (ref.current) {
            ref.current.position.y += speed;
            if (ref.current.position.y > 25) ref.current.position.y = -25;
        }
    });

    return (
        <mesh ref={ref} position={position} scale={scale}>
            <boxGeometry />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
    );
}

function Clock() {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            setTime(`${hh}:${mm}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Html
            position={[0, 4, 0]}
            center
            style={{
                pointerEvents: "none",
                userSelect: "none",
                opacity: 0.4,
                color: "white",
                fontFamily: "'Inter', sans-serif",
                fontSize: "4rem",
                fontWeight: 100,
                letterSpacing: "10px",
            }}
        >
            {time}
        </Html>
    );
}

function FallingText({ position, speed }) {
    const ref = useRef();
    const word = useMemo(() => KOREAN_WORDS[Math.floor(Math.random() * KOREAN_WORDS.length)], []);

    const lastTime = useRef(0);
    useFrame((state, delta) => {
        if (isMobile) {
            const time = state.clock.getElapsedTime();
            if (time - lastTime.current < 1 / 30) return;
            lastTime.current = time;
        }

        if (ref.current) {
            ref.current.position.y -= speed;
            if (ref.current.position.y < -30) ref.current.position.y = 30;
        }
    });

    return (
        <group ref={ref} position={position}>
            <Html
                transform
                distanceFactor={15}
                style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: 0.4,
                    color: 'white',
                    fontFamily: 'sans-serif',
                    fontSize: '2rem',
                    filter: 'blur(1px)',
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff'
                }}
            >
                {word}
            </Html>
        </group>
    );
}

function LuxuryBackground() {
    const textElements = useMemo(() => {
        return Array.from({ length: 15 }, () => ({
            position: [
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 60,
                -20,
            ],
            speed: 0.02 + Math.random() * 0.05,
        }));
    }, []);

    return (
        <group>
            {textElements.map((props, i) => (
                <FallingText key={i} {...props} />
            ))}
        </group>
    );
}

function LuxuryGlass() {
    const glass = useRef();
    const core = useRef();

    const lastTime = useRef(0);
    useFrame((state) => {
        if (isMobile) {
            const time = state.clock.getElapsedTime();
            if (time - lastTime.current < 1 / 30) return;
            lastTime.current = time;
        }

        const t = state.clock.getElapsedTime();
        if (glass.current) {
            glass.current.rotation.x = t * 0.2;
            glass.current.rotation.y = t * 0.3;
        }
        if (core.current) {
            core.current.position.x = Math.sin(t * 1.5) * 0.5;
            core.current.position.y = Math.cos(t * 1.5) * 0.5;
        }
    });

    return (
        <group>
            {/* Internal Emissive Core */}
            <mesh ref={core}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    color="#ff00ff"
                    emissive="#ff00ff"
                    emissiveIntensity={10}
                />
            </mesh>

            {/* Main Glass Object */}
            <mesh ref={glass}>
                <torusKnotGeometry args={[1.5, 0.4, 128, 16]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    resolution={256}
                    thickness={5}
                    chromaticAberration={1.5}
                    anisotropy={0.5}
                    distortion={0.2}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    ior={1.5}
                    transmission={1}
                    roughness={0}
                    color="#ffffff"
                />
            </mesh>
        </group>
    );
}


export default function KoreanCyberpunk() {
    const mouse = useRef([0, 0]);
    const [dpr, setDpr] = useState([1, 1.5]); // Ограничиваем разрешение для экономии GPU
    const [lowPerf, setLowPerf] = useState(false); // Состояние низкой производительности
    const [isActive, setIsActive] = useState(true); // Флаг активности пользователя
    const timeoutRef = useRef();

    // Функция обработки активности пользователя
    const handleInteraction = () => {
        setIsActive(prev => {
            if (!prev) {
                // Если сцена спала, принудительно «пинаем» рендер для мгновенного пробуждения
                invalidate();
                return true;
            }
            return prev;
        });

        // Сбрасываем таймер засыпания
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        // Если 30 секунд нет действий — переходим в режим экономии энергии (demand)
        timeoutRef.current = setTimeout(() => setIsActive(false), 30000);
    };

    useEffect(() => {
        handleInteraction(); // Активируем при загрузке

        // Слушаем события на уровне всего окна, чтобы проснуться даже от клика мимо холста
        window.addEventListener("mousemove", handleInteraction, { capture: true, passive: true });
        window.addEventListener("mousedown", handleInteraction, { capture: true, passive: true });
        window.addEventListener("touchstart", handleInteraction, { capture: true, passive: true });

        return () => {
            window.removeEventListener("mousemove", handleInteraction, { capture: true });
            window.removeEventListener("mousedown", handleInteraction, { capture: true });
            window.removeEventListener("touchstart", handleInteraction, { capture: true });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <Canvas
            // В режиме ожидания (demand) рендер замирает, если ничего не меняется, экономя до 90% заряда
            frameloop={isActive ? "always" : "demand"}
            dpr={dpr}
            onPointerMove={(e) => {
                handleInteraction(); // Считаем движение мыши над холстом за активность
                mouse.current = [
                    (e.clientX / window.innerWidth) * 2 - 1,
                    -(e.clientY / window.innerHeight) * 2 + 1,
                ];
            }}
            onPointerDown={handleInteraction}
        >
            {/* Монитор производительности: если FPS падает, снижаем качество эффектов */}
            <PerformanceMonitor
                onIncline={() => setLowPerf(false)}
                onDecline={() => setLowPerf(true)}
                flipflops={3}
                onFallback={() => setLowPerf(true)}
            />
            <color attach="background" args={["#050010"]} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

            <ambientLight intensity={0.1} />

            {/* Silhouette Side Lighting */}
            <spotLight position={[10, 0, 5]} color="#ff00ff" intensity={300} angle={0.5} penumbra={1} castShadow />
            <spotLight position={[-10, 0, 5]} color="#00ffff" intensity={300} angle={0.5} penumbra={1} castShadow />

            {/* Point Lights for overall ambiance */}
            <pointLight position={[0, 10, 5]} color="#ff00ff" intensity={50} />
            <pointLight position={[0, -10, 5]} color="#00ffff" intensity={50} />

            <CyberRain />
            <LuxuryBackground />
            <Clock />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <LuxuryGlass />
            </Float>

            <Environment preset="night" />

            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={0.8}
                    mipmapBlur
                    intensity={lowPerf ? 0.3 : 0.6}
                    radius={0.4}
                />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
                {!isMobile && !lowPerf && (
                    <ChromaticAberration
                        blendFunction={BlendFunction.NORMAL}
                        offset={[0.001, 0.001]}
                    />
                )}
                {!lowPerf && <Noise opacity={0.02} />}
            </EffectComposer>
        </Canvas>
    );
}
