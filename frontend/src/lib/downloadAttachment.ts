/**
 * Downloads a file from any URL (including cross-origin ones like
 * Cloudinary) and forces the browser to save it under the given filename.
 *
 * The plain HTML `download="name"` attribute is only honored by browsers
 * for same-origin links - for a cross-origin URL (Cloudinary's CDN is a
 * different domain than this app) browsers ignore it and fall back to
 * their own naming. Fetching the file as a blob and creating a local
 * object URL sidesteps that restriction entirely.
 */
export async function downloadAttachment(url: string, fileName: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: just open it in a new tab if the fetch/blob approach fails
    // (e.g. a CORS-restricted resource) - better than a silent no-op.
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
