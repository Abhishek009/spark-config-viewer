import React, { useState, useEffect } from 'react';

// Assume Tailwind CSS is available in the environment.
// You would need to include the Tailwind CSS script or build process.
// For a simple setup, add this to your HTML: <script src="https://cdn.tailwindcss.com"></script>

// Sample data for Spark configurations.
// This data is hardcoded here for simplicity and to resolve the previous file import error.
// For easier management, consider creating a spark-config.json file
// and importing it if your build setup supports it.
const sparkConfigurations = [
  {
    category: 'Application Properties',
    name: 'spark.app.name',
    defaultValue: '(none)',
    description: 'The name of your application. This will appear in the UI and in log data.'
  },
  {
    category: 'Application Properties',
    name: 'spark.driver.cores',
    defaultValue: '1',
    description: 'Number of cores to use for the driver process, only in cluster mode.'
  },
  {
    category: 'Application Properties',
    name: 'spark.driver.maxResultSize',
    defaultValue: '1g',
    description: `Limit of total size of serialized results of all partitions for each Spark action (e.g. collect) in bytes. Should be at least 1M, or 0 for unlimited. Jobs will be aborted if the total size is above this limit.
    Having a high limit may cause out-of-memory errors in driver (depends on spark.driver.memory and memory overhead of objects in JVM).`
  },
  {
    category: 'Application Properties',
    name: 'spark.driver.memory',
    defaultValue: '1g',
    // Updated description with newlines for specific bullet points
    description: `Amount of memory to use for the driver process, i.e. where SparkContext is initialized, in the same format as JVM memory strings with a size unit suffix ("k", "m", "g" or "t") (e.g. 512m, 2g).
Note: In client mode, this config must not be set through the SparkConf directly in your application, because the driver JVM is launched in the same process as the client.
The options --driver-memory on spark-submit or spark-shell and spark.driver.memory in the default properties file are used instead.`
  },
  {
    category: 'Application Properties',
    name: 'spark.driver.memoryOverhead',
    defaultValue: 'driverMemory * spark.driver.memoryOverheadFactor, with minimum of 384',
    description: 'The amount of off-heap memory to be allocated per driver. This is memory that is not used by the JVM itself, but by the application, for example for storing RDDs. This is a fraction of the driver memory, but can be set explicitly.'
  },
  {
    category: 'Runtime Environment',
    name: 'spark.driver.extraClassPath',
    defaultValue: '(none)',
    description: 'Extra classpath entries to prepend to the classpath of the driver. Note: In client mode, this config must be set through the `--driver-class-path` command-line option or in your `spark-defaults.conf` file.'
  },
  {
    category: 'Runtime Environment',
    name: 'spark.executor.extraJavaOptions',
    defaultValue: '(none)',
    description: 'A string of extra JVM options to pass to executors. These options are appended to the default options.'
  },
    {
    category: 'Scheduling',
    name: 'spark.scheduler.mode',
    defaultValue: 'FIFO',
    description: 'The scheduling mode between jobs submitted to the same SparkContext. Can be set to FAIR to use fair sharing instead of FIFO.'
  },
    {
    category: 'Scheduling',
    name: 'spark.task.cpus',
    defaultValue: '1',
    description: 'Number of cores to allocate for each task.'
  },
  {
    category: 'Shuffle Behavior',
    name: 'spark.shuffle.compress',
    defaultValue: 'true',
    description: 'Whether to compress map output files.'
  },
   {
    category: 'Shuffle Behavior',
    name: 'spark.shuffle.service.enabled',
    defaultValue: 'false',
    description: 'Enables the external shuffle service. If enabled, the shuffle service will run in a separate process, allowing executors to be killed and restarted without losing shuffle files.'
  },
  {
    category: 'Spark UI',
    name: 'spark.ui.port',
    defaultValue: '4040',
    description: 'Port for the Web UI to bind to.'
  },
   {
    category: 'Spark UI',
    name: 'spark.ui.retainedJobs',
    defaultValue: '1000',
    description: 'How many jobs should be retained in the UI.  Larger values consume more memory.'
  },
    {
    category: 'Compression and Serialization',
    name: 'spark.io.compression.codec',
    defaultValue: 'lz4',
    description: 'Codec used to compress RDDs. Can be lz4, snappy, or zstd. zstd requires using zstd-jni.'
  },
     {
    category: 'Compression and Serialization',
    name: 'spark.serializer',
    defaultValue: 'org.apache.spark.serializer.JavaSerializer',
    description: 'Class to use for serializing objects that will be sent over the network or cached. The default is Java serialization.'
  },
    {
    category: 'Memory Management',
    name: 'spark.memory.fraction',
    defaultValue: '0.6',
    description: 'Fraction of (executor memory - 300MB) to use for execution and storage. The rest is reserved for user code.'
  },
      {
    category: 'Memory Management',
    name: 'spark.memory.storageFraction',
    defaultValue: '0.5',
    description: 'Fraction of the memory specified by spark.memory.fraction that is used for storage (caching). The rest is used for execution.'
  },
  // Add more configurations here, categorized appropriately
];


// Component for a single configuration item
function ConfigurationItem({ config }) {
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
    const fullStopCount = text.split('.').length - 1;
    return fullStopCount > 1;
  };


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
            {config.description.split('.').filter(sentence => sentence.trim() !== '').map((sentence, index) => (
              <li key={index}>{sentence.trim() + '.'}</li> // Add full stop back to each sentence
            ))}
          </ul>
        ) : (
          // Otherwise, display as a single paragraph
          <p className="text-gray-700 text-sm leading-relaxed ml-4">{config.description || 'N/A'}</p>
        )}
      </div>


      {/* Display Category as a paragraph at the bottom */}
      <p className="text-xs text-gray-500 mt-4">
        <strong className="font-medium">Category:</strong> {config.category}
      </p>
    </div>
  );
}

// Component for the list of configurations, grouped by category
function ConfigurationList({ configurations }) {
  // Group configurations by category
  const groupedConfigurations = configurations.reduce((acc, config) => {
    const category = config.category || 'Other'; // Handle configurations without a category
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(config);
    return acc;
  }, {});

  const categories = Object.keys(groupedConfigurations);

  if (configurations.length === 0) {
    return <p className="text-center text-gray-600 mt-8">No configurations found matching your search.</p>;
  }

  return (
    <div className="config-list mt-8">
      {categories.map(category => (
        // Only render categories that have configurations after filtering
        groupedConfigurations[category].length > 0 && (
          <div key={category} className="mb-8">
            {/* Category Header */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-500 pb-2">{category}</h2>

            {/* Configuration Items */}
            {/* Using Tailwind grid for responsive layout */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groupedConfigurations[category].map(config => (
                // Grid item
                <div key={config.name}>
                  <ConfigurationItem config={config} />
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
  // State to hold the full list of configurations (hardcoded)
  const allConfigurations = sparkConfigurations;
  // State to hold the filtered list based on search term
  const [filteredConfigurations, setFilteredConfigurations] = useState(allConfigurations);
  // State for the search input value
  const [searchTerm, setSearchTerm] = useState('');

  // Effect to filter configurations whenever the search term changes
  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = allConfigurations.filter(config =>
      config.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      config.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      config.category.toLowerCase().includes(lowerCaseSearchTerm)
    );
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
      {/* Pass the filtered list to the ConfigurationList component */}
      <ConfigurationList configurations={filteredConfigurations} />
    </div>
  );
}

export default App;
