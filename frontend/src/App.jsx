import { Routes, Route, NavLink } from "react-router-dom";
import Test from "./pages/test";
import Home from "./pages/home";
import Chat from "./pages/chat";
import { useState } from "react";

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Data Table", path: "/test" },
    { name: "AI Contact", path: "/chat" },
  ];

  const activeStyle =
    "font-semibold underline text-blue-600";

  const inactiveStyle =
    "text-gray-700 hover:text-blue-500 transition";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-md">
        <nav className="container mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-600">MyApp</h1>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  isActive ? activeStyle : inactiveStyle
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? "✖" : "☰"}
          </button>
        </nav>

        {/* Mobile Links */}
        {mobileOpen && (
          <div className="md:hidden bg-white shadow-md">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `block p-4 border-b ${isActive ? activeStyle : inactiveStyle}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      {/* <main className="flex-1 container mx-auto"> */}
      <main className="flex min-h-screen mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
