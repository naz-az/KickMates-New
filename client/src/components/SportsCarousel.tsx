import { useState, useEffect, useRef, useCallback } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Sports data for the carousel
const sportsData = [
  {
    id: 1,
    name: 'Football',
    description: 'Join local matches and improve your skills with fellow football enthusiasts.',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
    // color: 'from-green-500 to-teal-600',
    // icon: '⚽'
  },
  {
    id: 2,
    name: 'Basketball',
    description: 'Find pickup games and tournaments in your neighborhood courts.',
    image: 'https://images.unsplash.com/photo-1546519638-68e109acd27d?auto=format&fit=crop&w=600&q=80',
    // color: 'from-orange-500 to-red-600',
    // icon: '🏀'
  },
  {
    id: 3,
    name: 'Tennis',
    description: 'Connect with tennis players of all skill levels for friendly matches.',
    image: 'image.png',
    // color: 'from-yellow-400 to-amber-600',
    // icon: '🎾'
  },
  {
    id: 4,
    name: 'Yoga',
    description: 'Join outdoor yoga sessions and connect with like-minded wellness enthusiasts.',
    image: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=600&q=80',
    // color: 'from-purple-400 to-indigo-600',
    // icon: '🧘'
  },
  {
    id: 5,
    name: 'Running',
    description: 'Find running buddies and join local running groups for motivation.',
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=600&q=80',
    // color: 'from-blue-400 to-sky-600',
    // icon: '🏃'
  },
  {
    id: 6,
    name: 'Swimming',
    description: 'Meet fellow swimmers and join pool sessions for fitness and fun.',
    image: 'https://images.unsplash.com/photo-1560090995-01632a28895b?auto=format&fit=crop&w=600&q=80',
    // color: 'from-cyan-400 to-blue-600',
    // icon: '🏊'
  }
];

// Define type for sport data
interface SportData {
  id: number;
  name: string;
  description: string;
  image: string;
  color?: string;
  icon?: string;
}

const SportsCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const sliderRef = useRef<Slider | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplaySpeed = 4000;
  
  // Handle loading state
  useEffect(() => {
    // Simulate loading of images
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Progress bar animation
  const startProgressAnimation = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (autoplaySpeed / 100));
      });
    }, 100);
  }, []);
  
  useEffect(() => {
    if (!loading && !isPaused) {
      startProgressAnimation();
    } else if (isPaused && progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [loading, isPaused, startProgressAnimation]);
  
  // Custom arrow components
  const PrevArrow = (props: any) => {
    const { onClick, className } = props;
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onClick) {
        onClick(e);
        startProgressAnimation();
      }
    };
    
    return (
      <button 
        className={`${className} slick-arrow slick-prev`}
        onClick={handleClick}
        aria-label="Previous"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );
  };

  const NextArrow = (props: any) => {
    const { onClick, className } = props;
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (onClick) {
        onClick(e);
        startProgressAnimation();
      }
    };
    
    return (
      <button 
        className={`${className} slick-arrow slick-next`}
        onClick={handleClick}
        aria-label="Next"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  };
  
  // Carousel controls
  const handlePausePlay = () => {
    setIsPaused(prev => !prev);
    if (isPaused) {
      sliderRef.current?.slickPlay();
      startProgressAnimation();
    } else {
      sliderRef.current?.slickPause();
    }
  };
  
  const handleSlideChange = (current: number, next: number) => {
    setActiveSlide(next);
    startProgressAnimation();
  };
  
  // Settings for the Slick slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !isPaused,
    autoplaySpeed,
    pauseOnHover: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    beforeChange: handleSlideChange,
    fade: true,
    cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)',
    arrows: true,
    draggable: true,
    swipe: true,
    customPaging: (i: number) => (
      <div
        className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
          i === activeSlide ? 'bg-primary scale-125' : 'bg-gray-300'
        }`}
      />
    ),
    dotsClass: 'slick-dots custom-dots flex justify-center mt-6 space-x-2'
  };

  return (
    <div 
      className="sports-carousel-container relative overflow-hidden py-8 pb-5"
      onMouseEnter={() => setIsPaused(true)} 
      onMouseLeave={() => {
        setIsPaused(false);
        sliderRef.current?.slickPlay();
        startProgressAnimation();
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary-light/10 to-accent/5 -z-10"></div>
      
      <div className="text-center mb-10 animate-fade-in">
        <h2 className="text-4xl font-bold text-primary-dark mb-4" style={{ fontFamily: '"Source Serif 4", Georgia, serif', fontSize: '3rem', color: '#000' }}>Find Your Next Sports Buddy</h2>
        <p className="text-lg text-text-light max-w-2xl mx-auto">
          Join sports sessions and connect with others who share your passion for sports and an active lifestyle.
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto px-2 relative">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="animate-fade-in relative">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-20">
              <div className="h-1 bg-gray-200 bg-opacity-30">
                <div 
                  className="h-full bg-primary transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Pause/Play Button */}
            <button 
              className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/50 transition-all"
              onClick={handlePausePlay}
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            {/* Slider */}
            <Slider ref={sliderRef} {...settings}>
              {sportsData.map((sport: SportData) => (
                <div key={sport.id} className="px-1 py-2">
                  <div className="carousel-card-fullscreen">
                    <div 
                      className="relative h-[300px] md:h-[400px] lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl"
                    >
                      {/* Background image with floating animation */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 animate-ken-burns" 
                        style={{ backgroundImage: `url(${sport.image})` }}
                      />
                      <div className={`absolute inset-0 opacity-100 animate-pulse-subtle`}></div>
                      
                      {/* Floating particles */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="particle particle-1"></div>
                        <div className="particle particle-2"></div>
                        <div className="particle particle-3"></div>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-8 md:p-12 lg:p-16 flex flex-col justify-end text-white">
                        <div className="animate-slide-up max-w-2xl">
                          <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>{sport.name}</h3>
                          <p className="text-white/90 text-lg md:text-xl lg:text-2xl max-w-xl mb-6 drop-shadow-md">{sport.description}</p>
                          
                          <div className="flex flex-wrap gap-3 mb-8">
                            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium">
                              {Math.floor(Math.random() * 20) + 5} Events
                            </span>
                            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium">
                              {Math.floor(Math.random() * 100) + 10} Players
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-4">
                            <Link 
                              to="/events" 
                              className="px-6 py-3 md:px-8 md:py-4 bg-white text-primary font-bold rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 shadow-lg"
                            >
                              Explore {sport.name}
                            </Link>
                            <Link 
                              to="/events/create" 
                              className="px-6 py-3 md:px-8 md:py-4 bg-white/30 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/40 transition-all duration-300 hover:scale-105"
                            >
                              Host an Event
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
            
            {/* Counter */}
            <div className="absolute bottom-6 right-6 md:right-10 z-20 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white font-medium">
              {activeSlide + 1} / {sportsData.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportsCarousel; 