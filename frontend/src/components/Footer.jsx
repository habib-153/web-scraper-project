const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container max-w-6xl mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Web Scraper Project</p>
      </div>
    </footer>
  );
};

export default Footer;
