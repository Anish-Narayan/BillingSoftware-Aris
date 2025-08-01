import React from 'react';

const SummaryCard = ({ title, value, percentageChange, colorClass, alertCount }) => {
  const getPercentageColor = (change) => {
    if (!change) return 'text-gray-600';
    const numChange = parseFloat(change);
    if (numChange > 0) return 'text-green-600';
    if (numChange < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white text-gray-800 shadow-lg rounded-xl p-6 flex flex-col justify-between border border-gray-100
                    transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl cursor-pointer relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
        {/* Removed Icon component */}
        {alertCount !== undefined && alertCount > 0 && (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {alertCount}
          </span>
        )}
      </div>
      <p className="text-4xl font-extrabold text-gray-800">{value}</p>

    </div>
  );
};

export default SummaryCard;