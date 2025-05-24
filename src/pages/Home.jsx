import React from 'react';
import { FaArrowRight, FaUsers, FaReceipt, FaWallet, FaShieldAlt, FaLayerGroup, FaPlusCircle, FaGlobe, FaChartPie } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Logo/Image - Shows first on mobile, second on desktop */}
            <div className="relative order-1 md:order-2 mb-8 md:mb-0">
              <div
                className="absolute inset-0 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: 'var(--primary)', transform: 'translate(-5%, -5%)' }}
              ></div>
              <img
                src="/hero-image.png"
                alt="KittyPay App Screenshot"
                className="relative z-10 w-full max-w-sm mx-auto md:max-w-none rounded-lg shadow-xl"
                style={{ maxHeight: '600px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = "/logo.svg";
                  e.target.className = "relative z-10 w-3/4 mx-auto";
                }}
              />
            </div>

            {/* Hero Text - Shows second on mobile, first on desktop */}
            <div className="space-y-8 order-2 md:order-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                The Modern <span style={{ color: 'var(--primary)' }}>Desi</span> Way to Split Expenses
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                KittyPay makes it simple to track, split, and settle expenses with friends and family in India.
                No more awkward money talks or complex calculations.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Link to="/signup">
                  <button
                    className="flex items-center px-6 py-3 rounded-lg shadow-lg text-white transition-transform transform hover:scale-105"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Get Started <FaArrowRight className="ml-2" size={18} />
                  </button>
                </Link>
                <button
                  onClick={() => {
                    document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 rounded-lg transition-colors"
                  style={{
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  How It Works
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-[10px] md:translate-y-[100px] lg:translate-y-[90px]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" style={{ display: 'block' }}>
            <path
              fill="var(--surface)"
              fillOpacity="1"
              d="M0,128L48,138.7C96,149,192,171,288,165.3C384,160,480,128,576,128C672,128,768,160,864,186.7C960,213,1056,235,1152,224C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl font-bold mb-3 md:mb-4" style={{ color: 'var(--text-primary)' }}>
              Why Choose KittyPay
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Our platform is designed specifically for Indian users with features that make expense management hassle-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[
              {
                icon: <FaUsers size={24} />,
                title: "Group Expenses Made Easy",
                description: "Create kitties for trips, roommates, events, or any shared expense. Invite friends via WhatsApp or email."
              },
              {
                icon: <FaReceipt size={24} />,
                title: "Smart Splitting",
                description: "Split bills equally, by percentage, or by specific amounts. Keep track of who paid what and who owes whom."
              },
              {
                icon: <FaGlobe size={24} />,
                title: "Multi-Currency Support",
                description: "Create kitties in different currencies. Each kitty uses a single currency to keep things simple."
              },
              {
                icon: <FaShieldAlt size={24} />,
                title: "Secure & Private",
                description: "Your financial information is never stored. We use bank-level encryption to keep your data safe."
              },
              {
                icon: <FaChartPie size={24} />,
                title: "Expense Analytics",
                description: "See spending patterns and track contributions with easy-to-understand visualizations."
              },
              {
                icon: <FaPlusCircle size={24} />,
                title: "Simplified Settlements",
                description: "Our smart algorithm shows exactly who owes what to whom with minimum transactions."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="p-4 md:p-6 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  border: '1px solid rgba(104, 109, 224, 0.3)',
                  boxShadow: '0 0 20px rgba(104, 109, 224, 0.2)',
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(104, 109, 224, 0.35)';
                    e.currentTarget.style.borderColor = 'rgba(104, 109, 224, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.innerWidth >= 768) {
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(104, 109, 224, 0.2)';
                    e.currentTarget.style.borderColor = 'rgba(104, 109, 224, 0.3)';
                  }
                }}
              >
                {/* Content container - horizontal layout on mobile, vertical on desktop */}
                <div className="flex flex-row md:flex-col items-center md:text-center">
                  {/* Icon container - smaller on mobile */}
                  <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 flex items-center justify-center rounded-full mb-0 md:mb-4 mr-4 md:mr-0"
                    style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {feature.icon}
                  </div>

                  {/* Text content */}
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-3" style={{ color: 'var(--text-primary)' }}>
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base md:max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24" style={{ backgroundColor: 'var(--surface-alt)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How KittyPay Works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Split expenses with friends and family in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line between steps - moved down to avoid overlapping with numbers */}
            <div className="hidden md:block absolute top-36 left-0 right-0 h-1" style={{ backgroundColor: 'var(--primary)' }}></div>

            {[
              {
                number: "1",
                title: "Create a Kitty",
                description: "Start a kitty for your group, trip, or roommates. Invite friends using WhatsApp, email, or phone number."
              },
              {
                number: "2",
                title: "Add Expenses",
                description: "Record expenses as they happen. Enter details and amounts. Split equally or customize per person."
              },
              {
                number: "3",
                title: "Track & Settle",
                description: "See who owes what at a glance. Settle debts offline using your preferred payment methods."
              }
            ].map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative z-10">
                {/* Step number with enhanced shadow */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-5 relative z-10"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(104, 109, 224, 0.4)'
                  }}
                >
                  {step.number}
                </div>
                {/* Background for the step content */}
                <div className="bg-opacity-70 rounded-lg p-4 w-full">
                  <h3 className="text-xl font-semibold mb-10" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <p className="max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/signup">
              <button
                className="px-8 py-3 rounded-lg shadow-lg text-white transition-transform transform hover:scale-105"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Start Your First Kitty
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 relative overflow-hidden" style={{ backgroundColor: 'var(--primary)' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="3" fill="white" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Simplify Group Expenses?
          </h2>
          <p className="text-xl mb-8 text-white opacity-90 max-w-2xl mx-auto">
            Join thousands of Indian users who manage shared expenses effortlessly with KittyPay.
          </p>
          <Link to="/signup">
            <button
              className="px-8 py-3 rounded-lg bg-white shadow-lg transition-transform transform hover:scale-105"
              style={{ color: 'var(--primary)' }}
            >
              Get Started — It's Free
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;