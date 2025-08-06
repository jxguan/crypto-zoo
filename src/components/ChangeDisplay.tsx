import React from 'react';
import type { Vertex, Edge, EditRequest } from '../types/crypto';

interface ChangeDisplayProps {
  editRequest: EditRequest;
  originalData: Vertex | Edge | null;
}

interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  hasChanged: boolean;
}

export const ChangeDisplay: React.FC<ChangeDisplayProps> = ({ editRequest, originalData }) => {
  const getFieldChanges = (): FieldChange[] => {
    const changes: FieldChange[] = [];
    const newData = editRequest.data;
    
    if (!originalData) {
      // For create actions, show all fields as new
      Object.entries(newData).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          changes.push({
            field: key,
            oldValue: null,
            newValue: value,
            hasChanged: true
          });
        }
      });
      return changes;
    }

    // For update actions, compare fields
    const allFields = new Set([...Object.keys(originalData), ...Object.keys(newData)]);
    
    allFields.forEach(field => {
      if (field === 'id' || field === 'created_at' || field === 'updated_at') {
        return; // Skip these fields
      }

      const oldValue = (originalData as any)[field];
      const newValue = (newData as any)[field];
      
      // Check if the field has changed
      const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);
      
      changes.push({
        field,
        oldValue,
        newValue,
        hasChanged
      });
    });

    return changes.sort((a, b) => a.field.localeCompare(b.field));
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const renderFieldValue = (value: any, isOld: boolean = false) => {
    const formattedValue = formatValue(value);
    const baseClasses = "p-2 rounded text-sm font-mono";
    const bgClass = isOld ? "bg-gray-100" : "bg-green-50";
    const textClass = isOld ? "text-gray-700" : "text-green-800";
    
    return (
      <div className={`${baseClasses} ${bgClass} ${textClass}`}>
        {formattedValue}
      </div>
    );
  };

  const changes = getFieldChanges();
  const changedFields = changes.filter(change => change.hasChanged);
  const hasChanges = changedFields.length > 0;

  if (!hasChanges) {
    return (
      <div className="text-center py-4 text-gray-500">
        No changes detected
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-sm text-gray-600">Original</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-50 rounded"></div>
          <span className="text-sm text-gray-600">New</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {changedFields.map((change) => (
          <div key={change.field} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b">
              <span className="font-medium text-sm text-gray-700">
                {change.field}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-0">
              <div className="border-r">
                {renderFieldValue(change.oldValue, true)}
              </div>
              <div>
                {renderFieldValue(change.newValue, false)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 