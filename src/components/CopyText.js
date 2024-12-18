import { useState } from "react";

const CopyTextButton = ({ textToCopy, customText = "Copy" }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000); // Reset after 1 second
    });
  };

  return (
    <button
      className="bg-gray-500 hover:bg-gray-700 text-white px-2 mx-2 rounded focus:outline-none focus:shadow-outline"
      onClick={copyText}
    >
      {isCopied ? "Copied!" : customText}
    </button>
  );
};

export default CopyTextButton;
