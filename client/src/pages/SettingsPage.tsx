import { useState } from 'react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    fullName: 'Alex Johnson',
    username: 'alexj',
    email: 'alex.johnson@example.com',
    bio: 'Sports enthusiast with a passion for tennis and basketball.',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    messageAlerts: true,
    weeklyDigest: false,
    marketingEmails: false
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showLastSeen: true,
    shareActivity: true,
    allowTagging: true
  });
  
  // Payment methods
  const paymentMethods = [
    {
      id: 1,
      type: 'visa',
      lastFour: '4242',
      expiry: '09/25',
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      lastFour: '5678',
      expiry: '12/24',
      isDefault: false
    }
  ];
  
  // Transaction history
  const transactions = [
    {
      id: 1,
      date: '2023-04-15',
      description: 'Tennis Coaching Session',
      amount: 45.00,
      status: 'completed'
    },
    {
      id: 2,
      date: '2023-04-10',
      description: 'Basketball Court Booking',
      amount: 30.00,
      status: 'completed'
    },
    {
      id: 3,
      date: '2023-04-05',
      description: 'Premium Membership Fee',
      amount: 19.99,
      status: 'completed'
    },
    {
      id: 4,
      date: '2023-03-28',
      description: 'Equipment Purchase',
      amount: 87.50,
      status: 'completed'
    }
  ];
  
  // Form handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handleToggleChange = (setting: string, section: string) => {
    if (section === 'notifications') {
      setNotificationSettings({
        ...notificationSettings,
        [setting]: !notificationSettings[setting as keyof typeof notificationSettings]
      });
    } else if (section === 'privacy') {
      setPrivacySettings({
        ...privacySettings,
        [setting]: !privacySettings[setting as keyof typeof privacySettings]
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic would go here
    console.log('Form submitted:', { profileForm, notificationSettings, privacySettings });
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account settings and preferences</p>
      </div>
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Settings
            </button>
            <button 
              className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button 
              className={`settings-tab ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              Privacy
            </button>
            <button 
              className={`settings-tab ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Payment Methods
            </button>
            <button 
              className={`settings-tab ${activeTab === 'billing' ? 'active' : ''}`}
              onClick={() => setActiveTab('billing')}
            >
              Billing History
            </button>
            <button 
              className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              Account
            </button>
          </div>
        </div>
        
        <div className="settings-main">
          {activeTab === 'profile' && (
            <div className="settings-panel">
              <h2 className="panel-title">Profile Settings</h2>
              <p className="panel-description">Update your personal information and profile details</p>
              
              <form className="settings-form" onSubmit={handleSubmit}>
                <div className="settings-form-group">
                  <div className="profile-picture-section">
                    <div className="profile-picture">
                      <img src="https://i.pravatar.cc/150?u=alex" alt="Profile" />
                    </div>
                    <div className="profile-picture-actions">
                      <button type="button" className="btn-outline">Change Photo</button>
                      <button type="button" className="btn-text">Remove</button>
                    </div>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="settings-form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                      type="text" 
                      id="fullName" 
                      name="fullName" 
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="settings-form-group">
                    <label htmlFor="username">Username</label>
                    <input 
                      type="text" 
                      id="username" 
                      name="username" 
                      value={profileForm.username}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="settings-form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={profileForm.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  
                  <div className="settings-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
                
                <div className="settings-form-group">
                  <label htmlFor="location">Location</label>
                  <input 
                    type="text" 
                    id="location" 
                    name="location" 
                    value={profileForm.location}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="settings-form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea 
                    id="bio" 
                    name="bio" 
                    rows={4}
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                  ></textarea>
                  <div className="form-hint">Brief description for your profile</div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-outline">Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2 className="panel-title">Notification Settings</h2>
              <p className="panel-description">Manage how you receive notifications and alerts</p>
              
              <div className="settings-options">
                <div className="settings-option-group">
                  <h3 className="option-group-title">Email Notifications</h3>
                  
                  <div className="settings-option">
                    <div className="option-info">
                      <div className="option-name">Email Notifications</div>
                      <div className="option-description">Receive email notifications for important updates</div>
                    </div>
                    <div className="option-control">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailNotifications}
                          onChange={() => handleToggleChange('emailNotifications', 'notifications')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="option-info">
                      <div className="option-name">Weekly Digest</div>
                      <div className="option-description">Receive a weekly summary of your activity</div>
                    </div>
                    <div className="option-control">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.weeklyDigest}
                          onChange={() => handleToggleChange('weeklyDigest', 'notifications')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="option-info">
                      <div className="option-name">Marketing Emails</div>
                      <div className="option-description">Receive promotional offers and updates</div>
                    </div>
                    <div className="option-control">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.marketingEmails}
                          onChange={() => handleToggleChange('marketingEmails', 'notifications')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-option-group">
                  <h3 className="option-group-title">Push Notifications</h3>
                  
                  <div className="settings-option">
                    <div className="option-info">
                      <div className="option-name">Push Notifications</div>
                      <div className="option-description">Receive notifications on your device</div>
                    </div>
                    <div className="option-control">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.pushNotifications}
                          onChange={() => handleToggleChange('pushNotifications', 'notifications')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="option-info">
                      <div className="option-name">Event Reminders</div>
                      <div className="option-description">Get reminded about upcoming events</div>
                    </div>
                    <div className="option-control">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.eventReminders}
                          onChange={() => handleToggleChange('eventReminders', 'notifications')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="settings-option">
                    <div className="option-info">
                      <div className="option-name">Message Alerts</div>
                      <div className="option-description">Get notified about new messages</div>
                    </div>
                    <div className="option-control">
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.messageAlerts}
                          onChange={() => handleToggleChange('messageAlerts', 'notifications')}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-outline">Reset to Default</button>
                  <button type="button" className="btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="settings-panel">
              <h2 className="panel-title">Privacy Settings</h2>
              <p className="panel-description">Control your privacy and visibility preferences</p>
              
              <div className="settings-options">
                <div className="settings-option">
                  <div className="option-info">
                    <div className="option-name">Public Profile</div>
                    <div className="option-description">Allow others to view your profile information</div>
                  </div>
                  <div className="option-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.publicProfile}
                        onChange={() => handleToggleChange('publicProfile', 'privacy')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="settings-option">
                  <div className="option-info">
                    <div className="option-name">Show Last Seen</div>
                    <div className="option-description">Allow others to see when you were last active</div>
                  </div>
                  <div className="option-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.showLastSeen}
                        onChange={() => handleToggleChange('showLastSeen', 'privacy')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="settings-option">
                  <div className="option-info">
                    <div className="option-name">Share Activity</div>
                    <div className="option-description">Share your sports activities with your connections</div>
                  </div>
                  <div className="option-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.shareActivity}
                        onChange={() => handleToggleChange('shareActivity', 'privacy')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="settings-option">
                  <div className="option-info">
                    <div className="option-name">Allow Tagging</div>
                    <div className="option-description">Allow others to tag you in photos and posts</div>
                  </div>
                  <div className="option-control">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={privacySettings.allowTagging}
                        onChange={() => handleToggleChange('allowTagging', 'privacy')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn-outline">Reset to Default</button>
                  <button type="button" className="btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'payment' && (
            <div className="settings-panel">
              <h2 className="panel-title">Payment Methods</h2>
              <p className="panel-description">Manage your payment methods and preferences</p>
              
              <div className="payment-methods">
                {paymentMethods.map(method => (
                  <div key={method.id} className={`payment-method ${method.isDefault ? 'default' : ''}`}>
                    <div className={`payment-card ${method.type}`}>
                      <div className="card-icon">{method.type === 'visa' ? 'Visa' : 'MasterCard'}</div>
                      <div className="card-details">
                        <div className="card-number">•••• •••• •••• {method.lastFour}</div>
                        <div className="card-expiry">Expires {method.expiry}</div>
                      </div>
                      {method.isDefault && <div className="default-badge">Default</div>}
                    </div>
                    <div className="payment-method-actions">
                      {!method.isDefault && (
                        <button className="btn-outline">Make Default</button>
                      )}
                      <button className="btn-outline">Edit</button>
                      <button className="btn-text">Remove</button>
                    </div>
                  </div>
                ))}
                
                <div className="add-payment-method">
                  <button className="btn-outline">+ Add New Payment Method</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'billing' && (
            <div className="settings-panel">
              <h2 className="panel-title">Billing History</h2>
              <p className="panel-description">View your transaction history and download invoices</p>
              
              <div className="transaction-history">
                <div className="transaction-header">
                  <div className="transaction-date">Date</div>
                  <div className="transaction-description">Description</div>
                  <div className="transaction-amount">Amount</div>
                  <div className="transaction-status">Status</div>
                  <div className="transaction-actions">Action</div>
                </div>
                
                {transactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-date">{formatDate(transaction.date)}</div>
                    <div className="transaction-description">{transaction.description}</div>
                    <div className="transaction-amount">${transaction.amount.toFixed(2)}</div>
                    <div className="transaction-status">
                      <span className={`status-badge ${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="transaction-actions">
                      <button className="btn-text">Receipt</button>
                    </div>
                  </div>
                ))}
                
                <div className="transaction-pagination">
                  <button className="pagination-btn" disabled>Previous</button>
                  <span className="pagination-info">Page 1 of 1</span>
                  <button className="pagination-btn" disabled>Next</button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'account' && (
            <div className="settings-panel">
              <h2 className="panel-title">Account Settings</h2>
              <p className="panel-description">Manage your account and security preferences</p>
              
              <div className="settings-form">
                <div className="settings-form-group">
                  <button className="btn-outline">Change Password</button>
                </div>
                
                <div className="settings-form-group">
                  <button className="btn-outline">Two-Factor Authentication</button>
                </div>
                
                <div className="settings-form-group">
                  <button className="btn-outline">Connected Accounts</button>
                </div>
                
                <div className="danger-zone">
                  <h3 className="danger-zone-title">Danger Zone</h3>
                  <p className="danger-zone-description">These actions are permanent and cannot be undone</p>
                  
                  <div className="danger-actions">
                    <button className="btn-danger">Deactivate Account</button>
                    <button className="btn-danger">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 