# Windows Next.js startup

This project uses Webpack for development because Turbopack native bindings are unavailable in the current Windows x64 setup.

Run:

```powershell
cd "D:\vs code\internship project\CampusOS\frontend"
npm install
npm run dev
```

The `dev` script is:

```text
next dev --webpack -H 0.0.0.0
```

If an older `.next` directory exists, delete it once before restarting:

```powershell
Remove-Item -Recurse -Force .next
```
