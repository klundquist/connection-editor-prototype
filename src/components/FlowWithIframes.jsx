// src/components/FlowWithIframes.jsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useUpdateNodeInternals,
} from 'reactflow';
import 'reactflow/dist/style.css';
import IframeNode from './IframeNode';

const nodeTypes = {
  iframe: IframeNode,
};

const Flow = () => {
  const updateNodeInternals = useUpdateNodeInternals();

  const updateNodeLabels = useCallback((nodeId, type, index, newLabel) => {
    setNodes((nds) => {
      return nds.map((node) => {
        if (node.id === nodeId) {
          const updatedLabels = {
            ...node.data[`${type}Labels`],
            [index]: newLabel,
          };
          return {
            ...node,
            data: {
              ...node.data,
              [`${type}Labels`]: updatedLabels,
            },
          };
        }
        return node;
      });
    });
  }, []);

  const updateNodeHandles = useCallback((nodeId, type) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === nodeId) {
          const currentHandles = node.data[type];
          const newHandles = [...currentHandles, currentHandles.length];
          
          return {
            ...node,
            data: {
              ...node.data,
              [type]: newHandles,
            },
          };
        }
        return node;
      });
      
      setTimeout(() => {
        updateNodeInternals(nodeId);
      }, 0);
      
      return newNodes;
    });
  }, [updateNodeInternals]);

  const initialNodes = [
    {
      id: '1',
      type: 'iframe',
      position: { x: 100, y: 0 },
      style: { width: 400, height: 300 },
      data: { 
        label: 'Example Website 1',
        url: 'https://example.com',
        inputs: [0],
        outputs: [0],
        inputLabels: {},
        outputLabels: {},
        updateHandles: updateNodeHandles,
        updateLabels: updateNodeLabels,
      },
    },
    {
      id: '2',
      type: 'iframe',
      position: { x: 600, y: 0 },
      style: { width: 400, height: 300 },
      data: { 
        label: 'Example Website 2',
        url: 'https://example.org',
        inputs: [0],
        outputs: [0],
        inputLabels: {},
        outputLabels: {},
        updateHandles: updateNodeHandles,
        updateLabels: updateNodeLabels,
      },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    { id: 'e1-2', source: '1', target: '2' },
  ]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNewNode = useCallback((url = 'https://example.com') => {
    const id = (nodes.length + 1).toString();
    const newNode = {
      id,
      type: 'iframe',
      position: { 
        x: Math.random() * 500, 
        y: Math.random() * 300 
      },
      style: { width: 400, height: 300 },
      data: {
        label: `Website ${id}`,
        url: url,
        inputs: [0],
        outputs: [0],
        inputLabels: {},
        outputLabels: {},
        updateHandles: updateNodeHandles,
        updateLabels: updateNodeLabels,
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes, updateNodeHandles, updateNodeLabels]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => {
            const url = prompt('Enter website URL:', 'https://example.com');
            if (url) {
              try {
                addNewNode(url);
              } catch (error) {
                console.error('Error creating node:', error);
                alert('Failed to create node. Check console for details.');
              }
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-md"
        >
          + New Website Frame
        </button>
        <button
          onClick={() => addNewNode('about:blank')}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors shadow-md"
        >
          + Empty Frame
        </button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  );
};

const FlowWithIframes = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
};

export default FlowWithIframes;