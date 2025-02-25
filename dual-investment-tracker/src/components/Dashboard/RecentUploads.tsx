import React from 'react';
import { FileHistoryEntry } from '../../types';

interface RecentUploadsProps {
  fileHistory: FileHistoryEntry[];
}

const RecentUploads: React.FC<RecentUploadsProps> = ({ fileHistory }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow lg:col-span-1">
      <h3 className="text-lg font-medium mb-2">Recent Uploads</h3>
      <div className="overflow-y-auto h-64">
        <table className="w-full table-auto">
          <thead className="text-left bg-gray-50">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Records</th>
            </tr>
          </thead>
          <tbody>
            {fileHistory.map(file => (
              <tr key={file.id} className="border-b">
                <td className="p-2">{new Date(file.timestamp).toLocaleString()}</td>
                <td className="p-2">{file.recordCount}</td>
              </tr>
            ))}
            {!fileHistory.length && (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-500">
                  No upload history yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentUploads;