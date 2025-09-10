import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
console.log("Footer loaded")

const Footer = () => {
  // TODO: Replace with your actual information
  const myName = "Henry Le";
  const myPhotoUrl = "https://via.placeholder.com/60";
  const linkedinUrl = "https://www.linkedin.com/in/henry-le-dev/"; // Replace with your LinkedIn URL
  const githubUrl = "https://github.com/Henry-Le-Dev"; // Replace with your GitHub URL

  return (
    <footer className="w-full flex justify-center p-4 bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-4 max-w-xs w-full">
        <Image
          src={myPhotoUrl}
          alt={`Photo of ${myName}`}
          width={60}
          height={60}
          className="rounded-full object-cover"
          // Fallback in case the image is missing
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/60'; }}
        />
        <div className="flex-grow">
          <p className="font-semibold text-gray-800">{myName}</p>
          <div className="flex items-center space-x-3 mt-1">
            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="text-gray-600 hover:text-blue-700 transition-colors">
              <FaLinkedin size={24} />
            </a>
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="text-gray-600 hover:text-gray-900 transition-colors">
              <FaGithub size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;