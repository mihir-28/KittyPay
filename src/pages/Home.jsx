import React from 'react';
import { FaArrowRight, FaUsers, FaReceipt, FaWallet, FaShieldAlt, FaLayerGroup, FaPlusCircle, FaGlobe, FaChartPie, FaCheckCircle, FaDownload, FaApple, FaAndroid, FaQuestionCircle, FaAngleDown } from 'react-icons/fa';
import { FaTimes as FaX } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add modal animation keyframes
const modalAnimation = `
  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const Home = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const modalRef = useRef(null);
  const howItWorksRef = useRef(null);
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    if (openFaqIndex === index) {
      setOpenFaqIndex(null);
    } else {
      setOpenFaqIndex(index);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEmailModal(false);
      }
    };

    if (showEmailModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmailModal]);

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowEmailModal(false);
      }
    };

    if (showEmailModal) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showEmailModal]);

  const handleNotifyClick = () => {
    setShowEmailModal(true);
  };

  const handleSubmitEmail = (e) => {
    e.preventDefault();

    if (notifyEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
      // Here you would normally save the email to your database
      toast.success("🎉 Thanks for signing up! We'll notify you when our app launches.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--primary-light)',
        },
      });

      setNotifyEmail('');
      setShowEmailModal(false);
    } else {
      toast.error("⚠️ Please enter a valid email address", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        style: {
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 100, 100, 0.5)',
        },
      });
    }
  };

  const scrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      // Get the current window width to detect desktop
      const isDesktop = window.innerWidth >= 768;
      
      if (isDesktop) {
        // For desktop: use a more direct approach with specific pixel calculations
        const yOffset = -20; // Slight offset from the top
        const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        });
      } else {
        // For mobile: use the standard approach that's already working
        window.scrollTo({
          top: section.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    }
  };

  const goToSignup = () => {
    navigate('/signup');
  };

  return (
    <div>
      {/* Add the animation styles */}
      <style dangerouslySetInnerHTML={{ __html: modalAnimation }} />
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
                <button
                  onClick={goToSignup}
                  className="flex items-center px-6 py-3 rounded-lg shadow-lg text-white transition-transform transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Get Started <FaArrowRight className="ml-2" size={18} />
                </button>
                <button
                  onClick={scrollToHowItWorks}
                  className="px-6 py-3 rounded-lg transition-colors cursor-pointer"
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

      {/* Statistics Section */}
      <section className="py-16" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "100+", label: "Beta Users" },
              { number: "₹50K+", label: "Expenses Tracked" },
              { number: "4.9", label: "Beta Rating" },
              { number: "250+", label: "Kitties Created" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--primary)' }}>
                  {stat.number}
                </h3>
                <p className="text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
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
      <section id="how-it-works" ref={howItWorksRef} className="py-16 md:py-24" style={{ backgroundColor: 'var(--surface-alt)' }}>
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
            <button
              onClick={goToSignup}
              className="px-8 py-3 rounded-lg shadow-lg text-white transition-transform transform hover:scale-105 cursor-pointer"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Start Your First Kitty
            </button>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Perfect For Any Situation
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              KittyPay adapts to all your expense-sharing needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Trips & Vacations",
                description: "Track expenses during holidays with friends and family, from flights to dining."
              },
              {
                title: "Flatmates & Roommates",
                description: "Manage recurring expenses like rent, utilities, groceries, and household supplies."
              },
              {
                title: "Events & Celebrations",
                description: "Split costs for birthdays, weddings, group gifts, parties, and other celebrations."
              },
              {
                title: "Dining Out & Entertainment",
                description: "Easily split restaurant bills, movie tickets, or any group activity expenses."
              }
            ].map((useCase, index) => (
              <div
                key={index}
                className="p-6 rounded-xl flex items-start"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="mr-4 mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                >
                  <FaCheckCircle size={16} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {useCase.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {useCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--surface-alt)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Got questions? We've got answers
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Is KittyPay free to use?",
                answer: "Yes, KittyPay is completely free to use for all basic features. We don't charge any transaction fees or monthly subscriptions."
              },
              {
                question: "How does KittyPay handle payments?",
                answer: "KittyPay doesn't process payments directly. We show you who owes what to whom, and you can settle up using your preferred payment methods outside the app."
              },
              {
                question: "Do I need to create an account?",
                answer: "Yes, you'll need to create an account with your email or Google account to use KittyPay. This helps us keep track of your kitties and expenses."
              },
              {
                question: "How do I invite friends to my kitty?",
                answer: "After creating a kitty, you can invite friends by entering their email address. They'll receive an invitation to join your kitty."
              },
              {
                question: "Can I use KittyPay outside India?",
                answer: "Absolutely! While KittyPay is designed with Indian users in mind, it works globally and supports multiple currencies."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  className="w-full text-left p-4 flex justify-between items-center focus:outline-none"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium flex items-center">
                    <FaQuestionCircle className="mr-3" style={{ color: 'var(--primary)' }} />
                    {faq.question}
                  </span>
                  <FaAngleDown
                    className={`transition-transform duration-200 ${openFaqIndex === index ? 'transform rotate-180' : ''}`}
                    style={{ color: 'var(--primary)' }}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-40' : 'max-h-0'}`}
                  style={{ backgroundColor: 'var(--surface-alt)' }}
                >
                  <p className="p-4" style={{ color: 'var(--text-secondary)' }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Replace App Download Section with Coming Soon */}
      <section className="py-16 md:py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[var(--primary)] to-[#8a4fff] rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Mobile App Coming Soon</h2>
                <p className="text-lg mb-6 opacity-90">
                  We're working on a dedicated mobile app for iOS and Android. Use the web version for now, and be the first to know when our app launches!
                </p>
                <div className="flex flex-row flex-wrap w-full gap-4">
                  <div className="flex-1 min-w-[140px]">
                    <button 
                      onClick={goToSignup}
                      className="w-full h-full bg-white text-[var(--primary)] px-4 py-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <FaUsers size={20} className="mr-2 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-xs">Join our</div>
                        <div className="text-sm font-semibold">Beta Program</div>
                      </div>
                    </button>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <button
                      className="w-full h-full bg-black/30 backdrop-blur-sm text-white border border-white/30 px-4 py-3 rounded-lg flex items-center justify-center hover:bg-black/40 transition-all cursor-pointer"
                      onClick={handleNotifyClick}
                    >
                      <FaDownload size={20} className="mr-2 flex-shrink-0" />
                      <div className="text-left">
                        <div className="text-xs">Get notified at</div>
                        <div className="text-sm font-semibold">App Launch</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-white opacity-20 rounded-full blur-xl"></div>
                  <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 text-center">
                    <div className="text-white text-5xl mb-4">📱</div>
                    <h3 className="text-white text-xl font-bold mb-3">Mobile App</h3>
                    <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-white font-medium">
                      In Development
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <button
            onClick={goToSignup}
            className="px-8 py-3 rounded-lg bg-white shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
            style={{ color: 'var(--primary)' }}
          >
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div
            ref={modalRef}
            className="bg-gradient-to-br from-[var(--surface)] to-[var(--surface-alt)] p-6 rounded-xl shadow-2xl border border-[var(--border)] w-[90%] max-w-md transform transition-all"
            style={{ animation: 'modal-appear 0.3s ease-out' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Get App Launch Updates</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <FaX size={18} />
              </button>
            </div>

            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Be the first to know when our mobile app launches. We'll send you a notification once it's available.
            </p>

            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: 'var(--surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    focusRing: 'var(--primary)'
                  }}
                  autoFocus
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white transition-transform transform hover:scale-105 cursor-pointer"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Notify Me
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Home;