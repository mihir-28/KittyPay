import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../firebase/analytics';

const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view when location changes
    trackPageView(location.pathname, document.title);
  }, [location]);

  return null; // This component doesn't render anything
};

export default RouteTracker; 