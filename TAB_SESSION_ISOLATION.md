# CampusOS tab-specific sessions

CampusOS authentication is now stored in `sessionStorage`, not `localStorage`.

This means:
- Tab A can be logged in as Principal.
- Tab B can be logged in as Teacher.
- Refreshing Tab B keeps the Teacher session.
- Refreshing Tab A keeps the Principal session.
- Logging in/out in one tab no longer changes the account used by another tab on the same origin.

The server-side last-route feature remains account-specific for cross-device resume, but the active browser session is now isolated per tab.
