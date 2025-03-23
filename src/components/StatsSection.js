const StatsSection = ({ totalUsers, totalPoints }) => {
  return (
    <div className="bg-gray-800 text-white py-8 mb-4 rounded-md">
      <div className="container mx-auto grid grid-cols-2 gap-4 md:grid-cols-2 text-center">
        {/* Total Volume */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center text-2xl md:text-4xl font-bold">
            {totalPoints?.toLocaleString()} <span className="ml-2">CORE</span>
          </div>
          <span className="text-gray-400 text-sm uppercase">Total Points</span>
        </div>

        {/* Total Users */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-2xl md:text-4xl font-bold">{totalUsers}</div>
          <span className="text-gray-400 text-sm uppercase">Total Users</span>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
