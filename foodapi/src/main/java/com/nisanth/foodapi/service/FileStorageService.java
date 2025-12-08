package com.nisanth.foodapi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.UUID;

@Service
public class FileStorageService {

    // base directory to store files - configure in application.properties
    @Value("${app.file-storage.path:/tmp/pod-storage}")
    private String storagePath;

    // base URL prefix for serving files (if you serve via static resource mapping)
    @Value("${app.file-storage.url-prefix:/files/pod/}")
    private String urlPrefix;

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) throw new IOException("Empty file");
        String original = StringUtils.cleanPath(file.getOriginalFilename());
        String ext = "";
        int idx = original.lastIndexOf('.');
        if (idx >= 0) ext = original.substring(idx);
        String name = UUID.randomUUID().toString() + "-" + Instant.now().toEpochMilli() + ext;

        Path dir = Paths.get(storagePath).toAbsolutePath();
        Files.createDirectories(dir);

        Path target = dir.resolve(name);
        Files.copy(file.getInputStream(), target);

        // Return the URL path (frontend can call the server's static mapping)
        return urlPrefix + name;
    }
}
