import React, { useState } from "react";

const CreatePredictionModal = ({ onClose, onSubmit }) => {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(["", ""]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const addAnswer = () => {
    setAnswers([...answers, ""]);
  };

  const updateAnswer = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (question && answers.every((a) => a.trim()) && startTime && endTime) {
      onSubmit(
        question,
        answers,
        Math.floor(new Date(startTime).getTime() / 1000),
        Math.floor(new Date(endTime).getTime() / 1000)
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Create Prediction</h2>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Question:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Answers:</label>
          {answers.map((answer, index) => (
            <input
              key={index}
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={answer}
              onChange={(e) => updateAnswer(index, e.target.value)}
            />
          ))}
          <button
            className="text-blue-500 text-sm underline"
            onClick={addAnswer}
          >
            Add Answer
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Start Time:</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">End Time:</label>
          <input
            type="datetime-local"
            className="w-full p-2 border rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button className="text-gray-500" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionModal;
