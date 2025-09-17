import Image from 'next/image';
import { FaGithub, FaLinkedin } from 'react-icons/fa6';

const Footer = () => {
  // TODO: Replace with your actual information
  const myName = "Henry Le";
  const myPhotoUrl = "https://avatars.githubusercontent.com/u/68843158?v=4"; // Using a real image URL
  const linkedinUrl = "https://www.linkedin.com/in/henry-le-umn/"; // Replace with your LinkedIn URL
  const githubUrl = "https://github.com/whippyy"; // Replace with your GitHub URL

  return (
    <footer className="w-full flex justify-center p-4 bg-gray-50 border-t">
      <div className="flex items-center space-x-4">
        <Image
          src={myPhotoUrl}
          alt={`Photo of ${myName}`}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <span className="font-semibold">{myName}</span>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-blue-600 transition-colors"
          aria-label="LinkedIn Profile"
        >
          <FaLinkedin size={24} />
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="GitHub Profile"
        >
          <FaGithub size={24} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;