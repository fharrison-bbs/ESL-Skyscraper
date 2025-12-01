
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, OrthographicCamera, Environment, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Grid, BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

interface IsoMapProps {
  grid: Grid;
  onTileClick: (x: number, y: number) => void;
  hoveredTool: string;
  population: number;
  weather: 'sunny' | 'rainy';
}

const GRASS_COLOR = '#4ade80';
const ROAD_COLOR = '#1f2937';
const DAMAGED_COLOR = '#1f2937';

// --- Helpers ---
const isRoad = (t?: TileData) => t?.buildingType === BuildingType.Road;

// --- Components ---

const TrafficSignalSystem = React.memo(({ grid }: { grid: Grid }) => {
  const [lightState, setLightState] = useState<'NS' | 'EW'>('NS');
  
  // Find intersections (3 or more road neighbors)
  const intersections = useMemo(() => {
    const points: {x: number, y: number}[] = [];
    grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType === BuildingType.Road) {
        let roads = 0;
        if (isRoad(grid[tile.y-1]?.[tile.x])) roads++;
        if (isRoad(grid[tile.y+1]?.[tile.x])) roads++;
        if (isRoad(grid[tile.y]?.[tile.x-1])) roads++;
        if (isRoad(grid[tile.y]?.[tile.x+1])) roads++;
        if (roads >= 3) {
            points.push({x: tile.x, y: tile.y});
        }
      }
    }));
    return points;
  }, [grid]);

  // Cycle lights every 5 seconds
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const cycle = Math.floor(time / 5) % 2;
    if (cycle === 0 && lightState !== 'NS') setLightState('NS');
    if (cycle === 1 && lightState !== 'EW') setLightState('EW');
  });

  return (
    <group>
        {intersections.map((pos, i) => {
            const x = pos.x - GRID_SIZE / 2;
            const z = pos.y - GRID_SIZE / 2;
            const nsColor = lightState === 'NS' ? '#4ade80' : '#ef4444';
            const ewColor = lightState === 'EW' ? '#4ade80' : '#ef4444';
            
            return (
                <group key={i} position={[x, 0, z]}>
                    {/* Posts */}
                    <mesh position={[0.4, 0.5, 0.4]}>
                        <boxGeometry args={[0.1, 1, 0.1]} />
                        <meshStandardMaterial color="#333" />
                    </mesh>
                    
                    {/* Lights NS facing */}
                    <mesh position={[0.4, 0.8, 0.35]}>
                        <boxGeometry args={[0.15, 0.15, 0.1]} />
                        <meshStandardMaterial color={nsColor} emissive={nsColor} emissiveIntensity={2} />
                    </mesh>

                     {/* Lights EW facing */}
                     <mesh position={[0.35, 0.8, 0.4]}>
                        <boxGeometry args={[0.1, 0.15, 0.15]} />
                        <meshStandardMaterial color={ewColor} emissive={ewColor} emissiveIntensity={2} />
                    </mesh>
                </group>
            )
        })}
    </group>
  );
});

const TrafficSystem = React.memo(({ grid }: { grid: Grid }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const CAR_COUNT = 15; // Reduced density
  
  const roadTiles = useMemo(() => {
    const tiles: {x: number, y: number}[] = [];
    grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType === BuildingType.Road) tiles.push({ x: tile.x, y: tile.y });
    }));
    return tiles;
  }, [grid]);

  // Precompute intersections for fast lookup in useFrame
  const intersectionSet = useMemo(() => {
     const set = new Set<string>();
     grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType === BuildingType.Road) {
        let roads = 0;
        if (isRoad(grid[tile.y-1]?.[tile.x])) roads++;
        if (isRoad(grid[tile.y+1]?.[tile.x])) roads++;
        if (isRoad(grid[tile.y]?.[tile.x-1])) roads++;
        if (isRoad(grid[tile.y]?.[tile.x+1])) roads++;
        if (roads >= 3) set.add(`${tile.x},${tile.y}`);
      }
    }));
    return set;
  }, [grid]);

  const cars = useMemo(() => {
    if (roadTiles.length === 0) return [];
    return new Array(CAR_COUNT).fill(0).map(() => {
      const start = roadTiles[Math.floor(Math.random() * roadTiles.length)];
      return {
        current: new THREE.Vector3(start.x - GRID_SIZE/2, 0.2, start.y - GRID_SIZE/2),
        target: new THREE.Vector3(start.x - GRID_SIZE/2, 0.2, start.y - GRID_SIZE/2),
        progress: 0,
        speed: 0.005 + Math.random() * 0.005, // Slower speed
        waiting: false
      };
    });
  }, [roadTiles]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || roadTiles.length === 0) return;
    
    // Determine Light State directly from time
    const time = state.clock.elapsedTime;
    const nsGreen = (Math.floor(time / 5) % 2) === 0;

    cars.forEach((car, i) => {
      // Logic: If moving towards an intersection, check light
      const gx = Math.round(car.target.x + GRID_SIZE/2);
      const gy = Math.round(car.target.z + GRID_SIZE/2);
      const isIntersection = intersectionSet.has(`${gx},${gy}`);
      
      let shouldWait = false;
      if (isIntersection && car.progress < 0.5) {
         // Determine direction
         const dx = car.target.x - car.current.x;
         const dz = car.target.z - car.current.z;
         
         if (Math.abs(dx) > 0) { // Moving East/West
             if (nsGreen) shouldWait = true; // Wait because NS is green (EW is red)
         } else if (Math.abs(dz) > 0) { // Moving North/South
             if (!nsGreen) shouldWait = true; // Wait because EW is green (NS is red)
         }
      }

      if (shouldWait) {
          // Slow down or stop
          // Visual: Interpolate but don't advance progress past 0.1
          if (car.progress < 0.2) car.progress += car.speed * 0.1;
      } else {
           car.progress += car.speed;
      }

      if (car.progress >= 1) {
        car.progress = 0;
        car.current.copy(car.target);
        
        const cgx = Math.round(car.current.x + GRID_SIZE/2);
        const cgy = Math.round(car.current.z + GRID_SIZE/2);

        // Pick neighbor
        const neighbors: THREE.Vector3[] = [];
        const directions = [[0,1], [0,-1], [1,0], [-1,0]];
        
        directions.forEach(([dx, dy]) => {
          const nx = cgx + dx;
          const ny = cgy + dy;
          if (grid[ny]?.[nx]?.buildingType === BuildingType.Road) {
            neighbors.push(new THREE.Vector3(nx - GRID_SIZE/2, 0.2, ny - GRID_SIZE/2));
          }
        });

        if (neighbors.length > 0) {
           // Simple random walk, but try not to go back immediately if possible
           car.target.copy(neighbors[Math.floor(Math.random() * neighbors.length)]);
        }
      }
      
      dummy.position.lerpVectors(car.current, car.target, car.progress);
      dummy.lookAt(car.target);
      dummy.scale.set(0.3, 0.2, 0.5); 
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (roadTiles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CAR_COUNT]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#facc15" />
    </instancedMesh>
  );
});

const PopulationSystem = React.memo(({ grid, population }: { grid: Grid, population: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const agentCount = Math.min(200, Math.floor(population / 2) + 10);
  
  const buildingTiles = useMemo(() => {
    const tiles: {x: number, y: number}[] = [];
    grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType !== BuildingType.None && tile.buildingType !== BuildingType.Road) {
        tiles.push({ x: tile.x, y: tile.y });
      }
    }));
    return tiles;
  }, [grid]);

  const agents = useMemo(() => {
    if (buildingTiles.length === 0) return [];
    return new Array(agentCount).fill(0).map(() => {
      const home = buildingTiles[Math.floor(Math.random() * buildingTiles.length)];
      return {
        centerX: home.x - GRID_SIZE/2,
        centerZ: home.y - GRID_SIZE/2,
        offsetX: (Math.random() - 0.5) * 0.8,
        offsetZ: (Math.random() - 0.5) * 0.8,
        speed: 0.01 + Math.random() * 0.02,
        angle: Math.random() * Math.PI * 2
      };
    });
  }, [buildingTiles, agentCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => [new THREE.Color('#ef4444'), new THREE.Color('#3b82f6'), new THREE.Color('#eab308'), new THREE.Color('#ffffff')], []);

  useFrame((state) => {
    if (!meshRef.current || buildingTiles.length === 0) return;
    const time = state.clock.elapsedTime;

    agents.forEach((agent, i) => {
      const x = agent.centerX + agent.offsetX + Math.sin(time * agent.speed + i) * 0.3;
      const z = agent.centerZ + agent.offsetZ + Math.cos(time * agent.speed + i) * 0.3;
      dummy.position.set(x * 1.05, 0.1, z * 1.05);
      dummy.scale.set(0.15, 0.3, 0.15);
      dummy.rotation.set(0, time + i, 0);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, colors[i % colors.length]);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  if (buildingTiles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, agentCount]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
});

const EnvironmentEffects = React.memo(({ weather }: { weather: 'sunny' | 'rainy' }) => {
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const cloudCount = 8;
  const rainCount = 400; // Optimized for mobile

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (weather === 'rainy' && rainRef.current) {
       const time = state.clock.elapsedTime;
       for (let i = 0; i < rainCount; i++) {
         const x = (i % 20) - 10 + Math.sin(time * 0.1 + i) * 5;
         const y = 10 - ((time * 5 + i) % 15);
         const z = (Math.floor(i / 20) % 20) - 10;
         dummy.position.set(x, y, z);
         dummy.scale.set(0.02, 0.5, 0.02);
         dummy.updateMatrix();
         rainRef.current.setMatrixAt(i, dummy.matrix);
       }
       rainRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
        {new Array(cloudCount).fill(0).map((_, i) => (
            <mesh key={i} position={[(Math.random() - 0.5) * 30, 8 + Math.random() * 2, (Math.random() - 0.5) * 30]}>
                <sphereGeometry args={[1.5 + Math.random(), 8, 8]} />
                <meshStandardMaterial color="white" transparent opacity={0.8} />
            </mesh>
        ))}
        {weather === 'rainy' && (
            <instancedMesh ref={rainRef} args={[undefined, undefined, rainCount]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#a5f3fc" transparent opacity={0.6} />
            </instancedMesh>
        )}
    </group>
  );
});

// Procedural Building Generator
const ProceduralBuilding = ({ type, level, seed }: { type: BuildingType, level: number, seed: number }) => {
    const random = (offset: number) => Math.abs(Math.sin(seed + offset));
    
    // Variations based on level and random seed
    const variant = Math.floor(random(0) * 3); 
    const height = 0.5 + (level * 0.3) + random(1) * 0.2;
    const colorVar = random(2) * 0.1;

    // Helper to shift color
    const shiftColor = (hex: string) => {
        const c = new THREE.Color(hex);
        c.offsetHSL(0, 0, colorVar - 0.05);
        return c;
    };

    if (type === BuildingType.Residential) {
        const baseColor = shiftColor(BUILDINGS[BuildingType.Residential].color);
        return (
            <group>
                 {/* Main Block */}
                 <mesh position={[0, height/2, 0]} castShadow receiveShadow>
                     <boxGeometry args={[0.8, height, 0.8]} />
                     <meshStandardMaterial color={baseColor} />
                 </mesh>
                 {/* Roof styles */}
                 {variant === 0 && ( // Peaked Roof
                     <mesh position={[0, height + 0.2, 0]} rotation={[0, Math.PI/4, 0]}>
                         <coneGeometry args={[0.6, 0.4, 4]} />
                         <meshStandardMaterial color="#7f1d1d" />
                     </mesh>
                 )}
                 {variant === 1 && ( // Modern Flat
                     <mesh position={[0.2, height, 0.2]}>
                         <boxGeometry args={[0.4, 0.2, 0.4]} />
                         <meshStandardMaterial color="#fecaca" />
                     </mesh>
                 )}
            </group>
        );
    }

    if (type === BuildingType.Commercial) {
        const baseColor = shiftColor(BUILDINGS[BuildingType.Commercial].color);
        return (
            <group>
                <mesh position={[0, height/2, 0]} castShadow receiveShadow>
                     <boxGeometry args={[0.9, height, 0.9]} />
                     <meshStandardMaterial color={baseColor} metalness={0.6} roughness={0.2} />
                </mesh>
                {/* Glass windows effect */}
                <mesh position={[0, height/2, 0.46]}>
                     <planeGeometry args={[0.7, height - 0.2]} />
                     <meshStandardMaterial color="#bfdbfe" metalness={0.9} roughness={0.1} />
                </mesh>
            </group>
        );
    }

    if (type === BuildingType.Industrial) {
        const baseColor = shiftColor(BUILDINGS[BuildingType.Industrial].color);
        return (
            <group>
                 <mesh position={[0, height/2, 0]} castShadow receiveShadow>
                     <boxGeometry args={[0.9, height, 0.9]} />
                     <meshStandardMaterial color={baseColor} roughness={0.8} />
                 </mesh>
                 {/* Smokestack */}
                 <mesh position={[0.2, height, 0.2]}>
                     <cylinderGeometry args={[0.1, 0.1, 0.5]} />
                     <meshStandardMaterial color="#4b5563" />
                 </mesh>
            </group>
        );
    }

    if (type === BuildingType.Hospital) {
        return (
            <group>
                <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.8, 0.8, 0.8]} />
                    <meshStandardMaterial color="#ffffff" />
                </mesh>
                {/* Red Cross */}
                <group position={[0, 0.85, 0]}>
                    <mesh>
                        <boxGeometry args={[0.15, 0.4, 0.1]} />
                        <meshStandardMaterial color="#ef4444" />
                    </mesh>
                    <mesh>
                        <boxGeometry args={[0.4, 0.15, 0.1]} />
                        <meshStandardMaterial color="#ef4444" />
                    </mesh>
                </group>
            </group>
        );
    }

    if (type === BuildingType.PoliceStation) {
        return (
            <group>
                <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[0.9, 0.6, 0.9]} />
                    <meshStandardMaterial color="#1e3a8a" />
                </mesh>
                {/* Siren */}
                <mesh position={[0, 0.8, 0]}>
                    <boxGeometry args={[0.4, 0.2, 0.1]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[0.1, 0.8, 0]}>
                    <boxGeometry args={[0.1, 0.1, 0.15]} />
                    <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[-0.1, 0.8, 0]}>
                    <boxGeometry args={[0.1, 0.1, 0.15]} />
                    <meshStandardMaterial color="blue" emissive="blue" emissiveIntensity={0.5} />
                </mesh>
            </group>
        );
    }
    
    // Generic fallbacks (School, Park, PowerPlant)
    const config = BUILDINGS[type];
    return (
        <mesh position={[0, height/2, 0]} castShadow>
            <boxGeometry args={[0.8, height, 0.8]} />
            <meshStandardMaterial color={config.color} />
        </mesh>
    );
};

const TileMesh = React.memo(({ tile, grid, onClick }: { tile: TileData; grid: Grid; onClick: () => void }) => {
  const isRoadTile = tile.buildingType === BuildingType.Road;
  const isNone = tile.buildingType === BuildingType.None;
  const isBuilding = !isRoadTile && !isNone;
  
  const x = tile.x - GRID_SIZE / 2;
  const z = tile.y - GRID_SIZE / 2;

  let color = isNone ? GRASS_COLOR : ROAD_COLOR;
  if (tile.damaged) color = DAMAGED_COLOR;

  // Neighbors for Road Connectivity
  const neighbors = useMemo(() => {
    if (!isRoadTile) return { n: false, s: false, e: false, w: false };
    return {
      n: isRoad(grid[tile.y - 1]?.[tile.x]),
      s: isRoad(grid[tile.y + 1]?.[tile.x]),
      e: isRoad(grid[tile.y]?.[tile.x + 1]),
      w: isRoad(grid[tile.y]?.[tile.x - 1]),
    };
  }, [grid, tile.x, tile.y, isRoadTile]);

  // Rotation for damage
  const rotation: [number, number, number] = useMemo(() => {
    return tile.damaged 
        ? [(Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2] 
        : [0, 0, 0];
  }, [tile.damaged]);

  return (
    <group position={[x * 1.05, 0, z * 1.05]}>
      {/* Interaction Hitbox */}
      <mesh position={[0, 0.5, 0]} onClick={(e) => { e.stopPropagation(); onClick(); }} visible={false}>
        <boxGeometry args={[1, 2, 1]} />
      </mesh>

      {/* Ground/Road Base */}
      <mesh 
        position={[0, 0.1, 0]} 
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color={color} roughness={isRoadTile ? 0.9 : 1} />
        
        {/* Improved Road Markings */}
        {isRoadTile && (
            <group position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
                {/* Center Hub */}
                <mesh>
                    <planeGeometry args={[0.2, 0.2]} />
                    <meshStandardMaterial color="#6b7280" />
                </mesh>
                {/* Connecting Lines */}
                {neighbors.n && <mesh position={[0, 0.35, 0]}><planeGeometry args={[0.08, 0.5]} /><meshStandardMaterial color="#e5e7eb" /></mesh>}
                {neighbors.s && <mesh position={[0, -0.35, 0]}><planeGeometry args={[0.08, 0.5]} /><meshStandardMaterial color="#e5e7eb" /></mesh>}
                {neighbors.e && <mesh position={[0.35, 0, 0]} rotation={[0,0,Math.PI/2]}><planeGeometry args={[0.08, 0.5]} /><meshStandardMaterial color="#e5e7eb" /></mesh>}
                {neighbors.w && <mesh position={[-0.35, 0, 0]} rotation={[0,0,Math.PI/2]}><planeGeometry args={[0.08, 0.5]} /><meshStandardMaterial color="#e5e7eb" /></mesh>}
            </group>
        )}
      </mesh>
      
      {/* Building Model */}
      {isBuilding && (
          <group position={[0, 0.2, 0]} rotation={rotation}>
              <ProceduralBuilding type={tile.buildingType} level={tile.level} seed={tile.x + tile.y * GRID_SIZE} />
          </group>
      )}

      {/* Damage Effects */}
      {tile.damaged && (
        <group>
             <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
                <Text position={[0, 1.5, 0]} fontSize={0.6} color="#fb923c" anchorX="center" anchorY="middle">🔥</Text>
             </Float>
             <mesh position={[0, 1, 0]}>
                 <sphereGeometry args={[0.3, 4, 4]} />
                 <meshStandardMaterial color="#333" transparent opacity={0.6} />
             </mesh>
        </group>
      )}

      {/* Level Badge */}
      {tile.level > 1 && !tile.damaged && isBuilding && (
         <Float speed={1} rotationIntensity={0} floatIntensity={0.2}>
            <Text position={[0, 1.5, 0]} fontSize={0.3} color="white" outlineWidth={0.02} outlineColor="black" anchorX="center" anchorY="middle">
                Lv.{tile.level}
            </Text>
         </Float>
      )}
    </group>
  );
});

const IsoMap: React.FC<IsoMapProps> = ({ grid, onTileClick, hoveredTool, population, weather }) => {
  return (
    <div className="absolute inset-0 bg-sky-900 touch-none">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[weather === 'rainy' ? '#1e293b' : '#0c4a6e']} />
        
        <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={40} near={-50} far={200} />
        
        <MapControls makeDefault enableRotate={true} rotateSpeed={0.5} enableZoom={true} minZoom={20} maxZoom={80} dampingFactor={0.05} />

        <ambientLight intensity={weather === 'rainy' ? 0.4 : 0.7} color="#cceeff" />
        <directionalLight
          castShadow
          position={[10, 20, 5]}
          intensity={weather === 'rainy' ? 0.8 : 1.5}
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20} shadow-camera-right={20}
          shadow-camera-top={20} shadow-camera-bottom={-20}
        />
        
        {weather === 'sunny' && <Environment preset="city" />}

        <group>
            {grid.map((row) => 
                row.map((tile) => (
                    <TileMesh key={`${tile.x}-${tile.y}`} tile={tile} grid={grid} onClick={() => onTileClick(tile.x, tile.y)} />
                ))
            )}
        </group>
        
        <TrafficSystem grid={grid} />
        <TrafficSignalSystem grid={grid} />
        <PopulationSystem grid={grid} population={population} />
        <EnvironmentEffects weather={weather} />
        
        {/* Base Plate */}
        <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[GRID_SIZE * 3, GRID_SIZE * 3]} />
            <meshStandardMaterial color="#1e293b" />
        </mesh>

      </Canvas>
    </div>
  );
};

export default IsoMap;
