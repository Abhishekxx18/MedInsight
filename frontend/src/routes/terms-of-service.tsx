import { ArrowLeft } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
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
          Terms of Service
        </h1>

        <div className="bg-white shadow-lg rounded-lg p-8 prose max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using MedInsight's services, you agree to be bound
            by these Terms of Service.
          </p>

          <h2>2. Service Description</h2>
          <p>
            MedInsight provides AI-powered disease prediction services. Our
            predictions are:
          </p>
          <ul>
            <li>For informational purposes only</li>
            <li>Not a substitute for professional medical advice</li>
            <li>Based on the information you provide</li>
            <li>Subject to accuracy limitations</li>
          </ul>

          <h2>3. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate information</li>
            <li>Maintain the confidentiality of your account</li>
            <li>Use the service responsibly</li>
            <li>Not misuse or abuse the service</li>
          </ul>

          <h2>4. Limitation of Liability</h2>
          <p>MedInsight is not liable for:</p>
          <ul>
            <li>Accuracy of predictions</li>
            <li>Medical decisions based on our service</li>
            <li>Service interruptions</li>
            <li>Data loss or security breaches</li>
          </ul>

          <h2>5. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued
            use of the service constitutes acceptance of modified terms.
          </p>

          <h2>6. Contact Information</h2>
          <p>For questions about these Terms, contact us at:</p>
          <p>
            Email: legal@healthpredict.com
            <br />
            Phone: (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  );
}
