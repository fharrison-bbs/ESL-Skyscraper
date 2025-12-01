
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls, OrthographicCamera, Environment, Text, Float, Instance, Instances } from '@react-three/drei';
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

const GRASS_COLOR = '#84cc16'; // Lighter olive green
const ROAD_COLOR = '#78716c'; // Stone grey
const DAMAGED_COLOR = '#44403c';

// --- Components ---

const TrafficSystem = React.memo(({ grid }: { grid: Grid }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const CHARIOT_COUNT = 8;
  
  const roadTiles = useMemo(() => {
    const tiles: {x: number, y: number}[] = [];
    grid.forEach(row => row.forEach(tile => {
      if (tile.buildingType === BuildingType.Road) tiles.push({ x: tile.x, y: tile.y });
    }));
    return tiles;
  }, [grid]);

  const chariots = useMemo(() => {
    if (roadTiles.length === 0) return [];
    return new Array(CHARIOT_COUNT).fill(0).map(() => {
      const start = roadTiles[Math.floor(Math.random() * roadTiles.length)];
      return {
        current: new THREE.Vector3(start.x - GRID_SIZE/2, 0.15, start.y - GRID_SIZE/2),
        target: new THREE.Vector3(start.x - GRID_SIZE/2, 0.15, start.y - GRID_SIZE/2),
        progress: 0,
        speed: 0.005 + Math.random() * 0.005,
      };
    });
  }, [roadTiles]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || roadTiles.length === 0) return;
    
    chariots.forEach((car, i) => {
      car.progress += car.speed;

      if (car.progress >= 1) {
        car.progress = 0;
        car.current.copy(car.target);
        
        const cgx = Math.round(car.current.x + GRID_SIZE/2);
        const cgy = Math.round(car.current.z + GRID_SIZE/2);

        const neighbors: THREE.Vector3[] = [];
        const directions = [[0,1], [0,-1], [1,0], [-1,0]];
        
        directions.forEach(([dx, dy]) => {
          const nx = cgx + dx;
          const ny = cgy + dy;
          if (grid[ny]?.[nx]?.buildingType === BuildingType.Road) {
            neighbors.push(new THREE.Vector3(nx - GRID_SIZE/2, 0.15, ny - GRID_SIZE/2));
          }
        });

        if (neighbors.length > 0) {
           car.target.copy(neighbors[Math.floor(Math.random() * neighbors.length)]);
        }
      }
      
      dummy.position.lerpVectors(car.current, car.target, car.progress);
      dummy.lookAt(car.target);
      dummy.scale.set(0.4, 0.3, 0.6); // Chariot shape
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (roadTiles.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, CHARIOT_COUNT]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#fcd34d" metalness={0.8} roughness={0.2} />
    </instancedMesh>
  );
});

const PopulationSystem = React.memo(({ grid, population }: { grid: Grid, population: number }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const agentCount = Math.min(150, Math.floor(population / 3) + 5);
  
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
        speed: 0.005 + Math.random() * 0.01,
        angle: Math.random() * Math.PI * 2
      };
    });
  }, [buildingTiles, agentCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  // Roman Toga Colors: White, Purple, Red, Cream
  const colors = useMemo(() => [new THREE.Color('#f8fafc'), new THREE.Color('#7e22ce'), new THREE.Color('#b91c1c'), new THREE.Color('#fef3c7')], []);

  useFrame((state) => {
    if (!meshRef.current || buildingTiles.length === 0) return;
    const time = state.clock.elapsedTime;

    agents.forEach((agent, i) => {
      const x = agent.centerX + agent.offsetX + Math.sin(time * agent.speed * 10 + i) * 0.2;
      const z = agent.centerZ + agent.offsetZ + Math.cos(time * agent.speed * 10 + i) * 0.2;
      dummy.position.set(x, 0.15, z);
      dummy.scale.set(0.15, 0.4, 0.15); // Tall thin humans
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
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
});

// Roman Architectural Elements
const Column = ({ position, height = 1 }: { position: [number, number, number], height?: number }) => (
    <mesh position={position} castShadow>
        <cylinderGeometry args={[0.08, 0.1, height, 8]} />
        <meshStandardMaterial color="#e5e5e5" roughness={0.5} />
    </mesh>
);

const Pediment = ({ position }: { position: [number, number, number] }) => (
    <mesh position={position} rotation={[0, Math.PI/4, 0]} castShadow>
        <coneGeometry args={[0.6, 0.4, 4]} />
        <meshStandardMaterial color="#b91c1c" />
    </mesh>
);

const ProceduralBuilding = ({ type, level, seed }: { type: BuildingType, level: number, seed: number }) => {
    const random = (offset: number) => Math.abs(Math.sin(seed + offset));
    
    // Marble / Stone colors
    const stoneColor = "#d6d3d1";
    const brickColor = "#9a3412";

    if (type === BuildingType.Domus) {
        // Roman House: Low, open courtyard (simulated)
        return (
            <group>
                 <mesh position={[0, 0.25, 0]} castShadow>
                     <boxGeometry args={[0.8, 0.5, 0.8]} />
                     <meshStandardMaterial color="#fff7ed" />
                 </mesh>
                 {/* Red Tiled Roof */}
                 <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI/4, 0]}>
                     <coneGeometry args={[0.6, 0.3, 4]} />
                     <meshStandardMaterial color="#991b1b" />
                 </mesh>
            </group>
        );
    }

    if (type === BuildingType.Insula) {
        // Apartment Block: Tall, brick
        const height = 0.8 + (level * 0.2);
        return (
            <group>
                <mesh position={[0, height/2, 0]} castShadow>
                     <boxGeometry args={[0.7, height, 0.7]} />
                     <meshStandardMaterial color={brickColor} />
                </mesh>
                {/* Small windows */}
                <mesh position={[0, height/2, 0.36]} castShadow>
                     <boxGeometry args={[0.5, height - 0.2, 0.05]} />
                     <meshStandardMaterial color="#444" />
                </mesh>
            </group>
        );
    }

    if (type === BuildingType.Forum) {
        // Open Plaza with Columns
        return (
            <group>
                <mesh position={[0, 0.1, 0]} receiveShadow>
                     <boxGeometry args={[0.9, 0.2, 0.9]} />
                     <meshStandardMaterial color={stoneColor} />
                </mesh>
                <Column position={[-0.3, 0.6, -0.3]} />
                <Column position={[0.3, 0.6, -0.3]} />
                <Column position={[-0.3, 0.6, 0.3]} />
                <Column position={[0.3, 0.6, 0.3]} />
                <mesh position={[0, 1.1, 0]} castShadow>
                     <boxGeometry args={[0.8, 0.1, 0.8]} />
                     <meshStandardMaterial color={stoneColor} />
                </mesh>
                {/* Statue Base */}
                <mesh position={[0, 0.4, 0]}>
                    <boxGeometry args={[0.2, 0.4, 0.2]} />
                    <meshStandardMaterial color="#fcd34d" metalness={0.6} />
                </mesh>
            </group>
        );
    }

    if (type === BuildingType.Colosseum) {
        // Circular Arena
        return (
            <group>
                <mesh position={[0, 0.4, 0]} castShadow>
                    <cylinderGeometry args={[0.45, 0.45, 0.6, 16]} />
                    <meshStandardMaterial color={stoneColor} />
                </mesh>
                <mesh position={[0, 0.7, 0]} castShadow>
                    <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
                    <meshStandardMaterial color={stoneColor} />
                </mesh>
                {/* Inner Sand */}
                <mesh position={[0, 0.71, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
                    <meshStandardMaterial color="#d97706" />
                </mesh>
            </group>
        );
    }

    if (type === BuildingType.Aqueduct) {
        return (
            <group>
                 <mesh position={[0, 0.4, 0]} castShadow>
                    <boxGeometry args={[1, 0.8, 0.2]} />
                    <meshStandardMaterial color={stoneColor} />
                 </mesh>
                 {/* Arch Cutout (Simulated with black cylinder) */}
                 <mesh position={[0, 0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.25, 0.25, 0.3, 16]} />
                    <meshStandardMaterial color="#1f2937" />
                 </mesh>
            </group>
        );
    }

    if (type === BuildingType.Senate) {
        // Temple Style
        return (
            <group>
                <mesh position={[0, 0.2, 0]} castShadow>
                    <boxGeometry args={[0.9, 0.4, 0.8]} />
                    <meshStandardMaterial color={stoneColor} />
                </mesh>
                {/* Steps */}
                <mesh position={[0, 0.1, 0.45]}>
                    <boxGeometry args={[0.6, 0.2, 0.2]} />
                    <meshStandardMaterial color={stoneColor} />
                </mesh>
                <Column position={[-0.3, 0.7, 0.3]} height={0.8} />
                <Column position={[0.3, 0.7, 0.3]} height={0.8} />
                <Pediment position={[0, 1.2, 0.3]} />
                <mesh position={[0, 0.8, -0.1]} castShadow>
                     <boxGeometry args={[0.8, 0.8, 0.6]} />
                     <meshStandardMaterial color="#f3e8ff" />
                </mesh>
            </group>
        );
    }

    if (type === BuildingType.Baths) {
        return (
             <group>
                <mesh position={[0, 0.3, 0]} castShadow>
                    <boxGeometry args={[0.9, 0.6, 0.9]} />
                    <meshStandardMaterial color="#0e7490" transparent opacity={0.9} />
                </mesh>
                 {/* Domes */}
                 <mesh position={[-0.2, 0.6, -0.2]}>
                     <sphereGeometry args={[0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
                     <meshStandardMaterial color="#cffafe" />
                 </mesh>
                 <mesh position={[0.2, 0.6, 0.2]}>
                     <sphereGeometry args={[0.2, 8, 8, 0, Math.PI * 2, 0, Math.PI/2]} />
                     <meshStandardMaterial color="#cffafe" />
                 </mesh>
            </group>
        );
    }
    
    // Generic
    return (
        <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={BUILDINGS[type]?.color || 'white'} />
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

  const isRoad = (t?: TileData) => t?.buildingType === BuildingType.Road;

  const neighbors = useMemo(() => {
    if (!isRoadTile) return { n: false, s: false, e: false, w: false };
    return {
      n: isRoad(grid[tile.y - 1]?.[tile.x]),
      s: isRoad(grid[tile.y + 1]?.[tile.x]),
      e: isRoad(grid[tile.y]?.[tile.x + 1]),
      w: isRoad(grid[tile.y]?.[tile.x - 1]),
    };
  }, [grid, tile.x, tile.y, isRoadTile]);

  const rotation: [number, number, number] = useMemo(() => {
    return tile.damaged 
        ? [(Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2] 
        : [0, 0, 0];
  }, [tile.damaged]);

  return (
    <group position={[x * 1.05, 0, z * 1.05]}>
      <mesh position={[0, 0.5, 0]} onClick={(e) => { e.stopPropagation(); onClick(); }} visible={false}>
        <boxGeometry args={[1, 2, 1]} />
      </mesh>

      <mesh 
        position={[0, 0.1, 0]} 
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <boxGeometry args={[1, 0.2, 1]} />
        <meshStandardMaterial color={color} roughness={1} />
        
        {isRoadTile && (
            <group position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
                {/* Cobblestone Look - No lines */}
                 <mesh>
                    <planeGeometry args={[0.8, 0.8]} />
                    <meshStandardMaterial color="#57534e" roughness={0.8} />
                </mesh>
                {/* Connections */}
                {neighbors.n && <mesh position={[0, 0.45, 0]}><planeGeometry args={[0.4, 0.2]} /><meshStandardMaterial color="#57534e" /></mesh>}
                {neighbors.s && <mesh position={[0, -0.45, 0]}><planeGeometry args={[0.4, 0.2]} /><meshStandardMaterial color="#57534e" /></mesh>}
                {neighbors.e && <mesh position={[0.45, 0, 0]} rotation={[0,0,Math.PI/2]}><planeGeometry args={[0.4, 0.2]} /><meshStandardMaterial color="#57534e" /></mesh>}
                {neighbors.w && <mesh position={[-0.45, 0, 0]} rotation={[0,0,Math.PI/2]}><planeGeometry args={[0.4, 0.2]} /><meshStandardMaterial color="#57534e" /></mesh>}
            </group>
        )}
      </mesh>
      
      {isBuilding && (
          <group position={[0, 0.2, 0]} rotation={rotation}>
              <ProceduralBuilding type={tile.buildingType} level={tile.level} seed={tile.x + tile.y * GRID_SIZE} />
          </group>
      )}

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

      {tile.level > 1 && !tile.damaged && isBuilding && (
         <Float speed={1} rotationIntensity={0} floatIntensity={0.2}>
            <Text position={[0, 1.5, 0]} fontSize={0.3} color="#fef3c7" outlineWidth={0.02} outlineColor="#78350f" anchorX="center" anchorY="middle" font="/fonts/TrajanPro-Bold.ttf">
                Lv.{tile.level}
            </Text>
         </Float>
      )}
    </group>
  );
});

const IsoMap: React.FC<IsoMapProps> = ({ grid, onTileClick, hoveredTool, population, weather }) => {
  return (
    <div className="absolute inset-0 bg-[#0f172a] touch-none">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[weather === 'rainy' ? '#334155' : '#38bdf8']} />
        
        <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={40} near={-50} far={200} />
        
        <MapControls makeDefault enableRotate={true} rotateSpeed={0.5} enableZoom={true} minZoom={20} maxZoom={80} dampingFactor={0.05} />

        <ambientLight intensity={weather === 'rainy' ? 0.4 : 0.6} color="#fff7ed" />
        <directionalLight
          castShadow
          position={[10, 20, 5]}
          intensity={weather === 'rainy' ? 0.8 : 1.2}
          color="#fef3c7" // Warm sun
          shadow-mapSize={[1024, 1024]}
        />
        
        {weather === 'sunny' && <Environment preset="sunset" />}

        <group>
            {grid.map((row) => 
                row.map((tile) => (
                    <TileMesh key={`${tile.x}-${tile.y}`} tile={tile} grid={grid} onClick={() => onTileClick(tile.x, tile.y)} />
                ))
            )}
        </group>
        
        <TrafficSystem grid={grid} />
        <PopulationSystem grid={grid} population={population} />
        
        {/* Base Plate */}
        <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[GRID_SIZE * 3, GRID_SIZE * 3]} />
            <meshStandardMaterial color="#57534e" />
        </mesh>

      </Canvas>
    </div>
  );
};

export default IsoMap;
