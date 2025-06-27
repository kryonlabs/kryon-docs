# Desktop Runtime

The Kryon Desktop Runtime provides native integration with Windows, macOS, and Linux desktop environments. It offers full-featured UI capabilities, hardware acceleration, and deep OS integration for creating professional desktop applications.

## Platform Support

### Windows Runtime

Native Windows integration using Win32 and modern Windows APIs:

```
Windows Support Matrix:
├── Windows 10 (1903+): Full support
├── Windows 11: Full support with enhanced features
├── Windows Server 2019+: Full support
├── Windows 8.1: Limited support (deprecated)
└── Windows 7: Not supported

Windows Features:
├── Win32 window management
├── DirectX 11/12 rendering
├── Windows Presentation Foundation (WPF) integration
├── Universal Windows Platform (UWP) support
├── Windows Runtime (WinRT) APIs
├── File system integration (NTFS, ReFS)
├── Windows notifications and taskbar
└── Accessibility framework integration
```

#### Windows Integration Example

```c
// Windows-specific runtime initialization
#include <windows.h>
#include <d3d11.h>
#include <kryon/desktop.h>

typedef struct kryon_windows_config {
    HINSTANCE hInstance;
    LPCWSTR window_class;
    LPCWSTR window_title;
    int window_width;
    int window_height;
    bool enable_dwm_composition;
    bool enable_dark_mode;
    ID3D11Device* d3d_device;
} kryon_windows_config_t;

kryon_result_t create_windows_app(const char* krb_path) {
    // Initialize Windows-specific configuration
    kryon_windows_config_t win_config = {
        .hInstance = GetModuleHandle(NULL),
        .window_class = L"KryonDesktopApp",
        .window_title = L"My Kryon Application",
        .window_width = 1024,
        .window_height = 768,
        .enable_dwm_composition = true,
        .enable_dark_mode = true,
        .d3d_device = NULL  // Let runtime create device
    };
    
    // Create Kryon configuration
    kryon_config_t config = kryon_get_default_config(KRYON_PLATFORM_WINDOWS);
    config.platform_data = &win_config;
    config.renderer_type = KRYON_RENDERER_D3D11;
    config.enable_gpu_acceleration = true;
    config.target_fps = 60;
    
    // Initialize runtime
    kryon_runtime_t* runtime;
    kryon_result_t result = kryon_init(&config, &runtime);
    if (result != KRYON_SUCCESS) return result;
    
    // Load application
    kryon_app_t* app;
    result = kryon_load_app(runtime, krb_path, &app);
    if (result != KRYON_SUCCESS) {
        kryon_runtime_destroy(runtime);
        return result;
    }
    
    // Run main message loop
    result = kryon_run_app(app);
    
    // Cleanup
    kryon_app_destroy(app);
    kryon_runtime_destroy(runtime);
    
    return result;
}

// Custom message handling
LRESULT CALLBACK kryon_window_proc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    kryon_app_t* app = (kryon_app_t*)GetWindowLongPtr(hwnd, GWLP_USERDATA);
    
    switch (msg) {
        case WM_SIZE: {
            int width = LOWORD(lParam);
            int height = HIWORD(lParam);
            kryon_resize(app, width, height);
            return 0;
        }
        
        case WM_PAINT: {
            PAINTSTRUCT ps;
            HDC hdc = BeginPaint(hwnd, &ps);
            kryon_render(app);
            EndPaint(hwnd, &ps);
            return 0;
        }
        
        case WM_LBUTTONDOWN: {
            int x = GET_X_LPARAM(lParam);
            int y = GET_Y_LPARAM(lParam);
            kryon_event_t event = {
                .type = KRYON_EVENT_MOUSE_DOWN,
                .mouse = { .x = x, .y = y, .button = KRYON_MOUSE_LEFT }
            };
            kryon_handle_event(app, &event);
            return 0;
        }
        
        case WM_KEYDOWN: {
            kryon_event_t event = {
                .type = KRYON_EVENT_KEY_DOWN,
                .key = { .code = (int)wParam, .modifiers = kryon_get_modifiers() }
            };
            kryon_handle_event(app, &event);
            return 0;
        }
        
        case WM_CLOSE:
            PostQuitMessage(0);
            return 0;
    }
    
    return DefWindowProc(hwnd, msg, wParam, lParam);
}
```

### macOS Runtime

Native macOS integration using Cocoa and modern macOS frameworks:

```
macOS Support Matrix:
├── macOS 12 Monterey: Full support
├── macOS 13 Ventura: Full support with enhanced features
├── macOS 14 Sonoma: Full support
├── macOS 11 Big Sur: Full support
└── macOS 10.15 Catalina: Limited support (deprecated)

macOS Features:
├── Cocoa application framework
├── Metal rendering pipeline
├── Core Animation integration
├── macOS window management
├── Menu bar and dock integration
├── Notification Center support
├── Accessibility framework (VoiceOver)
├── Sandboxing and App Store compatibility
└── Universal Binary support (Intel + Apple Silicon)
```

#### macOS Integration Example

```objc
// macOS-specific runtime implementation
#import <Cocoa/Cocoa.h>
#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>
#include <kryon/desktop.h>

@interface KryonAppDelegate : NSObject <NSApplicationDelegate>
@property (strong) NSWindow* window;
@property (assign) kryon_app_t* app;
@end

@implementation KryonAppDelegate

- (void)applicationDidFinishLaunching:(NSNotification*)notification {
    // Create main window
    NSRect frame = NSMakeRect(100, 100, 1024, 768);
    self.window = [[NSWindow alloc] 
        initWithContentRect:frame
                  styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | 
                           NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable
                    backing:NSBackingStoreBuffered
                      defer:NO];
    
    self.window.title = @"My Kryon Application";
    [self.window makeKeyAndOrderFront:nil];
    
    // Initialize Kryon
    kryon_macos_config_t macos_config = {
        .window = (__bridge void*)self.window,
        .metal_device = MTLCreateSystemDefaultDevice(),
        .enable_retina = YES,
        .enable_dark_mode = YES
    };
    
    kryon_config_t config = kryon_get_default_config(KRYON_PLATFORM_MACOS);
    config.platform_data = &macos_config;
    config.renderer_type = KRYON_RENDERER_METAL;
    config.enable_gpu_acceleration = true;
    
    kryon_runtime_t* runtime;
    kryon_init(&config, &runtime);
    
    // Load application
    NSString* krbPath = [[NSBundle mainBundle] pathForResource:@"app" ofType:@"krb"];
    kryon_load_app(runtime, [krbPath UTF8String], &self.app);
    
    // Setup render loop
    CVDisplayLinkRef displayLink;
    CVDisplayLinkCreateWithActiveCGDisplays(&displayLink);
    CVDisplayLinkSetOutputCallback(displayLink, renderCallback, (__bridge void*)self);
    CVDisplayLinkStart(displayLink);
}

CVReturn renderCallback(CVDisplayLinkRef displayLink,
                       const CVTimeStamp* now,
                       const CVTimeStamp* outputTime,
                       CVOptionFlags flagsIn,
                       CVOptionFlags* flagsOut,
                       void* displayLinkContext) {
    @autoreleasepool {
        KryonAppDelegate* delegate = (__bridge KryonAppDelegate*)displayLinkContext;
        
        double deltaTime = (double)(outputTime->videoTime - now->videoTime) / 
                          (double)outputTime->videoTimeScale;
        
        kryon_update(delegate.app, (float)deltaTime);
        kryon_render(delegate.app);
    }
    
    return kCVReturnSuccess;
}

@end

// Application entry point
int main(int argc, const char* argv[]) {
    @autoreleasepool {
        NSApplication* app = [NSApplication sharedApplication];
        app.delegate = [[KryonAppDelegate alloc] init];
        [app setActivationPolicy:NSApplicationActivationPolicyRegular];
        [app run];
    }
    return 0;
}
```

### Linux Runtime

Cross-distribution Linux support using X11, Wayland, and modern Linux APIs:

```
Linux Support Matrix:
├── Ubuntu 20.04+ LTS: Full support
├── Fedora 35+: Full support
├── Debian 11+: Full support
├── Arch Linux: Full support (rolling)
├── openSUSE 15.4+: Full support
├── CentOS 8+: Full support
└── Other distributions: Best effort

Linux Features:
├── X11 and Wayland support
├── OpenGL and Vulkan rendering
├── GTK+ and Qt integration options
├── Freedesktop.org standards compliance
├── Package manager integration
├── D-Bus system integration
├── Accessibility framework (ATK)
├── Flatpak and Snap packaging
└── Hardware acceleration (Mesa, NVIDIA, AMD)
```

#### Linux Integration Example

```c
// Linux-specific runtime implementation
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <GL/glx.h>
#include <kryon/desktop.h>

typedef struct kryon_linux_config {
    Display* display;
    Window window;
    GLXContext gl_context;
    const char* window_title;
    int window_width;
    int window_height;
    bool enable_compositing;
    kryon_linux_wm_t window_manager; // X11, Wayland, etc.
} kryon_linux_config_t;

kryon_result_t create_linux_app(const char* krb_path) {
    // Initialize X11 display
    Display* display = XOpenDisplay(NULL);
    if (!display) {
        return KRYON_ERROR_PLATFORM_UNAVAILABLE;
    }
    
    // Create window
    int screen = DefaultScreen(display);
    Window root = DefaultRootWindow(display);
    
    XSetWindowAttributes attrs = {0};
    attrs.background_pixel = BlackPixel(display, screen);
    attrs.event_mask = ExposureMask | KeyPressMask | ButtonPressMask | 
                      StructureNotifyMask | PointerMotionMask;
    
    Window window = XCreateWindow(
        display, root,
        100, 100, 1024, 768, 0,
        DefaultDepth(display, screen),
        InputOutput,
        DefaultVisual(display, screen),
        CWBackPixel | CWEventMask,
        &attrs
    );
    
    XStoreName(display, window, "My Kryon Application");
    XMapWindow(display, window);
    
    // Create OpenGL context
    GLint gl_attrs[] = {
        GLX_RGBA,
        GLX_DEPTH_SIZE, 24,
        GLX_DOUBLEBUFFER,
        None
    };
    
    XVisualInfo* visual = glXChooseVisual(display, screen, gl_attrs);
    GLXContext gl_context = glXCreateContext(display, visual, NULL, GL_TRUE);
    glXMakeCurrent(display, window, gl_context);
    
    // Initialize Kryon
    kryon_linux_config_t linux_config = {
        .display = display,
        .window = window,
        .gl_context = gl_context,
        .window_title = "My Kryon Application",
        .window_width = 1024,
        .window_height = 768,
        .enable_compositing = true,
        .window_manager = KRYON_LINUX_WM_X11
    };
    
    kryon_config_t config = kryon_get_default_config(KRYON_PLATFORM_LINUX);
    config.platform_data = &linux_config;
    config.renderer_type = KRYON_RENDERER_OPENGL;
    config.enable_gpu_acceleration = true;
    
    kryon_runtime_t* runtime;
    kryon_result_t result = kryon_init(&config, &runtime);
    if (result != KRYON_SUCCESS) {
        XCloseDisplay(display);
        return result;
    }
    
    // Load application
    kryon_app_t* app;
    result = kryon_load_app(runtime, krb_path, &app);
    if (result != KRYON_SUCCESS) {
        kryon_runtime_destroy(runtime);
        XCloseDisplay(display);
        return result;
    }
    
    // Main event loop
    XEvent event;
    bool running = true;
    
    while (running) {
        while (XPending(display)) {
            XNextEvent(display, &event);
            
            switch (event.type) {
                case Expose:
                    kryon_render(app);
                    glXSwapBuffers(display, window);
                    break;
                    
                case KeyPress: {
                    KeySym key = XLookupKeysym(&event.xkey, 0);
                    kryon_event_t kryon_event = {
                        .type = KRYON_EVENT_KEY_DOWN,
                        .key = { .code = (int)key, .modifiers = event.xkey.state }
                    };
                    kryon_handle_event(app, &kryon_event);
                    break;
                }
                
                case ButtonPress: {
                    kryon_event_t kryon_event = {
                        .type = KRYON_EVENT_MOUSE_DOWN,
                        .mouse = { 
                            .x = event.xbutton.x, 
                            .y = event.xbutton.y,
                            .button = event.xbutton.button 
                        }
                    };
                    kryon_handle_event(app, &kryon_event);
                    break;
                }
                
                case ConfigureNotify:
                    kryon_resize(app, event.xconfigure.width, event.xconfigure.height);
                    break;
                    
                case ClientMessage:
                    running = false;
                    break;
            }
        }
        
        // Update and render
        kryon_update(app, 1.0f / 60.0f); // 60 FPS target
        kryon_render(app);
        glXSwapBuffers(display, window);
        
        usleep(16667); // ~60 FPS
    }
    
    // Cleanup
    kryon_app_destroy(app);
    kryon_runtime_destroy(runtime);
    glXDestroyContext(display, gl_context);
    XDestroyWindow(display, window);
    XCloseDisplay(display);
    
    return KRYON_SUCCESS;
}
```

## Graphics Integration

### Rendering Backends

Desktop runtime supports multiple high-performance rendering backends:

```
Rendering Backend Support:
├── Windows
│   ├── DirectX 11 (primary)
│   ├── DirectX 12 (modern hardware)
│   ├── OpenGL 4.5+ (compatibility)
│   └── Vulkan (experimental)
├── macOS
│   ├── Metal (primary)
│   ├── OpenGL 4.1 (deprecated by Apple)
│   └── Vulkan via MoltenVK
├── Linux
│   ├── OpenGL 4.5+ (primary)
│   ├── Vulkan (modern hardware)
│   ├── Mesa software rendering (fallback)
│   └── Hardware-specific optimizations
└── Cross-platform
    ├── OpenGL ES 3.2 (compatibility)
    ├── WebGL 2.0 (embedded browsers)
    └── Software rendering (fallback)

Performance Characteristics:
├── DirectX 11: 1000+ FPS simple UI, 120+ FPS complex
├── DirectX 12: 1200+ FPS simple UI, 150+ FPS complex
├── Metal: 800+ FPS simple UI, 100+ FPS complex
├── OpenGL: 600+ FPS simple UI, 80+ FPS complex
├── Vulkan: 1100+ FPS simple UI, 140+ FPS complex
└── Software: 60+ FPS simple UI, 15+ FPS complex
```

### Hardware Acceleration

```c
// GPU acceleration configuration
typedef struct kryon_gpu_config {
    bool enable_hardware_acceleration;
    kryon_gpu_vendor_t preferred_vendor; // NVIDIA, AMD, Intel, Apple
    int device_index;                    // Multi-GPU selection
    size_t vram_limit;                   // Video memory limit
    bool enable_unified_memory;          // Unified memory architecture
    kryon_gpu_profile_t performance_profile; // Power vs performance
} kryon_gpu_config_t;

// Query available GPUs
kryon_result_t kryon_enumerate_gpus(kryon_gpu_info_t** gpus, size_t* count) {
    // Platform-specific GPU enumeration
    #ifdef _WIN32
        return kryon_enumerate_dxgi_adapters(gpus, count);
    #elif defined(__APPLE__)
        return kryon_enumerate_metal_devices(gpus, count);
    #else
        return kryon_enumerate_opengl_devices(gpus, count);
    #endif
}

// Select optimal GPU
kryon_gpu_info_t* kryon_select_optimal_gpu(const kryon_gpu_info_t* gpus, 
                                          size_t count,
                                          const kryon_gpu_config_t* config) {
    kryon_gpu_info_t* best = NULL;
    int best_score = 0;
    
    for (size_t i = 0; i < count; i++) {
        int score = 0;
        
        // Prefer discrete over integrated
        if (gpus[i].type == KRYON_GPU_DISCRETE) score += 1000;
        
        // Prefer more VRAM
        score += (int)(gpus[i].vram_size / (1024 * 1024)); // MB
        
        // Prefer vendor preference
        if (gpus[i].vendor == config->preferred_vendor) score += 500;
        
        // Prefer newer architectures
        score += gpus[i].compute_units * 10;
        
        if (score > best_score) {
            best_score = score;
            best = (kryon_gpu_info_t*)&gpus[i];
        }
    }
    
    return best;
}
```

### Display Management

```c
// Multi-monitor support
typedef struct kryon_display_info {
    int display_id;
    char name[256];
    int x, y;                    // Position in virtual desktop
    int width, height;           // Resolution
    int physical_width_mm;       // Physical dimensions
    int physical_height_mm;
    float dpi_x, dpi_y;         // DPI scaling
    int refresh_rate;            // Hz
    kryon_display_rotation_t rotation;
    bool is_primary;
} kryon_display_info_t;

// Enumerate displays
kryon_result_t kryon_enumerate_displays(kryon_display_info_t** displays, size_t* count);

// Window positioning across displays
kryon_result_t kryon_position_window(kryon_app_t* app, 
                                    int display_id, 
                                    int x, int y, 
                                    int width, int height) {
    kryon_display_info_t* displays;
    size_t display_count;
    kryon_enumerate_displays(&displays, &display_count);
    
    // Find target display
    kryon_display_info_t* target = NULL;
    for (size_t i = 0; i < display_count; i++) {
        if (displays[i].display_id == display_id) {
            target = &displays[i];
            break;
        }
    }
    
    if (!target) return KRYON_ERROR_INVALID_PARAMETER;
    
    // Adjust coordinates for display offset
    int absolute_x = target->x + x;
    int absolute_y = target->y + y;
    
    // Apply DPI scaling
    int scaled_x = (int)(absolute_x * target->dpi_x / 96.0f);
    int scaled_y = (int)(absolute_y * target->dpi_y / 96.0f);
    int scaled_width = (int)(width * target->dpi_x / 96.0f);
    int scaled_height = (int)(height * target->dpi_y / 96.0f);
    
    return kryon_set_window_bounds(app, scaled_x, scaled_y, scaled_width, scaled_height);
}

// DPI awareness
kryon_result_t kryon_set_dpi_awareness(kryon_app_t* app, kryon_dpi_awareness_t awareness) {
    #ifdef _WIN32
        HRESULT hr;
        switch (awareness) {
            case KRYON_DPI_UNAWARE:
                hr = SetProcessDpiAwareness(PROCESS_DPI_UNAWARE);
                break;
            case KRYON_DPI_SYSTEM_AWARE:
                hr = SetProcessDpiAwareness(PROCESS_SYSTEM_DPI_AWARE);
                break;
            case KRYON_DPI_PER_MONITOR_AWARE:
                hr = SetProcessDpiAwareness(PROCESS_PER_MONITOR_DPI_AWARE);
                break;
            default:
                return KRYON_ERROR_INVALID_PARAMETER;
        }
        return SUCCEEDED(hr) ? KRYON_SUCCESS : KRYON_ERROR_PLATFORM_FAILED;
    #elif defined(__APPLE__)
        // macOS handles DPI automatically with Retina displays
        return KRYON_SUCCESS;
    #else
        // Linux: Set scale factor based on display DPI
        kryon_display_info_t* display = kryon_get_primary_display();
        float scale = display->dpi_x / 96.0f;
        return kryon_set_ui_scale(app, scale);
    #endif
}
```

## System Integration

### File System Integration

```c
// Native file dialogs
typedef struct kryon_file_dialog_config {
    const char* title;
    const char* default_path;
    const char* default_filename;
    kryon_file_filter_t* filters;  // File type filters
    size_t filter_count;
    bool allow_multiple_selection;
    bool create_prompt_if_missing;
} kryon_file_dialog_config_t;

kryon_result_t kryon_show_open_file_dialog(const kryon_file_dialog_config_t* config,
                                          char``` file_paths,
                                          size_t* file_count) {
    #ifdef _WIN32
        OPENFILENAMEW ofn = {0};
        WCHAR file_buffer[32768] = {0};
        WCHAR filter_buffer[1024] = {0};
        
        // Build filter string
        WCHAR* filter_ptr = filter_buffer;
        for (size_t i = 0; i < config->filter_count; i++) {
            int len = MultiByteToWideChar(CP_UTF8, 0, config->filters[i].name, -1, 
                                        filter_ptr, 512);
            filter_ptr += len;
            len = MultiByteToWideChar(CP_UTF8, 0, config->filters[i].pattern, -1, 
                                    filter_ptr, 512);
            filter_ptr += len;
        }
        
        ofn.lStructSize = sizeof(ofn);
        ofn.lpstrFile = file_buffer;
        ofn.nMaxFile = sizeof(file_buffer) / sizeof(WCHAR);
        ofn.lpstrFilter = filter_buffer;
        ofn.nFilterIndex = 1;
        ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST;
        
        if (config->allow_multiple_selection) {
            ofn.Flags |= OFN_ALLOWMULTISELECT | OFN_EXPLORER;
        }
        
        if (GetOpenFileNameW(&ofn)) {
            // Parse selected files
            return kryon_parse_win32_file_list(file_buffer, file_paths, file_count);
        }
        
        return KRYON_ERROR_USER_CANCELLED;
        
    #elif defined(__APPLE__)
        return kryon_show_cocoa_open_panel(config, file_paths, file_count);
    #else
        return kryon_show_gtk_file_chooser(config, file_paths, file_count);
    #endif
}

// Directory operations
kryon_result_t kryon_create_directory(const char* path, bool create_parents) {
    #ifdef _WIN32
        if (create_parents) {
            return SHCreateDirectoryExA(NULL, path, NULL) == ERROR_SUCCESS ? 
                   KRYON_SUCCESS : KRYON_ERROR_FILE_IO;
        } else {
            return CreateDirectoryA(path, NULL) ? KRYON_SUCCESS : KRYON_ERROR_FILE_IO;
        }
    #else
        if (create_parents) {
            // Implement recursive directory creation
            char* path_copy = strdup(path);
            char* p = path_copy;
            
            while ((p = strchr(p + 1, '/')) != NULL) {
                *p = '\0';
                mkdir(path_copy, 0755);
                *p = '/';
            }
            
            int result = mkdir(path_copy, 0755);
            free(path_copy);
            return result == 0 ? KRYON_SUCCESS : KRYON_ERROR_FILE_IO;
        } else {
            return mkdir(path, 0755) == 0 ? KRYON_SUCCESS : KRYON_ERROR_FILE_IO;
        }
    #endif
}

// File monitoring
kryon_result_t kryon_watch_directory(const char* path,
                                    kryon_file_change_callback_t callback,
                                    void* user_data,
                                    kryon_file_watcher_t** watcher) {
    #ifdef _WIN32
        return kryon_create_win32_directory_watcher(path, callback, user_data, watcher);
    #elif defined(__APPLE__)
        return kryon_create_fsevents_watcher(path, callback, user_data, watcher);
    #else
        return kryon_create_inotify_watcher(path, callback, user_data, watcher);
    #endif
}
```

### System Services Integration

```c
// Notification system
typedef struct kryon_notification {
    const char* title;
    const char* message;
    const char* icon_path;
    int timeout_ms;                // 0 = persistent
    kryon_notification_priority_t priority;
    kryon_notification_callback_t callback;
    void* user_data;
} kryon_notification_t;

kryon_result_t kryon_show_notification(const kryon_notification_t* notification) {
    #ifdef _WIN32
        return kryon_show_toast_notification(notification);
    #elif defined(__APPLE__)
        return kryon_show_user_notification(notification);
    #else
        return kryon_show_libnotify_notification(notification);
    #endif
}

// System tray integration
typedef struct kryon_system_tray {
    const char* tooltip;
    const char* icon_path;
    kryon_menu_t* context_menu;
    kryon_tray_callback_t callback;
    void* user_data;
} kryon_system_tray_t;

kryon_result_t kryon_create_system_tray(const kryon_system_tray_t* config,
                                       kryon_tray_handle_t** handle) {
    #ifdef _WIN32
        return kryon_create_shell_notify_icon(config, handle);
    #elif defined(__APPLE__)
        return kryon_create_status_bar_item(config, handle);
    #else
        return kryon_create_status_notifier_item(config, handle);
    #endif
}

// Registry/preferences integration
kryon_result_t kryon_get_setting(const char* key, kryon_value_t* value) {
    #ifdef _WIN32
        return kryon_read_registry_value(HKEY_CURRENT_USER, 
                                       L"Software\\MyApp\\Settings", 
                                       key, value);
    #elif defined(__APPLE__)
        return kryon_read_user_defaults(key, value);
    #else
        return kryon_read_gsettings_value(key, value);
    #endif
}

kryon_result_t kryon_set_setting(const char* key, const kryon_value_t* value) {
    #ifdef _WIN32
        return kryon_write_registry_value(HKEY_CURRENT_USER, 
                                        L"Software\\MyApp\\Settings", 
                                        key, value);
    #elif defined(__APPLE__)
        return kryon_write_user_defaults(key, value);
    #else
        return kryon_write_gsettings_value(key, value);
    #endif
}
```

## Performance Optimization

### Desktop-Specific Optimizations

```
Desktop Performance Tuning:
├── Memory Management
│   ├── Use large memory pools (8-16MB)
│   ├── Enable memory mapped files
│   ├── Cache aggressively (desktop has more RAM)
│   └── Use system memory allocators
├── GPU Utilization
│   ├── Prefer discrete GPUs over integrated
│   ├── Use dedicated VRAM for textures
│   ├── Enable GPU command buffering
│   └── Optimize for high refresh rates (120Hz+)
├── CPU Optimization
│   ├── Use multiple cores for parallel processing
│   ├── Optimize for branch prediction
│   ├── Use SIMD instructions (SSE/AVX)
│   └── Enable CPU-specific optimizations
├── Storage Optimization
│   ├── Use NVMe SSD optimizations
│   ├── Prefetch resources based on usage
│   ├── Cache compiled assets on disk
│   └── Use memory-mapped file I/O
└── Network Optimization
    ├── Use system HTTP stack
    ├── Enable compression and caching
    ├── Parallelize resource downloads
    └── Implement smart prefetching
```

#### Desktop Memory Configuration

```c
// Optimized memory configuration for desktop
kryon_config_t kryon_get_desktop_config(void) {
    kryon_config_t config = {0};
    
    // Desktop systems typically have abundant memory
    config.max_memory = 256 * 1024 * 1024;     // 256MB
    config.cache_size = 64 * 1024 * 1024;      // 64MB cache
    config.enable_memory_pools = true;
    
    // Aggressive caching for better performance
    config.string_cache_size = 8 * 1024 * 1024;   // 8MB strings
    config.texture_cache_size = 128 * 1024 * 1024; // 128MB textures
    config.layout_cache_size = 16 * 1024 * 1024;   // 16MB layouts
    
    // Enable all optimizations
    config.enable_gpu_acceleration = true;
    config.enable_multithreading = true;
    config.enable_simd = true;
    config.enable_async_loading = true;
    
    // Desktop-specific features
    config.enable_file_monitoring = true;
    config.enable_background_loading = true;
    config.enable_predictive_caching = true;
    
    return config;
}

// Thread pool configuration for desktop
kryon_result_t kryon_configure_thread_pool(kryon_runtime_t* runtime) {
    int cpu_count = kryon_get_cpu_count();
    int thread_count = max(2, min(cpu_count - 1, 8)); // Leave one core free
    
    kryon_thread_pool_config_t pool_config = {
        .thread_count = thread_count,
        .priority = KRYON_THREAD_PRIORITY_NORMAL,
        .affinity_mask = 0, // Let OS decide
        .enable_work_stealing = true
    };
    
    return kryon_set_thread_pool_config(runtime, &pool_config);
}
```

### Profiling and Debugging

```c
// Desktop-specific profiling tools
typedef struct kryon_desktop_profile {
    // CPU profiling
    uint64_t cpu_time_total;
    uint64_t cpu_time_update;
    uint64_t cpu_time_render;
    uint64_t cpu_time_script;
    
    // GPU profiling
    uint64_t gpu_time_total;
    uint64_t gpu_memory_used;
    uint64_t gpu_memory_peak;
    int gpu_command_count;
    
    // Memory profiling
    size_t memory_used;
    size_t memory_peak;
    int allocation_count;
    int deallocation_count;
    size_t fragmentation_bytes;
    
    // I/O profiling
    uint64_t file_read_bytes;
    uint64_t file_write_bytes;
    int file_operations;
    
    // System profiling
    double cpu_usage_percent;
    double memory_usage_percent;
    double gpu_usage_percent;
} kryon_desktop_profile_t;

kryon_result_t kryon_start_profiling(kryon_app_t* app, kryon_profile_flags_t flags) {
    #ifdef _WIN32
        if (flags & KRYON_PROFILE_CPU) {
            return kryon_start_etw_profiling(app);
        }
    #elif defined(__APPLE__)
        if (flags & KRYON_PROFILE_CPU) {
            return kryon_start_instruments_profiling(app);
        }
    #else
        if (flags & KRYON_PROFILE_CPU) {
            return kryon_start_perf_profiling(app);
        }
    #endif
    
    return KRYON_SUCCESS;
}

// Export profiling data
kryon_result_t kryon_export_profile(kryon_app_t* app, 
                                   const char* filename, 
                                   kryon_profile_format_t format) {
    kryon_desktop_profile_t profile;
    kryon_get_profile_data(app, &profile);
    
    switch (format) {
        case KRYON_PROFILE_JSON:
            return kryon_export_profile_json(&profile, filename);
        case KRYON_PROFILE_CSV:
            return kryon_export_profile_csv(&profile, filename);
        case KRYON_PROFILE_CHROME_TRACE:
            return kryon_export_chrome_trace(&profile, filename);
        default:
            return KRYON_ERROR_INVALID_PARAMETER;
    }
}
```

## Packaging and Distribution

### Application Packaging

```
Desktop Packaging Options:
├── Windows
│   ├── MSI Installer (Windows Installer)
│   ├── MSIX Package (Microsoft Store)
│   ├── Portable executable
│   ├── ClickOnce deployment
│   └── Third-party installers (NSIS, InnoSetup)
├── macOS
│   ├── Application Bundle (.app)
│   ├── PKG Installer
│   ├── DMG Disk Image
│   ├── Mac App Store package
│   └── Homebrew formula
├── Linux
│   ├── DEB package (Debian/Ubuntu)
│   ├── RPM package (Red Hat/SUSE)
│   ├── Flatpak package
│   ├── Snap package
│   ├── AppImage
│   └── Native package (tarballs)
└── Cross-platform
    ├── Electron wrapper
    ├── Tauri bundle
    ├── Custom installer
    └── Docker container
```

#### Windows Packaging Example

```xml
<!-- MSI package configuration -->
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" 
           Name="My Kryon Application" 
           Language="1033" 
           Version="1.0.0" 
           Manufacturer="My Company" 
           UpgradeCode="12345678-1234-1234-1234-123456789012">
    
    <Package InstallerVersion="200" 
             Compressed="yes" 
             InstallScope="perMachine" />
    
    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />
    
    <MediaTemplate EmbedCab="yes" />
    
    <Feature Id="ProductFeature" Title="Main Application" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>
    
    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFilesFolder">
        <Directory Id="INSTALLFOLDER" Name="MyKryonApp" />
      </Directory>
    </Directory>
    
    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="MainExecutable">
        <File Source="$(var.SourceDir)\MyKryonApp.exe" />
        <File Source="$(var.SourceDir)\app.krb" />
        <File Source="$(var.SourceDir)\kryon-runtime.dll" />
      </Component>
      
      <Component Id="VisualCppRedist">
        <File Source="$(var.SourceDir)\vcredist_x64.exe" />
      </Component>
    </ComponentGroup>
    
    <Property Id="WIXUI_INSTALLDIR" Value="INSTALLFOLDER" />
    <UIRef Id="WixUI_InstallDir" />
  </Product>
</Wix>
```

#### macOS Packaging Example

```bash
#!/bin/bash
# macOS app bundle creation script

APP_NAME="MyKryonApp"
BUNDLE_ID="com.mycompany.mykryonapp"
VERSION="1.0.0"

# Create app bundle structure
mkdir -p "${APP_NAME}.app/Contents/MacOS"
mkdir -p "${APP_NAME}.app/Contents/Resources"
mkdir -p "${APP_NAME}.app/Contents/Frameworks"

# Copy executable and resources
cp build/MyKryonApp "${APP_NAME}.app/Contents/MacOS/"
cp app.krb "${APP_NAME}.app/Contents/Resources/"
cp assets/* "${APP_NAME}.app/Contents/Resources/"

# Copy Kryon runtime framework
cp -R kryon-runtime.framework "${APP_NAME}.app/Contents/Frameworks/"

# Create Info.plist
cat > "${APP_NAME}.app/Contents/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
                       "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleVersion</key>
    <string>${VERSION}</string>
    <key>CFBundleExecutable</key>
    <string>MyKryonApp</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

# Sign the application (if certificates available)
if [ -n "$SIGNING_IDENTITY" ]; then
    codesign --deep --force --verify --verbose --sign "$SIGNING_IDENTITY" "${APP_NAME}.app"
fi

# Create DMG
hdiutil create -volname "${APP_NAME}" -srcfolder "${APP_NAME}.app" -ov -format UDZO "${APP_NAME}-${VERSION}.dmg"
```

### Auto-Update System

```c
// Cross-platform auto-update system
typedef struct kryon_update_config {
    const char* update_server_url;
    const char* current_version;
    const char* update_channel;     // stable, beta, alpha
    bool check_on_startup;
    int check_interval_hours;
    bool auto_download;
    bool auto_install;
    kryon_update_callback_t callback;
    void* user_data;
} kryon_update_config_t;

kryon_result_t kryon_check_for_updates(const kryon_update_config_t* config,
                                      kryon_update_info_t** update_info) {
    // Construct update check URL
    char url[1024];
    snprintf(url, sizeof(url), "%s/check?version=%s&channel=%s&platform=%s",
             config->update_server_url,
             config->current_version,
             config->update_channel,
             kryon_get_platform_string());
    
    // Make HTTP request
    kryon_http_request_t request = {
        .url = url,
        .method = KRYON_HTTP_GET,
        .timeout_ms = 30000
    };
    
    kryon_http_response_t response;
    kryon_result_t result = kryon_http_request(&request, &response);
    if (result != KRYON_SUCCESS) return result;
    
    // Parse JSON response
    if (response.status_code == 200) {
        return kryon_parse_update_response(response.body, update_info);
    } else if (response.status_code == 204) {
        *update_info = NULL; // No updates available
        return KRYON_SUCCESS;
    }
    
    return KRYON_ERROR_UPDATE_CHECK_FAILED;
}

// Download and install update
kryon_result_t kryon_install_update(const kryon_update_info_t* update_info,
                                   kryon_progress_callback_t progress_callback) {
    // Download update package
    kryon_result_t result = kryon_download_file(update_info->download_url,
                                              update_info->local_path,
                                              progress_callback);
    if (result != KRYON_SUCCESS) return result;
    
    // Verify package integrity
    result = kryon_verify_update_package(update_info);
    if (result != KRYON_SUCCESS) return result;
    
    // Platform-specific installation
    #ifdef _WIN32
        return kryon_install_msi_update(update_info);
    #elif defined(__APPLE__)
        return kryon_install_pkg_update(update_info);
    #else
        return kryon_install_linux_update(update_info);
    #endif
}
```

## Best Practices

### 1. Platform-Specific Optimizations

```c
// Detect and optimize for specific platform features
kryon_result_t kryon_optimize_for_platform(kryon_app_t* app) {
    kryon_platform_info_t platform_info;
    kryon_get_platform_info(&platform_info);
    
    #ifdef _WIN32
    // Windows-specific optimizations
    if (platform_info.windows.version >= KRYON_WINDOWS_10) {
        // Enable DirectX 12 if available
        if (platform_info.windows.has_dx12) {
            kryon_set_renderer(app, KRYON_RENDERER_D3D12);
        }
        
        // Use Windows 10 features
        kryon_enable_windows10_features(app);
    }
    
    // Enable high DPI support
    kryon_set_dpi_awareness(app, KRYON_DPI_PER_MONITOR_AWARE);
    
    #elif defined(__APPLE__)
    // macOS-specific optimizations
    if (platform_info.macos.version >= KRYON_MACOS_12) {
        // Use Metal performance shaders
        kryon_enable_metal_performance_shaders(app);
    }
    
    // Optimize for Retina displays
    if (platform_info.macos.has_retina) {
        kryon_set_content_scale_factor(app, 2.0f);
    }
    
    // Apple Silicon optimizations
    if (platform_info.macos.architecture == KRYON_ARCH_ARM64) {
        kryon_enable_unified_memory_optimizations(app);
    }
    
    #else
    // Linux-specific optimizations
    if (platform_info.linux.desktop_environment == KRYON_DE_GNOME) {
        kryon_enable_gnome_integration(app);
    } else if (platform_info.linux.desktop_environment == KRYON_DE_KDE) {
        kryon_enable_kde_integration(app);
    }
    
    // Wayland vs X11 optimizations
    if (platform_info.linux.display_server == KRYON_DISPLAY_WAYLAND) {
        kryon_enable_wayland_optimizations(app);
    }
    #endif
    
    return KRYON_SUCCESS;
}
```

### 2. Resource Management

```c
// Efficient resource management for desktop apps
typedef struct kryon_resource_manager {
    kryon_cache_t* texture_cache;
    kryon_cache_t* font_cache;
    kryon_cache_t* audio_cache;
    kryon_thread_pool_t* loader_pool;
    bool enable_background_loading;
} kryon_resource_manager_t;

kryon_result_t kryon_create_resource_manager(kryon_resource_manager_t** manager) {
    kryon_resource_manager_t* rm = malloc(sizeof(kryon_resource_manager_t));
    
    // Create large caches for desktop
    kryon_cache_create(&rm->texture_cache, 128 * 1024 * 1024); // 128MB
    kryon_cache_create(&rm->font_cache, 16 * 1024 * 1024);     // 16MB
    kryon_cache_create(&rm->audio_cache, 64 * 1024 * 1024);    // 64MB
    
    // Create background loading thread pool
    kryon_thread_pool_config_t pool_config = {
        .thread_count = 2,
        .priority = KRYON_THREAD_PRIORITY_LOW
    };
    kryon_thread_pool_create(&rm->loader_pool, &pool_config);
    
    rm->enable_background_loading = true;
    *manager = rm;
    
    return KRYON_SUCCESS;
}

// Preload resources based on usage patterns
kryon_result_t kryon_preload_resources(kryon_resource_manager_t* manager,
                                      const char** resource_paths,
                                      size_t resource_count) {
    if (!manager->enable_background_loading) {
        // Load synchronously
        for (size_t i = 0; i < resource_count; i++) {
            kryon_load_resource_sync(manager, resource_paths[i]);
        }
    } else {
        // Load asynchronously in background
        for (size_t i = 0; i < resource_count; i++) {
            kryon_load_resource_async(manager, resource_paths[i]);
        }
    }
    
    return KRYON_SUCCESS;
}
```

### 3. Error Handling and Recovery

```c
// Robust error handling for desktop applications
typedef struct kryon_error_recovery {
    kryon_error_handler_t handler;
    void* user_data;
    bool enable_crash_reporting;
    bool enable_auto_recovery;
    const char* crash_dump_path;
} kryon_error_recovery_t;

kryon_result_t kryon_setup_error_recovery(kryon_app_t* app,
                                         const kryon_error_recovery_t* config) {
    #ifdef _WIN32
    // Setup Windows error reporting
    if (config->enable_crash_reporting) {
        SetUnhandledExceptionFilter(kryon_exception_filter);
    }
    #elif defined(__APPLE__)
    // Setup macOS crash reporting
    if (config->enable_crash_reporting) {
        kryon_setup_mach_exception_handler();
    }
    #else
    // Setup Linux signal handlers
    if (config->enable_crash_reporting) {
        signal(SIGSEGV, kryon_signal_handler);
        signal(SIGABRT, kryon_signal_handler);
        signal(SIGFPE, kryon_signal_handler);
    }
    #endif
    
    // Setup application-level error recovery
    kryon_set_error_handler(app, config->handler, config->user_data);
    
    return KRYON_SUCCESS;
}

// Graceful degradation example
kryon_result_t kryon_handle_gpu_context_lost(kryon_app_t* app) {
    kryon_log(KRYON_LOG_WARNING, "GPU context lost, attempting recovery");
    
    // Try to recreate graphics context
    kryon_result_t result = kryon_recreate_graphics_context(app);
    if (result == KRYON_SUCCESS) {
        kryon_log(KRYON_LOG_INFO, "GPU context recovered successfully");
        return KRYON_SUCCESS;
    }
    
    // Fall back to software rendering
    kryon_log(KRYON_LOG_WARNING, "Falling back to software rendering");
    result = kryon_set_renderer(app, KRYON_RENDERER_SOFTWARE);
    if (result == KRYON_SUCCESS) {
        kryon_show_notification_to_user(
            "Performance Notice",
            "Graphics acceleration is unavailable. Using software rendering."
        );
        return KRYON_SUCCESS;
    }
    
    // Last resort: minimal UI
    kryon_log(KRYON_LOG_ERROR, "All rendering options failed, using minimal UI");
    return kryon_enable_minimal_ui_mode(app);
}
```

---

The Desktop Runtime provides comprehensive support for creating high-performance, native desktop applications with full OS integration. By leveraging platform-specific APIs and optimizations, developers can create applications that feel native while maintaining cross-platform compatibility through the unified Kryon API.
