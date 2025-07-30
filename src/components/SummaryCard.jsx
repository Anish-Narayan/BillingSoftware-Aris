import React from 'react';

const SummaryCard = ({ title, value, description }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center justify-center border border-gray-100
                    transition-transform duration-200 ease-in-out transform hover:scale-105 hover:shadow-2xl cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-500 mb-2">{title}</h3>
      <p className="mt-2 text-4xl font-bold text-indigo-500">{value}</p>
      {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    </div>
  );
};

export default SummaryCard;