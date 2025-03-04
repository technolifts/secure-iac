import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600">&copy; {new Date().getFullYear()} Secure IaC. All rights reserved.</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-primary transition">
              Terms
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-primary transition">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;