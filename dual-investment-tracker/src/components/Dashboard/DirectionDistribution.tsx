import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom theme colors
const UP_COLOR = '#00C49F';
const DOWN_COLOR = '#FF8042';

interface DirectionDistributionProps {
  byDirection: Record<string, number>;
}

const DirectionDistribution: React.FC<DirectionDistributionProps> = ({ byDirection }) => {
  const data = Object.entries(byDirection).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">UP vs DOWN Trades</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              <Cell key="cell-up" fill={UP_COLOR} />
              <Cell key="cell-down" fill={DOWN_COLOR} />
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DirectionDistribution;