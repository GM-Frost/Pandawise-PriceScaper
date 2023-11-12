"use client";
import React, { useState, FormEvent } from "react";
const isValidAmazonProductURL = (url: string) => {
  try {
    const parsedURL = new URL(url);
    const hostname = parsedURL.hostname;

    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
    //if hostname contains amazon.com or amazon.ca
  } catch (error) {
    return false;
  }
  return false;
};
const Searchbar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValidLink = isValidAmazonProductURL(searchPrompt);

    if (!isValidLink) return alert("Please provide a valid Amazon Product URL");

    try {
      setLoading(true);
      //SCRAPE THE PRODUCT PAGE
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap gap-4 mt-12" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter Product Link"
        className="searchbar-input"
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
      />
      <button
        disabled={searchPrompt === ""}
        type="submit"
        className="searchbar-btn"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default Searchbar;
