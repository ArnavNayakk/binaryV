import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

import { FaBitcoin, FaEthereum } from "react-icons/fa";
import {
  SiLitecoin,
  SiDogecoin,
  SiCardano,
  SiPolkadot,
  SiRipple,
} from "react-icons/si";

import HoleLoader from "./Loader/HoleLoader";
import ErrorBoundary from "./ErrorBoundary";

//Earth 3D Model Component
const EarthModel = () => {
  const { scene } = useGLTF("/models/Earth2-v1.glb");
  return <primitive object={scene} scale={0.0025} position={[0, 0.3, 0]} />;
};

// Single Coin Orbit Component
const CurrencyCoin = ({
  radius = 2.5,
  speed = 0.01,
  Icon,
  shadowColor = "#00FF00",
  initialAngle = 0,
}) => {
  const groupRef = useRef();
  const angleRef = useRef(initialAngle);

  useFrame(() => {
    angleRef.current += speed;
    const x = radius * Math.cos(angleRef.current);
    const z = radius * Math.sin(angleRef.current);
    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
      groupRef.current.rotation.y = -angleRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      <Html center occlude>
        <Icon
          size={30}
          style={{
            color: "#FFFFFF",
            filter: `drop-shadow(0 0 4px ${shadowColor}) drop-shadow(0 0 8px ${shadowColor})`,
          }}
        />
      </Html>
    </group>
  ); 
};

// Preload GLTF model
useGLTF.preload("/models/Earth2-v1.glb");

const CurrencyOrbits = () => {
  const coins = [
    { Icon: FaBitcoin, shadowColor: "#F7931A" },
    { Icon: FaEthereum, shadowColor: "#3C3C3D" },
    { Icon: SiLitecoin, shadowColor: "#345C9C" },
    { Icon: SiDogecoin, shadowColor: "#C2A633" },
    { Icon: SiCardano, shadowColor: "#0033AD" },
    { Icon: SiPolkadot, shadowColor: "#E6007A" },
    { Icon: SiRipple, shadowColor: "#00AAE4" },
    { Icon: SiLitecoin, shadowColor: "#345C9C" },
  ];

  const radius = 2;
  const speed = 0.01;

  return (
    <>
      {coins.map((coin, index) => (
        <CurrencyCoin
          key={index}
          radius={radius}
          speed={speed}
          Icon={coin.Icon}
          shadowColor={coin.shadowColor}
          initialAngle={(index / coins.length) * Math.PI * 2}
        />
      ))}
    </>
  );
};

const PlanetWithCoins = () => {
  const planetRef = useRef();

  useFrame(() => {
    if (planetRef.current) planetRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={planetRef}>
      <EarthModel />
      <CurrencyOrbits />
    </group>
  );
};

export default function PlanetCardModel() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<HoleLoader />}>
        <Canvas camera={{ position: [0, 0, 12], fov: 35 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />

          <PlanetWithCoins />

          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </Suspense>
    </ErrorBoundary>
  );
}
