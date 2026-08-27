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
 * Single-tenant Cloudinary service for CampusOS.
 * Handles attachment uploads for Assignments/Notices and returns a permanent CDN secure_url.
 * Used by AssignmentService and NoticeService.
 */
@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
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
     * Uploads MultipartFile to Cloudinary and returns the secure_url.
     * @param file   attachment
     * @param folder e.g. "campusos/assignments" or "campusos/notices"
     * @return secure_url
     */
    public String upload(MultipartFile file, String folder) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto",
                            "public_id", UUID.randomUUID().toString(),
                            "use_filename", false,
                            "overwrite", false
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload attachment to Cloudinary.", e);
        }
    }

    /**
     * Deletes a Cloudinary asset by publicId.
     * Uses resource_type auto to handle images, pdfs etc.
     */
    public void delete(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "auto"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete Cloudinary asset: " + publicId, e);
        }
    }

    /**
     * Deletes by secure_url — extracts publicId first.
     */
    public void deleteByUrl(String secureUrl) {
        if (secureUrl == null || secureUrl.isBlank()) return;
        String publicId = extractPublicId(secureUrl);
        if (publicId != null) delete(publicId);
    }

    /**
     * Extracts publicId from a Cloudinary secure_url.
     * e.g. https://res.cloudinary.com/demo/image/upload/v1714580000/campusos/assignments/550e8400-e29b-41d4-a716-446655440000.pdf
     * -> campusos/assignments/550e8400-e29b-41d4-a716-446655440000
     */
    public String extractPublicId(String secureUrl) {
        if (secureUrl == null || !secureUrl.contains("/upload/")) return null;
        try {
            String afterUpload = secureUrl.substring(secureUrl.indexOf("/upload/") + 8);
            // remove version prefix v123456/
            if (afterUpload.matches("^v\\d+/.*")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
            }
            // remove file extension
            int dot = afterUpload.lastIndexOf('.');
            if (dot > 0) afterUpload = afterUpload.substring(0, dot);
            return afterUpload;
        } catch (Exception e) {
            return null;
        }
    }
}
