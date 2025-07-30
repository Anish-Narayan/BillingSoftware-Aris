import React from 'react';

const HelloWorld = () => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Hello, World!
        </h1>
      </div>
    </div>
  );
};

export default HelloWorld;