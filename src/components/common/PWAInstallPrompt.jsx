import { useState, useEffect } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { useNavigate } from 'react-router-dom'

const PWAInstallPrompt = () => {
  const [offlineReady, setOfflineReady] = useState(false)
  const [needRefresh, setNeedRefresh] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [showInitialNotification, setShowInitialNotification] = useState(false)
  const [showDesktopPrompt, setShowDesktopPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  
  // Check if the device is mobile
  const checkMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
  
  // Check if app is in standalone mode (already installed)
  const isPWAInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true || // For iOS
           localStorage.getItem('pwa_installed') === 'true'
  }
  
  // Check if user has already installed the app or dismissed the notification
  const checkInstallState = () => {
    return isPWAInstalled() || 
           sessionStorage.getItem('pwa_dismissed') === 'true'
  }
  
  // Mark app as installed
  const markAsInstalled = () => {
    localStorage.setItem('pwa_installed', 'true')
    setIsInstallable(false)
    setShowDesktopPrompt(false)
    setShowInitialNotification(false)
  }
  
  // Mark as dismissed for this session
  const markAsDismissed = () => {
    sessionStorage.setItem('pwa_dismissed', 'true')
    setShowDesktopPrompt(false)
    setShowInitialNotification(false)
  }

  const updateSW = registerSW({
    onNeedRefresh() {
      setNeedRefresh(true)
    },
    onOfflineReady() {
      setOfflineReady(true)
    }
  })

  useEffect(() => {
    // Set mobile state
    const isMobileDevice = checkMobile()
    setIsMobile(isMobileDevice)
    
    // Check if the app is already installed or dismissed
    const isInstalledOrDismissed = checkInstallState()
    
    if (!isInstalledOrDismissed) {
      // For mobile devices, show notification after a delay regardless of beforeinstallprompt
      if (isMobileDevice) {
        setIsInstallable(true)
        setTimeout(() => {
          setShowInitialNotification(true)
          
          // Auto-hide after 8 seconds
          setTimeout(() => {
            setShowInitialNotification(false)
          }, 8000)
        }, 2000)
      }
    }
    
    // For desktop devices, we still need beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setInstallPrompt(e)
      
      if (!isInstalledOrDismissed && !isMobileDevice) {
        setIsInstallable(true)
        setTimeout(() => {
          setShowDesktopPrompt(true)
          
          // Auto-hide the notification after 8 seconds
          setTimeout(() => {
            setShowDesktopPrompt(false)
          }, 8000)
        }, 2000)
      }
    }
    
    // Check if app is already installed
    const handleAppInstalled = () => {
      markAsInstalled()
    }
    
    // Check if app is running in standalone mode (already installed)
    if (isPWAInstalled()) {
      markAsInstalled()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
    setShowInitialNotification(false)
    setShowDesktopPrompt(false)
    markAsDismissed()
  }

  const installApp = async () => {
    if (installPrompt) {
      // Desktop install via the beforeinstallprompt event
      try {
        // Show the install prompt
        installPrompt.prompt()
        
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice
        
        // We've used the prompt, and can't use it again, discard it
        setInstallPrompt(null)
        setIsInstallable(false)
        setShowInitialNotification(false)
        setShowDesktopPrompt(false)
        
        if (outcome === 'accepted') {
          markAsInstalled()
        } else {
          markAsDismissed()
        }
        
        console.log(`User ${outcome} the install prompt`)
      } catch (error) {
        console.error('Error showing install prompt:', error)
      }
    } else if (isMobile) {
      // For mobile, display installation instructions
      alert("To install this app on your home screen:\n\n" +
        "• On iOS: tap the Share icon (rectangle with arrow) and select 'Add to Home Screen'\n\n" +
        "• On Android: tap the menu (three dots) and select 'Add to Home Screen' or 'Install App'")
      
      markAsDismissed()
    }
  }
  
  const goToProfile = () => {
    close()
    navigate('/profile')
  }

  return (
    <>
      {/* Offline/Update notification - same for all devices */}
      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm animate-fade-in" 
             style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--text-secondary)', borderOpacity: 0.2 }}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {offlineReady ? 'App ready to work offline' : 'New content available'}
              </h3>
              <button 
                className="hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
                onClick={close}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {offlineReady 
                ? 'KittyPay has been installed and can work offline.'
                : 'New version of KittyPay is available. Click reload to update.'}
            </p>
            
            {needRefresh && (
              <button
                className="mt-2 w-full text-white py-2 px-4 rounded hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}
                onClick={() => updateSW(true)}
              >
                Reload & Update
              </button>
            )}
          </div>
        </div>
      )}

      {/* Initial notification for mobile */}
      {isMobile && showInitialNotification && isInstallable && (
        <div className="fixed top-24 left-0 right-0 mx-auto z-50 p-3 rounded-lg shadow-lg border max-w-xs text-center animate-fade-in"
             style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--text-secondary)', borderOpacity: 0.2 }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              Install KittyPay App
            </h3>
            <button 
              className="hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onClick={close}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            Add to home screen for the best experience
          </p>
          <button
            onClick={installApp}
            className="w-full text-white text-sm py-1.5 px-3 rounded hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Install Now
          </button>
        </div>
      )}

      {/* Desktop notification - top right corner */}
      {!isMobile && showDesktopPrompt && isInstallable && (
        <div className="fixed top-24 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-xs animate-fade-in"
             style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--text-secondary)', borderOpacity: 0.2 }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                   style={{ color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install KittyPay
            </h3>
            <button 
              className="hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onClick={close}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            Install our app for faster access and offline support
          </p>
          <div className="flex justify-between gap-3">
            <button
              onClick={close}
              className="flex-1 text-sm py-1.5 px-3 rounded border hover:opacity-80"
              style={{ 
                color: 'var(--text-secondary)', 
                borderColor: 'var(--text-secondary)', 
                borderOpacity: 0.3 
              }}
            >
              Not Now
            </button>
            <button
              onClick={installApp}
              className="flex-1 text-white text-sm py-1.5 px-3 rounded hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Install
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PWAInstallPrompt 