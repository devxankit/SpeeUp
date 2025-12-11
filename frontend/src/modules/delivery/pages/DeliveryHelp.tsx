import { useNavigate } from 'react-router-dom';
import DeliveryHeader from '../components/DeliveryHeader';
import DeliveryBottomNav from '../components/DeliveryBottomNav';

export default function DeliveryHelp() {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: 'How do I accept a new order?',
      answer: 'When you receive a new order notification, tap on it to view order details. Click "Accept Order" to confirm.',
    },
    {
      question: 'What should I do if I cannot deliver an order?',
      answer: 'Contact the customer first. If unable to reach them, mark the order as "Unable to Deliver" and contact support.',
    },
    {
      question: 'How are my earnings calculated?',
      answer: 'You earn ₹25 per successful delivery. Additional bonuses may apply for special orders or peak hours.',
    },
    {
      question: 'How do I update my profile information?',
      answer: 'Go to Menu > Profile and tap "Edit Profile" to update your personal details, vehicle information, etc.',
    },
    {
      question: 'What if I have a complaint or issue?',
      answer: 'You can contact our support team through the Help & Support section or call our helpline at +91-1800-XXX-XXXX.',
    },
  ];

  const contactOptions = [
    { label: 'Call Support', value: '+91-1800-XXX-XXXX', icon: 'phone' },
    { label: 'Email Support', value: 'support@speeup.com', icon: 'email' },
    { label: 'Live Chat', value: 'Available 24/7', icon: 'chat' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 pb-20">
      <DeliveryHeader />
      <div className="px-4 py-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="text-neutral-900 text-xl font-semibold">Help & Support</h2>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden mb-4">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-neutral-900 font-semibold">Contact Us</h3>
          </div>
          <div className="divide-y divide-neutral-200">
            {contactOptions.map((option, index) => (
              <div key={index} className="p-4">
                <p className="text-neutral-900 text-sm font-medium mb-1">{option.label}</p>
                <p className="text-neutral-500 text-xs">{option.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h3 className="text-neutral-900 font-semibold">Frequently Asked Questions</h3>
          </div>
          <div className="divide-y divide-neutral-200">
            {faqItems.map((item, index) => (
              <div key={index} className="p-4">
                <p className="text-neutral-900 text-sm font-medium mb-2">{item.question}</p>
                <p className="text-neutral-500 text-xs leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Button */}
        <button className="w-full mt-4 bg-orange-500 text-white rounded-xl py-3 font-semibold hover:bg-orange-600 transition-colors">
          Contact Support
        </button>
      </div>
      <DeliveryBottomNav />
    </div>
  );
}

