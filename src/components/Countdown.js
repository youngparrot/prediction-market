import { useState, useEffect } from "react";
import dayjs from "dayjs";

const Countdown = ({ date }) => {
  const targetDate = dayjs(date);
  const now = dayjs();
  const difference = targetDate.diff(now);
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Cleanup the timer on component unmount
  }, []);

  function calculateTimeLeft() {
    const now = dayjs();
    const difference = targetDate.diff(now); // Milliseconds difference

    let timeLeft = {};

    if (difference > 0) {
      const totalSeconds = Math.floor(difference / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      timeLeft = {
        days: totalDays, // Total number of days left
        hours: totalHours % 24, // Remaining hours after days are calculated
        minutes: totalMinutes % 60, // Remaining minutes
        seconds: totalSeconds % 60, // Remaining seconds
      };
    }

    return timeLeft;
  }

  return (
    <div className="text-center">
      <div className="flex justify-center space-x-4 mt-4">
        {timeLeft.hours !== undefined ? (
          <>
            <div className="flex flex-col items-center min-w-16 md:min-w-20">
              <div className="bg-gray-200 p-4 w-full rounded-md text-2xl md:text-4xl font-bold text-black">
                {timeLeft.days}
              </div>
              <div className="text-highlight mt-2">DAYS</div>
            </div>
            <div className="flex flex-col items-center min-w-16 md:min-w-20">
              <div className="bg-gray-200 p-4 w-full rounded-md text-2xl md:text-4xl font-bold text-black">
                {timeLeft.hours}
              </div>
              <div className="text-highlight mt-2">HOURS</div>
            </div>
            <div className="flex flex-col items-center min-w-16 md:min-w-20">
              <div className="bg-gray-200 p-4 w-full rounded-md text-2xl md:text-4xl font-bold text-black">
                {timeLeft.minutes}
              </div>
              <div className="text-highlight mt-2">MINUTES</div>
            </div>
            <div className="flex flex-col items-center min-w-16 md:min-w-20">
              <div className="bg-gray-200 p-4 w-full rounded-md text-2xl md:text-4xl font-bold text-black">
                {timeLeft.seconds}
              </div>
              <div className="text-highlight mt-2">SECONDS</div>
            </div>
          </>
        ) : (
          <div className="text-2xl text-highlight">
            Reload the page to see the result
          </div>
        )}
      </div>
    </div>
  );
};

export default Countdown;
