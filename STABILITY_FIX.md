The repeated dashboard refresh was caused by the last-route PUT returning text.
The API helper was incorrectly dispatching `campusos:data-changed` for text responses
even when `silent: true` was requested. That event triggered a hard window reload.
The text branch is now silent-aware, and the refresh listener uses `router.refresh()`
instead of `window.location.reload()`.
