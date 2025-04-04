import { useState, useMemo, useEffect } from 'react';
import Calendar from '../components/Calendar';
import axios from 'axios';

interface TopCourse {
  id: number;
  title: string;
  instructor: string;
  instructor_avatar: string;
  level: string;
  rating: number;
  attendees: number;
  image_url: string;
}

interface UserCourse {
  id: number;
  title: string;
  sessions_completed: number;
  total_sessions: number;
  image_url: string;
  participants: string[];
}

interface UpcomingEvent {
  id: number;
  title: string;
  type: string;
  event_date: string;
  event_time: string;
}

interface UserStats {
  score: {
    value: number;
    change: string;
  };
  completedHours: {
    value: number;
    change: string;
  };
  totalStudents: {
    value: number;
    change: string;
  };
  totalHours: {
    value: number;
    change: string;
  };
}

interface ProductivityData {
  days: string[];
  mentoring: number[];
  selfImprove: number[];
  student: number[];
}

const API_URL = 'http://localhost:5000/api';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [myCourses, setMyCourses] = useState<UserCourse[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [productivityData, setProductivityData] = useState<ProductivityData | null>(null);
  
  // Format current date
  const formattedDate = useMemo(() => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options as any);
  }, []);
  
  const currentMonth = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);
  
  // Current week dates
  const currentWeekDates = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    
    return Array(7).fill(0).map((_, i) => {
      const date = new Date(today);
      date.setDate(diff + i);
      return {
        day: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        hasEvent: upcomingEvents.some(event => event.event_date.includes(date.getDate().toString()))
      };
    });
  }, [upcomingEvents]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get auth token
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        // Fetch all dashboard data in parallel
        const [
          topCoursesRes,
          myCoursesRes,
          upcomingEventsRes,
          userStatsRes,
          productivityRes
        ] = await Promise.all([
          axios.get(`${API_URL}/dashboard/top-courses`, config),
          axios.get(`${API_URL}/dashboard/user-courses`, config),
          axios.get(`${API_URL}/dashboard/upcoming-events`, config),
          axios.get(`${API_URL}/dashboard/statistics`, config),
          axios.get(`${API_URL}/dashboard/productivity`, config)
        ]);
        
        setTopCourses(topCoursesRes.data);
        setMyCourses(myCoursesRes.data);
        setUpcomingEvents(upcomingEventsRes.data);
        setUserStats(userStatsRes.data);
        setProductivityData(productivityRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Fallback to demo data if API fails
        setTopCourses([
          {
            id: 1,
            title: 'Football Skills Mastery: From Beginner to Pro Player',
            instructor: 'Alison Walsh',
            instructor_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
            level: 'Beginner',
            rating: 5.0,
            attendees: 118,
            image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55'
          },
          {
            id: 2,
            title: 'Basketball Fundamentals: Team Play & Techniques',
            instructor: 'Patty Kutch',
            instructor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
            level: 'Beginner',
            rating: 4.8,
            attendees: 234,
            image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc'
          },
          {
            id: 3,
            title: 'Advanced Sport Training: Performance & Conditioning',
            instructor: 'Alonzo Murray',
            instructor_avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
            level: 'Intermediate',
            rating: 4.9,
            attendees: 57,
            image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b'
          },
          {
            id: 4,
            title: 'Team Sports Leadership & Coaching Excellence',
            instructor: 'Gregory Harris',
            instructor_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
            level: 'Advanced',
            rating: 5.0,
            attendees: 19,
            image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9'
          }
        ]);
        
        setMyCourses([
          {
            id: 1,
            title: 'Football Training',
            sessions_completed: 9,
            total_sessions: 12,
            image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
            participants: [
              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
              'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
              'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79'
            ]
          },
          {
            id: 2,
            title: 'Basketball Skills',
            sessions_completed: 16,
            total_sessions: 24,
            image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
            participants: [
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
              'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
              'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79'
            ]
          },
          {
            id: 3,
            title: 'Training Techniques',
            sessions_completed: 11,
            total_sessions: 18,
            image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b',
            participants: [
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
              'https://images.unsplash.com/photo-1517841905240-472988babdf9',
              'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1'
            ]
          },
          {
            id: 4,
            title: 'Team Development',
            sessions_completed: 18,
            total_sessions: 37,
            image_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9',
            participants: [
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
              'https://images.unsplash.com/photo-1568602471122-7832951cc4c5',
              'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61'
            ]
          }
        ]);
        
        setUpcomingEvents([
          {
            id: 1,
            title: 'Business Prospect Analysis',
            type: 'Course',
            event_date: 'April 25',
            event_time: '11:00-12:00'
          },
          {
            id: 2,
            title: 'AI & Virtual Reality: Intro',
            type: 'Tutoring',
            event_date: 'April 27',
            event_time: '14:30-15:30'
          }
        ]);
        
        setUserStats({
          score: {
            value: 210,
            change: '+15%'
          },
          completedHours: {
            value: 34,
            change: '+15%'
          },
          totalStudents: {
            value: 17,
            change: '-2%'
          },
          totalHours: {
            value: 11,
            change: '-9%'
          }
        });
        
        setProductivityData({
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          mentoring: [25, 75, 25, 25, 25, 0, 25],
          selfImprove: [50, 90, 50, 50, 50, 25, 50],
          student: [75, 90, 75, 75, 75, 50, 90]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Days of the week data for UI display
  const weekDays = useMemo(() => {
    if (!productivityData) return [];
    
    return productivityData.days.map((day, index) => ({
      day,
      percent: productivityData.student[index]
    }));
  }, [productivityData]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 pb-10 px-4 md:px-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-0 mt-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back! Here's your activity summary</p>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div className="text-base font-medium text-gray-700">{formattedDate}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="col-span-2 space-y-8">
          {/* Top courses section */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg text-gray-800">Sports Courses For You</h2>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors">View all</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {topCourses.map(course => (
                <div key={course.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white">
                  <div className="relative">
                    <img 
                      src={course.image_url} 
                      alt={course.title} 
                      className="w-full h-40 object-cover"
                    />
                    <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-16"></div>
                    <div className="absolute bottom-3 left-3 bg-white/90 rounded-full px-2 py-0.5 text-xs font-medium">{course.level}</div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-3 line-clamp-1">{course.title}</h3>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img 
                          src={course.instructor_avatar} 
                          alt={course.instructor} 
                          className="w-7 h-7 rounded-full mr-2 border border-gray-100"
                        />
                        <span className="text-sm text-purple-600 font-medium">{course.instructor}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          {course.attendees}
                        </span>
                        
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {course.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* My courses section */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-lg text-gray-800">My Sports Training</h2>
              <button className="text-purple-600 text-sm font-medium hover:text-purple-800 transition-colors">View all</button>
            </div>
            
            <div className="space-y-4">
              {myCourses.map(course => (
                <div key={course.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200 border border-gray-100">
                  <div className="flex items-center">
                    <div className="relative w-12 h-12 flex-shrink-0 mr-4">
                      <img 
                        src={course.image_url} 
                        alt={course.title} 
                        className="w-full h-full rounded-lg object-cover shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-800">{course.title}</h3>
                      <div className="flex items-center mt-1">
                        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{width: `${(course.sessions_completed / course.total_sessions) * 100}%`}}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 ml-2">{course.sessions_completed}/{course.total_sessions}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      {course.participants.slice(0, 4).map((avatar, index) => (
                        <img 
                          key={index} 
                          src={avatar} 
                          alt="Participant" 
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                        />
                      ))}
                      {course.participants.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white shadow-sm">
                          +{course.participants.length - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right column */}
        <div className="col-span-1 space-y-8">
          {/* Calendar section */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-5">
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <div className="flex items-center text-base font-semibold text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">April 2024</span>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl mb-4">
              <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-3">
                <div className="text-purple-600">Mo</div>
                <div className="text-purple-600">Tu</div>
                <div className="text-purple-600">We</div>
                <div className="text-purple-600">Th</div>
                <div className="text-purple-600">Fr</div>
                <div className="text-blue-600">Sa</div>
                <div className="text-blue-600">Su</div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 text-center">
                {[23, 24, 25, 26, 27, 28, 29].map((date, index) => {
                  const isToday = currentWeekDates[index]?.isToday;
                  const hasEvent = date === 25 || date === 27;
                  const isWeekend = index > 4; // Saturday and Sunday
                  
                  return (
                    <div key={index} className="relative flex flex-col items-center justify-center py-1">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full 
                        ${isToday ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium shadow-md' : 
                          isWeekend ? 'hover:bg-blue-100 text-blue-800' : 'hover:bg-purple-100'} 
                        ${hasEvent && !isToday ? (isWeekend ? 'text-blue-700 font-medium' : 'text-purple-700 font-medium') : ''} 
                        cursor-pointer transition-all duration-200`}>
                        {date}
                      </div>
                      {hasEvent && (
                        <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${isWeekend ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Upcoming events */}
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-800">Upcoming Events</h3>
                <button className="text-xs text-purple-600 font-medium hover:text-purple-800 transition-colors flex items-center">
                  View all
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              {upcomingEvents.map(event => (
                <div key={event.id} className="group border-l-[3px] border-l-purple-500 pl-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-white rounded-r-lg transition-all duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-800 mb-1 group-hover:text-purple-700 transition-colors">{event.title}</div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className="bg-purple-50 px-2 py-0.5 rounded-full text-purple-700 font-medium">{event.event_date}</span>
                        <span className="bg-blue-50 px-2 py-0.5 rounded-full text-blue-700 font-medium">{event.event_time}</span>
                      </div>
                    </div>
                    <div className={`flex items-center justify-center rounded-full py-1 px-3 text-xs font-medium ${event.type === 'Course' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} shadow-sm`}>
                      {event.type === 'Course' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      )}
                      {event.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Overall Information section */}
          {userStats && (
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <h2 className="font-semibold text-lg text-gray-800 mb-6">Overall Information</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500">Score</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xl font-bold mr-2 text-gray-800">{userStats.score.value}</div>
                    <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-600">
                      {userStats.score.change}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500">Completed Course</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xl font-bold mr-2 text-gray-800">{userStats.completedHours.value}h</div>
                    <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-600">
                      {userStats.completedHours.change}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500">Total Students</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xl font-bold mr-2 text-gray-800">{userStats.totalStudents.value}</div>
                    <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                      {userStats.totalStudents.change}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500">Total Hours</div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xl font-bold mr-2 text-gray-800">{userStats.totalHours.value}</div>
                    <div className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600">
                      {userStats.totalHours.change}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Productivity section - Donut Chart */}
          {productivityData && (
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">Activity Overview</h2>
                    <p className="text-xs text-gray-500">Weekly distribution</p>
                  </div>
                </div>
                <select className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Last Month</option>
                </select>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                {/* Donut Chart with enhanced shading and effects */}
                <div className="relative w-52 h-52 mx-auto">
                  {/* Outer glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gray-100 blur-md opacity-50"></div>
                  
                  {/* Main donut chart with improved gradient transitions */}
                  <div 
                    className="relative w-full h-full rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] overflow-hidden"
                    style={{
                      background: `
                        conic-gradient(
                          from 0deg, 
                          #FCD34D 0deg 72deg, 
                          #F59E0B 72deg 136.8deg, 
                          #EC4899 136.8deg 216deg, 
                          #8B5CF6 216deg 270deg, 
                          #3B82F6 270deg 360deg
                        )
                      `,
                      boxShadow: 'inset 0px 0px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Light highlight overlay for 3D effect */}
                    <div 
                      className="absolute inset-0 rounded-full" 
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)'
                      }}
                    ></div>
                    
                    {/* Inner white circle to create donut effect */}
                    <div 
                      className="absolute top-1/2 left-1/2 w-[60%] h-[60%] rounded-full -translate-x-1/2 -translate-y-1/2" 
                      style={{
                        background: 'white',
                        boxShadow: 'inset 0px 0px 8px rgba(0,0,0,0.1), 0px 0px 10px rgba(255,255,255,0.8)'
                      }}
                    ></div>
                  </div>
                  
                  {/* Center text with enhanced styling */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold" style={{ 
                      color: '#1F2937',
                      textShadow: '0px 1px 2px rgba(255,255,255,0.8)'
                    }}>72</div>
                    <div className="text-xs text-gray-500">Total Value</div>
                  </div>
                </div>
                
                {/* Enhanced Legend with hover effects */}
                <div className="mt-6 w-full grid grid-cols-3 gap-x-2 gap-y-4">
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-[#FCD34D] mr-2 shadow-sm group-hover:scale-110 transition-transform"></div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Sports</span>
                  </div>
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B] mr-2 shadow-sm group-hover:scale-110 transition-transform"></div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Training</span>
                  </div>
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-[#EC4899] mr-2 shadow-sm group-hover:scale-110 transition-transform"></div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Recovery</span>
                  </div>
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-2 shadow-sm group-hover:scale-110 transition-transform"></div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Coaching</span>
                  </div>
                  <div className="flex items-center group cursor-pointer">
                    <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-2 shadow-sm group-hover:scale-110 transition-transform"></div>
                    <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Tactics</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
                <button className="text-purple-600 text-xs font-medium flex items-center hover:text-purple-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Activity
                </button>
                
                <button className="text-gray-600 text-xs font-medium flex items-center hover:text-gray-800 transition-colors">
                  View Details
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 