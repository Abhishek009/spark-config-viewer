import React, { useState, useEffect } from 'react';
import sparkConfigurationsData from './spark-config.json';


// Component for a single configuration item
function ConfigurationItem({ config, category }) {
  // Function to check if the description should be displayed as bullet points based on newlines
  const shouldDisplayAsNewlineBulletPoints = (text) => {
    if (!text) return false;
    return text.includes('\n');
  };


  const shouldDisplayAsFullStopBulletPoints = (text) => {
    if (!text) return false;

    // Check for specific patterns like "i.e." or "e.g."
    // If found, treat as a single sentence for display purposes, even if it has multiple full stops.
    if (text.includes('i.e.') || text.includes('e.g.')) {
      return false;
    }

  };

  // Split the description into sentences if it should be displayed as bullet points
  const descriptionSentences = config.description ? config.description.split('.').filter(sentence => sentence.trim() !== '') : [];

  return (
    // Using Tailwind classes for styling, including the hover effect.
    // Added flex and flex-col to make the card a flex container for consistent height.
    // Adjusted the box-shadow values for a less intense glow.
    <div className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-200 transition-all duration-200 hover:[box-shadow:0_0_5px_#ff0000,0_0_10px_#00ff00,0_0_15px_#0000ff] flex flex-col h-full">
      {/* Display Name as a heading - Changed text-md to text-lg */}
      <h4 className="text-lg font-semibold text-gray-800 mb-2 break-words">{config.name}</h4>

      {/* Display Default Value as a paragraph */}
      <p className="text-sm text-gray-600 mb-2">
        <strong className="font-medium">Default Value:</strong> <span className="font-mono text-blue-700 break-words">{config.defaultValue || 'N/A'}</span>
      </p>

      {/* Display Description conditionally */}
      <div className="flex-grow"> {/* Use a div with flex-grow to ensure it takes up available space */}
        <p className="text-sm text-gray-600 mb-1"><strong className="font-medium">Description:</strong></p>
        {shouldDisplayAsNewlineBulletPoints(config.description) ? (
           // If description has newlines, split by newline and display as bullet points
          <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed break-words">
            {config.description.split('\n').filter(line => line.trim() !== '').map((line, index) => (
              <li key={index}>{line.trim()}</li> // Display each line as a list item
            ))}
          </ul>
        ) : shouldDisplayAsFullStopBulletPoints(config.description) ? (
          // If multiple sentences (and no newlines/i.e./e.g.), split by full stop and display as bullet points
          <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed break-words"> {/* Added ml-4 for indentation */}
            {descriptionSentences.map((sentence, index) => (
              <li key={index}>{sentence.trim() + '.'}</li> // Add full stop back to each sentence
            ))}
          </ul>
        ) : (
          // Otherwise, display as a single paragraph
          <p className="text-gray-700 text-sm leading-relaxed ml-4 break-words">{config.description || 'N/A'}</p>
        )}
      </div>


      {/* Display Category as a paragraph at the bottom */}
      {/* Category is now passed as a prop from the parent */}
      <p className="text-xs text-gray-500 mt-4">
        <strong className="font-medium">Category:</strong> {category}
      </p>
    </div>
  );
}

// Component for the list of configurations, grouped by category
function ConfigurationList({ configurations }) {
  const categories = Object.keys(configurations);
 // State to manage the collapse status of each category
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Function to toggle the collapse state of a category
  const toggleCategory = (category) => {
    setCollapsedCategories(prevState => ({
      ...prevState,
      [category]: !prevState[category]
    }));
  };
  // Check if there are any configurations in the filtered list
  const hasConfigurations = categories.some(category => configurations[category].length > 0);

  if (!hasConfigurations) {
    return <p className="text-center text-gray-600 mt-8">No configurations found matching your search.</p>;
  }

  return (
    <div className="config-list mt-8">
      {categories.map(category => (
        // Only render categories that have configurations after filtering
        configurations[category].length > 0 && (
          <div key={category} className="mb-8">
            {/* Category Header - Made clickable */}
            <h2
              className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2 cursor-pointer flex justify-between items-center"
              onClick={() => toggleCategory(category)}
            >
              {category}
              {/* Arrow icon to indicate collapse state */}
              <svg
                className={`w-6 h-6 transform transition-transform duration-200 ${
                  collapsedCategories[category] ? 'rotate-0' : 'rotate-180'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </h2>

            {/* Configuration Items - Conditionally rendered based on collapse state */}
            {!collapsedCategories[category] && (
              // Using Tailwind grid for responsive layout
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {configurations[category].map(config => (
                  // Grid item, pass category as a prop
                  <div key={config.name}>
                    <ConfigurationItem config={config} category={category} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      ))}
    </div>
  );
}

// Main App component
function App() {
  // State to hold the full list of configurations loaded from the file (grouped by category)
  const [allConfigurations, setAllConfigurations] = useState({});
  // State to hold the filtered list based on search term (also grouped by category)
  const [filteredConfigurations, setFilteredConfigurations] = useState({});
  // State for the search input value
  const [searchTerm, setSearchTerm] = useState('');
  
 // Effect to load data from the JSON file when the component mounts
  useEffect(() => {
    setAllConfigurations(sparkConfigurationsData);
    setFilteredConfigurations(sparkConfigurationsData); // Initially show all data
  }, []); 

  // Effect to filter configurations whenever the search term or allConfigurations changes
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = {}; // Object to hold the filtered and grouped configurations

    // Iterate through the categories in allConfigurations
    Object.keys(allConfigurations).forEach(category => {
      // Filter the configurations within each category
      const filteredInCategory = allConfigurations[category].filter(config =>
        config.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        (config.description && config.description.toLowerCase().includes(lowerCaseSearchTerm)) || // Added check for description existence
        category.toLowerCase().includes(lowerCaseSearchTerm) // Also search by category name
      );

      // Add the filtered configurations for this category to the result object
      if (filteredInCategory.length > 0) {
        filtered[category] = filteredInCategory;
      }
    });

    setFilteredConfigurations(filtered);
  }, [searchTerm, allConfigurations]); // Dependencies include searchTerm and allConfigurations

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Spark Configuration Explorer</h1>

      {/* Main Search Bar for Configurations */}
      <div className="mb-8 max-w-lg mx-auto text-center">
        <label htmlFor="config-search" className="block text-lg font-medium text-gray-700 mb-2">Search Spark Configurations</label>
        <input
          id="config-search"
          type="text"
          placeholder="Search by name, description, or category..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Configuration List */}
      <ConfigurationList configurations={filteredConfigurations} />
    </div>
  );
}

export default App;
