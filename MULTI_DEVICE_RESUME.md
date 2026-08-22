# CampusOS account-specific last-page resume

The last page is tied to the authenticated account.

- Account A's last page is stored on Account A's user record.
- Account B's last page is stored on Account B's user record.
- When Account B signs in, CampusOS uses Account B's newly issued JWT to fetch Account B's route.
- The previous browser session is cleared before a new login.
- A browser-side route cache, where used, is keyed by email (`campusos_last_route:<email>`), so accounts on one device cannot share it.
- Login/register/forgot-password pages are never saved as resume pages.
