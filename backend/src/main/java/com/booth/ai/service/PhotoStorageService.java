package com.booth.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class PhotoStorageService {

    // 임시 인메모리 저장소 (id -> png bytes)
    private final Map<String, byte[]> photoStorage = new ConcurrentHashMap<>();

    /**
     * DataURL 또는 Base64 이미지를 저장하고 고유 다운로드 ID를 반환
     */
    public String storePhoto(String base64DataUrl) {
        String pureBase64 = base64DataUrl;
        if (base64DataUrl.contains(",")) {
            pureBase64 = base64DataUrl.split(",")[1];
        }

        byte[] imageBytes = Base64.getDecoder().decode(pureBase64);
        String id = UUID.randomUUID().toString().substring(0, 8);
        photoStorage.put(id, imageBytes);

        log.info("Photo stored with id: {}, size: {} bytes", id, imageBytes.length);
        return id;
    }

    /**
     * ID로 이미지 바이트 배열 조회
     */
    public byte[] getPhoto(String id) {
        return photoStorage.get(id);
    }
}
