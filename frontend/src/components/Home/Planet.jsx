import React, { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, Html, PerformanceMonitor } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader";
import Loader from "../Loader/Loader";

const isMobile = window.innerWidth < 768;

const locations = [
  // Asia
  { lat: 20.5937, lon: 78.9629, label: "India" },
  { lat: 35.8617, lon: 104.1954, label: "China" },
  { lat: 36.2048, lon: 138.2529, label: "Japan" },
  { lat: 23.6978, lon: 120.9605, label: "Taiwan" },
  { lat: 21.9139, lon: 95.956, label: "Myanmar" },
  { lat: 31.0461, lon: 34.8516, label: "Israel" },
  { lat: 23.4241, lon: 53.8478, label: "UAE" },
  { lat: 23.8859, lon: 45.0792, label: "Saudi Arabia" },
  // Europe
  { lat: 51.1657, lon: 10.4515, label: "Germany" },
  { lat: 41.8719, lon: 12.5674, label: "Italy" },
  { lat: 55.3781, lon: -3.436, label: "UK" },
  { lat: 61.9241, lon: 25.7482, label: "Finland" },
  { lat: 40.4637, lon: -3.7492, label: "Spain" },
  // Africa
  { lat: 9.082, lon: 8.6753, label: "Nigeria" },
  { lat: -1.2921, lon: 36.8219, label: "Kenya" },
  { lat: -30.5595, lon: 22.9375, label: "South Africa" },
  { lat: 26.8206, lon: 30.8025, label: "Egypt" },
  // North America
  { lat: 37.0902, lon: -95.7129, label: "USA" },
  { lat: 56.1304, lon: -106.3468, label: "Canada" },
  { lat: 23.6345, lon: -102.5528, label: "Mexico" },
  { lat: 17.1899, lon: -88.4976, label: "Belize" },
  // South America
  { lat: -14.235, lon: -51.9253, label: "Brazil" },
  { lat: -38.4161, lon: -63.6167, label: "Argentina" },
  { lat: -9.1899, lon: -75.0152, label: "Peru" },
  { lat: -35.6751, lon: -71.543, label: "Chile" },
  // Oceania
  { lat: -25.2744, lon: 133.7751, label: "Australia" },
  { lat: -40.9006, lon: 174.886, label: "New Zealand" },
  { lat: -6.314993, lon: 143.9555, label: "Papua New Guinea" },
];

// ------------------- Location Pin -------------------
function LocationPin({ lat, lon, label }) {
  const pinRef = useRef();
  const [visible, setVisible] = useState(true);
  const worldPos = useMemo(() => new THREE.Vector3(), []);

  const position = useMemo(() => {
    const radius = 1.03;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [lat, lon]);

  // Visibility check handler assigned once
  useEffect(() => {
    if (pinRef.current) {
      pinRef.current.userData.checkVisibility = (cameraDir) => {
        pinRef.current.getWorldPosition(worldPos);
        const surfaceNormal = worldPos.clone().normalize();
        setVisible(surfaceNormal.dot(cameraDir) > 0.1);
      };
    }
  }, [worldPos]);

  return (
    <group position={position} ref={pinRef}>
      <mesh>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial emissive="limegreen" emissiveIntensity={1} />
      </mesh>
      {visible && (
        <Html
          position={[0, 0.04, 0]}
          center
          style={{
            color: "white",
            fontSize: "10px",
            background: "rgba(0,0,0,0.4)",
            padding: "2px 4px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Html>
      )}
    </group>
  );
}

// ------------------- Planet -------------------
function Planet() {
  const { gl, viewport, camera } = useThree();
  const planetRef = useRef();
  const cloudsRef = useRef();
  const planetGroup = useRef();
  const cameraDir = useMemo(() => new THREE.Vector3(), []);

  const loaderConfig = useMemo(
    () => ({
      paths: [
        `/textures/exotic-planet/Exotic 02 (Diffuse ${
          isMobile ? "2k" : "4k"
        }).ktx2`,
        `/textures/exotic-planet/Exotic 02 (Roughness ${
          isMobile ? "2k" : "4k"
        }).ktx2`,
        `/textures/exotic-planet/Exotic 02 (Bump ${
          isMobile ? "2k" : "4k"
        }).ktx2`,
        `/textures/exotic-planet/Exotic 02 (Clouds ${
          isMobile ? "2k" : "4k"
        }).ktx2`,
      ],
    }),
    []
  );

  const [colorMap, roughnessMap, bumpMap, cloudsMap] = useLoader(
    KTX2Loader,
    loaderConfig.paths,
    (loader) => {
      loader.setTranscoderPath("/basis/");
      loader.detectSupport(gl);
    }
  );

  const planetMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: colorMap,
        roughnessMap,
        bumpMap,
        bumpScale: 0.05,
        metalness: 0.1,
        roughness: 0.9,
      }),
    [colorMap, roughnessMap, bumpMap]
  );

  const cloudsMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: cloudsMap,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
    [cloudsMap]
  );

  useFrame(({ clock }) => {
    if (planetRef.current) planetRef.current.rotation.y += 0.002;
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.003;

    if (planetGroup.current) {
      const newScale = Math.min(viewport.width, viewport.height) / 2.3;
      planetGroup.current.scale.set(newScale, newScale, newScale);
    }

    camera.getWorldDirection(cameraDir);
    cameraDir.negate();

    // Update all pin visibility every few frames
    if (clock.elapsedTime % 0.15 < 0.016 && planetGroup.current) {
      planetGroup.current.traverse((child) => {
        if (child.userData?.checkVisibility)
          child.userData.checkVisibility(cameraDir);
      });
    }
  });

  return (
    <group ref={planetGroup}>
      <mesh ref={cloudsRef} material={cloudsMaterial}>
        <sphereGeometry args={[1.02, 32, 32]} />
      </mesh>

      <mesh ref={planetRef} material={planetMaterial} castShadow receiveShadow>
        <sphereGeometry args={[1, 48, 48]} />
        {locations.map((loc) => (
          <LocationPin key={loc.label} {...loc} />
        ))}
      </mesh>
    </group>
  );
}

// ------------------- Planet Section -------------------
export default function PlanetSection() {
  return (
    <div className="w-full lg:w-1/2 h-full min-h-[300px] pt-6 lg:pt-3 bg-transparent z-20">
      <Canvas
        resize={{ scroll: true, debounce: { scroll: 50, resize: 50 } }}
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{
          physicallyCorrectLights: true,
          antialias: window.devicePixelRatio === 1,
          powerPreference: isMobile ? "low-power" : "high-performance",
        }}
        shadows
        dpr={[1, 1.5]}
      >
        <PerformanceMonitor />

        <directionalLight
          position={[5, 2, 3]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <hemisphereLight
          skyColor={"#b5d9ff"}
          groundColor={"#222"}
          intensity={0.35}
        />
        <pointLight position={[-3, -3, -5]} intensity={0.1} />

        <Suspense
          fallback={
            <Html center>
              <Loader />
            </Html>
          }
        >
          <Planet />
          <EffectComposer>
            <Bloom
              intensity={1.3}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.6}
            />
          </EffectComposer>
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}
