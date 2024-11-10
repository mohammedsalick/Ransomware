const { useState, useEffect } = React;

function RansomwareDetectorUI() {
    const [selectedTests, setSelectedTests] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [error, setError] = useState(null);
    const [quarantinedFiles, setQuarantinedFiles] = useState([]);
    const [scanResults, setScanResults] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const tests = [
        {
            id: 1,
            name: "Rapid file creation",
            description: "Creates multiple files in quick succession"
        },
        {
            id: 2,
            name: "Suspicious extensions",
            description: "Creates files with known ransomware extensions"
        },
        {
            id: 3,
            name: "High entropy files",
            description: "Creates files with high entropy content"
        },
        {
            id: 4,
            name: "Rapid file modifications",
            description: "Rapidly modifies file contents"
        },
        {
            id: 5,
            name: "File moves/renames",
            description: "Tests file movement operations"
        }
    ];

    useEffect(() => {
        if (isRunning) {
            const interval = setInterval(() => {
                fetchTestStatus();
                fetchQuarantineStatus();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isRunning]);

    const fetchTestStatus = async () => {
        try {
            const response = await fetch('/api/test-status');
            const data = await response.json();
            setTestResults(data.results);
            setIsRunning(data.is_running);
        } catch (error) {
            console.error('Error fetching test status:', error);
            setError('Failed to fetch test status');
        }
    };

    const fetchQuarantineStatus = async () => {
        try {
            const response = await fetch('/api/quarantine-status');
            const data = await response.json();
            setQuarantinedFiles(data.quarantined_files);
        } catch (error) {
            console.error('Error fetching quarantine status:', error);
        }
    };

    const handleTestSelection = (testId) => {
        setSelectedTests(prev => {
            if (prev.includes(testId)) {
                return prev.filter(id => id !== testId);
            } else {
                return [...prev, testId];
            }
        });
    };

    const runTests = async () => {
        try {
            setError(null);
            setIsRunning(true);
            setTestResults([]);
            
            const response = await fetch('/api/run-tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ test_ids: selectedTests }),
            });

            if (!response.ok) {
                throw new Error('Failed to start tests');
            }
        } catch (error) {
            console.error('Error starting tests:', error);
            setError('Failed to start tests');
            setIsRunning(false);
        }
    };

    const selectAll = () => {
        setSelectedTests(tests.map(test => test.id));
    };

    const clearAll = () => {
        setSelectedTests([]);
        setTestResults([]);
        setError(null);
    };

    const handleScan = async () => {
        try {
            setIsScanning(true);
            const response = await fetch('/api/scan-folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ folder_path: selectedFolder }),
            });

            if (!response.ok) {
                throw new Error('Failed to scan folder');
            }

            const data = await response.json();
            setScanResults(data.results);
        } catch (error) {
            console.error('Error scanning folder:', error);
            setError('Failed to scan folder');
        } finally {
            setIsScanning(false);
        }
    };

    const handleQuarantine = async (filePath) => {
        try {
            const response = await fetch('/api/quarantine-scanned-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file_path: filePath }),
            });

            if (!response.ok) {
                throw new Error('Failed to quarantine file');
            }

            const data = await response.json();
            
            setTestResults(prev => [...prev, {
                name: "File Quarantined",
                status: `Successfully quarantined to: ${data.quarantine_path}`,
                timestamp: new Date().toLocaleTimeString()
            }]);

            setScanResults(prevResults => 
                prevResults.filter(result => result.file_path !== filePath)
            );
        } catch (error) {
            console.error('Error quarantining file:', error);
            setError('Failed to quarantine file');
        }
    };

    const handleAnalyze = async (result) => {
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/analyze-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ file_info: result }),
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            setCurrentAnalysis(data.analysis);
            setShowAnalysis(true);
        } catch (error) {
            console.error('Error:', error);
            setCurrentAnalysis('Failed to get AI analysis. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const renderDashboard = () => (
        <div className="bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-semibold text-white mb-6">Ransomware Detector</h1>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:space-x-4 items-center">
                    <input
                        type="text"
                        value={selectedFolder}
                        onChange={(e) => setSelectedFolder(e.target.value)}
                        placeholder="Enter folder path"
                        className="flex-1 p-3 rounded-lg text-black mb-4 sm:mb-0"
                    />
                    <button
                        onClick={handleScan}
                        disabled={isScanning || !selectedFolder}
                        className="px-4 py-2 text-white rounded-lg bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400"
                    >
                        {isScanning ? 'Scanning...' : 'Scan Folder'}
                    </button>
                </div>
                {scanResults.length > 0 && (
                    <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-xl font-medium">Scan Results:</h3>
                        <div className="space-y-4 mt-4">
                            {scanResults.map((result, index) => (
                                <div key={index} className={`flex justify-between items-center p-4 rounded-lg ${result.suspicious ? 'bg-red-800' : 'bg-green-800'}`}>
                                    <div className="flex items-center space-x-2">
                                        <i className={`fas ${result.suspicious ? 'fa-exclamation-circle text-red-400' : 'fa-check-circle text-green-400'}`}></i>
                                        <span>{result.file_path}</span>
                                    </div>
                                    {result.suspicious && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleAnalyze(result)}
                                                className="px-4 py-2 text-white rounded-lg bg-blue-500 hover:bg-blue-600"
                                                disabled={isAnalyzing}
                                            >
                                                {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                            </button>
                                            <button
                                                onClick={() => handleQuarantine(result.file_path)}
                                                className="px-4 py-2 text-white rounded-lg bg-yellow-500 hover:bg-yellow-600"
                                            >
                                                Quarantine
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderTestCases = () => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Test Cases</h2>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <button
                        onClick={selectAll}
                        className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    >
                        Select All
                    </button>
                    <button
                        onClick={clearAll}
                        className="px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                    >
                        Clear All
                    </button>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {tests.map((test) => (
                        <li key={test.id} className="bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={selectedTests.includes(test.id)}
                                    onChange={() => handleTestSelection(test.id)}
                                    className="h-5 w-5 text-teal-500"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold">{test.name}</h3>
                                    <p className="text-gray-400 text-sm">{test.description}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={runTests}
                    disabled={selectedTests.length === 0 || isRunning}
                    className="w-full mt-4 px-6 py-3 text-white rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400"
                >
                    {isRunning ? 'Tests Running...' : 'Run Selected Tests'}
                </button>
            </div>
        </div>
    );

    const renderResults = () => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Test Results</h2>
            {testResults.length > 0 ? (
                <div className="space-y-4">
                    {testResults.map((result, index) => (
                        <div key={index} className="bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">{result.name}</h3>
                                    <p className="text-gray-400">{result.status}</p>
                                </div>
                                <span className="text-gray-400">{result.timestamp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400">No test results available</p>
            )}
        </div>
    );

    const ChatbotSidebar = ({ isOpen, onClose, response, isLoading }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed left-0 top-0 h-full w-96 bg-gray-900 shadow-xl transform transition-transform z-50 flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
                    <div className="flex items-center">
                        <i className="fas fa-robot text-blue-400 mr-2 text-xl"></i>
                        <h3 className="text-xl font-bold">Security Assistant</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <i className="fas fa-circle-notch fa-spin text-2xl text-blue-400 mb-2"></i>
                                <p className="text-gray-400">Analyzing file security...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* AI Message */}
                            <div className="flex space-x-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                    <i className="fas fa-robot text-white"></i>
                                </div>
                                <div className="flex-1">
                                    <div className="bg-gray-800 rounded-lg p-4 text-white">
                                        <div className="prose prose-invert">
                                            <div className="whitespace-pre-wrap">{response}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 text-center">
                        Powered by Gemini AI
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'tests' && renderTestCases()}
            {activeTab === 'results' && renderResults()}
            
            <ChatbotSidebar
                isOpen={showAnalysis}
                onClose={() => setShowAnalysis(false)}
                response={currentAnalysis}
                isLoading={isAnalyzing}
            />
        </div>
    );
}

ReactDOM.render(<RansomwareDetectorUI />, document.getElementById("root"));
