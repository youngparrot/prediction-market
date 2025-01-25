import { FaShareAlt } from "react-icons/fa";

const { PREDICTION_MARKET_APP } = require("@/utils/environment");

const Share = ({ prediction }) => {
  const handleShare = (e) => {
    e.preventDefault();

    const pageUrl = `${PREDICTION_MARKET_APP}/prediction/${
      prediction._id || ""
    }`;
    const tweetText = `Let's predict this prediction "${prediction.question}" on @youngparrotnft Prediction Market🔥💯`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      pageUrl
    )}&text=${encodeURIComponent(tweetText)}`;
    window.open(twitterShareUrl, "_blank");
  };

  return (
    <button onClick={handleShare} title="Share on X">
      <FaShareAlt size={20} className="text-blue-500 hover:text-blue-400" />
    </button>
  );
};

export default Share;
