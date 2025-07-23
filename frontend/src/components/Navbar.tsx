import { useState, useEffect, useRef } from "react";
import { Menu, X, Activity, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import { Link, useLocation } from "@tanstack/react-router";

export default function Navbar() {
  const location = useLocation();
  const fixedNavLocation = ["/", "/disease-selection"].includes(
    location.pathname
  );
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleAuthAction = () => {
    if (user) {
      setDropdownOpen((open) => !open);
    } else {
      setShowLoginModal(true);
    }
  };

  if (location.pathname == "/disease-selection") return null;

  return (
    <>
      <nav
        className={`${fixedNavLocation ? "fixed" : "sticky"} top-0 w-full z-30 bg-white md:bg-white/50 md:backdrop-blur-md shadow-md py-2 rounded-b-lg md:rounded-b-xs`}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <Activity className="h-8 w-8 text-emerald-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                MedInsight
              </span>
            </Link>

            <div
              className={
                user || location.pathname !== "/"
                  ? "hidden"
                  : "flex items-center gap-4"
              }
            >
              <HomePageLinks setIsOpen={(v) => setIsOpen(v)} />
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleAuthAction}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="font-medium text-gray-700">
                      {user.name.length > 12
                        ? user.name.split(" ")[0].slice(0, 10) + "..."
                        : user.name.split(" ")[0]}
                    </span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      <Link
                        to="/profile"
                        className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-t-md transition-colors flex items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserCircle2 className="h-5 w-5" /> <span>Profile</span>
                      </Link>
                      <Link
                        to="/disease-selection"
                        className="px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Activity className="h-5 w-5" /> <span>Prediction</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-b-md transition-colors w-full flex items-center gap-2"
                      >
                        <LogOut className="h-5 w-5" /> <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleAuthAction}
                  className="border-2 border-emerald-600 bg-emerald-500 text-white hover:bg-white hover:text-emerald-600 font-medium px-4 py-1.5 rounded-md transition-colors duration-300"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 relative top-0.5"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="md:hidden mt-6 pb-4">
              <div className="flex flex-col space-y-4">
                <HomePageLinks setIsOpen={(v) => setIsOpen(v)} />
                {user ? (
                  <>
                    <Link
                      to="/disease-selection"
                      className="w-full bg-white text-emerald-700 hover:bg-emerald-50 py-2 rounded-md transition-colors duration-300 text-center font-medium border border-emerald-100"
                      onClick={() => setIsOpen(false)}
                    >
                      Disease Prediction
                    </Link>
                    <Link
                      to="/profile"
                      className="w-full bg-white text-emerald-700 hover:bg-emerald-50 py-2 rounded-md transition-colors duration-300 text-center font-medium border border-emerald-100"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="w-full bg-gray-600 text-white hover:bg-gray-700 py-2 rounded-md transition-colors duration-300 flex items-center justify-center gap-2"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleAuthAction();
                      setIsOpen(false);
                    }}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 py-2 rounded-md transition-colors duration-300"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

function HomePageLinks({ setIsOpen }: { setIsOpen: (open: boolean) => void }) {
  return (
    <>
      <a
        href="/#features"
        className="font-medium text-gray-700 hover:text-emerald-500 hover:underline transition-colors"
        onClick={() => setIsOpen(false)}
      >
        Features
      </a>
      <a
        href="/#how-it-works"
        className="font-medium text-gray-700 hover:text-emerald-500 hover:underline transition-colors"
        onClick={() => setIsOpen(false)}
      >
        How It Works
      </a>
      <Link
        to="/privacy-policy"
        className="font-medium text-gray-700 hover:text-emerald-500 hover:underline transition-colors"
        onClick={() => setIsOpen(false)}
      >
        Privacy Policy
      </Link>
      <Link
        to="/terms-of-service"
        className="font-medium text-gray-700 hover:text-emerald-500 hover:underline transition-colors"
        onClick={() => setIsOpen(false)}
      >
        Terms of Service
      </Link>
    </>
  );
}
