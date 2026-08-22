The dashboard was refreshing because DataRefreshListener reloads the page whenever `campusos:data-changed` is emitted. The last-route PUT was using the normal API request path, which emitted that event, creating a reload loop on every dashboard/path render.

Fix:
- `apiRequest` supports `silent`.
- `/api/auth/last-route` is saved silently.
- The route is only saved when the pathname actually changes.
- Existing data-change refresh behavior for normal create/update/delete operations remains intact.
