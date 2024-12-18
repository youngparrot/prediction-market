export default function ProgressBar({ total, minted }) {
  const progressPercentage = (minted / total) * 100;

  return (
    <div className="w-full mx-auto">
      <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
        <div
          className="h-full bg-highlight transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-sm mt-2 text-boby">
        <span>Total minted</span>
        <span>
          {minted}/{total}
        </span>
      </div>
    </div>
  );
}
