import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
console.log("Footer loaded");

const Footer = () => {
  // TODO: Replace with your actual information
  const myName = "Henry Le";
  const myPhotoUrl = "https://via.placeholder.com/60";
  const linkedinUrl = "https://www.linkedin.com/in/henry-le-umn/"; // Replace with your LinkedIn URL
  const githubUrl = "https://github.com/whippyy"; // Replace with your GitHub URL

  return (
    <footer className="w-full flex justify-center p-4 bg-gray-50">
      <div className="flex items-center space-x-4">
        {/* Circle placeholder */}
        <div className="w-12 h-12 rounded-full bg-gray-300" />
        <span className="font-semibold">{myName}</span>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
          LinkedIn
        </a>
        <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-800 underline">
          GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;