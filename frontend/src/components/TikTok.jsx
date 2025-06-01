import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Calendar, BookOpen, Globe, RefreshCw, Heart, X } from 'lucide-react';

const WikipediaShorts = ({ onClose }) => {
  const [currentSection, setCurrentSection] = useState('today');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentIndices, setCurrentIndices] = useState({
    today: 0,
    featured: 0,
    currentAffairs: 0
  });
  const [likedCards, setLikedCards] = useState({});
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const modalRef = useRef(null);
  const [wheelDelta, setWheelDelta] = useState(0);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Fetch Wikipedia content
  const fetchWikipediaContent = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      // Fetch "On This Day" content
      const onThisDayResponse = await fetch(
        `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`
      );
      const onThisDayData = await onThisDayResponse.json();

      // Fetch science articles
      const scienceResponse = await fetch(
        'https://en.wikipedia.org/api/rest_v1/page/random/summary?titles=Science'
      );
      const scienceData = await scienceResponse.json();

      // Fetch math articles
      const mathResponse = await fetch(
        'https://en.wikipedia.org/api/rest_v1/page/random/summary?titles=Mathematics'
      );
      const mathData = await mathResponse.json();

      // Fetch GK articles
      const gkResponse = await fetch(
        'https://en.wikipedia.org/api/rest_v1/page/random/summary'
      );
      const gkData = await gkResponse.json();

      // Fetch current affairs (using most viewed articles)
      const currentAffairsResponse = await fetch(
        `https://en.wikipedia.org/api/rest_v1/feed/featured/${today.getFullYear()}/${month}/${day}`
      );
      const currentAffairsData = await currentAffairsResponse.json();

      setContent({
        today: onThisDayData.events?.slice(0, 15) || [],
        featured: [
          { ...scienceData, category: 'Science' },
          { ...mathData, category: 'Mathematics' },
          { ...gkData, category: 'General Knowledge' }
        ],
        currentAffairs: currentAffairsData.mostread?.articles?.slice(0, 15) || []
      });
    } catch (error) {
      console.error('Error fetching Wikipedia content:', error);
      // Fallback content
      setContent({
        today: Array(5).fill({
          text: "The World Wide Web was invented, revolutionizing global communication.",
          year: 1991,
          pages: [{
            titles: { normalized: "World Wide Web" },
            extract: "The World Wide Web (WWW) is an information system enabling documents and other web resources to be accessed over the Internet.",
            content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/World_Wide_Web" } }
          }]
        }),
        featured: [
          { 
            title: "Quantum Mechanics", 
            extract: "Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.",
            category: 'Science'
          },
          { 
            title: "Algebra", 
            extract: "Algebra is one of the broad areas of mathematics, together with number theory, geometry and analysis.",
            category: 'Mathematics'
          },
          { 
            title: "United Nations", 
            extract: "The United Nations is an intergovernmental organization whose stated purposes are to maintain international peace and security.",
            category: 'General Knowledge'
          }
        ],
        currentAffairs: Array(5).fill({
          title: "Climate Change Summit",
          extract: "World leaders gather to discuss climate change initiatives and set new emission targets.",
          timestamp: new Date().toISOString()
        })
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWikipediaContent();
  }, []);

  const sections = [
    { id: 'today', label: 'On This Day', icon: Calendar },
    { id: 'featured', label: 'Subjects', icon: BookOpen },
    { id: 'currentAffairs', label: 'Current Affairs', icon: Globe }
  ];

  const getCurrentContent = () => {
    switch (currentSection) {
      case 'today':
        return content.today || [];
      case 'featured':
        return content.featured || [];
      case 'currentAffairs':
        return content.currentAffairs || [];
      default:
        return [];
    }
  };

  const currentContent = getCurrentContent();
  const currentIndex = currentIndices[currentSection];

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches ? e.touches[0].clientY : e.clientY);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    const diff = y - startY;
    
    // Prevent page scroll when swiping
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const diff = startY - y;
    handleScroll(diff);
  };

  const handleWheel = (e) => {
    // Accumulate wheel delta to handle trackpad scrolling
    const newDelta = wheelDelta + e.deltaY;
    setWheelDelta(newDelta);
    
    // Only trigger when accumulated delta is significant
    if (Math.abs(newDelta) > 100) {
      handleScroll(e.deltaY);
      setWheelDelta(0);
    }
    
    // Prevent default to avoid page scroll
    e.preventDefault();
  };

  const handleScroll = (delta) => {
    if (delta > 50 && currentIndex < currentContent.length - 1) {
      // Scroll down - next item
      setCurrentIndices(prev => ({
        ...prev,
        [currentSection]: prev[currentSection] + 1
      }));
    } else if (delta < -50 && currentIndex > 0) {
      // Scroll up - previous item
      setCurrentIndices(prev => ({
        ...prev,
        [currentSection]: prev[currentSection] - 1
      }));
    }
  };

  const toggleLike = (section, index) => {
    setLikedCards(prev => {
      const key = `${section}-${index}`;
      return {
        ...prev,
        [key]: !prev[key]
      };
    });
  };

  const getImageUrl = (item) => {
    if (item.thumbnail?.source) return item.thumbnail.source;
    if (item.pages?.[0]?.thumbnail?.source) return item.pages[0].thumbnail.source;
    if (item.originalimage?.source) return item.originalimage.source;
    return `https://picsum.photos/400/700?random=${Math.floor(Math.random() * 1000)}`;
  };

  const getTitle = (item) => {
    if (item.title) return item.title;
    if (item.pages?.[0]?.titles?.normalized) return item.pages[0].titles.normalized;
    if (item.text) return `Event from ${item.year}`;
    return "Wikipedia Fact";
  };

  const getDescription = (item) => {
    if (item.extract) return item.extract;
    if (item.pages?.[0]?.extract) return item.pages[0].extract;
    if (item.text) return item.text;
    return "Discover fascinating facts from Wikipedia";
  };

  const getWikipediaUrl = (item) => {
    if (item.content_urls?.desktop?.page) return item.content_urls.desktop.page;
    if (item.pages?.[0]?.content_urls?.desktop?.page) return item.pages[0].content_urls.desktop.page;
    const title = getTitle(item).replace(/\s+/g, '_');
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="relative w-full h-full max-w-md max-h-[90vh] mx-auto bg-black rounded-lg overflow-hidden"
        style={{
          aspectRatio: '9/16' // Standard TikTok aspect ratio
        }}
      >
        {/* Close button (for desktop) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-gray-800 bg-opacity-50 rounded-full p-2 text-white hover:bg-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header Navigation */}
        <div className="flex justify-center space-x-1 p-4 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setCurrentSection(section.id);
                  setCurrentIndices(prev => ({ ...prev, [section.id]: 0 }));
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentSection === section.id
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <IconComponent size={16} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content - Vertical Scroll */}
        <div 
          ref={containerRef}
          className="h-[calc(100%-56px)] w-full relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {currentContent.map((item, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-transform duration-300 ease-out ${
                index === currentIndex 
                  ? 'translate-y-0 z-10' 
                  : index < currentIndex 
                    ? '-translate-y-full z-0' 
                    : 'translate-y-full z-0'
              }`}
              style={{
                pointerEvents: index === currentIndex ? 'auto' : 'none'
              }}
            >
              {/* Content Card */}
              <div className="h-full w-full flex flex-col">
                {/* Image Section */}
                <div className="relative flex-1 overflow-hidden">
                  <img
                    src={getImageUrl(item)}
                    alt={getTitle(item)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/400/700?random=${Math.floor(Math.random() * 1000)}`;
                    }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

                  {/* Like Button - Moved to top right above content */}
                  <div className="absolute right-4 top-1/3 flex flex-col items-center space-y-4 z-20">
                    <button
                      onClick={() => toggleLike(currentSection, index)}
                      className="flex flex-col items-center"
                    >
                      <Heart
                        size={28}
                        className={`transition-colors ${
                          likedCards[`${currentSection}-${index}`] ? 'text-red-500 fill-red-500' : 'text-white'
                        }`}
                      />
                      <span className="text-xs text-white mt-1">
                        {likedCards[`${currentSection}-${index}`] ? 'Liked' : 'Like'}
                      </span>
                    </button>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                    {item.category && (
                      <span className="inline-block px-2 py-1 bg-blue-600 text-xs font-medium rounded-md">
                        {item.category}
                      </span>
                    )}
                    
                    <div className="space-y-3">
                      <h2 className="text-2xl font-bold leading-tight">
                        {getTitle(item)}
                      </h2>
                      
                      {item.year && (
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Calendar size={16} />
                          <span className="text-sm font-medium">{item.year}</span>
                        </div>
                      )}

                      {item.timestamp && (
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Calendar size={16} />
                          <span className="text-sm font-medium">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <p className="text-gray-200 text-sm leading-relaxed line-clamp-4">
                        {getDescription(item)}
                      </p>

                      {/* Read More Button */}
                      <a
                        href={getWikipediaUrl(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <span>Read More</span>
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchWikipediaContent}
          className="absolute top-16 right-4 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm rounded-full p-2 transition-all z-20"
        >
          <RefreshCw size={20} />
        </button>
      </div>
    </div>
  );
};

// Button to open the modal
export const WikipediaShortsLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg z-40"
      >
        <BookOpen size={24} />
      </button>

      {isOpen && <WikipediaShorts onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default WikipediaShortsLauncher;