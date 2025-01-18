"use client";

import { useState } from "react";

export default function StatusFilter({ onFilterChange }) {
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleStatusChange = (event) => {
    const status = event.target.value;
    setSelectedStatus(status);
    if (onFilterChange) onFilterChange(status); // Pass the selected status to the parent
  };

  return (
    <div>
      <select
        id="status-filter"
        value={selectedStatus}
        onChange={handleStatusChange}
        className="block w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="requested">Review</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}
