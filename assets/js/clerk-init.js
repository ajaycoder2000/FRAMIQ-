/* FarmIQ Clerk bootstrap — shared across all pages.
   Publishable key is safe to expose in frontend code (that's how Clerk's
   client SDK is designed to work); it authorizes the frontend only. */

const FARMIQ_CLERK_PUB_KEY = 'pk_test_cHJvLXZpcGVyLTM3MzIuY2xlcmsuYWNjb3VudHMuZGV2JA';

let __farmiqClerkReady = null;
const FARMIQ_CLERK_TIMEOUT_MS = 10000;

function farmiqInitClerk() {
  if (__farmiqClerkReady) return __farmiqClerkReady;
  __farmiqClerkReady = new Promise((resolve) => {
    const deadline = Date.now() + FARMIQ_CLERK_TIMEOUT_MS;
    function wait() {
      if (Date.now() > deadline && !window.Clerk) {
        console.error('FarmIQ: Clerk failed to load within timeout — check network/ad-blocker.');
        document.dispatchEvent(new CustomEvent('farmiq:auth-failed'));
        resolve(null);
        return;
      }
      if (window.Clerk) {
        window.Clerk.load({
          appearance: {
            variables: {
              colorPrimary: '#c9a84c',
              colorBackground: '#17201a',
              colorInputBackground: '#0c1410',
              colorInputText: '#e9ede6',
              colorText: '#e9ede6',
              colorTextSecondary: 'rgba(233,237,230,.7)',
              colorNeutral: '#e9ede6',
              colorDanger: '#ff6b6b',
              borderRadius: '8px',
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            elements: {
              card: { backgroundColor: '#17201a', border: '1px solid rgba(233,237,230,.16)', boxShadow: 'none' },
              headerTitle: { fontFamily: "'Space Grotesk', sans-serif" },
              formFieldInput: {
                backgroundColor: '#0c1410',
                borderColor: 'rgba(233,237,230,.3)',
                color: '#e9ede6',
                '&:focus': { borderColor: '#c9a84c' },
              },
              formFieldLabel: { color: '#e9ede6' },
              footerActionText: { color: 'rgba(233,237,230,.7)' },
              footerActionLink: { color: '#c9a84c' },
              dividerLine: { backgroundColor: 'rgba(233,237,230,.16)' },
              dividerText: { color: 'rgba(233,237,230,.5)' },
              socialButtonsBlockButton: { borderColor: 'rgba(233,237,230,.3)', color: '#e9ede6' },
            },
          },
        }).then(() => resolve(window.Clerk));
      } else {
        setTimeout(wait, 50);
      }
    }
    wait();
  });
  return __farmiqClerkReady;
}

function farmiqClerkUser() {
  return window.Clerk && window.Clerk.user ? window.Clerk.user : null;
}

function farmiqClerkIsAuthed() {
  return !!(window.Clerk && window.Clerk.user);
}

function farmiqClerkDisplayName() {
  const u = farmiqClerkUser();
  if (!u) return 'Farmer';
  return u.firstName || (u.primaryEmailAddress ? u.primaryEmailAddress.emailAddress.split('@')[0] : 'Farmer');
}
