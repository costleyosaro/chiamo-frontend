import React from "react";
import { MdSearch } from "react-icons/md";

export default function SearchBar({ query = "", setQuery = () => {} }) {
  return (
    <div className="search-container">
      <MdSearch className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        placeholder="Search for products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search products"
      />
    </div>
  );
}
