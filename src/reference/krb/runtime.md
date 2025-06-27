# Runtime Integration

This document covers how KRB files are loaded, parsed, and executed by Kryon runtimes. It details the APIs, performance characteristics, and best practices for integrating KRB support into applications and platforms.

## Runtime Architecture

### Loading Pipeline

The KRB loading process follows a multi-stage pipeline optimized for performance:

```
┌─────────────────┐
│   File I/O      │ ← Memory mapping or streaming
├─────────────────┤
│   Validation    │ ← Header verification and checksum
├─────────────────┤
│   Parsing       │ ← Section parsing and indexing
├─────────────────┤
│   Optimization  │ ← Cache setup and pre-computation
├─────────────────┤
│   Instantiation │ ← Element tree creation
├─────────────────┤
│   Rendering     │ ← Layout and draw operations
└─────────────────┘
```

### Memory Management

KRB runtimes employ sophisticated memory management strategies:

```
Memory Allocation Strategy:
├── File Buffer (mmap or read)
│   ├── Read-only sections (strings, properties)
│   └── Shared across instances
├── Runtime Objects  
│   ├── Element instances (reference-counted)
│   ├── Property caches (LRU eviction)
│   └── Event handler bindings
└── Rendering Buffers
    ├── Layout computation cache
    ├── Draw command buffers
    └── GPU resource handles
```

## Loading APIs

### C Runtime API

Core C API for KRB file loading and management:

```c
// File loading
typedef struct krb_file {
    uint32_t version;
    uint32_t flags;
    size_t size;
    void* data;
} krb_file_t;

// Load KRB file from path
krb_result_t krb_load_file(const char* path, krb_file_t** file);

// Load KRB from memory buffer
krb_result_t krb_load_buffer(const void* data, size_t size, krb_file_t** file);

// Validate file integrity
krb_result_t krb_validate(const krb_file_t* file);

// Create application instance
krb_result_t krb_create_app(const krb_file_t* file, krb_app_t** app);

// Cleanup
void krb_file_destroy(krb_file_t* file);
void krb_app_destroy(krb_app_t* app);

// Error handling
const char* krb_error_string(krb_result_t result);
```

### Runtime Instance Management

```c
// Application lifecycle
typedef struct krb_app {
    krb_file_t* file;
    krb_element_t* root;
    krb_context_t* context;
    krb_renderer_t* renderer;
} krb_app_t;

// Initialize runtime context
krb_result_t krb_context_create(krb_context_t** context);

// Set runtime options
krb_result_t krb_context_set_option(krb_context_t* ctx, 
                                   krb_option_t option, 
                                   const void* value);

// Update and render
krb_result_t krb_app_update(krb_app_t* app, float delta_time);
krb_result_t krb_app_render(krb_app_t* app, krb_surface_t* surface);

// Event handling
krb_result_t krb_app_handle_event(krb_app_t* app, const krb_event_t* event);
```

### Element Access API

```c
// Element tree navigation
krb_element_t* krb_app_get_root(const krb_app_t* app);
krb_element_t* krb_element_get_child(const krb_element_t* element, size_t index);
krb_element_t* krb_element_find_by_id(const krb_app_t* app, const char* id);

// Property access
krb_result_t krb_element_get_property(const krb_element_t* element,
                                     krb_property_t property,
                                     krb_value_t* value);

krb_result_t krb_element_set_property(krb_element_t* element,
                                     krb_property_t property,
                                     const krb_value_t* value);

// Dynamic element manipulation
krb_result_t krb_element_add_child(krb_element_t* parent, krb_element_t* child);
krb_result_t krb_element_remove_child(krb_element_t* parent, krb_element_t* child);
krb_result_t krb_element_create(krb_element_type_t type, krb_element_t** element);
```

## Performance Characteristics

### Loading Performance

Typical loading times across different platforms and file sizes:

```
Platform         Small (5KB)   Medium (50KB)   Large (500KB)
Desktop (SSD)    0.8ms         3.2ms          28.4ms
Mobile (ARM)     1.5ms         6.8ms          52.1ms
Web (WASM)       2.1ms         9.4ms          78.6ms
Embedded (MCU)   4.2ms         18.7ms         156.3ms

Breakdown (Medium file on Desktop):
- File I/O:       0.4ms (12%)
- Validation:     0.2ms (6%)
- Parsing:        1.1ms (34%)
- Instantiation:  1.2ms (38%)
- First Render:   0.3ms (10%)
```

### Memory Usage

Memory consumption patterns for loaded KRB applications:

```
Component            Small App    Medium App    Large App
File Buffer          5KB          50KB          500KB
String Table         0.8KB        4.2KB         28.4KB
Element Objects      1.2KB        8.9KB         67.3KB
Property Cache       0.6KB        3.1KB         18.7KB
Rendering Buffers    2.1KB        12.4KB        89.2KB
Total Runtime        9.7KB        78.6KB        703.6KB

Peak Memory (loading): +15% temporary allocation
Steady State:          Base memory usage
Memory Growth:         <1% per hour (minimal leaks)
```

### Rendering Performance

Frame rate characteristics for different complexity levels:

```
UI Complexity        Desktop      Mobile       Web
Simple (10 elements) 1000+ FPS    300+ FPS     200+ FPS
Medium (100 elements) 400+ FPS    120+ FPS     80+ FPS
Complex (1000 elements) 120+ FPS   45+ FPS     25+ FPS

Bottlenecks by complexity:
Simple:  GPU driver overhead
Medium:  Property computation  
Complex: Layout calculation and overdraw
```

## Platform Integration

### Desktop Integration (Windows/macOS/Linux)

```c
// Platform-specific initialization
#ifdef _WIN32
    krb_result_t krb_win32_init(HWND hwnd, krb_context_t** context);
#elif defined(__APPLE__)
    krb_result_t krb_cocoa_init(NSView* view, krb_context_t** context);
#else
    krb_result_t krb_x11_init(Display* display, Window window, krb_context_t** context);
#endif

// Common desktop features
krb_result_t krb_set_window_title(krb_app_t* app, const char* title);
krb_result_t krb_set_window_size(krb_app_t* app, int width, int height);
krb_result_t krb_set_window_resizable(krb_app_t* app, bool resizable);

// File system integration
krb_result_t krb_load_resource(krb_app_t* app, const char* path, krb_resource_t** resource);
krb_result_t krb_save_state(krb_app_t* app, const char* path);
krb_result_t krb_load_state(krb_app_t* app, const char* path);
```

### Mobile Integration (iOS/Android)

```c
// iOS Integration
#ifdef __OBJC__
@interface KryonView : UIView
- (instancetype)initWithKRBFile:(NSString*)path;
- (void)updateWithDeltaTime:(NSTimeInterval)deltaTime;
@end

// Android Integration (JNI)
JNIEXPORT jlong JNICALL
Java_com_kryon_KryonView_loadKRB(JNIEnv* env, jobject obj, jstring path);

JNIEXPORT void JNICALL  
Java_com_kryon_KryonView_render(JNIEnv* env, jobject obj, jlong handle);
#endif

// Touch event handling
typedef struct krb_touch_event {
    float x, y;
    krb_touch_phase_t phase; // began, moved, ended, cancelled
    uint32_t touch_id;
} krb_touch_event_t;

krb_result_t krb_handle_touch(krb_app_t* app, const krb_touch_event_t* event);
```

### Web Integration (WebAssembly)

```javascript
// JavaScript API wrapper
class KryonApp {
    constructor(krbData) {
        this.handle = Module._krb_load_from_buffer(krbData.ptr, krbData.size);
        this.canvas = null;
    }
    
    attachToCanvas(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('webgl2');
        Module._krb_set_webgl_context(this.handle, this.context);
    }
    
    update(deltaTime) {
        Module._krb_update(this.handle, deltaTime);
    }
    
    render() {
        Module._krb_render(this.handle);
    }
    
    handleEvent(event) {
        const eventPtr = Module._malloc(sizeof_krb_event);
        // Marshal event data...
        Module._krb_handle_event(this.handle, eventPtr);
        Module._free(eventPtr);
    }
}

// Usage
fetch('app.krb')
    .then(response => response.arrayBuffer())
    .then(data => {
        const app = new KryonApp(data);
        app.attachToCanvas(document.getElementById('canvas'));
        
        function frame(time) {
            app.update(time / 1000);
            app.render();
            requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    });
```

### Embedded Integration

```c
// Minimal embedded runtime
typedef struct krb_minimal_context {
    const krb_file_t* file;
    krb_element_t* elements;
    uint16_t element_count;
    krb_property_cache_t* cache;
} krb_minimal_context_t;

// Reduced API for resource-constrained devices
krb_result_t krb_minimal_init(const void* krb_data, 
                             size_t size,
                             krb_minimal_context_t** context);

krb_result_t krb_minimal_render(krb_minimal_context_t* context,
                               krb_display_t* display);

// Memory constraints
#define KRB_MINIMAL_MAX_ELEMENTS 64
#define KRB_MINIMAL_MAX_STRINGS  128  
#define KRB_MINIMAL_CACHE_SIZE   512

// No dynamic allocation - everything pre-allocated
```

## Scripting Integration

### Script Runtime Initialization

```c
// Script engine integration
typedef enum {
    KRB_SCRIPT_LUA,
    KRB_SCRIPT_JAVASCRIPT,
    KRB_SCRIPT_PYTHON,
    KRB_SCRIPT_WREN
} krb_script_engine_t;

// Initialize script support
krb_result_t krb_script_init(krb_app_t* app, krb_script_engine_t engine);

// Execute embedded scripts
krb_result_t krb_script_execute_startup(krb_app_t* app);

// Call script functions
krb_result_t krb_script_call(krb_app_t* app, 
                            const char* function_name,
                            const krb_value_t* args,
                            size_t arg_count,
                            krb_value_t* result);
```

### Lua Integration Example

```c
// Lua-specific integration
typedef struct krb_lua_context {
    lua_State* L;
    krb_app_t* app;
    int registry_ref;
} krb_lua_context_t;

// Initialize Lua runtime
krb_result_t krb_lua_init(krb_app_t* app, krb_lua_context_t** lua_ctx) {
    lua_State* L = luaL_newstate();
    luaL_openlibs(L);
    
    // Register Kryon API
    lua_newtable(L);
    lua_pushcfunction(L, krb_lua_get_element);
    lua_setfield(L, -2, "getElementById");
    lua_pushcfunction(L, krb_lua_set_property);
    lua_setfield(L, -2, "setProperty");
    lua_setglobal(L, "kryon");
    
    // Create context
    krb_lua_context_t* ctx = malloc(sizeof(krb_lua_context_t));
    ctx->L = L;
    ctx->app = app;
    
    *lua_ctx = ctx;
    return KRB_SUCCESS;
}

// Lua API functions
static int krb_lua_get_element(lua_State* L) {
    const char* id = luaL_checkstring(L, 1);
    krb_app_t* app = get_app_from_lua(L);
    
    krb_element_t* element = krb_element_find_by_id(app, id);
    if (element) {
        push_element_userdata(L, element);
        return 1;
    }
    
    lua_pushnil(L);
    return 1;
}
```

## Error Handling

### Error Codes and Recovery

```c
// Comprehensive error codes
typedef enum {
    KRB_SUCCESS = 0,
    
    // File errors
    KRB_ERROR_FILE_NOT_FOUND,
    KRB_ERROR_FILE_INVALID,
    KRB_ERROR_FILE_CORRUPTED,
    KRB_ERROR_VERSION_UNSUPPORTED,
    
    // Memory errors  
    KRB_ERROR_OUT_OF_MEMORY,
    KRB_ERROR_BUFFER_TOO_SMALL,
    
    // Runtime errors
    KRB_ERROR_INVALID_ELEMENT,
    KRB_ERROR_INVALID_PROPERTY,
    KRB_ERROR_SCRIPT_ERROR,
    KRB_ERROR_RENDERER_FAILED,
    
    // Platform errors
    KRB_ERROR_PLATFORM_UNSUPPORTED,
    KRB_ERROR_GRAPHICS_UNAVAILABLE
} krb_result_t;

// Error context
typedef struct krb_error_context {
    krb_result_t code;
    char message[256];
    const char* file;
    int line;
    const char* function;
} krb_error_context_t;

// Error reporting
krb_result_t krb_get_last_error(krb_error_context_t* context);
void krb_set_error_handler(krb_error_handler_t handler, void* user_data);
```

### Graceful Degradation

```c
// Fallback strategies
typedef struct krb_fallback_options {
    bool skip_unknown_elements;    // Continue with known elements
    bool use_default_properties;   // Use defaults for invalid properties
    bool disable_scripts;          // Skip script execution on errors
    bool simplified_rendering;     // Use basic renderer if advanced fails
} krb_fallback_options_t;

krb_result_t krb_set_fallback_options(krb_app_t* app, 
                                     const krb_fallback_options_t* options);

// Example fallback handling
krb_result_t safe_load_krb(const char* path, krb_app_t** app) {
    krb_file_t* file;
    krb_result_t result = krb_load_file(path, &file);
    
    if (result != KRB_SUCCESS) {
        // Try loading with fallback options
        krb_fallback_options_t fallback = {
            .skip_unknown_elements = true,
            .use_default_properties = true,
            .disable_scripts = true,
            .simplified_rendering = true
        };
        
        result = krb_load_file_with_fallback(path, &fallback, &file);
    }
    
    if (result == KRB_SUCCESS) {
        result = krb_create_app(file, app);
    }
    
    return result;
}
```

## Performance Optimization

### Lazy Loading Strategies

```c
// Lazy element instantiation
typedef struct krb_lazy_element {
    uint32_t element_index;     // Index in KRB file
    krb_element_t* instance;    // NULL until accessed
    bool is_visible;            // Only load visible elements
} krb_lazy_element_t;

// Load elements on demand
krb_element_t* krb_get_element_lazy(krb_app_t* app, uint32_t index) {
    krb_lazy_element_t* lazy = &app->lazy_elements[index];
    
    if (!lazy->instance && lazy->is_visible) {
        lazy->instance = krb_instantiate_element(app, lazy->element_index);
    }
    
    return lazy->instance;
}

// Visibility culling
void krb_update_visibility(krb_app_t* app, const krb_rect_t* viewport) {
    for (size_t i = 0; i < app->element_count; i++) {
        krb_lazy_element_t* lazy = &app->lazy_elements[i];
        
        // Calculate element bounds
        krb_rect_t bounds = krb_calculate_bounds(app, i);
        
        // Update visibility
        bool was_visible = lazy->is_visible;
        lazy->is_visible = krb_rect_intersects(&bounds, viewport);
        
        // Unload invisible elements to save memory
        if (was_visible && !lazy->is_visible) {
            krb_unload_element(lazy->instance);
            lazy->instance = NULL;
        }
    }
}
```

### Caching Strategies

```c
// Multi-level caching
typedef struct krb_cache_system {
    // L1: Hot property cache (LRU, 64 entries)
    krb_property_cache_t* property_cache;
    
    // L2: Layout cache (element bounds, 128 entries)  
    krb_layout_cache_t* layout_cache;
    
    // L3: Render cache (pre-rendered elements, 32 entries)
    krb_render_cache_t* render_cache;
    
    // Statistics
    struct {
        uint64_t property_hits, property_misses;
        uint64_t layout_hits, layout_misses;
        uint64_t render_hits, render_misses;
    } stats;
} krb_cache_system_t;

// Cache management
krb_result_t krb_cache_init(krb_cache_system_t** cache, size_t memory_limit);
void krb_cache_evict_lru(krb_cache_system_t* cache);
void krb_cache_clear(krb_cache_system_t* cache);

// Usage example
krb_property_value_t krb_get_property_cached(krb_element_t* element, 
                                           krb_property_t property) {
    // Check L1 cache first
    krb_property_value_t* cached = krb_property_cache_get(
        element->app->cache->property_cache, 
        element->id, 
        property
    );
    
    if (cached) {
        element->app->cache->stats.property_hits++;
        return *cached;
    }
    
    // Cache miss - compute value
    element->app->cache->stats.property_misses++;
    krb_property_value_t value = krb_compute_property(element, property);
    
    // Store in cache
    krb_property_cache_set(
        element->app->cache->property_cache,
        element->id,
        property,
        value
    );
    
    return value;
}
```

### Memory Pool Allocation

```c
// Memory pool for frequent allocations
typedef struct krb_memory_pool {
    void* memory;
    size_t size;
    size_t used;
    size_t block_size;
    void** free_list;
} krb_memory_pool_t;

// Initialize pools for different object types
krb_result_t krb_init_memory_pools(krb_app_t* app) {
    // Element pool (fixed-size blocks)
    krb_pool_create(&app->element_pool, sizeof(krb_element_t), 256);
    
    // Property pool (variable-size blocks)
    krb_pool_create(&app->property_pool, 64, 512);
    
    // String pool (for dynamic strings)
    krb_pool_create(&app->string_pool, 32, 128);
    
    return KRB_SUCCESS;
}

// Fast allocation/deallocation
krb_element_t* krb_element_alloc(krb_app_t* app) {
    return (krb_element_t*)krb_pool_alloc(&app->element_pool);
}

void krb_element_free(krb_app_t* app, krb_element_t* element) {
    krb_pool_free(&app->element_pool, element);
}
```

## Debugging and Profiling

### Debug Information

```c
// Debug build features
#ifdef KRB_DEBUG
typedef struct krb_debug_info {
    const char* source_file;
    uint32_t source_line;
    const char* element_path;
    uint64_t creation_time;
    uint32_t property_changes;
} krb_debug_info_t;

// Debug tracking
krb_result_t krb_debug_track_element(krb_element_t* element, 
                                    const krb_debug_info_t* info);

// Debug queries
krb_element_t** krb_debug_find_elements_by_source(krb_app_t* app, 
                                                 const char* source_file,
                                                 size_t* count);

// Performance profiling
typedef struct krb_profile_data {
    uint64_t load_time_us;
    uint64_t parse_time_us;
    uint64_t render_time_us;
    uint64_t script_time_us;
    
    uint32_t frame_count;
    float avg_frame_time_ms;
    float max_frame_time_ms;
    
    size_t memory_used;
    size_t memory_peak;
} krb_profile_data_t;

krb_result_t krb_profile_start(krb_app_t* app);
krb_result_t krb_profile_stop(krb_app_t* app, krb_profile_data_t* data);
#endif
```

### Runtime Inspection

```c
// Runtime introspection API
typedef struct krb_inspect_result {
    uint32_t element_count;
    uint32_t property_count;
    uint32_t string_count;
    
    size_t memory_usage;
    float cache_hit_ratio;
    
    krb_element_t** elements;
    krb_property_info_t* properties;
} krb_inspect_result_t;

krb_result_t krb_inspect_runtime(krb_app_t* app, krb_inspect_result_t** result);

// Property monitoring
typedef void (*krb_property_change_callback_t)(krb_element_t* element,
                                              krb_property_t property,
                                              const krb_value_t* old_value,
                                              const krb_value_t* new_value,
                                              void* user_data);

krb_result_t krb_monitor_property_changes(krb_app_t* app,
                                         krb_property_change_callback_t callback,
                                         void* user_data);
```

## Best Practices

### 1. Initialize Runtime Properly

```c
// Proper initialization sequence
krb_result_t init_kryon_app(const char* krb_path, krb_app_t** app) {
    krb_result_t result;
    
    // 1. Create context with appropriate options
    krb_context_t* context;
    result = krb_context_create(&context);
    if (result != KRB_SUCCESS) return result;
    
    // 2. Configure for target platform
    krb_context_set_option(context, KRB_OPTION_MEMORY_LIMIT, &(size_t){50 * 1024 * 1024});
    krb_context_set_option(context, KRB_OPTION_CACHE_SIZE, &(size_t){1024});
    
    // 3. Load and validate KRB file
    krb_file_t* file;
    result = krb_load_file(krb_path, &file);
    if (result != KRB_SUCCESS) {
        krb_context_destroy(context);
        return result;
    }
    
    result = krb_validate(file);
    if (result != KRB_SUCCESS) {
        krb_file_destroy(file);
        krb_context_destroy(context);
        return result;
    }
    
    // 4. Create application instance
    result = krb_create_app_with_context(file, context, app);
    if (result != KRB_SUCCESS) {
        krb_file_destroy(file);
        krb_context_destroy(context);
        return result;
    }
    
    // 5. Initialize script runtime if needed
    if (file->flags & KRB_FLAG_HAS_SCRIPTS) {
        result = krb_script_init(*app, KRB_SCRIPT_LUA);
        if (result != KRB_SUCCESS) {
            krb_app_destroy(*app);
            return result;
        }
    }
    
    return KRB_SUCCESS;
}
```

### 2. Handle Errors Gracefully

```c
// Robust error handling
krb_result_t render_frame(krb_app_t* app, krb_surface_t* surface) {
    krb_result_t result;
    
    // Update with error recovery
    result = krb_app_update(app, get_delta_time());
    if (result != KRB_SUCCESS) {
        log_warning("Update failed: %s", krb_error_string(result));
        // Continue with stale state rather than crash
    }
    
    // Render with fallback
    result = krb_app_render(app, surface);
    if (result != KRB_SUCCESS) {
        log_warning("Render failed: %s", krb_error_string(result));
        
        // Try simplified rendering
        result = krb_app_render_simplified(app, surface);
        if (result != KRB_SUCCESS) {
            log_error("All rendering failed, showing error screen");
            render_error_screen(surface);
        }
    }
    
    return KRB_SUCCESS; // Always succeed at frame level
}
```

### 3. Optimize Memory Usage

```c
// Memory-conscious runtime management
void optimize_memory_usage(krb_app_t* app) {
    // 1. Periodic cache cleanup
    if (get_memory_pressure() > 0.8f) {
        krb_cache_evict_unused(app->cache, 0.5f); // Evict 50% of cache
    }
    
    // 2. Unload invisible elements
    krb_rect_t viewport = get_viewport_bounds();
    krb_update_visibility(app, &viewport);
    
    // 3. Compress string table if memory pressure high
    if (get_memory_pressure() > 0.9f) {
        krb_string_table_compress(app);
    }
    
    // 4. Garbage collect script runtime
    if (app->script_context) {
        krb_script_gc(app->script_context);
    }
}

// Monitor memory usage
void monitor_memory(krb_app_t* app) {
    static uint64_t last_check = 0;
    uint64_t now = get_time_ms();
    
    if (now - last_check > 5000) { // Check every 5 seconds
        size_t memory_used = krb_get_memory_usage(app);
        
        if (memory_used > app->memory_limit * 0.8) {
            log_warning("Memory usage high: %zu MB", memory_used / 1024 / 1024);
            optimize_memory_usage(app);
        }
        
        last_check = now;
    }
}
```

### 4. Profile Performance

```c
// Performance monitoring
typedef struct perf_monitor {
    uint64_t frame_start;
    uint64_t update_time;
    uint64_t render_time;
    
    float avg_frame_time;
    float max_frame_time;
    uint32_t frame_count;
} perf_monitor_t;

void profile_frame(krb_app_t* app, perf_monitor_t* perf) {
    perf->frame_start = get_time_us();
    
    // Measure update time
    uint64_t update_start = get_time_us();
    krb_app_update(app, get_delta_time());
    perf->update_time = get_time_us() - update_start;
    
    // Measure render time
    uint64_t render_start = get_time_us();
    krb_app_render(app, get_surface());
    perf->render_time = get_time_us() - render_start;
    
    // Update statistics
    uint64_t frame_time = get_time_us() - perf->frame_start;
    perf->avg_frame_time = (perf->avg_frame_time * perf->frame_count + frame_time) / (perf->frame_count + 1);
    perf->max_frame_time = max(perf->max_frame_time, frame_time);
    perf->frame_count++;
    
    // Log slow frames
    if (frame_time > 16000) { // > 16ms (60 FPS)
        log_warning("Slow frame: %.2fms (update: %.2fms, render: %.2fms)",
                   frame_time / 1000.0f,
                   perf->update_time / 1000.0f,
                   perf->render_time / 1000.0f);
    }
}
```

---

Runtime integration is critical for KRB performance and reliability. By following these APIs, patterns, and best practices, developers can create robust applications that efficiently load and execute KRB files across diverse platforms and environments.
