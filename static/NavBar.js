const NavBar = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="bg-gray-900 p-4 mb-6 rounded-lg shadow-lg">
            <div className="flex items-center space-x-4">
                {/* Logo Image */}
                <img src="static/images/threatsafe.jpg" alt="" className="w-10 h-10 mr-4 rounded-lg" />
                
                {/* Navigation Buttons */}
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'dashboard' 
                        ? 'bg-teal-500 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    <i className="fas fa-home mr-2"></i>Dashboard
                </button>
                <button
                    onClick={() => setActiveTab('tests')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'tests' 
                        ? 'bg-teal-500 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    <i className="fas fa-vial mr-2"></i>Test Cases
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        activeTab === 'results' 
                        ? 'bg-teal-500 text-white' 
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    <i className="fas fa-chart-bar mr-2"></i>Results
                </button>

                {/* Spacer to push title image to the right */}
                <div className="flex-grow"></div>

                {/* Title Image at the end of navbar */}
                <img src="static/images/ThreatSafeTitle-removebg-preview.png" alt="" className="w-20 h-10" />
            </div>
        </nav>
    );
};
