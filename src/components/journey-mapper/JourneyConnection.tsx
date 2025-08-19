import { JourneyConnection as Connection } from "../../pages/JourneyMapper";

interface JourneyConnectionProps {
  connection: Connection;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
}

export const JourneyConnection = ({
  connection,
  sourcePosition,
  targetPosition
}: JourneyConnectionProps) => {
  // Calculate connection points (center of cards, offset for visual appeal)
  const sourceX = sourcePosition.x + 144; // Half card width (288/2)
  const sourceY = sourcePosition.y + 100; // Rough card height
  const targetX = targetPosition.x + 144;
  const targetY = targetPosition.y + 50;

  // Create curved path
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const controlX1 = sourceX + dx * 0.5;
  const controlY1 = sourceY;
  const controlX2 = targetX - dx * 0.5;
  const controlY2 = targetY;

  const path = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`;

  // Color based on conversion percentage
  const getConnectionColor = (percentage: number) => {
    if (percentage >= 70) return "#10B981"; // green
    if (percentage >= 40) return "#F59E0B"; // orange
    return "#EF4444"; // red
  };

  const color = getConnectionColor(connection.percentage);

  // Calculate label position (middle of curve)
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <g className="pointer-events-auto">
      {/* Connection line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeOpacity="0.7"
        markerEnd="url(#arrowhead)"
      />
      
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={color}
            fillOpacity="0.8"
          />
        </marker>
      </defs>

      {/* Percentage label */}
      <g transform={`translate(${labelX}, ${labelY})`}>
        <circle
          cx="0"
          cy="0"
          r="20"
          fill="white"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-xs font-bold fill-current"
          style={{ fill: color }}
        >
          {connection.percentage}%
        </text>
      </g>

      {/* Interactive hover area */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="cursor-pointer hover:stroke-primary/20"
      >
        <title>{connection.percentage}% conversion rate</title>
      </path>
    </g>
  );
};