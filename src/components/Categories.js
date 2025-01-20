"use client";

import { useRouter } from "next/navigation";

export const categories = [
  { label: "All", path: "all" },
  { label: "Politics", path: "politics" },
  { label: "Sports", path: "sports" },
  { label: "Crypto", path: "crypto" },
  { label: "Global Elections", path: "global-elections" },
  { label: "Elon Tweets", path: "elon-tweets" },
  { label: "Mentions", path: "mentions" },
  { label: "Pop Culture", path: "pop-culture" },
  { label: "Business", path: "business" },
];

export default function Categories({ categoryPath }) {
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(`/market/${path}`);
  };

  return (
    <div className="md:sticky md:top-14 md:z-10 flex gap-4 px-4 py-2 bg-gray-900 text-white overflow-x-auto mb-4">
      {categories.map((category) => (
        <button
          key={category.path}
          onClick={() => handleNavigation(category.path)}
          className={`whitespace-nowrap px-3 py-1 rounded-md text-sm hover:bg-gray-700 ${
            category.path === categoryPath ? "bg-gray-700" : ""
          } focus:outline-none focus:ring focus:ring-gray-500`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
