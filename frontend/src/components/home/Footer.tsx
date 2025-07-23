import { Link } from "@tanstack/react-router";
import {
  Activity,

  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Activity className="h-8 w-8 text-emerald-500" />
              <span className="ml-2 text-xl font-bold text-white">
                MedInsight
              </span>
            </div>
            <p className="mb-4">
              Cutting-edge AI-powered disease prediction service helping you
              take control of your health with early detection and preventive
              care recommendations.
            </p>
            
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="hover:text-emerald-500 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-emerald-500 transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-emerald-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="hover:text-emerald-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-emerald-500 flex-shrink-0" />
                <span>Hyderabad,Telangana</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-emerald-500 flex-shrink-0" />
                <span>+91 9491361212 </span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-emerald-500 flex-shrink-0" />
                <span>abhi04457@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} MedInsight. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
