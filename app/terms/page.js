"use client";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header Section */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
          <p className="text-sm mt-2">Effective Date: January 14, 2025</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-10 bg-white rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Welcome to our platform. By using our services, you agree to the following terms and conditions. Please read
          them carefully as they govern your use of the platform and any services provided.
        </p>

        <h2 className="text-xl font-semibold mb-4">1. User Responsibilities</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Users are responsible for ensuring that the information they provide during registration is accurate and
          up-to-date. Misuse of the platform for illegal activities or fraud is strictly prohibited and may result in
          account termination.
        </p>

        <h2 className="text-xl font-semibold mb-4">2. Business Services</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Our platform connects users with businesses. However, we are not responsible for any agreements, payments, or
          interactions between users and businesses. These matters are strictly between the business and the user.
        </p>

        <h2 className="text-xl font-semibold mb-4">3. Payments</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          Payments for services are managed solely by the business providing the service. Our platform does not process
          payments or act as a mediator in financial disputes. Please ensure you understand the business's payment terms
          before proceeding.
        </p>

        <h2 className="text-xl font-semibold mb-4">4. Liability</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          We are not liable for any damages, losses, or disputes arising from your use of the platform or the services
          provided by businesses. All interactions are at your own discretion and risk.
        </p>

        <h2 className="text-xl font-semibold mb-4">5. Amendments</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          We reserve the right to update these terms and conditions at any time. Changes will be communicated via
          updates on this page. Continued use of the platform after changes signifies your acceptance of the revised
          terms.
        </p>

        <h2 className="text-xl font-semibold mb-4">6. Contact Us</h2>
        <p className="mb-6 text-gray-700 leading-relaxed">
          If you have any questions or concerns about these terms and conditions, please contact us at
          <a href="mailto:waveriders.help@gmail.com" className="text-blue-600"> waveriders.help@gmail.com</a>.
        </p>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} WaveRiders. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;
