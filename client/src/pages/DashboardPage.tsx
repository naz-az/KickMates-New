import { useState } from 'react';
import Calendar from '../components/Calendar';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data for dashboard
  const stats = [
    { id: 1, title: 'Sessions Attended', value: 24, change: '+12%' },
    { id: 2, title: 'Hours Practiced', value: 48, change: '+8%' },
    { id: 3, title: 'Sports Played', value: 5, change: '+1' },
    { id: 4, title: 'Achievements', value: 7, change: '+2' }
  ];
  
  const progressItems = [
    { 
      id: 1, 
      title: 'Tennis Master Class', 
      progress: 75, 
      instructor: 'David Wilson',
      instructorAvatar: 'https://i.pravatar.cc/150?u=david'
    },
    { 
      id: 2, 
      title: 'Basketball Skills', 
      progress: 45, 
      instructor: 'Sarah Johnson',
      instructorAvatar: 'https://i.pravatar.cc/150?u=sarah'
    },
    { 
      id: 3, 
      title: 'Football Strategies', 
      progress: 90, 
      instructor: 'Michael Brown',
      instructorAvatar: 'https://i.pravatar.cc/150?u=michael'
    }
  ];
  
  const upcomingSessions = [
    {
      id: 1,
      title: 'Tennis Practice',
      date: 'Today, 4:00 PM',
      location: 'City Sports Center',
      participants: 6
    },
    {
      id: 2,
      title: 'Basketball Game',
      date: 'Tomorrow, 6:30 PM',
      location: 'Downtown Courts',
      participants: 12
    },
    {
      id: 3,
      title: 'Yoga Session',
      date: 'Friday, 8:00 AM',
      location: 'Harmony Studio',
      participants: 8
    }
  ];
  
  // Format current date
  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options as any);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Dashboard</h1>
        <div className="flex space-x-3">
          <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/5 transition-colors">Export Data</button>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">+ New Event</button>
        </div>
      </div>
      
      <div className="flex items-center text-text-light space-x-2 text-sm">
        <span>Today is</span>
        <span className="font-medium text-text-dark">{formatDate()}</span>
      </div>
      
      <div className="bg-gradient-to-r from-primary to-primary-light rounded-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Welcome back, Alex!</h2>
        <p className="mb-4 opacity-90">You have 3 sessions scheduled for this week and 5 unread messages. Your fitness score improved by 12% since last month.</p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-white/20 rounded-md hover:bg-white/30 transition-colors">View Schedule</button>
          <button className="px-4 py-2 bg-white/20 rounded-md hover:bg-white/30 transition-colors">Check Messages</button>
          <button className="px-4 py-2 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition-colors">Complete Profile</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-text-light text-sm mb-1">{stat.title}</div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-success text-sm font-medium">{stat.change}</div>
          </div>
        ))}
      </div>
      
      <div className="border-b border-gray-200">
        <div className="flex space-x-1">
          <button 
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'progress' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}
            onClick={() => setActiveTab('progress')}
          >
            Progress
          </button>
          <button 
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'statistics' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
          <button 
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'achievements' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-dark'}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Progress Tracker</h3>
                <button className="text-sm text-primary font-medium">View All</button>
              </div>
              
              <div className="space-y-4">
                {progressItems.map(item => (
                  <div key={item.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex justify-between mb-3">
                      <h4 className="font-medium">{item.title}</h4>
                      <div className="flex items-center space-x-2">
                        <img 
                          src={item.instructorAvatar} 
                          alt={item.instructor} 
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm text-text-light">{item.instructor}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{item.progress}%</span>
                        <span className="text-xs text-text-light">Completed</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Your Activity</h3>
                <div className="flex text-sm bg-gray-100 rounded-md overflow-hidden">
                  <button className="px-3 py-1 bg-primary text-white">Week</button>
                  <button className="px-3 py-1 hover:bg-gray-200 transition-colors">Month</button>
                  <button className="px-3 py-1 hover:bg-gray-200 transition-colors">Year</button>
                </div>
              </div>
              
              <div className="mt-6 flex h-48 items-end justify-between">
                {/* Chart visualization would go here */}
                <div className="w-full flex justify-between items-end h-40 px-2">
                  <div className="w-[10%] bg-primary rounded-t-md" style={{ height: '60%' }}></div>
                  <div className="w-[10%] bg-primary rounded-t-md" style={{ height: '80%' }}></div>
                  <div className="w-[10%] bg-primary rounded-t-md" style={{ height: '40%' }}></div>
                  <div className="w-[10%] bg-primary rounded-t-md" style={{ height: '70%' }}></div>
                  <div className="w-[10%] bg-primary rounded-t-md" style={{ height: '90%' }}></div>
                  <div className="w-[10%] bg-primary rounded-t-md" style={{ height: '50%' }}></div>
                  <div className="w-[10%] bg-primary rounded-t-md" style={{ height: '75%' }}></div>
                </div>
              </div>
              <div className="flex justify-between px-2 pt-2 text-xs text-text-light">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Upcoming Sessions</h3>
                <button className="text-sm text-primary font-medium">See All</button>
              </div>
              
              <div className="space-y-4">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="text-sm text-primary font-medium mb-1">{session.date}</div>
                    <h4 className="font-medium mb-2">{session.title}</h4>
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-sm text-text-light">
                        <span className="mr-1">📍</span>
                        {session.location}
                      </div>
                      <div className="flex items-center text-sm text-text-light">
                        <span className="mr-1">👥</span>
                        {session.participants} participants
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <button className="flex-1 py-1.5 border border-gray-200 rounded text-sm font-medium hover:bg-gray-50 transition-colors">Details</button>
                      <button className="flex-1 py-1.5 bg-primary text-white rounded text-sm font-medium hover:bg-primary-dark transition-colors">Join</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-lg">Recommended For You</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-xl">🎾</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Advanced Tennis Group</h4>
                    <p className="text-xs text-text-light">Join players with similar skills for weekly practice</p>
                  </div>
                  <button className="flex-shrink-0 px-3 py-1 border border-gray-200 rounded text-xs font-medium hover:bg-gray-50 transition-colors">Join</button>
                </div>
                
                <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-xl">📊</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Training Analysis</h4>
                    <p className="text-xs text-text-light">Get insights about your performance and progress</p>
                  </div>
                  <button className="flex-shrink-0 px-3 py-1 border border-gray-200 rounded text-xs font-medium hover:bg-gray-50 transition-colors">View</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'progress' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Your Course Progress</h3>
          <p className="text-text-light">Coming soon...</p>
        </div>
      )}
      
      {activeTab === 'statistics' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Your Performance Statistics</h3>
          <p className="text-text-light">Coming soon...</p>
        </div>
      )}
      
      {activeTab === 'achievements' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Your Achievements</h3>
          <p className="text-text-light">Coming soon...</p>
        </div>
      )}
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Your Schedule</h3>
        </div>
        <Calendar />
      </div>
    </div>
  );
};

export default DashboardPage; 