import { useState } from 'react';

type SettingSection = 
  | 'mail'
  | 'google-api'
  | 'firebase'
  | 'notification'
  | 'login'
  | 'social-links'
  | '3rd-party-api'
  | 'language'
  | 'app-header'
  | 'other';

export default function AdminAppSetting() {
  const [activeSection, setActiveSection] = useState<SettingSection>('mail');
  const [mailSettings, setMailSettings] = useState({
    mailerName: '',
    host: '',
    emailId: '',
    password: '',
    port: '465',
    encryption: 'SSL',
  });
  const [testEmail, setTestEmail] = useState('');

  const settingSections = [
    { id: 'mail' as SettingSection, label: 'Mail Setting' },
    { id: 'google-api' as SettingSection, label: 'Google API / Recaptcha' },
    { id: 'firebase' as SettingSection, label: 'Firebase Setting' },
    { id: 'notification' as SettingSection, label: 'Notification' },
    { id: 'login' as SettingSection, label: 'Login Setting' },
    { id: 'social-links' as SettingSection, label: 'Social Links' },
    { id: '3rd-party-api' as SettingSection, label: '3rd Party API' },
    { id: 'language' as SettingSection, label: 'Language Setting' },
    { id: 'app-header' as SettingSection, label: 'App Main Header Setting' },
    { id: 'other' as SettingSection, label: 'Other Setting' },
  ];

  const handleMailSettingChange = (field: string, value: string) => {
    setMailSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateMail = () => {
    console.log('Updating mail settings:', mailSettings);
    alert('Mail settings updated successfully!');
  };

  const handleTestMail = () => {
    if (!testEmail) {
      alert('Please enter an email address to test');
      return;
    }
    console.log('Testing SMTP connection with:', testEmail);
    alert(`Test email sent to ${testEmail}`);
  };

  const renderMailSetting = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-neutral-800">Mail Setting</h2>
      
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            Mailer Name
          </label>
          <input
            type="text"
            value={mailSettings.mailerName}
            onChange={(e) => handleMailSettingChange('mailerName', e.target.value)}
            placeholder="----------"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            Host
          </label>
          <input
            type="text"
            value={mailSettings.host}
            onChange={(e) => handleMailSettingChange('host', e.target.value)}
            placeholder="----------"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            Email Id/ Username
          </label>
          <input
            type="text"
            value={mailSettings.emailId}
            onChange={(e) => handleMailSettingChange('emailId', e.target.value)}
            placeholder="----------"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            Password
          </label>
          <input
            type="password"
            value={mailSettings.password}
            onChange={(e) => handleMailSettingChange('password', e.target.value)}
            placeholder="----------"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            Port
          </label>
          <select
            value={mailSettings.port}
            onChange={(e) => handleMailSettingChange('port', e.target.value)}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="465">465</option>
            <option value="587">587</option>
            <option value="25">25</option>
            <option value="2525">2525</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            Encryption
          </label>
          <select
            value={mailSettings.encryption}
            onChange={(e) => handleMailSettingChange('encryption', e.target.value)}
            className="w-full px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="SSL">SSL</option>
            <option value="TLS">TLS</option>
            <option value="None">None</option>
          </select>
        </div>
      </div>

      {/* Update Button */}
      <div>
        <button
          onClick={handleUpdateMail}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded font-medium transition-colors"
        >
          Update
        </button>
      </div>

      {/* Test SMTP Section */}
      <div className="pt-6 border-t border-neutral-200">
        <label className="block text-sm font-bold text-neutral-800 mb-2">
          Enter mail id for testing smtp connection
        </label>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter mail id for testing smtp connection"
            className="flex-1 px-4 py-2.5 border border-neutral-300 rounded text-sm bg-white text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <button
            onClick={handleTestMail}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded font-medium transition-colors"
          >
            Test Mail
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'mail':
        return renderMailSetting();
      case 'google-api':
        return <div className="text-neutral-600">Google API / Recaptcha settings coming soon...</div>;
      case 'firebase':
        return <div className="text-neutral-600">Firebase settings coming soon...</div>;
      case 'notification':
        return <div className="text-neutral-600">Notification settings coming soon...</div>;
      case 'login':
        return <div className="text-neutral-600">Login settings coming soon...</div>;
      case 'social-links':
        return <div className="text-neutral-600">Social Links settings coming soon...</div>;
      case '3rd-party-api':
        return <div className="text-neutral-600">3rd Party API settings coming soon...</div>;
      case 'language':
        return <div className="text-neutral-600">Language settings coming soon...</div>;
      case 'app-header':
        return <div className="text-neutral-600">App Main Header settings coming soon...</div>;
      case 'other':
        return <div className="text-neutral-600">Other settings coming soon...</div>;
      default:
        return renderMailSetting();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-white px-4 sm:px-6 py-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">App Setting</h1>
          </div>
          <div className="text-sm text-neutral-600">
            <span className="text-blue-600">Home</span> / <span className="text-neutral-900">App Setting</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-neutral-50 border-r border-neutral-200 p-4 overflow-y-auto">
          <div className="space-y-2">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-neutral-700 border border-teal-600 hover:bg-teal-50'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

