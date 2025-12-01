/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { MapControls, OrthographicCamera, Environment, Text, Float } from '@react-three/drei';
import { Grid, BuildingType, TileData } from '../types';
import { BUILDINGS, GRID_SIZE } from '../constants';

interface IsoMapProps {
  grid: Grid;
  onTileClick: (x: number, y: number) => void;
  hoveredTool: string;
  population: number;
}

const GRASS_COLOR = '#4ade80';
const ROAD_COLOR = '#374151';
const DAMAGED_COLOR = '#1f2937';

const TileMesh = React.memo(({ tile, onClick }: { tile: TileData; onClick: () => void }) => {
  const config = BUILDINGS[tile.buildingType];
  
  // Safety check to prevent crashes if data is corrupted
  if (!config) return null;

  const isRoad = tile.buildingType === BuildingType.Road;
  const isNone = tile.buildingType === BuildingType.None;
  const isBuilding = !isRoad && !isNone;
  
  // Calculate Position
  // Center the grid at 0,0
  const x = tile.x - GRID_SIZE / 2;
  const z = tile.y - GRID_SIZE / 2;

  // Determine appearance
  let color = isNone ? GRASS_COLOR : (isRoad ? ROAD_COLOR : config.color);
  if (tile.damaged) color = DAMAGED_COLOR;

  // Building Height calculation
  let height = 0.2; // Base ground height
  let yPos = 0;

  if (isBuilding) {
    const baseHeight = 0.5;
    const levelHeight = 0.4;
    height = baseHeight + (tile.level * levelHeight);
    
    // Taller building types
    if (tile.buildingType === BuildingType.Industrial) height += 0.5;
    if (tile.buildingType === BuildingType.PowerPlant) height += 1.0;
    if (tile.buildingType === BuildingType.Commercial) height += 0.3;
    
    yPos = height / 2;
  } else {
    yPos = 0.1; // Ground tiles are thin
  }

  // Random visual variations for damage
  // Use simple array [x,y,z] instead of THREE.Euler to avoid read-only property errors in R3F
  const rotation: [number, number, number] = useMemo(() => {
    if (tile.damaged) {
      return [(Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2];
    }
    return [0, 0, 0];
  }, [tile.damaged]);

  return (
    <group position={[x * 1.05, 0, z * 1.05]}> {/* 1.05 spacing for grid lines effect */}
      
      {/* Interaction Target (Invisible but clickable) */}
      <mesh position={[0, 0.5, 0]} onClick={(e) => { e.stopPropagation(); onClick(); }} visible={false}>
        <boxGeometry args={[1, 2, 1]} />
      </mesh>

      {/* Visible Mesh */}
      <mesh 
        position={[0, yPos, 0]} 
        rotation={rotation}
        castShadow={isBuilding} 
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial color={color} roughness={0.8} />
        
        {/* Road Markings */}
        {isRoad && (
          <mesh position={[0, 0.11, 0]} rotation={[-Math.PI/2, 0, 0]}>
             <planeGeometry args={[0.15, 0.6]} />
             <meshStandardMaterial color="#94a3b8" />
          </mesh>
        )}
      </mesh>
      
      {/* Damaged Particle / Smoke indicator */}
      {tile.damaged && (
        <Float speed={2} rotationIntensity={0} floatIntensity={0.5}>
            <Text position={[0, height + 0.5, 0]} fontSize={0.5} color="orange" anchorX="center" anchorY="middle">
                🔥
            </Text>
        </Float>
      )}

      {/* Level Badge */}
      {tile.level > 1 && !tile.damaged && isBuilding && (
         <Float speed={1} rotationIntensity={0} floatIntensity={0.2}>
            <Text 
                position={[0, height + 0.5, 0]} 
                fontSize={0.3} 
                color="white" 
                outlineWidth={0.02} 
                outlineColor="black"
                anchorX="center" 
                anchorY="middle"
            >
                Lv.{tile.level}
            </Text>
         </Float>
      )}

    </group>
  );
});

const IsoMap: React.FC<IsoMapProps> = ({ grid, onTileClick, hoveredTool, population }) => {
  return (
    <div className="absolute inset-0 bg-sky-900 touch-none">
      <Canvas 
        shadows 
        dpr={[1, 2]} // Handle Retina displays correctly
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#0c4a6e']} />
        
        {/* Camera Setup */}
        <OrthographicCamera 
            makeDefault 
            position={[20, 20, 20]} 
            zoom={40} 
            near={-50} 
            far={200} 
        />
        
        {/* Controls - Damped for smooth touch */}
        <MapControls 
            makeDefault 
            enableRotate={true}
            rotateSpeed={0.5}
            enableZoom={true} 
            minZoom={20} 
            maxZoom={80}
            dampingFactor={0.05}
        />

        {/* Lighting */}
        <ambientLight intensity={0.7} color="#cceeff" />
        <directionalLight
          castShadow
          position={[10, 20, 5]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]} // Moderate size for mobile performance
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <Environment preset="city" />

        {/* The City Grid */}
        <group>
            {grid.map((row) => 
                row.map((tile) => (
                    <TileMesh 
                        key={`${tile.x}-${tile.y}`} 
                        tile={tile} 
                        onClick={() => onTileClick(tile.x, tile.y)} 
                    />
                ))
            )}
        </group>
        
        {/* Base Plate */}
        <mesh position={[0, -0.1, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[GRID_SIZE * 2, GRID_SIZE * 2]} />
            <meshStandardMaterial color="#1e293b" />
        </mesh>

      </Canvas>
    </div>
  );
};

export default IsoMap;