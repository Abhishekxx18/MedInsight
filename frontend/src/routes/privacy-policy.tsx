import { ArrowLeft } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-8 prose max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including:
          </p>
          <ul>
            <li>Personal health information</li>
            <li>Medical history</li>
            <li>Diagnostic test results</li>
            <li>Contact information</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>Your information is used to:</p>
          <ul>
            <li>Provide disease prediction services</li>
            <li>Improve our prediction algorithms</li>
            <li>Send you relevant health recommendations</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal
            information, including:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Regular backups and disaster recovery procedures</li>
          </ul>

          <h2>4. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Request corrections to your data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of certain data processing activities</li>
          </ul>

          <h2>5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p>
            Email: privacy@healthpredict.com
            <br />
            Phone: (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
}
