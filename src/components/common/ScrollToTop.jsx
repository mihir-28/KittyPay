import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top when the route changes
 * This improved version helps prevent the "flash of content before scrolling" issue
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();
    const prevPathRef = useRef(pathname);

    useEffect(() => {
        // Only scroll if the path has changed
        if (prevPathRef.current !== pathname) {
            // Use 0, 0 to ensure we're at the very top of the page
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant' // Use 'instant' instead of smooth for immediate scroll
            });
            
            prevPathRef.current = pathname;
        }
    }, [pathname]);

    return null;
};

export default ScrollToTop;