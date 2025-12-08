package com.nisanth.foodapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.file-storage.path:/tmp/pod-storage}")
    private String storagePath;

    @Value("${app.file-storage.url-prefix:/files/pod/}")
    private String urlPrefix;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // serve files under /files/pod/** from the storage directory
        String resourceLocation = "file:" + storagePath + "/";
        registry.addResourceHandler(urlPrefix + "**")
                .addResourceLocations(resourceLocation);
    }
}
