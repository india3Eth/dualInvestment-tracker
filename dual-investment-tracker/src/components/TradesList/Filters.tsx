import React from 'react';
import { FilterOptions } from '../../types';

interface FiltersProps {
  filters: FilterOptions;
  onFilterChange: (filterType: keyof FilterOptions, value: string) => void;
  assetOptions: string[];
}

const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange, assetOptions }) => {
  return (
    <div className="flex gap-2">
      <select
        className="p-2 border rounded"
        value={filters.dateRange}
        onChange={(e) => onFilterChange('dateRange', e.target.value)}
      >
        <option value="all">All Time</option>
        <option value="week">Past Week</option>
        <option value="month">Past Month</option>
        <option value="quarter">Past Quarter</option>
      </select>
      <select
        className="p-2 border rounded"
        value={filters.assetType}
        onChange={(e) => onFilterChange('assetType', e.target.value)}
      >
        <option value="all">All Assets</option>
        {assetOptions.map(asset => (
          <option key={asset} value={asset}>{asset}</option>
        ))}
      </select>
      <select
        className="p-2 border rounded"
        value={filters.direction}
        onChange={(e) => onFilterChange('direction', e.target.value)}
      >
        <option value="all">All Directions</option>
        <option value="UP">UP</option>
        <option value="DOWN">DOWN</option>
      </select>
      <select
        className="p-2 border rounded"
        value={filters.status}
        onChange={(e) => onFilterChange('status', e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="PURCHASE_SUCCESS">Active</option>
        <option value="SETTLED">Settled</option>
      </select>
    </div>
  );
};

export default Filters;