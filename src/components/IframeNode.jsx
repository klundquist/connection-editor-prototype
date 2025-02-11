// src/components/IframeNode.jsx
import { Handle, Position } from 'reactflow';
import { NodeResizer } from 'reactflow';
import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, AlertTriangle } from 'lucide-react';

const HANDLE_OFFSET = 16;
const LABEL_VERTICAL_OFFSET = 4;
const LABEL_WIDTH = 80;

const HandleLabel = ({ label, onChange, isInput }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(label || '');

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange?.(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onChange?.(text);
    }
  };

  const labelClasses = `text-xs px-1 py-0.5 w-${LABEL_WIDTH} 
    ${isInput ? 'text-right' : 'text-left'} 
    hover:bg-gray-50 rounded cursor-text`;

  const inputClasses = `text-xs px-1 py-0.5 w-${LABEL_WIDTH} 
    ${isInput ? 'text-right' : 'text-left'} 
    bg-white border border-gray-300 rounded`;

  if (isEditing) {
    return (
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputClasses}
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={labelClasses}
    >
      {text || 'Click to edit'}
    </div>
  );
};

const IframeNode = ({ data, selected, id }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [previousDimensions, setPreviousDimensions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const nodeElement = document.querySelector(`[data-id="${id}"]`);
    if (nodeElement) {
      if (isCollapsed) {
        if (!previousDimensions) {
          setPreviousDimensions({
            width: nodeElement.style.width,
            height: nodeElement.style.height
          });
        }
        nodeElement.style.height = '40px';
      } else if (previousDimensions) {
        nodeElement.style.width = previousDimensions.width;
        nodeElement.style.height = previousDimensions.height;
      }
    }
  }, [isCollapsed, id, previousDimensions]);

  const getHandlePosition = (index, total) => {
    if (total === 1) return 50;
    const spacing = isCollapsed ? 24 : 12;
    const totalHeight = (total - 1) * spacing;
    const startPosition = 50 - (totalHeight / 2);
    return startPosition + (index * spacing);
  };

  const handleIframeLoad = (event) => {
    setError('');
    try {
      const iframe = event.target;
      if (iframe.contentWindow === null) {
        throw new Error('Cannot access iframe content');
      }
    } catch (err) {
      setError('This website cannot be embedded due to security restrictions.');
      console.error('Iframe error:', err);
    }
  };

  const handleIframeError = () => {
    setError('Failed to load the website. Please check the URL.');
  };

  return (
    <div className="relative border-2 border-gray-200 rounded-lg bg-white min-w-[300px] min-h-[40px] h-full">
      <NodeResizer 
        minWidth={300}
        minHeight={isCollapsed ? 40 : 200}
        isVisible={selected}
        lineClassName="border-blue-400"
        handleClassName="h-3 w-3 bg-white border-2 border-blue-400"
      />
      
      {/* Input Handles */}
      <div className="absolute left-0 top-0 bottom-0">
        {data.inputs.map((index) => (
          <div 
            key={`input-${index}`}
            className="relative"
            style={{
              position: 'absolute',
              top: `${getHandlePosition(index, data.inputs.length)}%`,
              transform: 'translateY(-50%)',
            }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`input-${index}`}
              className="!w-2 !h-2"
              style={{ left: `-${HANDLE_OFFSET}px` }}
            />
            <div 
              className="absolute" 
              style={{ 
                right: `${HANDLE_OFFSET + 4}px`, 
                top: `${LABEL_VERTICAL_OFFSET}px`,
                width: LABEL_WIDTH
              }}
            >
              <HandleLabel
                label={data.inputLabels?.[index]}
                onChange={(newLabel) => data.updateLabels?.(id, 'input', index, newLabel)}
                isInput={true}
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => data.updateHandles?.(id, 'inputs')}
          className="absolute w-3 h-3"
          style={{
            left: `-${HANDLE_OFFSET}px`,
            top: `${getHandlePosition(data.inputs.length - 1, data.inputs.length) + 8}%`,
          }}
          title="Add input"
        >
          <Plus className="w-full h-full text-gray-600" />
        </button>
      </div>

      {/* Output Handles */}
      <div className="absolute right-0 top-0 bottom-0">
        {data.outputs.map((index) => (
          <div
            key={`output-${index}`}
            className="relative"
            style={{
              position: 'absolute',
              top: `${getHandlePosition(index, data.outputs.length)}%`,
              transform: 'translateY(-50%)',
            }}
          >
            <Handle
              type="source"
              position={Position.Right}
              id={`output-${index}`}
              className="!w-2 !h-2"
              style={{ right: `-${HANDLE_OFFSET}px` }}
            />
            <div 
              className="absolute" 
              style={{ 
                left: `${HANDLE_OFFSET + 4}px`, 
                top: `${LABEL_VERTICAL_OFFSET}px`,
                width: LABEL_WIDTH
              }}
            >
              <HandleLabel
                label={data.outputLabels?.[index]}
                onChange={(newLabel) => data.updateLabels?.(id, 'output', index, newLabel)}
                isInput={false}
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => data.updateHandles?.(id, 'outputs')}
          className="absolute w-3 h-3"
          style={{
            right: `-${HANDLE_OFFSET}px`,
            top: `${getHandlePosition(data.outputs.length - 1, data.outputs.length) + 8}%`,
          }}
          title="Add output"
        >
          <Plus className="w-full h-full text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-2 border-b border-gray-200">
          <h3 className="text-sm font-semibold">{data.label}</h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
            />
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex-grow p-2 min-h-0">
            <div className="w-full h-full">
              {error && (
                <div className="flex items-center gap-2 p-2 mb-2 text-red-600 bg-red-50 rounded">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
              <iframe
                src={data.url}
                title={data.label}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                onError={handleIframeError}
                onLoad={handleIframeLoad}
              />
              <div className="text-xs text-gray-500 mt-1">
                Current URL: {data.url}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IframeNode;