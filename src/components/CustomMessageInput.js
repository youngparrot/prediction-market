import { useMessageInputContext } from "stream-chat-react";
import { useState } from "react";
import { IoMdSend } from "react-icons/io";

export default function CustomMessageInput({ placeholder }) {
  const { handleSubmit, handleChange, text } = useMessageInputContext();
  const [input, setInput] = useState(text || "");

  const handleSend = (e) => {
    e.preventDefault();

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(input)) {
      alert("Links are not allowed.");
      return;
    }

    if (input.trim() === "") return;

    handleSubmit();
    setInput("");
  };

  return (
    <form
      onSubmit={handleSend}
      className="flex items-center p-2 bg-white border-t"
    >
      <div className="flex flex-1 items-center rounded-full border px-2 py-2">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder={placeholder || "Type your message"}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleChange(e);
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`ml-2 transition-colors ${
            input.trim()
              ? "text-blue-600 hover:text-blue-800 cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <IoMdSend size={20} />
        </button>
      </div>
    </form>
  );
}
