import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY 

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

const clerkAppearance = {
  baseTheme: undefined,
  variables: {
    colorPrimary: 'hsl(215, 100%, 50%)',
    colorBackground: 'hsl(210, 40%, 98%)',
    colorInputBackground: 'hsl(0, 0%, 100%)',
    colorInputText: 'hsl(215, 25%, 15%)',
    colorText: 'hsl(215, 25%, 15%)',
    colorTextSecondary: 'hsl(215, 15%, 45%)',
    colorSuccess: 'hsl(142, 72%, 45%)',
    colorDanger: 'hsl(0, 75%, 55%)',
    colorWarning: 'hsl(38, 100%, 50%)',
    colorNeutral: 'hsl(215, 15%, 88%)',
    borderRadius: '0.75rem',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  elements: {
    rootBox: {
      backgroundColor: 'hsl(210, 40%, 98%)'
    },
    card: {
      backgroundColor: 'hsl(0, 0%, 100%)',
      border: '1px solid hsl(215, 15%, 88%)',
      borderRadius: '0.75rem',
      boxShadow: '0 2px 10px -2px hsl(215, 20%, 85%, 0.3)'
    },
    headerTitle: {
      color: 'hsl(215, 25%, 15%)',
      fontSize: '1.5rem',
      fontWeight: '600'
    },
    headerSubtitle: {
      color: 'hsl(215, 15%, 45%)',
      fontSize: '0.875rem'
    },
    formButtonPrimary: {
      backgroundColor: 'hsl(215, 100%, 50%)',
      color: 'hsl(0, 0%, 100%)',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      padding: '0.625rem 1rem',
      '&:hover': {
        backgroundColor: 'hsl(215, 100%, 45%)'
      }
    },
    formFieldInput: {
      backgroundColor: 'hsl(0, 0%, 100%)',
      border: '1px solid hsl(215, 15%, 88%)',
      borderRadius: '0.5rem',
      color: 'hsl(215, 25%, 15%)',
      '&:focus': {
        borderColor: 'hsl(215, 100%, 50%)',
        boxShadow: '0 0 0 2px hsl(215, 100%, 50%, 0.1)'
      }
    },
    formFieldLabel: {
      color: 'hsl(215, 25%, 25%)',
      fontSize: '0.875rem',
      fontWeight: '500'
    },
    identityPreviewText: {
      color: 'hsl(215, 15%, 45%)'
    },
    identityPreviewEditButton: {
      color: 'hsl(215, 100%, 50%)'
    },
    footer: {
      backgroundColor: 'hsl(210, 20%, 96%)',
      borderTop: '1px solid hsl(215, 15%, 88%)'
    },
    footerActionText: {
      color: 'hsl(215, 15%, 45%)'
    },
    footerActionLink: {
      color: 'hsl(215, 100%, 50%)',
      '&:hover': {
        color: 'hsl(215, 100%, 45%)'
      }
    },
    socialButtonsBlockButton: {
      backgroundColor: 'hsl(0, 0%, 100%)',
      border: '1px solid hsl(215, 15%, 88%)',
      borderRadius: '0.5rem',
      color: 'hsl(215, 25%, 15%)',
      '&:hover': {
        backgroundColor: 'hsl(210, 20%, 96%)'
      }
    },
    dividerLine: {
      backgroundColor: 'hsl(215, 15%, 88%)'
    },
    dividerText: {
      color: 'hsl(215, 15%, 45%)'
    }
  }
};

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    appearance={clerkAppearance}
  >
    <App />
  </ClerkProvider>
);
