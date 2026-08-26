package com.campusos.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Stores uploaded files (assignment/notice attachments) in Cloudinary instead
 * of local disk. Render's free tier wipes local files on every restart,
 * redeploy, or 15-minute idle spin-down, so anything saved with
 * Files.copy(...) to a local folder disappears - Cloudinary is a real
 * persistent store, so the file survives all of that.
 */
@Service
public class FileStorageService {

    private final Cloudinary cloudinary;

    public FileStorageService(
            @Value("${CLOUDINARY_CLOUD_NAME:}") String cloudName,
            @Value("${CLOUDINARY_API_KEY:}") String apiKey,
            @Value("${CLOUDINARY_API_SECRET:}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    /**
     * Uploads the file and returns its public, permanent URL.
     * folder e.g. "campusos/assignments" or "campusos/notices" - keeps
     * uploads organized inside your Cloudinary account.
     *
     * Cloudinary's fl_attachment renaming is unreliable for raw files
     * (PDFs etc), so the clean original filename is NOT baked into this
     * URL - callers should store file.getOriginalFilename() separately
     * and force it client-side with the HTML "download" attribute instead.
     */
    public String upload(MultipartFile file, String folder) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto",
                            "public_id", UUID.randomUUID().toString(),
                            "use_filename", false
                    )
            );

            return (String) result.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload attachment.", e);
        }
    }
}
