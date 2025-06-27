# Web Runtime

The Kryon Web Runtime provides seamless integration with modern web browsers through WebAssembly (WASM), enabling high-performance Kryon applications that run natively in web environments while maintaining full compatibility with web standards and browser APIs.

## Architecture Overview

### WebAssembly Integration

The Web Runtime leverages WebAssembly for optimal performance while maintaining JavaScript interoperability:

```
Web Runtime Architecture:
├── WebAssembly Core
│   ├── Kryon Runtime (compiled to WASM)
│   ├── Memory management
│   ├── Element system
│   └── Rendering engine
├── JavaScript Bridge
│   ├── WASM-JS bindings
│   ├── Browser API access
│   ├── Event handling
│   └── Resource loading
├── Web APIs Integration
│   ├── Canvas/WebGL rendering
│   ├── File system access
│   ├── Network requests
│   └── Storage APIs
└── Progressive Web App Features
    ├── Service workers
    ├── Offline capabilities
    ├── Push notifications
    └── App-like experience
```

### Browser Support Matrix

```
Browser Compatibility:
├── Chrome 84+: Full support (WebAssembly SIMD, threads)
├── Firefox 79+: Full support 
├── Safari 14+: Full support (some limitations on iOS)
├── Edge 84+: Full support
├── Chrome Mobile 84+: Full support
├── Safari Mobile 14+: Limited (no SharedArrayBuffer)
└── Legacy Browsers: Graceful degradation

WebAssembly Features:
├── Basic WASM: Universal support (2017+)
├── WASM threads: Chrome 70+, Firefox 72+, Safari 14.1+
├── WASM SIMD: Chrome 91+, Firefox 89+, Safari 16.4+
├── WASM GC: Experimental (Chrome 119+)
└── WASM Component Model: Future standard
```

## WebAssembly Implementation

### Core Runtime Module

```c
// WebAssembly module interface
#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <kryon/web.h>

// Export C functions to JavaScript
EMSCRIPTEN_KEEPALIVE
extern "C" {
    // Runtime lifecycle
    kryon_runtime_t* kryon_web_create_runtime(const char* config_json);
    void kryon_web_destroy_runtime(kryon_runtime_t* runtime);
    
    // Application management
    kryon_app_t* kryon_web_load_app(kryon_runtime_t* runtime, 
                                   const uint8_t* krb_data, 
                                   size_t krb_size);
    void kryon_web_destroy_app(kryon_app_t* app);
    
    // Frame updates
    void kryon_web_update(kryon_app_t* app, float delta_time);
    void kryon_web_render(kryon_app_t* app);
    
    // Event handling
    void kryon_web_handle_mouse_event(kryon_app_t* app, int type, 
                                     float x, float y, int button);
    void kryon_web_handle_keyboard_event(kryon_app_t* app, int type, 
                                        int key_code, int modifiers);
    void kryon_web_handle_resize(kryon_app_t* app, int width, int height);
    
    // Resource management
    void kryon_web_set_canvas_context(kryon_app_t* app, int context_id);
    int kryon_web_load_texture(kryon_app_t* app, const uint8_t* data, 
                              size_t size, int width, int height);
}

// Web-specific configuration
typedef struct kryon_web_config {
    // Rendering
    bool enable_webgl2;
    bool enable_webgpu;          // Experimental
    bool enable_offscreen_canvas;
    int max_texture_size;
    
    // Performance
    bool enable_shared_array_buffer;
    bool enable_simd;
    int worker_thread_count;
    size_t memory_initial_pages;
    size_t memory_maximum_pages;
    
    // Features
    bool enable_file_system_access;
    bool enable_clipboard_access;
    bool enable_camera_access;
    bool enable_microphone_access;
    
    // Security
    bool strict_csp_mode;
    bool enable_cross_origin_isolation;
} kryon_web_config_t;

// Initialize web runtime
kryon_runtime_t* kryon_web_create_runtime(const char* config_json) {
    kryon_web_config_t config = {0};
    kryon_parse_web_config(config_json, &config);
    
    // Check browser capabilities
    if (config.enable_webgl2 && !emscripten_webgl_enable_extension(0, "OES_vertex_array_object")) {
        printf("Warning: WebGL2 not fully supported\n");
    }
    
    // Configure WASM runtime
    kryon_config_t kryon_config = {
        .max_memory = config.memory_maximum_pages * 65536,
        .enable_multithreading = config.enable_shared_array_buffer,
        .enable_simd = config.enable_simd,
        .renderer_type = config.enable_webgpu ? KRYON_RENDERER_WEBGPU : KRYON_RENDERER_WEBGL,
        .platform_data = &config
    };
    
    kryon_runtime_t* runtime;
    if (kryon_init(&kryon_config, &runtime) != KRYON_SUCCESS) {
        return NULL;
    }
    
    return runtime;
}
```

### JavaScript Bridge

```javascript
// JavaScript wrapper for Kryon WebAssembly module
class KryonWebRuntime {
    constructor() {
        this.module = null;
        this.runtime = null;
        this.app = null;
        this.canvas = null;
        this.context = null;
        this.animationFrame = null;
        this.isRunning = false;
    }
    
    async initialize(wasmPath, config = {}) {
        // Load WebAssembly module
        this.module = await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = wasmPath;
            script.onload = () => {
                window.createKryonModule({
                    locateFile: (path) => {
                        if (path.endsWith('.wasm')) {
                            return wasmPath.replace('.js', '.wasm');
                        }
                        return path;
                    }
                }).then(resolve).catch(reject);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        
        // Initialize runtime
        const configJson = JSON.stringify(config);
        this.runtime = this.module._kryon_web_create_runtime(
            this.module.allocateUTF8(configJson)
        );
        
        if (!this.runtime) {
            throw new Error('Failed to initialize Kryon runtime');
        }
        
        // Setup browser API bindings
        this.setupBrowserAPIs();
    }
    
    setupBrowserAPIs() {
        // File System Access API
        this.module.addFunction('js_file_open_dialog', (filters_ptr, callback_ptr) => {
            const filters = this.module.UTF8ToString(filters_ptr);
            this.showFileOpenDialog(JSON.parse(filters))
                .then(files => this.module.dynCall_vi(callback_ptr, files))
                .catch(err => this.module.dynCall_vi(callback_ptr, 0));
        }, 'vii');
        
        // Clipboard API
        this.module.addFunction('js_clipboard_write', (text_ptr) => {
            const text = this.module.UTF8ToString(text_ptr);
            navigator.clipboard.writeText(text);
        }, 'vi');
        
        // Fetch API for resource loading
        this.module.addFunction('js_fetch_resource', (url_ptr, callback_ptr) => {
            const url = this.module.UTF8ToString(url_ptr);
            fetch(url)
                .then(response => response.arrayBuffer())
                .then(data => {
                    const ptr = this.module._malloc(data.byteLength);
                    this.module.HEAPU8.set(new Uint8Array(data), ptr);
                    this.module.dynCall_vii(callback_ptr, ptr, data.byteLength);
                })
                .catch(err => this.module.dynCall_vii(callback_ptr, 0, 0));
        }, 'vii');
        
        // Local Storage API
        this.module.addFunction('js_storage_get', (key_ptr) => {
            const key = this.module.UTF8ToString(key_ptr);
            const value = localStorage.getItem(key) || '';
            return this.module.allocateUTF8(value);
        }, 'ii');
        
        this.module.addFunction('js_storage_set', (key_ptr, value_ptr) => {
            const key = this.module.UTF8ToString(key_ptr);
            const value = this.module.UTF8ToString(value_ptr);
            localStorage.setItem(key, value);
        }, 'vii');
    }
    
    async loadApp(krbData) {
        if (!this.runtime) {
            throw new Error('Runtime not initialized');
        }
        
        // Upload KRB data to WASM memory
        const krbPtr = this.module._malloc(krbData.byteLength);
        this.module.HEAPU8.set(new Uint8Array(krbData), krbPtr);
        
        // Load application
        this.app = this.module._kryon_web_load_app(
            this.runtime, krbPtr, krbData.byteLength
        );
        
        this.module._free(krbPtr);
        
        if (!this.app) {
            throw new Error('Failed to load Kryon application');
        }
    }
    
    attachToCanvas(canvas, options = {}) {
        this.canvas = canvas;
        
        // Create WebGL context
        const contextAttributes = {
            alpha: options.alpha !== false,
            depth: options.depth !== false,
            stencil: options.stencil !== false,
            antialias: options.antialias !== false,
            premultipliedAlpha: options.premultipliedAlpha !== false,
            preserveDrawingBuffer: options.preserveDrawingBuffer === true,
            powerPreference: options.powerPreference || 'default',
            failIfMajorPerformanceCaveat: options.failIfMajorPerformanceCaveat === true
        };
        
        this.context = canvas.getContext('webgl2', contextAttributes) ||
                      canvas.getContext('webgl', contextAttributes);
        
        if (!this.context) {
            throw new Error('WebGL not supported');
        }
        
        // Register context with WASM module
        const contextId = this.module.GL.registerContext(this.context, contextAttributes);
        this.module._kryon_web_set_canvas_context(this.app, contextId);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Handle canvas resize
        this.handleResize();
        
        // Setup resize observer
        if (window.ResizeObserver) {
            new ResizeObserver(() => this.handleResize()).observe(canvas);
        } else {
            window.addEventListener('resize', () => this.handleResize());
        }
    }
    
    setupEventListeners() {
        const canvas = this.canvas;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.module._kryon_web_handle_mouse_event(
                this.app, 0, x, y, e.button
            );
            e.preventDefault();
        });
        
        canvas.addEventListener('mouseup', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.module._kryon_web_handle_mouse_event(
                this.app, 1, x, y, e.button
            );
            e.preventDefault();
        });
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.module._kryon_web_handle_mouse_event(
                this.app, 2, x, y, 0
            );
        });
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            for (let touch of e.changedTouches) {
                const rect = canvas.getBoundingClientRect();
                const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
                const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
                this.module._kryon_web_handle_mouse_event(
                    this.app, 0, x, y, 0
                );
            }
            e.preventDefault();
        });
        
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            const modifiers = (e.ctrlKey ? 1 : 0) | 
                            (e.shiftKey ? 2 : 0) | 
                            (e.altKey ? 4 : 0) | 
                            (e.metaKey ? 8 : 0);
            this.module._kryon_web_handle_keyboard_event(
                this.app, 0, e.keyCode, modifiers
            );
        });
        
        window.addEventListener('keyup', (e) => {
            const modifiers = (e.ctrlKey ? 1 : 0) | 
                            (e.shiftKey ? 2 : 0) | 
                            (e.altKey ? 4 : 0) | 
                            (e.metaKey ? 8 : 0);
            this.module._kryon_web_handle_keyboard_event(
                this.app, 1, e.keyCode, modifiers
            );
        });
    }
    
    handleResize() {
        const canvas = this.canvas;
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        if (this.app) {
            this.module._kryon_web_handle_resize(this.app, canvas.width, canvas.height);
        }
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        let lastTime = 0;
        const renderFrame = (currentTime) => {
            if (!this.isRunning) return;
            
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            this.module._kryon_web_update(this.app, deltaTime);
            this.module._kryon_web_render(this.app);
            
            this.animationFrame = requestAnimationFrame(renderFrame);
        };
        
        this.animationFrame = requestAnimationFrame(renderFrame);
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
    
    destroy() {
        this.stop();
        
        if (this.app) {
            this.module._kryon_web_destroy_app(this.app);
            this.app = null;
        }
        
        if (this.runtime) {
            this.module._kryon_web_destroy_runtime(this.runtime);
            this.runtime = null;
        }
    }
    
    // Helper methods for browser APIs
    async showFileOpenDialog(filters = []) {
        if ('showOpenFilePicker' in window) {
            // File System Access API
            const fileHandles = await window.showOpenFilePicker({
                types: filters.map(filter => ({
                    description: filter.description,
                    accept: filter.accept
                })),
                multiple: false
            });
            
            return fileHandles.map(handle => handle.getFile());
        } else {
            // Fallback to input element
            return new Promise((resolve) => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = filters.map(f => Object.values(f.accept).flat()).join(',');
                input.onchange = (e) => resolve(Array.from(e.target.files));
                input.click();
            });
        }
    }
}
```

## Progressive Web App Features

### Service Worker Integration

```javascript
// Service worker for offline support and caching
class KryonServiceWorker {
    constructor() {
        this.CACHE_NAME = 'kryon-app-v1';
        this.urlsToCache = [
            '/',
            '/index.html',
            '/kryon-runtime.js',
            '/kryon-runtime.wasm',
            '/app.krb',
            '/manifest.json'
        ];
    }
    
    async install() {
        const cache = await caches.open(this.CACHE_NAME);
        return cache.addAll(this.urlsToCache);
    }
    
    async fetch(event) {
        // Cache-first strategy for static assets
        if (this.isStaticAsset(event.request.url)) {
            return this.cacheFirst(event.request);
        }
        
        // Network-first strategy for API calls
        if (this.isAPICall(event.request.url)) {
            return this.networkFirst(event.request);
        }
        
        // Default to network with cache fallback
        return this.networkWithFallback(event.request);
    }
    
    async cacheFirst(request) {
        const response = await caches.match(request);
        if (response) {
            return response;
        }
        
        const networkResponse = await fetch(request);
        const cache = await caches.open(this.CACHE_NAME);
        cache.put(request, networkResponse.clone());
        
        return networkResponse;
    }
    
    async networkFirst(request) {
        try {
            const networkResponse = await fetch(request);
            
            // Cache successful responses
            if (networkResponse.ok) {
                const cache = await caches.open(this.CACHE_NAME);
                cache.put(request, networkResponse.clone());
            }
            
            return networkResponse;
        } catch (error) {
            // Fallback to cache
            const response = await caches.match(request);
            if (response) {
                return response;
            }
            
            throw error;
        }
    }
    
    async networkWithFallback(request) {
        try {
            return await fetch(request);
        } catch (error) {
            const response = await caches.match(request);
            if (response) {
                return response;
            }
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
                return caches.match('/offline.html');
            }
            
            throw error;
        }
    }
    
    isStaticAsset(url) {
        return url.includes('.wasm') || 
               url.includes('.js') || 
               url.includes('.css') || 
               url.includes('.krb');
    }
    
    isAPICall(url) {
        return url.includes('/api/');
    }
}

// Service worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Service worker implementation (sw.js)
const serviceWorker = new KryonServiceWorker();

self.addEventListener('install', event => {
    event.waitUntil(serviceWorker.install());
});

self.addEventListener('fetch', event => {
    event.respondWith(serviceWorker.fetch(event));
});
```

### Web App Manifest

```json
{
  "name": "My Kryon Application",
  "short_name": "KryonApp",
  "description": "A high-performance application built with Kryon",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "orientation": "portrait-primary",
  "scope": "/",
  "lang": "en",
  "dir": "ltr",
  
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  
  "shortcuts": [
    {
      "name": "New Document",
      "short_name": "New",
      "description": "Create a new document",
      "url": "/new",
      "icons": [
        {
          "src": "/icons/new-document.png",
          "sizes": "96x96",
          "type": "image/png"
        }
      ]
    }
  ],
  
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop view of the application"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile view of the application"
    }
  ],
  
  "categories": [
    "productivity",
    "utilities"
  ],
  
  "prefer_related_applications": false,
  
  "edge_side_panel": {
    "preferred_width": 400
  }
}
```

### Push Notifications

```javascript
// Push notification support
class KryonPushNotifications {
    constructor(app) {
        this.app = app;
        this.registration = null;
        this.subscription = null;
    }
    
    async initialize() {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push messaging is not supported');
            return false;
        }
        
        this.registration = await navigator.serviceWorker.ready;
        return true;
    }
    
    async requestPermission() {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    async subscribe(vapidPublicKey) {
        if (!this.registration) {
            throw new Error('Service worker not registered');
        }
        
        this.subscription = await this.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
        });
        
        // Send subscription to server
        await this.sendSubscriptionToServer(this.subscription);
        
        return this.subscription;
    }
    
    async unsubscribe() {
        if (this.subscription) {
            await this.subscription.unsubscribe();
            await this.removeSubscriptionFromServer(this.subscription);
            this.subscription = null;
        }
    }
    
    async sendSubscriptionToServer(subscription) {
        await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription)
        });
    }
    
    async removeSubscriptionFromServer(subscription) {
        await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription)
        });
    }
    
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Push event handling in service worker
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'kryon-notification',
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: '/icons/open.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icons/dismiss.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Kryon App', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
```

## Performance Optimization

### WebAssembly Optimizations

```c
// WebAssembly-specific optimizations
#ifdef __EMSCRIPTEN__

// Use Emscripten-specific optimizations
#include <emscripten/html5.h>
#include <emscripten/threading.h>

// Optimize memory allocation for web
__attribute__((weak)) void* kryon_web_malloc(size_t size) {
    // Use aligned allocation for better performance
    return aligned_alloc(16, (size + 15) & ~15);
}

// Optimize texture loading for web
kryon_result_t kryon_web_load_texture_optimized(const uint8_t* data, 
                                               size_t size,
                                               int* texture_id) {
    // Use WebGL-optimized texture formats
    GLuint texture;
    glGenTextures(1, &texture);
    glBindTexture(GL_TEXTURE_2D, texture);
    
    // Use compressed texture formats when available
    if (emscripten_webgl_enable_extension(emscripten_webgl_get_current_context(), 
                                         "WEBGL_compressed_texture_s3tc")) {
        // Use S3TC compression
        glCompressedTexImage2D(GL_TEXTURE_2D, 0, GL_COMPRESSED_RGBA_S3TC_DXT5_EXT,
                              width, height, 0, size, data);
    } else {
        // Fallback to uncompressed
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, 
                    GL_RGBA, GL_UNSIGNED_BYTE, data);
    }
    
    *texture_id = texture;
    return KRYON_SUCCESS;
}

// Web-specific frame timing
EMSCRIPTEN_KEEPALIVE
void kryon_web_request_animation_frame() {
    emscripten_request_animation_frame(kryon_web_frame_callback, NULL);
}

EM_BOOL kryon_web_frame_callback(double time, void* userData) {
    kryon_app_t* app = (kryon_app_t*)userData;
    
    static double lastTime = 0;
    double deltaTime = (time - lastTime) / 1000.0;
    lastTime = time;
    
    kryon_update(app, (float)deltaTime);
    kryon_render(app);
    
    // Request next frame
    emscripten_request_animation_frame(kryon_web_frame_callback, userData);
    return EM_TRUE;
}

// Memory pressure handling for web
EMSCRIPTEN_KEEPALIVE
void kryon_web_handle_memory_pressure() {
    // Reduce memory usage when browser is under pressure
    kryon_clear_unused_caches();
    kryon_compress_textures();
    kryon_garbage_collect();
}

#endif // __EMSCRIPTEN__
```

### Streaming and Progressive Loading

```javascript
// Progressive loading implementation
class KryonProgressiveLoader {
    constructor(app) {
        this.app = app;
        this.loadingQueue = [];
        this.isLoading = false;
        this.priorityOrder = ['critical', 'high', 'medium', 'low'];
    }
    
    addResource(url, priority = 'medium', callback = null) {
        this.loadingQueue.push({
            url,
            priority,
            callback,
            loaded: false
        });
        
        // Sort by priority
        this.loadingQueue.sort((a, b) => {
            return this.priorityOrder.indexOf(a.priority) - 
                   this.priorityOrder.indexOf(b.priority);
        });
        
        if (!this.isLoading) {
            this.startLoading();
        }
    }
    
    async startLoading() {
        this.isLoading = true;
        
        while (this.loadingQueue.length > 0) {
            const resource = this.loadingQueue.shift();
            
            try {
                await this.loadResource(resource);
                resource.loaded = true;
                
                if (resource.callback) {
                    resource.callback(null, resource);
                }
            } catch (error) {
                console.error(`Failed to load resource: ${resource.url}`, error);
                
                if (resource.callback) {
                    resource.callback(error, resource);
                }
            }
            
            // Yield control to prevent blocking
            await this.yield();
        }
        
        this.isLoading = false;
    }
    
    async loadResource(resource) {
        const response = await fetch(resource.url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.arrayBuffer();
        
        // Load into Kryon application
        const ptr = this.app.module._malloc(data.byteLength);
        this.app.module.HEAPU8.set(new Uint8Array(data), ptr);
        
        // Call appropriate loader based on file type
        if (resource.url.endsWith('.png') || resource.url.endsWith('.jpg')) {
            this.app.module._kryon_web_load_texture(
                this.app.app, ptr, data.byteLength
            );
        } else if (resource.url.endsWith('.wav') || resource.url.endsWith('.mp3')) {
            this.app.module._kryon_web_load_audio(
                this.app.app, ptr, data.byteLength
            );
        }
        
        this.app.module._free(ptr);
    }
    
    async yield() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }
}

// Streaming resource loader
class KryonStreamingLoader {
    constructor(app) {
        this.app = app;
        this.chunkSize = 64 * 1024; // 64KB chunks
    }
    
    async loadStreamingResource(url, onProgress = null) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentLength = parseInt(response.headers.get('content-length') || '0');
        const reader = response.body.getReader();
        
        let receivedLength = 0;
        let chunks = [];
        
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            chunks.push(value);
            receivedLength += value.length;
            
            if (onProgress) {
                onProgress(receivedLength, contentLength);
            }
            
            // Process chunks as they arrive for large files
            if (receivedLength % (this.chunkSize * 10) === 0) {
                await this.processChunks(chunks);
                chunks = [];
            }
        }
        
        // Process remaining chunks
        if (chunks.length > 0) {
            await this.processChunks(chunks);
        }
    }
    
    async processChunks(chunks) {
        // Combine chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        
        let offset = 0;
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }
        
        // Upload to WASM and process
        const ptr = this.app.module._malloc(combined.length);
        this.app.module.HEAPU8.set(combined, ptr);
        
        this.app.module._kryon_web_process_data_chunk(
            this.app.app, ptr, combined.length
        );
        
        this.app.module._free(ptr);
        
        // Yield control
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}
```

## Security Considerations

### Content Security Policy

```html
<!-- Strict CSP for WebAssembly applications -->
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'wasm-unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    font-src 'self';
    connect-src 'self' https://api.example.com;
    worker-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
">
```

### Cross-Origin Isolation

```javascript
// Enable cross-origin isolation for SharedArrayBuffer
// Set these headers on the server:
// Cross-Origin-Opener-Policy: same-origin
// Cross-Origin-Embedder-Policy: require-corp

class KryonCrossOriginIsolation {
    static async checkSupport() {
        return 'crossOriginIsolated' in window && window.crossOriginIsolated;
    }
    
    static async enableFeatures(app) {
        if (await this.checkSupport()) {
            // Enable SharedArrayBuffer for threading
            app.enableSharedArrayBuffer = true;
            
            // Enable high-resolution timers
            app.enableHighResTimer = true;
            
            console.log('Cross-origin isolation enabled');
        } else {
            console.warn('Cross-origin isolation not available, some features disabled');
        }
    }
}
```

### Secure Resource Loading

```javascript
// Secure resource loading with integrity checks
class KryonSecureLoader {
    constructor(app) {
        this.app = app;
        this.trustedOrigins = new Set([
            window.location.origin,
            'https://cdn.example.com'
        ]);
    }
    
    async loadResource(url, expectedHash = null) {
        // Validate origin
        const urlObj = new URL(url, window.location.href);
        if (!this.trustedOrigins.has(urlObj.origin)) {
            throw new Error(`Untrusted origin: ${urlObj.origin}`);
        }
        
        // Load resource
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load: ${response.status}`);
        }
        
        const data = await response.arrayBuffer();
        
        // Verify integrity if hash provided
        if (expectedHash) {
            const actualHash = await this.calculateHash(data);
            if (actualHash !== expectedHash) {
                throw new Error('Resource integrity check failed');
            }
        }
        
        return data;
    }
    
    async calculateHash(data) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Validate KRB file signature
    async validateKRBFile(krbData) {
        // Check magic number
        const view = new DataView(krbData);
        const magic = view.getUint32(0, true);
        
        if (magic !== 0x3142524B) { // "KRB1"
            throw new Error('Invalid KRB file format');
        }
        
        // Verify checksum
        const fileSize = krbData.byteLength;
        const storedChecksum = view.getUint32(fileSize - 4, true);
        const calculatedChecksum = await this.calculateCRC32(
            krbData.slice(0, fileSize - 4)
        );
        
        if (storedChecksum !== calculatedChecksum) {
            throw new Error('KRB file checksum mismatch');
        }
        
        return true;
    }
    
    async calculateCRC32(data) {
        // CRC32 implementation for file validation
        const table = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
            let c = i;
            for (let j = 0; j < 8; j++) {
                c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
            }
            table[i] = c;
        }
        
        let crc = 0xFFFFFFFF;
        const bytes = new Uint8Array(data);
        
        for (let i = 0; i < bytes.length; i++) {
            crc = table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
        }
        
        return (crc ^ 0xFFFFFFFF) >>> 0;
    }
}
```

## Deployment Strategies

### Static Hosting

```yaml
# GitHub Pages deployment with GitHub Actions
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install Kryon toolchain
      run: |
        wget https://github.com/kryon-lang/kryon/releases/download/v1.2.0/kryon-linux-x64.tar.gz
        tar -xzf kryon-linux-x64.tar.gz
        echo "$PWD/kryon/bin" >> $GITHUB_PATH
        
    - name: Build application
      run: |
        kryc src/app.kry --target=web --optimize=max -o dist/app.krb
        
    - name: Build WebAssembly runtime
      run: |
        emcc -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME="createKryonModule" \
             -s USE_WEBGL2=1 -s FULL_ES3=1 \
             -s ALLOW_MEMORY_GROWTH=1 -s MAXIMUM_MEMORY=256MB \
             --pre-js src/pre.js --post-js src/post.js \
             kryon-runtime.c -o dist/kryon-runtime.js
             
    - name: Copy static assets
      run: |
        cp src/index.html dist/
        cp src/manifest.json dist/
        cp -r src/icons dist/
        cp src/sw.js dist/
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: myapp.example.com
```

### CDN Integration

```javascript
// CDN optimization for global delivery
class KryonCDNOptimizer {
    constructor() {
        this.cdnEndpoints = [
            'https://cdn-us.example.com',
            'https://cdn-eu.example.com',
            'https://cdn-asia.example.com'
        ];
    }
    
    async selectOptimalCDN() {
        // Test latency to different CDN endpoints
        const latencyTests = this.cdnEndpoints.map(async (endpoint) => {
            const startTime = performance.now();
            
            try {
                await fetch(`${endpoint}/ping`, { method: 'HEAD' });
                const latency = performance.now() - startTime;
                return { endpoint, latency };
            } catch (error) {
                return { endpoint, latency: Infinity };
            }
        });
        
        const results = await Promise.all(latencyTests);
        const fastest = results.reduce((min, current) => 
            current.latency < min.latency ? current : min
        );
        
        return fastest.endpoint;
    }
    
    async loadFromCDN(filename) {
        const cdn = await this.selectOptimalCDN();
        const url = `${cdn}/${filename}`;
        
        // Add cache busting and integrity checking
        const response = await fetch(url, {
            cache: 'default',
            integrity: await this.getResourceIntegrity(filename)
        });
        
        if (!response.ok) {
            throw new Error(`CDN load failed: ${response.status}`);
        }
        
        return response;
    }
    
    async getResourceIntegrity(filename) {
        // Resource integrity hashes (computed at build time)
        const hashes = {
            'kryon-runtime.wasm': 'sha384-abc123...',
            'app.krb': 'sha384-def456...'
        };
        
        return hashes[filename];
    }
}
```

### Docker Containerization

```dockerfile
# Multi-stage Docker build for web deployment
FROM emscripten/emsdk:3.1.45 AS builder

WORKDIR /app

# Copy source files
COPY src/ ./src/
COPY kryon-runtime.c ./
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm ci

# Install Kryon toolchain
RUN wget https://github.com/kryon-lang/kryon/releases/download/v1.2.0/kryon-linux-x64.tar.gz && \
    tar -xzf kryon-linux-x64.tar.gz && \
    cp -r kryon/bin/* /usr/local/bin/

# Build Kryon application
RUN kryc src/app.kry --target=web --optimize=max -o dist/app.krb

# Build WebAssembly runtime
RUN emcc -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME="createKryonModule" \
         -s USE_WEBGL2=1 -s FULL_ES3=1 -s ALLOW_MEMORY_GROWTH=1 \
         -s MAXIMUM_MEMORY=256MB --pre-js src/pre.js --post-js src/post.js \
         kryon-runtime.c -o dist/kryon-runtime.js

# Copy static assets
RUN cp src/index.html dist/ && \
    cp src/manifest.json dist/ && \
    cp -r src/icons dist/ && \
    cp src/sw.js dist/

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Enable compression and security headers
RUN echo 'gzip on; gzip_types text/plain application/javascript application/wasm;' > /etc/nginx/conf.d/compression.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Framework Integration

### React Integration

```jsx
// React component for Kryon applications
import React, { useEffect, useRef, useState } from 'react';
import { KryonWebRuntime } from './kryon-web-runtime';

const KryonApp = ({ 
    krbFile, 
    config = {}, 
    onLoad = null, 
    onError = null,
    className = "",
    style = {}
}) => {
    const canvasRef = useRef(null);
    const [runtime, setRuntime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        let mounted = true;
        
        const initializeKryon = async () => {
            try {
                const kryonRuntime = new KryonWebRuntime();
                await kryonRuntime.initialize('/kryon-runtime.js', config);
                
                const krbData = await fetch(krbFile).then(r => r.arrayBuffer());
                await kryonRuntime.loadApp(krbData);
                
                if (mounted) {
                    kryonRuntime.attachToCanvas(canvasRef.current);
                    kryonRuntime.start();
                    
                    setRuntime(kryonRuntime);
                    setLoading(false);
                    
                    if (onLoad) {
                        onLoad(kryonRuntime);
                    }
                }
            } catch (err) {
                if (mounted) {
                    setError(err.message);
                    setLoading(false);
                    
                    if (onError) {
                        onError(err);
                    }
                }
            }
        };
        
        initializeKryon();
        
        return () => {
            mounted = false;
            if (runtime) {
                runtime.destroy();
            }
        };
    }, [krbFile, config]);
    
    if (loading) {
        return (
            <div className={`kryon-loading ${className}`} style={style}>
                <div>Loading Kryon application...</div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className={`kryon-error ${className}`} style={style}>
                <div>Error loading application: {error}</div>
            </div>
        );
    }
    
    return (
        <canvas 
            ref={canvasRef}
            className={`kryon-canvas ${className}`}
            style={{ width: '100%', height: '100%', ...style }}
        />
    );
};

// Usage
const App = () => {
    return (
        <div className="app">
            <h1>My Kryon Application</h1>
            <KryonApp 
                krbFile="/app.krb"
                config={{
                    enable_webgl2: true,
                    enable_simd: true,
                    max_memory: 128 * 1024 * 1024
                }}
                onLoad={(runtime) => {
                    console.log('Kryon app loaded successfully');
                }}
                onError={(error) => {
                    console.error('Failed to load Kryon app:', error);
                }}
                style={{ height: '600px' }}
            />
        </div>
    );
};

export default App;
```

### Vue.js Integration

```vue
<template>
  <div class="kryon-container">
    <canvas 
      ref="canvas"
      :class="{ 'kryon-loading': loading }"
      @contextmenu.prevent
    ></canvas>
    <div v-if="loading" class="loading-overlay">
      Loading...
    </div>
    <div v-if="error" class="error-overlay">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { KryonWebRuntime } from './kryon-web-runtime';

export default {
  name: 'KryonApp',
  props: {
    krbFile: {
      type: String,
      required: true
    },
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      runtime: null,
      loading: true,
      error: null
    };
  },
  async mounted() {
    try {
      this.runtime = new KryonWebRuntime();
      await this.runtime.initialize('/kryon-runtime.js', this.config);
      
      const krbData = await fetch(this.krbFile).then(r => r.arrayBuffer());
      await this.runtime.loadApp(krbData);
      
      this.runtime.attachToCanvas(this.$refs.canvas);
      this.runtime.start();
      
      this.loading = false;
      this.$emit('loaded', this.runtime);
    } catch (err) {
      this.error = err.message;
      this.loading = false;
      this.$emit('error', err);
    }
  },
  beforeUnmount() {
    if (this.runtime) {
      this.runtime.destroy();
    }
  }
};
</script>

<style scoped>
.kryon-container {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.loading-overlay,
.error-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
}
</style>
```

## Best Practices

### 1. Performance Optimization

```javascript
// Web-specific performance optimization
class KryonWebOptimizer {
    static optimizeForWeb(runtime) {
        // Enable WebGL extensions
        this.enableWebGLExtensions(runtime);
        
        // Optimize memory usage
        this.optimizeMemoryUsage(runtime);
        
        // Setup efficient resource loading
        this.setupResourceLoading(runtime);
        
        // Configure frame rate adaptation
        this.setupFrameRateAdaptation(runtime);
    }
    
    static enableWebGLExtensions(runtime) {
        const canvas = runtime.canvas;
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        // Enable useful extensions
        const extensions = [
            'EXT_texture_filter_anisotropic',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_compressed_texture_etc',
            'OES_texture_float',
            'OES_element_index_uint'
        ];
        
        extensions.forEach(ext => {
            const extension = gl.getExtension(ext);
            if (extension) {
                console.log(`Enabled WebGL extension: ${ext}`);
            }
        });
    }
    
    static optimizeMemoryUsage(runtime) {
        // Monitor memory usage
        const checkMemory = () => {
            if ('memory' in performance) {
                const memInfo = performance.memory;
                const usage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
                
                if (usage > 0.8) {
                    runtime.module._kryon_web_handle_memory_pressure();
                }
            }
        };
        
        setInterval(checkMemory, 5000); // Check every 5 seconds
    }
    
    static setupResourceLoading(runtime) {
        // Preload critical resources
        const criticalResources = [
            '/fonts/main.woff2',
            '/textures/ui.png'
        ];
        
        criticalResources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = url.endsWith('.woff2') ? 'font' : 'image';
            if (link.as === 'font') link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    static setupFrameRateAdaptation(runtime) {
        let frameCount = 0;
        let lastTime = performance.now();
        let frameTime = 16.67; // 60 FPS target
        
        const measurePerformance = () => {
            frameCount++;
            
            if (frameCount % 60 === 0) { // Check every 60 frames
                const currentTime = performance.now();
                const actualFrameTime = (currentTime - lastTime) / 60;
                
                // Adapt quality based on performance
                if (actualFrameTime > frameTime * 1.2) {
                    // Reduce quality
                    runtime.module._kryon_web_reduce_quality();
                } else if (actualFrameTime < frameTime * 0.8) {
                    // Increase quality
                    runtime.module._kryon_web_increase_quality();
                }
                
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measurePerformance);
        };
        
        requestAnimationFrame(measurePerformance);
    }
}
```

### 2. Error Handling and Recovery

```javascript
// Comprehensive error handling for web runtime
class KryonWebErrorHandler {
    constructor(runtime) {
        this.runtime = runtime;
        this.setupGlobalErrorHandling();
        this.setupWebGLErrorHandling();
        this.setupMemoryErrorHandling();
    }
    
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });
    }
    
    setupWebGLErrorHandling() {
        const canvas = this.runtime.canvas;
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        // WebGL context lost handling
        canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            this.handleWebGLContextLost();
        });
        
        canvas.addEventListener('webglcontextrestored', () => {
            this.handleWebGLContextRestored();
        });
        
        // Periodic WebGL error checking
        setInterval(() => {
            const error = gl.getError();
            if (error !== gl.NO_ERROR) {
                this.handleWebGLError(error);
            }
        }, 1000);
    }
    
    setupMemoryErrorHandling() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                const usage = memInfo.usedJSHeapSize / memInfo.totalJSHeapSize;
                
                if (usage > 0.9) {
                    this.handleMemoryPressure('high');
                } else if (usage > 0.8) {
                    this.handleMemoryPressure('medium');
                }
            }, 2000);
        }
    }
    
    handleError(type, error) {
        console.error(`${type}:`, error);
        
        // Send error report to analytics
        this.reportError(type, error);
        
        // Attempt recovery
        this.attemptRecovery(type, error);
    }
    
    handleWebGLContextLost() {
        console.warn('WebGL context lost, attempting recovery...');
        
        // Stop rendering
        this.runtime.stop();
        
        // Show user notification
        this.showNotification('Graphics context lost. Attempting to recover...', 'warning');
    }
    
    handleWebGLContextRestored() {
        console.log('WebGL context restored');
        
        // Reinitialize graphics resources
        this.runtime.module._kryon_web_reinit_graphics();
        
        // Resume rendering
        this.runtime.start();
        
        // Show success notification
        this.showNotification('Graphics context recovered', 'success');
    }
    
    handleWebGLError(error) {
        const errorNames = {
            [WebGL2RenderingContext.INVALID_ENUM]: 'INVALID_ENUM',
            [WebGL2RenderingContext.INVALID_VALUE]: 'INVALID_VALUE',
            [WebGL2RenderingContext.INVALID_OPERATION]: 'INVALID_OPERATION',
            [WebGL2RenderingContext.OUT_OF_MEMORY]: 'OUT_OF_MEMORY'
        };
        
        console.error(`WebGL Error: ${errorNames[error] || error}`);
        
        if (error === WebGL2RenderingContext.OUT_OF_MEMORY) {
            this.handleMemoryPressure('critical');
        }
    }
    
    handleMemoryPressure(level) {
        console.warn(`Memory pressure: ${level}`);
        
        switch (level) {
            case 'medium':
                this.runtime.module._kryon_web_reduce_memory_usage();
                break;
            case 'high':
                this.runtime.module._kryon_web_aggressive_cleanup();
                break;
            case 'critical':
                this.runtime.module._kryon_web_emergency_cleanup();
                this.showNotification('Low memory detected. Some features may be disabled.', 'warning');
                break;
        }
    }
    
    attemptRecovery(type, error) {
        // Different recovery strategies based on error type
        if (error.message && error.message.includes('memory')) {
            this.handleMemoryPressure('high');
        } else if (type === 'WebGL Error') {
            // Try to reinitialize graphics
            setTimeout(() => {
                this.runtime.module._kryon_web_reinit_graphics();
            }, 1000);
        }
    }
    
    reportError(type, error) {
        // Send error report to analytics service
        if ('sendBeacon' in navigator) {
            const errorData = JSON.stringify({
                type,
                message: error.message || error,
                stack: error.stack,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            });
            
            navigator.sendBeacon('/api/errors', errorData);
        }
    }
    
    showNotification(message, type = 'info') {
        // Show user-friendly notification
        const notification = document.createElement('div');
        notification.className = `kryon-notification kryon-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}
```

### 3. Accessibility

```javascript
// Web accessibility implementation
class KryonWebAccessibility {
    constructor(runtime) {
        this.runtime = runtime;
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
    }
    
    setupKeyboardNavigation() {
        const canvas = this.runtime.canvas;
        canvas.tabIndex = 0; // Make canvas focusable
        
        canvas.addEventListener('keydown', (e) => {
            // Handle standard keyboard navigation
            switch (e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(e);
                    break;
                case 'Escape':
                    this.handleEscape(e);
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.handleArrowNavigation(e);
                    break;
            }
        });
    }
    
    setupScreenReaderSupport() {
        const canvas = this.runtime.canvas;
        
        // Add ARIA attributes
        canvas.setAttribute('role', 'application');
        canvas.setAttribute('aria-label', 'Kryon Application');
        
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
        
        // Update screen reader content when UI changes
        this.runtime.onUIUpdate = (description) => {
            this.announceToScreenReader(description);
        };
    }
    
    setupHighContrastMode() {
        // Detect high contrast mode
        const detectHighContrast = () => {
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.color = 'rgb(31, 41, 59)';
            testElement.style.backgroundColor = 'rgb(255, 255, 255)';
            
            document.body.appendChild(testElement);
            
            const computedStyle = window.getComputedStyle(testElement);
            const isHighContrast = computedStyle.color !== 'rgb(31, 41, 59)';
            
            document.body.removeChild(testElement);
            
            return isHighContrast;
        };
        
        if (detectHighContrast()) {
            this.runtime.module._kryon_web_enable_high_contrast();
        }
        
        // Listen for changes
        window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
            if (e.matches) {
                this.runtime.module._kryon_web_enable_high_contrast();
            } else {
                this.runtime.module._kryon_web_disable_high_contrast();
            }
        });
    }
    
    handleTabNavigation(event) {
        // Get focusable elements from Kryon
        const focusableElements = this.runtime.module._kryon_web_get_focusable_elements();
        
        if (focusableElements.length > 0) {
            event.preventDefault();
            
            const currentIndex = this.runtime.module._kryon_web_get_focused_element_index();
            let nextIndex;
            
            if (event.shiftKey) {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            } else {
                nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            }
            
            this.runtime.module._kryon_web_focus_element(nextIndex);
        }
    }
    
    handleActivation(event) {
        event.preventDefault();
        this.runtime.module._kryon_web_activate_focused_element();
    }
    
    handleEscape(event) {
        event.preventDefault();
        this.runtime.module._kryon_web_handle_escape();
    }
    
    handleArrowNavigation(event) {
        event.preventDefault();
        
        const direction = {
            'ArrowUp': 0,
            'ArrowDown': 1,
            'ArrowLeft': 2,
            'ArrowRight': 3
        }[event.key];
        
        this.runtime.module._kryon_web_navigate_direction(direction);
    }
    
    announceToScreenReader(message) {
        this.liveRegion.textContent = message;
    }
}
```

---

The Kryon Web Runtime provides a comprehensive solution for deploying high-performance applications to the web while maintaining compatibility with modern web standards and best practices. By leveraging WebAssembly, Progressive Web App features, and careful optimization, developers can create web applications that rival native desktop performance while remaining accessible and secure.
