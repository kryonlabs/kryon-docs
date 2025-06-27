# Runtime Reference

The Kryon Runtime system provides the execution environment for KRB applications across diverse platforms and architectures. This reference covers runtime architecture, APIs, platform integration, performance characteristics, and deployment strategies.

## Runtime Architecture

### Core Components

The Kryon Runtime consists of several interconnected subsystems:

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│                    Script Engine                           │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │     Lua     │ JavaScript  │   Python    │    Wren     │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Element System                          │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │   Layout    │  Rendering  │   Events    │    State    │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    KRB Loader                              │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │  File I/O   │   Parser    │ Validation  │    Cache    │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                  Platform Layer                            │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │  Graphics   │    Input    │   Audio     │  File Sys   │  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Runtime Lifecycle

Applications follow a standardized lifecycle across all platforms:

```
Lifecycle Phases:
├── Initialization
│   ├── Runtime system startup
│   ├── Platform abstraction layer setup
│   ├── Memory management initialization
│   └── Graphics context creation
├── Loading
│   ├── KRB file loading and validation
│   ├── Element tree instantiation
│   ├── Resource loading and caching
│   └── Script engine initialization
├── Execution
│   ├── Event loop management
│   ├── Frame-based updates and rendering
│   ├── User interaction handling
│   └── Script execution and callbacks
├── State Management
│   ├── Property updates and notifications
│   ├── Layout recalculation
│   ├── Animation and transitions
│   └── Memory optimization
└── Cleanup
    ├── Resource deallocation
    ├── Script engine shutdown
    ├── Platform resource cleanup
    └── Memory leak detection
```

## Platform Support

### Supported Platforms

Kryon Runtime provides native support across major platforms:

```
Platform Matrix:
├── Desktop Platforms
│   ├── Windows (Win32, UWP)
│   ├── macOS (Cocoa, AppKit)
│   ├── Linux (X11, Wayland)
│   └── FreeBSD, OpenBSD
├── Mobile Platforms  
│   ├── iOS (UIKit, SwiftUI integration)
│   ├── Android (Native, Java integration)
│   └── Cross-platform (React Native, Flutter)
├── Web Platforms
│   ├── WebAssembly (WASM)
│   ├── Progressive Web Apps (PWA)
│   ├── Electron integration
│   └── Browser extensions
├── Embedded Platforms
│   ├── ARM Cortex-M (minimal runtime)
│   ├── RISC-V (microcontroller)
│   ├── ESP32/ESP8266
│   └── Raspberry Pi (full runtime)
└── Server Platforms
    ├── Headless rendering
    ├── Cloud functions
    ├── Container environments
    └── Edge computing
```

### Runtime Variants

Different runtime variants optimize for specific use cases:

```
Runtime Variants:
├── Full Runtime
│   ├── Complete feature set
│   ├── All script engines
│   ├── Advanced graphics
│   └── Development tools
├── Minimal Runtime
│   ├── Core functionality only
│   ├── Single script engine
│   ├── Basic rendering
│   └── <100KB footprint
├── Embedded Runtime
│   ├── No dynamic allocation
│   ├── Static memory pools
│   ├── Hardware-specific optimizations
│   └── <50KB footprint
├── Web Runtime
│   ├── WebAssembly optimized
│   ├── Browser API integration
│   ├── Progressive loading
│   └── Streaming support
└── Server Runtime
    ├── Headless operation
    ├── Batch processing
    ├── API generation
    └── Cloud integration
```

## Runtime APIs

### Core Runtime API

The foundational C API provides runtime management:

```c
// Runtime initialization and lifecycle
typedef struct kryon_runtime kryon_runtime_t;
typedef struct kryon_app kryon_app_t;

// Initialize runtime with configuration
kryon_result_t kryon_init(const kryon_config_t* config, kryon_runtime_t** runtime);

// Load and create application
kryon_result_t kryon_load_app(kryon_runtime_t* runtime, 
                             const char* krb_path, 
                             kryon_app_t** app);

// Main execution loop
kryon_result_t kryon_run_app(kryon_app_t* app);

// Manual update and render (for custom loops)
kryon_result_t kryon_update(kryon_app_t* app, float delta_time);
kryon_result_t kryon_render(kryon_app_t* app);

// Event handling
kryon_result_t kryon_handle_event(kryon_app_t* app, const kryon_event_t* event);

// Cleanup
void kryon_app_destroy(kryon_app_t* app);
void kryon_runtime_destroy(kryon_runtime_t* runtime);
```

### Configuration System

```c
// Runtime configuration
typedef struct kryon_config {
    // Memory management
    size_t max_memory;              // Maximum memory usage (bytes)
    size_t cache_size;              // Element cache size
    bool enable_memory_pools;       // Use memory pools for allocations
    
    // Rendering
    kryon_renderer_t renderer_type; // Graphics renderer selection
    bool enable_vsync;              // Vertical synchronization
    int target_fps;                 // Target frame rate
    bool enable_gpu_acceleration;   // Use GPU when available
    
    // Script engines
    uint32_t enabled_scripts;       // Bitmask of enabled script engines
    size_t script_memory_limit;     // Memory limit for scripts
    bool enable_script_debugging;   // Script debugging support
    
    // Platform specific
    void* platform_data;           // Platform-specific configuration
    kryon_log_level_t log_level;    // Logging verbosity
    bool enable_profiling;          // Performance profiling
} kryon_config_t;

// Default configuration for platform
kryon_config_t kryon_get_default_config(kryon_platform_t platform);

// Validate configuration
kryon_result_t kryon_validate_config(const kryon_config_t* config);
```

### Element Access API

```c
// Element tree navigation and manipulation
typedef struct kryon_element kryon_element_t;

// Element access
kryon_element_t* kryon_get_root_element(kryon_app_t* app);
kryon_element_t* kryon_find_element_by_id(kryon_app_t* app, const char* id);
kryon_element_t* kryon_get_parent(kryon_element_t* element);
kryon_element_t* kryon_get_child(kryon_element_t* element, size_t index);
size_t kryon_get_child_count(kryon_element_t* element);

// Property management
kryon_result_t kryon_get_property(kryon_element_t* element,
                                 const char* property,
                                 kryon_value_t* value);

kryon_result_t kryon_set_property(kryon_element_t* element,
                                 const char* property,
                                 const kryon_value_t* value);

// Dynamic element creation
kryon_result_t kryon_create_element(kryon_app_t* app,
                                   const char* type,
                                   kryon_element_t** element);

kryon_result_t kryon_add_child(kryon_element_t* parent, kryon_element_t* child);
kryon_result_t kryon_remove_child(kryon_element_t* parent, kryon_element_t* child);
```

## Performance Characteristics

### Loading Performance

Runtime loading performance varies by platform and file size:

```
Loading Benchmarks (Typical Applications):
├── Desktop (NVMe SSD)
│   ├── Small (5KB): 0.8ms ± 0.2ms
│   ├── Medium (50KB): 3.2ms ± 0.8ms
│   ├── Large (500KB): 28ms ± 5ms
│   └── Very Large (5MB): 280ms ± 45ms
├── Mobile (ARM64)
│   ├── Small (5KB): 1.5ms ± 0.4ms
│   ├── Medium (50KB): 6.8ms ± 1.2ms
│   ├── Large (500KB): 52ms ± 8ms
│   └── Very Large (5MB): 520ms ± 80ms
├── Web (WASM)
│   ├── Small (5KB): 2.1ms ± 0.6ms
│   ├── Medium (50KB): 9.4ms ± 2.1ms
│   ├── Large (500KB): 78ms ± 12ms
│   └── Very Large (5MB): 780ms ± 120ms
└── Embedded (ARM Cortex-M)
    ├── Small (5KB): 4.2ms ± 1.0ms
    ├── Medium (50KB): 18.7ms ± 3.2ms
    ├── Large (500KB): 156ms ± 25ms
    └── Very Large: Not supported

Performance Factors:
├── File I/O: 20-40% of total time
├── Decompression: 15-30% of total time
├── Parsing: 25-40% of total time
├── Instantiation: 10-25% of total time
└── Script loading: 5-15% of total time
```

### Runtime Performance

Frame-based performance characteristics:

```
Runtime Benchmarks (60 FPS target):
├── Desktop (GTX 1060)
│   ├── Simple UI (10 elements): 0.2ms/frame (500+ FPS possible)
│   ├── Medium UI (100 elements): 2.1ms/frame (200+ FPS possible)
│   ├── Complex UI (1000 elements): 8.3ms/frame (120+ FPS possible)
│   └── Very Complex UI (5000+ elements): 16.7ms/frame (60 FPS)
├── Mobile (Snapdragon 855)
│   ├── Simple UI: 0.8ms/frame (300+ FPS possible)
│   ├── Medium UI: 4.2ms/frame (120+ FPS possible)
│   ├── Complex UI: 13.9ms/frame (70+ FPS possible)
│   └── Very Complex UI: 22.1ms/frame (45 FPS)
├── Web (Chrome V8)
│   ├── Simple UI: 1.2ms/frame (200+ FPS possible)
│   ├── Medium UI: 6.7ms/frame (80+ FPS possible)
│   ├── Complex UI: 18.9ms/frame (50+ FPS possible)
│   └── Very Complex UI: 35.2ms/frame (28 FPS)
└── Embedded (ESP32)
    ├── Simple UI: 8.3ms/frame (30+ FPS possible)
    ├── Medium UI: 25.0ms/frame (20+ FPS possible)
    └── Complex UI: Not recommended

Performance Bottlenecks:
├── Layout calculation: 30-50% of frame time
├── Text rendering: 20-35% of frame time
├── Graphics calls: 15-25% of frame time
├── Script execution: 5-15% of frame time
└── Property updates: 5-10% of frame time
```

### Memory Usage

Runtime memory consumption patterns:

```
Memory Usage (Typical Applications):
├── Runtime Overhead
│   ├── Full Runtime: 2-5 MB
│   ├── Minimal Runtime: 500KB - 1MB
│   ├── Embedded Runtime: 50-200KB
│   └── Web Runtime: 1-3MB
├── Application Memory
│   ├── Small app (5KB KRB): +10-20KB runtime
│   ├── Medium app (50KB KRB): +80-150KB runtime
│   ├── Large app (500KB KRB): +700KB-1.2MB runtime
│   └── Script overhead: 50KB-2MB per engine
├── Caching
│   ├── Element cache: 100KB-1MB
│   ├── Property cache: 50-200KB
│   ├── Layout cache: 100-500KB
│   └── Render cache: 500KB-5MB
└── Peak Memory
    ├── Loading peak: +50-100% temporary
    ├── Runtime steady: Base memory
    ├── Garbage collection: +10-30% cycles
    └── Memory pressure: Automatic reduction

Memory Optimization:
├── Lazy loading: 30-50% reduction
├── Element pooling: 20-40% reduction
├── Cache tuning: 10-25% reduction
├── Compression: 40-70% file reduction
└── Memory pools: 15-30% fragmentation reduction
```

## Integration Patterns

### Native Application Integration

#### Desktop Applications

```c
// Windows integration example
#include <windows.h>
#include <kryon/runtime.h>

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, 
                   LPSTR lpCmdLine, int nCmdShow) {
    // Initialize Kryon runtime
    kryon_config_t config = kryon_get_default_config(KRYON_PLATFORM_WINDOWS);
    config.platform_data = &(kryon_windows_config_t){
        .hInstance = hInstance,
        .window_class = L"KryonApp",
        .window_title = L"My Kryon Application"
    };
    
    kryon_runtime_t* runtime;
    if (kryon_init(&config, &runtime) != KRYON_SUCCESS) {
        return 1;
    }
    
    // Load application
    kryon_app_t* app;
    if (kryon_load_app(runtime, "app.krb", &app) != KRYON_SUCCESS) {
        kryon_runtime_destroy(runtime);
        return 1;
    }
    
    // Run main loop
    kryon_result_t result = kryon_run_app(app);
    
    // Cleanup
    kryon_app_destroy(app);
    kryon_runtime_destroy(runtime);
    
    return result == KRYON_SUCCESS ? 0 : 1;
}
```

#### Mobile Applications

```objc
// iOS integration example
@interface KryonViewController : UIViewController
@property (nonatomic) kryon_app_t* app;
@end

@implementation KryonViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Initialize Kryon runtime
    kryon_config_t config = kryon_get_default_config(KRYON_PLATFORM_IOS);
    config.platform_data = &(kryon_ios_config_t){
        .view_controller = self,
        .metal_device = MTLCreateSystemDefaultDevice()
    };
    
    kryon_runtime_t* runtime;
    kryon_init(&config, &runtime);
    
    // Load application from bundle
    NSString* krbPath = [[NSBundle mainBundle] pathForResource:@"app" ofType:@"krb"];
    kryon_load_app(runtime, [krbPath UTF8String], &self.app);
    
    // Setup display link for 60 FPS
    CADisplayLink* displayLink = [CADisplayLink displayLinkWithTarget:self 
                                                              selector:@selector(renderFrame:)];
    [displayLink addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];
}

- (void)renderFrame:(CADisplayLink*)displayLink {
    float deltaTime = displayLink.duration;
    kryon_update(self.app, deltaTime);
    kryon_render(self.app);
}

@end
```

### Web Integration

#### WebAssembly Module

```javascript
// JavaScript wrapper for Kryon WASM runtime
class KryonRuntime {
    constructor() {
        this.module = null;
        this.app = null;
        this.canvas = null;
    }
    
    async initialize(wasmPath) {
        // Load WASM module
        this.module = await WebAssembly.instantiateStreaming(fetch(wasmPath), {
            env: {
                // Provide JavaScript APIs to WASM
                js_fetch_resource: this.fetchResource.bind(this),
                js_log_message: console.log,
                js_request_frame: this.requestFrame.bind(this)
            }
        });
        
        // Initialize runtime
        const config = this.module.instance.exports.kryon_get_default_config(0); // Web platform
        this.runtime = this.module.instance.exports.kryon_init(config);
    }
    
    async loadApp(krbData) {
        // Upload KRB data to WASM memory
        const krbPtr = this.module.instance.exports.malloc(krbData.byteLength);
        const krbView = new Uint8Array(this.module.instance.exports.memory.buffer, 
                                      krbPtr, krbData.byteLength);
        krbView.set(new Uint8Array(krbData));
        
        // Load application
        this.app = this.module.instance.exports.kryon_load_app_from_memory(
            this.runtime, krbPtr, krbData.byteLength
        );
        
        this.module.instance.exports.free(krbPtr);
    }
    
    attachToCanvas(canvas) {
        this.canvas = canvas;
        const gl = canvas.getContext('webgl2');
        
        // Setup WebGL context for Kryon
        this.module.instance.exports.kryon_set_webgl_context(this.app, gl);
    }
    
    update(deltaTime) {
        this.module.instance.exports.kryon_update(this.app, deltaTime);
    }
    
    render() {
        this.module.instance.exports.kryon_render(this.app);
    }
    
    handleEvent(event) {
        // Convert JavaScript events to Kryon format
        const kryonEvent = this.convertEvent(event);
        this.module.instance.exports.kryon_handle_event(this.app, kryonEvent);
    }
}

// Usage
const kryon = new KryonRuntime();
await kryon.initialize('kryon-runtime.wasm');
await kryon.loadApp(await fetch('app.krb').then(r => r.arrayBuffer()));
kryon.attachToCanvas(document.getElementById('canvas'));

// Render loop
function renderLoop(time) {
    kryon.update(time / 1000);
    kryon.render();
    requestAnimationFrame(renderLoop);
}
requestAnimationFrame(renderLoop);
```

### Framework Integration

#### React Integration

```javascript
import { useEffect, useRef, useState } from 'react';
import { KryonRuntime } from '@kryon/react';

function KryonApp({ krbFile, onElementClick }) {
    const canvasRef = useRef(null);
    const [runtime, setRuntime] = useState(null);
    const [app, setApp] = useState(null);
    
    useEffect(() => {
        const initKryon = async () => {
            const kryonRuntime = new KryonRuntime();
            await kryonRuntime.initialize();
            
            const kryonApp = await kryonRuntime.loadApp(krbFile);
            kryonApp.attachToCanvas(canvasRef.current);
            
            // Setup event forwarding
            kryonApp.onElementEvent = (elementId, eventType, data) => {
                if (eventType === 'click' && onElementClick) {
                    onElementClick(elementId, data);
                }
            };
            
            setRuntime(kryonRuntime);
            setApp(kryonApp);
        };
        
        initKryon();
    }, [krbFile]);
    
    useEffect(() => {
        if (!app) return;
        
        let animationId;
        let lastTime = 0;
        
        const renderFrame = (time) => {
            const deltaTime = (time - lastTime) / 1000;
            lastTime = time;
            
            app.update(deltaTime);
            app.render();
            
            animationId = requestAnimationFrame(renderFrame);
        };
        
        animationId = requestAnimationFrame(renderFrame);
        
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [app]);
    
    return (
        <canvas 
            ref={canvasRef}
            style={{ width: '100%', height: '100%' }}
            onMouseMove={(e) => app?.handleMouseMove(e.clientX, e.clientY)}
            onClick={(e) => app?.handleClick(e.clientX, e.clientY)}
        />
    );
}

// Usage
function App() {
    return (
        <div className="app">
            <h1>My Kryon Application</h1>
            <KryonApp 
                krbFile="/assets/ui.krb"
                onElementClick={(elementId, data) => {
                    console.log(`Element ${elementId} clicked:`, data);
                }}
            />
        </div>
    );
}
```

## Deployment Strategies

### Distribution Methods

```
Deployment Options:
├── Standalone Applications
│   ├── Single executable with embedded KRB
│   ├── Application + separate KRB file
│   ├── Installer packages (MSI, DMG, DEB)
│   └── App store distribution
├── Web Applications
│   ├── Static hosting (CDN + WASM)
│   ├── Progressive Web Apps (PWA)
│   ├── Embedded in existing sites
│   └── Electron wrappers
├── Mobile Applications
│   ├── Native app bundles (IPA, APK)
│   ├── React Native integration
│   ├── Flutter plugins
│   └── Hybrid app frameworks
├── Server Applications
│   ├── Docker containers
│   ├── Cloud functions (AWS Lambda, etc.)
│   ├── Microservices
│   └── Edge computing
└── Embedded Systems
    ├── Firmware with embedded runtime
    ├── OTA update support
    ├── Resource-constrained optimization
    └── Real-time system integration
```

### Performance Optimization

```
Runtime Optimization Strategies:
├── Memory Optimization
│   ├── Enable memory pools
│   ├── Tune cache sizes
│   ├── Use lazy loading
│   └── Monitor memory pressure
├── Rendering Optimization
│   ├── Enable GPU acceleration
│   ├── Optimize frame rate targets
│   ├── Use efficient render paths
│   └── Minimize overdraw
├── Loading Optimization
│   ├── Preload critical resources
│   ├── Use progressive loading
│   ├── Optimize compression
│   └── Cache compiled assets
├── Script Optimization
│   ├── Choose appropriate engines
│   ├── Minimize script overhead
│   ├── Use script caching
│   └── Profile script performance
└── Platform Optimization
    ├── Use platform-specific builds
    ├── Optimize for target hardware
    ├── Minimize dependencies
    └── Profile on target devices
```

## Reference Sections

### [Desktop Runtime](desktop.md)
- Windows, macOS, and Linux specific implementations
- Native window management and graphics integration
- File system and OS service integration
- Performance optimization for desktop hardware

### [Mobile Runtime](mobile.md)
- iOS and Android native integration
- Touch input and gesture handling
- Mobile-specific optimizations and constraints
- App lifecycle management and background processing

### [Web Runtime](web.md)
- WebAssembly implementation details
- Browser API integration and compatibility
- Progressive loading and streaming support
- Web platform security and sandboxing

### [Embedded Runtime](embedded.md)
- Microcontroller and resource-constrained implementations
- Real-time system integration
- Hardware-specific optimizations
- Memory management for embedded systems

### [Scripting](scripting.md)
- Script engine integration and APIs
- Language-specific bindings and features
- Performance considerations and optimization
- Security and sandboxing for scripts

### [Performance](performance.md)
- Detailed performance analysis and benchmarks
- Optimization techniques and best practices
- Profiling tools and methodologies
- Platform-specific performance characteristics

---

The Kryon Runtime provides a powerful, flexible foundation for executing KRB applications across diverse platforms while maintaining consistent behavior and high performance. Understanding the runtime architecture and integration patterns enables developers to create efficient, scalable applications that leverage the full capabilities of the Kryon system.
