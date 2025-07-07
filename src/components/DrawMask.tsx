import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Line, Image as KonvaImage } from 'react-konva';
import {
  Box,
  Slider,
  Button,
  HStack,
  Text,
  VStack,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { InfoIcon, DeleteIcon, RepeatIcon } from '@chakra-ui/icons';

interface DrawMaskProps {
  imageUrl: string;
  onMaskCreated: (maskBase64: string) => void;
}

interface Line {
  points: number[];
  brushSize: number;
  tool: 'brush' | 'eraser';
}

const DrawMask: React.FC<DrawMaskProps> = ({ imageUrl, onMaskCreated }) => {
  const [lines, setLines] = useState<Line[]>([]);
  const [brushSize, setBrushSize] = useState<number>(20);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 512, height: 512 });
  
  const stageRef = useRef<Konva.Stage | null>(null);
  const isDrawing = useRef<boolean>(false);
  
  // Load the image to get its dimensions
  useEffect(() => {
    if (imageUrl) {
      const img = new window.Image();
      img.src = imageUrl;
      img.onload = () => {
        setImageElement(img);
        // Keep aspect ratio but fit within 512x512
        const maxDimension = Math.max(img.width, img.height);
        const scale = 512 / maxDimension;
        setCanvasSize({
          width: Math.round(img.width * scale),
          height: Math.round(img.height * scale),
        });
      };
    }
  }, [imageUrl]);
  
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (pos) {
      setLines([...lines, { points: [pos.x, pos.y], brushSize, tool }]);
    }
  };
  
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) {
      return;
    }
    const stage = e.target.getStage();
    const point = stage?.getPointerPosition();
    if (!point) return;
    
    const lastLine = lines[lines.length - 1];
    
    // Add point to the last line
    const newLastLine = {
      ...lastLine,
      points: lastLine.points.concat([point.x, point.y]),
    };
    
    // Replace the last line with the new one
    const newLines = [...lines];
    newLines.splice(lines.length - 1, 1, newLastLine);
    setLines(newLines);
  };
  
  const handleMouseUp = () => {
    isDrawing.current = false;
  };
  
  const generateMask = () => {
    if (!stageRef.current) return;
    
    // Create a temporary canvas to draw only the mask
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Fill with black (transparent in mask)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw all lines in white (opaque in mask)
    lines.forEach(line => {
      if (line.points.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(line.points[0], line.points[1]);
      
      for (let i = 2; i < line.points.length; i += 2) {
        ctx.lineTo(line.points[i], line.points[i + 1]);
      }
      
      ctx.strokeStyle = line.tool === 'brush' ? 'white' : 'black';
      ctx.lineWidth = line.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    });
    
    // Convert to base64 and pass to parent
    const dataURL = canvas.toDataURL('image/png');
    onMaskCreated(dataURL.split(',')[1]);
  };
  
  const clearMask = () => {
    setLines([]);
  };
  
  const undoLastStroke = () => {
    setLines(lines.slice(0, -1));
  };
  
  return (
    <VStack spacing={4} align="stretch">
      <Box
        border="1px solid"
        borderColor="gray.600"
        borderRadius="md"
        overflow="hidden"
        position="relative"
        width={`${canvasSize.width}px`}
        height={`${canvasSize.height}px`}
        mx="auto"
      >
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          ref={stageRef}
        >
          <Layer>
            {imageElement && (
              <KonvaImage
                image={imageElement}
                width={canvasSize.width}
                height={canvasSize.height}
              />
            )}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.tool === 'brush' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}
                strokeWidth={line.brushSize}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation={
                  line.tool === 'brush' ? 'source-over' : 'destination-out'
                }
              />
            ))}
          </Layer>
        </Stage>
      </Box>
      
      <HStack spacing={4} justify="space-between">
        <Text fontWeight="bold">Brush Size:</Text>
        <Box flex="1" position="relative">
          <Slider
            value={brushSize}
            min={1}
            max={50}
            onChange={(val) => setBrushSize(val)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            colorScheme="purple"
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <Tooltip
              hasArrow
              bg="brand.primary"
              color="white"
              placement="top"
              isOpen={showTooltip}
              label={`${brushSize}px`}
            >
              <SliderThumb />
            </Tooltip>
          </Slider>
        </Box>
        <Text>{brushSize}px</Text>
      </HStack>
      
      <HStack spacing={4}>
        <Button
          onClick={() => setTool('brush')}
          colorScheme={tool === 'brush' ? 'purple' : 'gray'}
          variant={tool === 'brush' ? 'solid' : 'outline'}
          flex="1"
        >
          Brush
        </Button>
        <Button
          onClick={() => setTool('eraser')}
          colorScheme={tool === 'eraser' ? 'purple' : 'gray'}
          variant={tool === 'eraser' ? 'solid' : 'outline'}
          flex="1"
        >
          Eraser
        </Button>
      </HStack>
      
      <HStack spacing={4}>
        <IconButton
          aria-label="Undo last stroke"
          icon={<RepeatIcon />}
          onClick={undoLastStroke}
          isDisabled={lines.length === 0}
          colorScheme="blue"
        />
        <IconButton
          aria-label="Clear mask"
          icon={<DeleteIcon />}
          onClick={clearMask}
          isDisabled={lines.length === 0}
          colorScheme="red"
        />
        <Button
          onClick={generateMask}
          colorScheme="purple"
          flex="1"
          leftIcon={<InfoIcon />}
        >
          Apply Mask
        </Button>
      </HStack>
    </VStack>
  );
};

export default DrawMask;
