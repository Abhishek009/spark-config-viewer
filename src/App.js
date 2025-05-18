import React, { useState, useEffect } from 'react';

// Assume Tailwind CSS is available in the environment.
// You would need to include the Tailwind CSS script or build process.
// For a simple setup, add this to your HTML: <script src="https://cdn.tailwindcss.com"></script>

// Assume the Spark configuration data is available in a JSON file
// named 'spark-config.json' in the public directory or src directory.
// You will need to create this file with your configuration data in the grouped format.
// Example content for spark-config.json:
/*
{
  "Application Properties": [
    {
      "name": "spark.app.name",
      "defaultValue": "(none)",
      "description": "The name of your application. This will appear in the UI and in log data."
    },
    {
      "name": "spark.driver.cores",
      "defaultValue": "1",
      "description": "Number of cores to use for the driver process, only in cluster mode."
    },
    // ... add more Application Properties here
  ],
  "Runtime Environment": [
    {
      "name": "spark.driver.extraClassPath",
      "defaultValue": "(none)",
      "description": "Extra classpath entries to prepend to the classpath of the driver. Note: In client mode, this config must be set through the `--driver-class-path` command-line option or in your `spark-defaults.conf` file."
    },
    // ... add more Runtime Environment properties here
  ],
  // ... add other categories and their configurations
}
*/
// For demonstration, we'll use a direct import here.
// Make sure you have a file named 'spark-config.json' in the same directory as this component
// or adjust the import path accordingly.
import sparkConfigurationsData from './spark-config.json';


// Component for a single configuration item
function ConfigurationItem({ config, category }) {
  // Function to check if the description should be displayed as bullet points based on newlines
  const shouldDisplayAsNewlineBulletPoints = (text) => {
    if (!text) return false;
    return text.includes('\n');
  };

  // Function to check if the description should be displayed as bullet points based on multiple full stops (excluding i.e. and e.g.)
  const shouldDisplayAsFullStopBulletPoints = (text) => {
    if (!text) return false;

    // Check for specific patterns like "i.e." or "e.g."
    // If found, treat as a single sentence for display purposes, even if it has multiple full stops.
    if (text.includes('i.e.') || text.includes('e.g.')) {
      return false;
    }

    // Count the number of full stops as a simple heuristic for multiple sentences.
    // const fullStopCount = text.split('.').length - 1;
    //return fullStopCount > 1;
  };

  // Split the description into sentences if it should be displayed as bullet points
  const descriptionSentences = config.description ? config.description.split('.').filter(sentence => sentence.trim() !== '') : [];

  return (
    // Using Tailwind classes for styling, including the hover effect.
    // Added flex and flex-col to make the card a flex container for consistent height.
    // Adjusted the box-shadow values for a less intense glow.
    <div className="bg-white p-4 rounded-lg shadow mb-4 border border-gray-200 transition-all duration-200 hover:[box-shadow:0_0_5px_#ff0000,0_0_10px_#00ff00,0_0_15px_#0000ff] flex flex-col h-full">
      {/* Display Name as a heading - Changed text-md to text-lg */}
      <h4 className="text-lg font-semibold text-gray-800 mb-2">{config.name}</h4>

      {/* Display Default Value as a paragraph */}
      <p className="text-sm text-gray-600 mb-2">
        <strong className="font-medium">Default Value:</strong> <span className="font-mono text-blue-700">{config.defaultValue || 'N/A'}</span>
      </p>

      {/* Display Description conditionally */}
      <div className="flex-grow"> {/* Use a div with flex-grow to ensure it takes up available space */}
        <p className="text-sm text-gray-600 mb-1"><strong className="font-medium">Description:</strong></p>
        {shouldDisplayAsNewlineBulletPoints(config.description) ? (
           // If description has newlines, split by newline and display as bullet points
          <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed ml-4">
            {config.description.split('\n').filter(line => line.trim() !== '').map((line, index) => (
              <li key={index}>{line.trim()}</li> // Display each line as a list item
            ))}
          </ul>
        ) : shouldDisplayAsFullStopBulletPoints(config.description) ? (
          // If multiple sentences (and no newlines/i.e./e.g.), split by full stop and display as bullet points
          <ul className="list-disc list-inside text-gray-700 text-sm leading-relaxed ml-4"> {/* Added ml-4 for indentation */}
            {descriptionSentences.map((sentence, index) => (
              <li key={index}>{sentence.trim() + '.'}</li> // Add full stop back to each sentence
            ))}
          </ul>
        ) : (
          // Otherwise, display as a single paragraph
          <p className="text-gray-700 text-sm leading-relaxed ml-4">{config.description || 'N/A'}</p>
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
            {/* Category Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">{category}</h2>

            {/* Configuration Items */}
            {/* Using Tailwind grid for responsive layout */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {configurations[category].map(config => (
                // Grid item, pass category as a prop
                <div key={config.name}>
                  <ConfigurationItem config={config} category={category} />
                </div>
              ))}
            </div>
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
    // In a real application, you might fetch this data from an API or a static file
    // using the `fetch` API if the file is in the public directory.
    // For this example, we directly import the JSON data.
    // Ensure 'spark-config.json' exists in the correct path and has the grouped structure.
    setAllConfigurations(sparkConfigurationsData);
    setFilteredConfigurations(sparkConfigurationsData); // Initially show all data
  }, []); // Empty dependency array means this effect runs only once on mount

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
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Spark Configuration Explorer</h1>

      {/* Search Bar */}
      <div className="mb-8 max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Search by name, description, or category..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Configuration List */}
      {/* Pass the filtered and grouped list to the ConfigurationList component */}
      <ConfigurationList configurations={filteredConfigurations} />
    </div>
  );
}

export default App;
