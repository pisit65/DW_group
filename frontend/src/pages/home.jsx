export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center bg-gradient-to-r from-blue-100 to-blue-200 py-20">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">
          Welcome to MyApp
        </h2>
        <p className="text-gray-700 mb-6 max-w-xl">
          Explore amazing features and make your life easier with our modern web solutions.
        </p>
        <a
          href="#"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <a href="/chat">Get Started</a>
          
        </a>
      </section>

      {/* Card Section */}
      <section className="container mx-auto py-16">
        <h3 className="text-3xl font-bold text-center mb-10">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition">
            <h4 className="text-xl font-semibold mb-2">Analyze Data</h4>
            <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition">
            <h4 className="text-xl font-semibold mb-2">Chat with Bot</h4>
            <p className="text-gray-600">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white shadow rounded-lg p-6 text-center hover:shadow-lg transition">
            <h4 className="text-xl font-semibold mb-2">Summary data</h4>
            <p className="text-gray-600">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white shadow mt-auto">
        <div className="container mx-auto text-center p-4 text-gray-600">
          &copy; 2025 MyApp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
