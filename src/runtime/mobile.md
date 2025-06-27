# Mobile Runtime

The Kryon Mobile Runtime provides native integration with iOS and Android platforms, optimized for touch interfaces, mobile hardware constraints, and mobile app lifecycle management. It delivers native performance while maintaining battery efficiency and platform compliance.

## Platform Support

### iOS Runtime

Native iOS integration using UIKit and modern iOS frameworks:

```
iOS Support Matrix:
├── iOS 14.0+: Full support
├── iOS 15.0+: Enhanced features (SwiftUI integration)
├── iOS 16.0+: Advanced capabilities (Metal 3, widgets)
├── iOS 17.0+: Latest features (interactive widgets)
└── iPadOS 14.0+: Full support with tablet optimizations

iOS Features:
├── UIKit and SwiftUI integration
├── Metal rendering pipeline
├── Core Animation and motion effects
├── Touch and gesture recognition
├── App lifecycle management
├── Background processing
├── Push notifications
├── App Store compliance
├── Accessibility (VoiceOver, Dynamic Type)
└── Device-specific optimizations
```

#### iOS Integration Example

```objc
// iOS-specific runtime implementation
#import <UIKit/UIKit.h>
#import <Metal/Metal.h>
#import <MetalKit/MetalKit.h>
#include <kryon/mobile.h>

@interface KryonViewController : UIViewController <MTKViewDelegate>
@property (strong, nonatomic) MTKView* metalView;
@property (assign, nonatomic) kryon_app_t* app;
@property (strong, nonatomic) CADisplayLink* displayLink;
@end

@implementation KryBViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    // Setup Metal view
    self.metalView = [[MTKView alloc] initWithFrame:self.view.bounds];
    self.metalView.device = MTLCreateSystemDefaultDevice();
    self.metalView.delegate = self;
    self.metalView.preferredFramesPerSecond = 60;
    self.metalView.colorPixelFormat = MTLPixelFormatBGRA8Unorm;
    [self.view addSubview:self.metalView];
    
    // Configure for mobile
    kryon_ios_config_t ios_config = {
        .view_controller = self,
        .metal_view = self.metalView,
        .metal_device = self.metalView.device,
        .enable_retina = YES,
        .battery_optimization = KRYON_BATTERY_BALANCED,
        .thermal_management = KRYON_THERMAL_MODERATE
    };
    
    kryon_config_t config = kryon_get_mobile_config(KRYON_PLATFORM_IOS);
    config.platform_data = &ios_config;
    config.max_memory = 128 * 1024 * 1024;  // 128MB limit for mobile
    config.target_fps = 60;
    config.enable_battery_optimization = true;
    config.enable_thermal_throttling = true;
    
    // Initialize Kryon runtime
    kryon_runtime_t* runtime;
    if (kryon_init(&config, &runtime) != KRYON_SUCCESS) {
        NSLog(@"Failed to initialize Kryon runtime");
        return;
    }
    
    // Load application
    NSString* krbPath = [[NSBundle mainBundle] pathForResource:@"app" ofType:@"krb"];
    if (kryon_load_app(runtime, [krbPath UTF8String], &self.app) != KRYON_SUCCESS) {
        NSLog(@"Failed to load Kryon application");
        return;
    }
    
    // Setup touch gesture recognizers
    [self setupGestureRecognizers];
    
    // Start render loop
    self.displayLink = [CADisplayLink displayLinkWithTarget:self 
                                                   selector:@selector(renderFrame)];
    [self.displayLink addToRunLoop:[NSRunLoop mainRunLoop] 
                           forMode:NSDefaultRunLoopMode];
}

- (void)setupGestureRecognizers {
    // Tap gesture
    UITapGestureRecognizer* tapGesture = 
        [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(handleTap:)];
    [self.metalView addGestureRecognizer:tapGesture];
    
    // Pan gesture
    UIPanGestureRecognizer* panGesture = 
        [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(handlePan:)];
    [self.metalView addGestureRecognizer:panGesture];
    
    // Pinch gesture
    UIPinchGestureRecognizer* pinchGesture = 
        [[UIPinchGestureRecognizer alloc] initWithTarget:self action:@selector(handlePinch:)];
    [self.metalView addGestureRecognizer:pinchGesture];
}

- (void)handleTap:(UITapGestureRecognizer*)recognizer {
    CGPoint location = [recognizer locationInView:self.metalView];
    
    kryon_touch_event_t touch_event = {
        .type = KRYON_TOUCH_TAP,
        .x = location.x * self.metalView.contentScaleFactor,
        .y = location.y * self.metalView.contentScaleFactor,
        .touch_id = 0,
        .timestamp = CACurrentMediaTime()
    };
    
    kryon_handle_touch_event(self.app, &touch_event);
}

- (void)handlePan:(UIPanGestureRecognizer*)recognizer {
    CGPoint location = [recognizer locationInView:self.metalView];
    CGPoint velocity = [recognizer velocityInView:self.metalView];
    
    kryon_touch_type_t touch_type;
    switch (recognizer.state) {
        case UIGestureRecognizerStateBegan:
            touch_type = KRYON_TOUCH_BEGAN;
            break;
        case UIGestureRecognizerStateChanged:
            touch_type = KRYON_TOUCH_MOVED;
            break;
        case UIGestureRecognizerStateEnded:
            touch_type = KRYON_TOUCH_ENDED;
            break;
        default:
            touch_type = KRYON_TOUCH_CANCELLED;
            break;
    }
    
    kryon_touch_event_t touch_event = {
        .type = touch_type,
        .x = location.x * self.metalView.contentScaleFactor,
        .y = location.y * self.metalView.contentScaleFactor,
        .velocity_x = velocity.x,
        .velocity_y = velocity.y,
        .touch_id = 0,
        .timestamp = CACurrentMediaTime()
    };
    
    kryon_handle_touch_event(self.app, &touch_event);
}

- (void)renderFrame {
    float deltaTime = self.displayLink.duration;
    
    kryon_update(self.app, deltaTime);
    kryon_render(self.app);
}

// MTKViewDelegate methods
- (void)drawInMTKView:(MTKView*)view {
    // Rendering handled by Kryon
}

- (void)mtkView:(MTKView*)view drawableSizeWillChange:(CGSize)size {
    kryon_resize(self.app, size.width, size.height);
}

// App lifecycle management
- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    kryon_resume(self.app);
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    kryon_pause(self.app);
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    kryon_handle_memory_warning(self.app);
}

@end
```

### Android Runtime

Native Android integration using NDK and modern Android APIs:

```
Android Support Matrix:
├── Android 7.0 (API 24)+: Full support
├── Android 8.0 (API 26)+: Enhanced features
├── Android 10 (API 29)+: Gesture navigation support
├── Android 12 (API 31)+: Material You integration
└── Android 14 (API 34)+: Latest features

Android Features:
├── Native Activity and JNI integration
├── Vulkan and OpenGL ES rendering
├── Touch and gesture handling
├── App lifecycle management
├── Background processing limits
├── Notification channels
├── Play Store compliance
├── Accessibility (TalkBack, large text)
├── Multi-window and foldable support
└── Hardware-specific optimizations
```

#### Android Integration Example

```c
// Android-specific runtime implementation
#include <jni.h>
#include <android/native_activity.h>
#include <android/asset_manager.h>
#include <android/input.h>
#include <EGL/egl.h>
#include <GLES3/gl3.h>
#include <kryon/mobile.h>

typedef struct kryon_android_app {
    struct android_app* android_app;
    kryon_app_t* kryon_app;
    EGLDisplay display;
    EGLSurface surface;
    EGLContext context;
    bool initialized;
    bool focused;
} kryon_android_app_t;

// Android app lifecycle callbacks
static void android_handle_cmd(struct android_app* app, int32_t cmd) {
    kryon_android_app_t* kryon_android = (kryon_android_app_t*)app->userData;
    
    switch (cmd) {
        case APP_CMD_INIT_WINDOW:
            if (app->window != NULL && !kryon_android->initialized) {
                kryon_android_init_display(kryon_android);
                kryon_android_load_app(kryon_android);
                kryon_android->initialized = true;
            }
            break;
            
        case APP_CMD_TERM_WINDOW:
            kryon_android_term_display(kryon_android);
            kryon_android->initialized = false;
            break;
            
        case APP_CMD_GAINED_FOCUS:
            kryon_android->focused = true;
            if (kryon_android->kryon_app) {
                kryon_resume(kryon_android->kryon_app);
            }
            break;
            
        case APP_CMD_LOST_FOCUS:
            kryon_android->focused = false;
            if (kryon_android->kryon_app) {
                kryon_pause(kryon_android->kryon_app);
            }
            break;
            
        case APP_CMD_PAUSE:
            if (kryon_android->kryon_app) {
                kryon_pause(kryon_android->kryon_app);
            }
            break;
            
        case APP_CMD_RESUME:
            if (kryon_android->kryon_app) {
                kryon_resume(kryon_android->kryon_app);
            }
            break;
            
        case APP_CMD_LOW_MEMORY:
            if (kryon_android->kryon_app) {
                kryon_handle_memory_warning(kryon_android->kryon_app);
            }
            break;
    }
}

// Touch input handling
static int32_t android_handle_input(struct android_app* app, AInputEvent* event) {
    kryon_android_app_t* kryon_android = (kryon_android_app_t*)app->userData;
    
    if (AInputEvent_getType(event) == AINPUT_EVENT_TYPE_MOTION) {
        int32_t action = AMotionEvent_getAction(event);
        int32_t action_masked = action & AMOTION_EVENT_ACTION_MASK;
        int32_t pointer_index = (action & AMOTION_EVENT_ACTION_POINTER_INDEX_MASK) 
                               >> AMOTION_EVENT_ACTION_POINTER_INDEX_SHIFT;
        
        kryon_touch_event_t touch_event = {0};
        touch_event.x = AMotionEvent_getX(event, pointer_index);
        touch_event.y = AMotionEvent_getY(event, pointer_index);
        touch_event.touch_id = AMotionEvent_getPointerId(event, pointer_index);
        touch_event.timestamp = AMotionEvent_getEventTime(event) / 1000000.0; // ns to ms
        
        switch (action_masked) {
            case AMOTION_EVENT_ACTION_DOWN:
            case AMOTION_EVENT_ACTION_POINTER_DOWN:
                touch_event.type = KRYON_TOUCH_BEGAN;
                break;
                
            case AMOTION_EVENT_ACTION_MOVE:
                touch_event.type = KRYON_TOUCH_MOVED;
                break;
                
            case AMOTION_EVENT_ACTION_UP:
            case AMOTION_EVENT_ACTION_POINTER_UP:
                touch_event.type = KRYON_TOUCH_ENDED;
                break;
                
            case AMOTION_EVENT_ACTION_CANCEL:
                touch_event.type = KRYON_TOUCH_CANCELLED;
                break;
        }
        
        if (kryon_android->kryon_app) {
            kryon_handle_touch_event(kryon_android->kryon_app, &touch_event);
        }
        
        return 1; // Event handled
    }
    
    return 0; // Event not handled
}

// Initialize Android app
kryon_result_t kryon_android_init_display(kryon_android_app_t* app) {
    // Initialize EGL
    const EGLint attribs[] = {
        EGL_SURFACE_TYPE, EGL_WINDOW_BIT,
        EGL_BLUE_SIZE, 8,
        EGL_GREEN_SIZE, 8,
        EGL_RED_SIZE, 8,
        EGL_ALPHA_SIZE, 8,
        EGL_DEPTH_SIZE, 24,
        EGL_RENDERABLE_TYPE, EGL_OPENGL_ES3_BIT,
        EGL_NONE
    };
    
    app->display = eglGetDisplay(EGL_DEFAULT_DISPLAY);
    eglInitialize(app->display, 0, 0);
    
    EGLConfig config;
    EGLint numConfigs;
    eglChooseConfig(app->display, attribs, &config, 1, &numConfigs);
    
    app->surface = eglCreateWindowSurface(app->display, config, 
                                         app->android_app->window, NULL);
    
    const EGLint contextAttribs[] = {
        EGL_CONTEXT_CLIENT_VERSION, 3,
        EGL_NONE
    };
    
    app->context = eglCreateContext(app->display, config, NULL, contextAttribs);
    eglMakeCurrent(app->display, app->surface, app->surface, app->context);
    
    // Get screen dimensions
    EGLint width, height;
    eglQuerySurface(app->display, app->surface, EGL_WIDTH, &width);
    eglQuerySurface(app->display, app->surface, EGL_HEIGHT, &height);
    
    return KRYON_SUCCESS;
}

// Load Kryon application
kryon_result_t kryon_android_load_app(kryon_android_app_t* app) {
    // Configure for Android
    kryon_android_config_t android_config = {
        .android_app = app->android_app,
        .asset_manager = app->android_app->activity->assetManager,
        .jni_env = NULL, // Will be set up when needed
        .java_activity = app->android_app->activity->clazz,
        .battery_optimization = KRYON_BATTERY_AGGRESSIVE,
        .thermal_management = KRYON_THERMAL_AGGRESSIVE
    };
    
    kryon_config_t config = kryon_get_mobile_config(KRYON_PLATFORM_ANDROID);
    config.platform_data = &android_config;
    config.max_memory = 64 * 1024 * 1024;   // 64MB limit for Android
    config.target_fps = 60;
    config.enable_battery_optimization = true;
    config.enable_thermal_throttling = true;
    
    // Initialize runtime
    kryon_runtime_t* runtime;
    kryon_result_t result = kryon_init(&config, &runtime);
    if (result != KRYON_SUCCESS) return result;
    
    // Load app from assets
    result = kryon_load_app_from_assets(runtime, "app.krb", &app->kryon_app);
    if (result != KRYON_SUCCESS) {
        kryon_runtime_destroy(runtime);
        return result;
    }
    
    return KRYON_SUCCESS;
}

// Main Android entry point
void android_main(struct android_app* state) {
    kryon_android_app_t kryon_android = {0};
    kryon_android.android_app = state;
    
    state->userData = &kryon_android;
    state->onAppCmd = android_handle_cmd;
    state->onInputEvent = android_handle_input;
    
    // Main loop
    while (1) {
        int events;
        struct android_poll_source* source;
        
        while (ALooper_pollAll(kryon_android.focused ? 0 : -1, NULL, &events, 
                              (void**)&source) >= 0) {
            if (source != NULL) {
                source->process(state, source);
            }
            
            if (state->destroyRequested != 0) {
                kryon_android_term_display(&kryon_android);
                return;
            }
        }
        
        // Render frame if focused and initialized
        if (kryon_android.focused && kryon_android.initialized && kryon_android.kryon_app) {
            kryon_update(kryon_android.kryon_app, 1.0f / 60.0f);
            kryon_render(kryon_android.kryon_app);
            eglSwapBuffers(kryon_android.display, kryon_android.surface);
        }
    }
}
```

## Touch Input System

### Touch Event Handling

Mobile runtime provides comprehensive touch and gesture support:

```c
// Touch event types
typedef enum {
    KRYON_TOUCH_BEGAN,
    KRYON_TOUCH_MOVED,
    KRYON_TOUCH_ENDED,
    KRYON_TOUCH_CANCELLED,
    KRYON_TOUCH_TAP,
    KRYON_TOUCH_DOUBLE_TAP,
    KRYON_TOUCH_LONG_PRESS,
    KRYON_TOUCH_SWIPE,
    KRYON_TOUCH_PINCH,
    KRYON_TOUCH_ROTATE
} kryon_touch_type_t;

typedef struct kryon_touch_event {
    kryon_touch_type_t type;
    float x, y;                    // Touch coordinates
    float velocity_x, velocity_y;  // Touch velocity (for gestures)
    float pressure;                // Touch pressure (0.0-1.0)
    float radius;                  // Touch radius
    int touch_id;                  // Unique touch identifier
    double timestamp;              // Event timestamp
    
    // Gesture-specific data
    union {
        struct {
            float scale;           // Pinch scale factor
            float rotation;        // Rotation angle in radians
        } gesture;
        
        struct {
            float direction_x, direction_y; // Swipe direction
            float distance;                 // Swipe distance
        } swipe;
    };
} kryon_touch_event_t;

// Multi-touch handling
typedef struct kryon_multitouch_state {
    kryon_touch_event_t touches[10];  // Support up to 10 touches
    int active_touch_count;
    bool gesture_in_progress;
    kryon_touch_type_t active_gesture;
} kryon_multitouch_state_t;

kryon_result_t kryon_handle_touch_event(kryon_app_t* app, 
                                       const kryon_touch_event_t* event) {
    // Update multitouch state
    kryon_multitouch_state_t* mt_state = kryon_get_multitouch_state(app);
    kryon_update_multitouch_state(mt_state, event);
    
    // Detect gestures
    kryon_touch_type_t gesture = kryon_detect_gesture(mt_state);
    if (gesture != KRYON_TOUCH_BEGAN) {
        kryon_touch_event_t gesture_event = *event;
        gesture_event.type = gesture;
        return kryon_dispatch_touch_event(app, &gesture_event);
    }
    
    // Dispatch regular touch event
    return kryon_dispatch_touch_event(app, event);
}

// Gesture recognition
kryon_touch_type_t kryon_detect_gesture(const kryon_multitouch_state_t* state) {
    if (state->active_touch_count == 1) {
        // Single touch gestures
        const kryon_touch_event_t* touch = &state->touches[0];
        
        // Detect tap vs drag
        float distance = sqrtf(touch->velocity_x * touch->velocity_x + 
                              touch->velocity_y * touch->velocity_y);
        
        if (distance < 10.0f && touch->type == KRYON_TOUCH_ENDED) {
            return KRYON_TOUCH_TAP;
        }
        
        // Detect swipe
        if (distance > 100.0f && touch->type == KRYON_TOUCH_ENDED) {
            return KRYON_TOUCH_SWIPE;
        }
        
    } else if (state->active_touch_count == 2) {
        // Two-finger gestures
        const kryon_touch_event_t* touch1 = &state->touches[0];
        const kryon_touch_event_t* touch2 = &state->touches[1];
        
        // Calculate distance between touches
        float dx = touch2->x - touch1->x;
        float dy = touch2->y - touch1->y;
        float distance = sqrtf(dx * dx + dy * dy);
        
        // Detect pinch
        static float initial_distance = 0;
        if (touch1->type == KRYON_TOUCH_BEGAN || touch2->type == KRYON_TOUCH_BEGAN) {
            initial_distance = distance;
        } else if (fabsf(distance - initial_distance) > 20.0f) {
            return KRYON_TOUCH_PINCH;
        }
    }
    
    return KRYON_TOUCH_BEGAN; // No gesture detected
}
```

### Accessibility Support

```c
// Mobile accessibility integration
typedef struct kryon_accessibility_config {
    bool enable_voiceover;        // iOS VoiceOver / Android TalkBack
    bool enable_large_text;       // Dynamic text sizing
    bool enable_high_contrast;    // High contrast mode
    bool enable_reduced_motion;   // Reduce animations
    float text_scale_factor;      // Text scaling (1.0 = normal)
    kryon_accessibility_callback_t callback;
} kryon_accessibility_config_t;

kryon_result_t kryon_setup_accessibility(kryon_app_t* app,
                                        const kryon_accessibility_config_t* config) {
    #ifdef __APPLE__
    // iOS accessibility setup
    if (config->enable_voiceover) {
        kryon_enable_voiceover_support(app);
    }
    
    // Register for dynamic type changes
    [[NSNotificationCenter defaultCenter] 
        addObserver:app 
           selector:@selector(handleDynamicTypeChange:)
               name:UIContentSizeCategoryDidChangeNotification 
             object:nil];
             
    #elif defined(__ANDROID__)
    // Android accessibility setup
    if (config->enable_voiceover) {
        kryon_enable_talkback_support(app);
    }
    
    // Register for accessibility service changes
    kryon_register_accessibility_service_callback(app, config->callback);
    #endif
    
    // Apply accessibility settings
    if (config->enable_large_text) {
        kryon_set_text_scale_factor(app, config->text_scale_factor);
    }
    
    if (config->enable_high_contrast) {
        kryon_enable_high_contrast_mode(app);
    }
    
    if (config->enable_reduced_motion) {
        kryon_disable_animations(app);
    }
    
    return KRYON_SUCCESS;
}

// Accessibility element description
typedef struct kryon_accessibility_element {
    const char* label;            // Spoken description
    const char* hint;             // Usage hint
    const char* value;            // Current value
    kryon_accessibility_role_t role; // button, text, image, etc.
    kryon_rect_t frame;           // Element bounds
    bool is_focusable;           // Can receive focus
    bool is_selected;            // Currently selected
} kryon_accessibility_element_t;

kryon_result_t kryon_set_accessibility_info(kryon_element_t* element,
                                           const kryon_accessibility_element_t* info) {
    #ifdef __APPLE__
    UIView* view = kryon_get_element_view(element);
    view.isAccessibilityElement = YES;
    view.accessibilityLabel = [NSString stringWithUTF8String:info->label];
    view.accessibilityHint = [NSString stringWithUTF8String:info->hint];
    view.accessibilityValue = [NSString stringWithUTF8String:info->value];
    
    switch (info->role) {
        case KRYON_ACCESSIBILITY_BUTTON:
            view.accessibilityTraits = UIAccessibilityTraitButton;
            break;
        case KRYON_ACCESSIBILITY_TEXT:
            view.accessibilityTraits = UIAccessibilityTraitStaticText;
            break;
        case KRYON_ACCESSIBILITY_IMAGE:
            view.accessibilityTraits = UIAccessibilityTraitImage;
            break;
    }
    
    #elif defined(__ANDROID__)
    // Set Android accessibility node info
    kryon_set_android_accessibility_info(element, info);
    #endif
    
    return KRYON_SUCCESS;
}
```

## Performance Optimization

### Mobile-Specific Constraints

```
Mobile Performance Considerations:
├── Memory Constraints
│   ├── Limited RAM (2-8GB typical)
│   ├── Aggressive app suspension
│   ├── Memory pressure handling
│   └── Cache size limitations
├── Battery Life
│   ├── CPU throttling for heat
│   ├── GPU power management
│   ├── Background processing limits
│   └── Battery optimization modes
├── Thermal Management
│   ├── CPU/GPU frequency scaling
│   ├── Automatic quality reduction
│   ├── Frame rate throttling
│   └── Performance monitoring
├── Network Constraints
│   ├── Cellular data limits
│   ├── Variable connection quality
│   ├── Background download restrictions
│   └── Offline functionality needs
└── Touch Performance
    ├── Low latency requirements (<16ms)
    ├── High frequency input (120Hz+)
    ├── Gesture recognition overhead
    └── Multi-touch complexity
```

### Battery Optimization

```c
// Battery-aware performance management
typedef struct kryon_battery_config {
    kryon_battery_mode_t mode;           // Conservative, balanced, performance
    float cpu_throttle_threshold;        // 0.0-1.0 (battery level)
    float gpu_throttle_threshold;        // 0.0-1.0 (battery level)
    int low_power_fps;                   // FPS in low power mode
    bool enable_background_throttling;   // Reduce performance in background
    bool enable_thermal_protection;     // Protect against overheating
} kryon_battery_config_t;

kryon_result_t kryon_configure_battery_optimization(kryon_app_t* app,
                                                   const kryon_battery_config_t* config) {
    // Monitor battery level
    float battery_level = kryon_get_battery_level();
    bool is_charging = kryon_is_device_charging();
    
    // Adjust performance based on battery state
    if (!is_charging && battery_level < config->cpu_throttle_threshold) {
        // Reduce CPU intensive operations
        kryon_set_update_frequency(app, config->low_power_fps);
        kryon_enable_cpu_throttling(app, 0.7f); // 70% CPU limit
    }
    
    if (!is_charging && battery_level < config->gpu_throttle_threshold) {
        // Reduce GPU intensive operations
        kryon_set_render_quality(app, KRYON_QUALITY_LOW);
        kryon_disable_expensive_effects(app);
    }
    
    // Thermal protection
    if (config->enable_thermal_protection) {
        float thermal_state = kryon_get_thermal_state();
        if (thermal_state > 0.8f) {
            kryon_enable_aggressive_throttling(app);
        }
    }
    
    return KRYON_SUCCESS;
}

// Dynamic quality adjustment
kryon_result_t kryon_adjust_quality_for_performance(kryon_app_t* app) {
    kryon_performance_metrics_t metrics;
    kryon_get_performance_metrics(app, &metrics);
    
    // Adjust based on frame time
    if (metrics.avg_frame_time > 20.0f) { // > 20ms (50 FPS)
        // Reduce quality to maintain frame rate
        kryon_quality_level_t current_quality = kryon_get_render_quality(app);
        
        switch (current_quality) {
            case KRYON_QUALITY_HIGH:
                kryon_set_render_quality(app, KRYON_QUALITY_MEDIUM);
                break;
            case KRYON_QUALITY_MEDIUM:
                kryon_set_render_quality(app, KRYON_QUALITY_LOW);
                break;
            case KRYON_QUALITY_LOW:
                kryon_reduce_element_complexity(app);
                break;
        }
    } else if (metrics.avg_frame_time < 12.0f) { // < 12ms (83+ FPS)
        // Increase quality if performance headroom available
        kryon_quality_level_t current_quality = kryon_get_render_quality(app);
        
        if (current_quality < KRYON_QUALITY_HIGH) {
            kryon_set_render_quality(app, current_quality + 1);
        }
    }
    
    return KRYON_SUCCESS;
}
```

### Memory Management

```c
// Mobile memory optimization
typedef struct kryon_mobile_memory_config {
    size_t max_texture_cache;      // Maximum texture cache size
    size_t max_geometry_cache;     // Maximum geometry cache size
    bool enable_texture_compression; // Use compressed textures
    bool enable_lazy_loading;      // Load resources on demand
    bool enable_memory_pressure_response; // Respond to system memory warnings
    float memory_warning_threshold; // Trigger cleanup at this usage level
} kryon_mobile_memory_config_t;

kryon_result_t kryon_configure_mobile_memory(kryon_app_t* app,
                                            const kryon_mobile_memory_config_t* config) {
    // Configure texture cache
    kryon_set_texture_cache_size(app, config->max_texture_cache);
    if (config->enable_texture_compression) {
        #ifdef __APPLE__
        kryon_enable_texture_format(app, KRYON_TEXTURE_ASTC);
        #elif defined(__ANDROID__)
        kryon_enable_texture_format(app, KRYON_TEXTURE_ETC2);
        #endif
    }
    
    // Configure geometry cache
    kryon_set_geometry_cache_size(app, config->max_geometry_cache);
    
    // Enable lazy loading
    if (config->enable_lazy_loading) {
        kryon_enable_lazy_resource_loading(app);
    }
    
    // Setup memory pressure monitoring
    if (config->enable_memory_pressure_response) {
        kryon_set_memory_warning_handler(app, kryon_handle_memory_pressure);
        kryon_set_memory_warning_threshold(app, config->memory_warning_threshold);
    }
    
    return KRYON_SUCCESS;
}

// Memory pressure response
kryon_result_t kryon_handle_memory_pressure(kryon_app_t* app, 
                                           kryon_memory_pressure_level_t level) {
    switch (level) {
        case KRYON_MEMORY_PRESSURE_LOW:
            // Gentle cleanup
            kryon_trim_texture_cache(app, 0.2f); // Remove 20% of cache
            break;
            
        case KRYON_MEMORY_PRESSURE_MEDIUM:
            // Moderate cleanup
            kryon_trim_texture_cache(app, 0.5f); // Remove 50% of cache
            kryon_trim_geometry_cache(app, 0.3f);
            kryon_unload_unused_resources(app);
            break;
            
        case KRYON_MEMORY_PRESSURE_HIGH:
            // Aggressive cleanup
            kryon_clear_texture_cache(app);      // Clear all texture cache
            kryon_clear_geometry_cache(app);     // Clear all geometry cache
            kryon_unload_non_visible_elements(app);
            kryon_force_garbage_collection(app);
            break;
    }
    
    return KRYON_SUCCESS;
}
```

## App Lifecycle Management

### iOS App Lifecycle

```c
// iOS app state management
typedef enum {
    KRYON_IOS_STATE_ACTIVE,
    KRYON_IOS_STATE_INACTIVE,
    KRYON_IOS_STATE_BACKGROUND,
    KRYON_IOS_STATE_SUSPENDED
} kryon_ios_app_state_t;

kryon_result_t kryon_handle_ios_lifecycle(kryon_app_t* app, 
                                         kryon_ios_app_state_t state) {
    switch (state) {
        case KRYON_IOS_STATE_ACTIVE:
            // App is in foreground and receiving events
            kryon_resume(app);
            kryon_set_update_frequency(app, 60); // Full frame rate
            kryon_enable_audio(app);
            break;
            
        case KRYON_IOS_STATE_INACTIVE:
            // App is in foreground but not receiving events (e.g., phone call)
            kryon_pause_updates(app);
            kryon_reduce_frame_rate(app, 30);
            break;
            
        case KRYON_IOS_STATE_BACKGROUND:
            // App is in background, limited processing time
            kryon_pause(app);
            kryon_save_application_state(app);
            kryon_stop_audio(app);
            kryon_stop_animations(app);
            
            // Request background time for critical tasks
            kryon_request_background_time(app, 30); // 30 seconds
            break;
            
        case KRYON_IOS_STATE_SUSPENDED:
            // App is suspended, no processing allowed
            kryon_suspend(app);
            break;
    }
    
    return KRYON_SUCCESS;
}

// Background task management for iOS
kryon_result_t kryon_request_background_time(kryon_app_t* app, int seconds) {
    #ifdef __APPLE__
    UIApplication* application = [UIApplication sharedApplication];
    
    __block UIBackgroundTaskIdentifier bgTask = [application beginBackgroundTaskWithExpirationHandler:^{
        [application endBackgroundTask:bgTask];
        bgTask = UIBackgroundTaskInvalid;
    }];
    
    // Perform background work
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        // Save critical app state
        kryon_save_critical_state(app);
        
        // Upload analytics or crash reports
        kryon_upload_pending_data(app);
        
        // Clean up temporary files
        kryon_cleanup_temp_files(app);
        
        [application endBackgroundTask:bgTask];
        bgTask = UIBackgroundTaskInvalid;
    });
    #endif
    
    return KRYON_SUCCESS;
}
```

### Android App Lifecycle

```c
// Android app lifecycle management
typedef enum {
    KRYON_ANDROID_STATE_CREATED,
    KRYON_ANDROID_STATE_STARTED,
    KRYON_ANDROID_STATE_RESUMED,
    KRYON_ANDROID_STATE_PAUSED,
    KRYON_ANDROID_STATE_STOPPED,
    KRYON_ANDROID_STATE_DESTROYED
} kryon_android_app_state_t;

kryon_result_t kryon_handle_android_lifecycle(kryon_app_t* app,
                                             kryon_android_app_state_t state) {
    switch (state) {
        case KRYON_ANDROID_STATE_CREATED:
            // Activity created, initialize resources
            kryon_initialize_resources(app);
            break;
            
        case KRYON_ANDROID_STATE_STARTED:
            // Activity visible but not interactive
            kryon_prepare_for_interaction(app);
            break;
            
        case KRYON_ANDROID_STATE_RESUMED:
            // Activity in foreground and interactive
            kryon_resume(app);
            kryon_set_update_frequency(app, 60);
            break;
            
        case KRYON_ANDROID_STATE_PAUSED:
            // Activity partially obscured
            kryon_pause_updates(app);
            kryon_save_user_preferences(app);
            break;
            
        case KRYON_ANDROID_STATE_STOPPED:
            // Activity not visible
            kryon_pause(app);
            kryon_save_application_state(app);
            kryon_release_heavy_resources(app);
            break;
            
        case KRYON_ANDROID_STATE_DESTROYED:
            // Activity being destroyed
            kryon_cleanup_resources(app);
            break;
    }
    
    return KRYON_SUCCESS;
}

// Android low memory handling
JNIEXPORT void JNICALL
Java_com_kryon_KryonActivity_onLowMemory(JNIEnv* env, jobject obj) {
    kryon_app_t* app = kryon_get_app_from_activity(obj);
    if (app) {
        kryon_handle_memory_pressure(app, KRYON_MEMORY_PRESSURE_HIGH);
    }
}

// Android configuration change handling
JNIEXPORT void JNICALL
Java_com_kryon_KryonActivity_onConfigurationChanged(JNIEnv* env, jobject obj,
                                                    jobject new_config) {
    kryon_app_t* app = kryon_get_app_from_activity(obj);
    if (app) {
        // Handle orientation changes, density changes, etc.
        kryon_handle_configuration_change(app, new_config);
    }
}
```

## Deployment and Distribution

### iOS App Store Deployment

```
iOS Deployment Checklist:
├── Code Signing
│   ├── Development certificates
│   ├── Distribution certificates
│   ├── Provisioning profiles
│   └── App Store Connect setup
├── App Store Requirements
│   ├── Info.plist configuration
│   ├── App icons (all sizes)
│   ├── Launch screens
│   ├── Privacy usage descriptions
│   ├── App Transport Security
│   └── Accessibility compliance
├── Build Configuration
│   ├── Release build optimization
│   ├── Bitcode enablement
│   ├── Symbol stripping
│   └── Asset catalog optimization
├── Testing
│   ├── Device testing (multiple models)
│   ├── iOS version compatibility
│   ├── Performance profiling
│   └── Memory leak detection
└── Submission
    ├── App Store Connect metadata
    ├── Screenshots and previews
    ├── App review information
    └── Release management
```

#### iOS Build Script

```bash
#!/bin/bash
# iOS build and deployment script

APP_NAME="MyKryonApp"
BUNDLE_ID="com.mycompany.mykryonapp"
VERSION="1.0.0"
BUILD_NUMBER="1"

# Clean previous builds
rm -rf build/
mkdir -p build/

# Build Kryon application
echo "Building Kryon application..."
kryc src/app.kry --target=mobile --platform=ios --optimize=max -o build/app.krb

# Configure Xcode project
echo "Configuring Xcode project..."
xcodebuild -project "${APP_NAME}.xcodeproj" \
           -configuration Release \
           -scheme "${APP_NAME}" \
           MARKETING_VERSION="${VERSION}" \
           CURRENT_PROJECT_VERSION="${BUILD_NUMBER}" \
           PRODUCT_BUNDLE_IDENTIFIER="${BUNDLE_ID}" \
           CODE_SIGN_STYLE=Manual \
           DEVELOPMENT_TEAM="${TEAM_ID}" \
           PROVISIONING_PROFILE_SPECIFIER="${PROVISIONING_PROFILE}" \
           clean

# Build for device
echo "Building for iOS device..."
xcodebuild -project "${APP_NAME}.xcodeproj" \
           -configuration Release \
           -scheme "${APP_NAME}" \
           -destination "generic/platform=iOS" \
           -archivePath "build/${APP_NAME}.xcarchive" \
           archive

# Export IPA
echo "Exporting IPA..."
xcodebuild -exportArchive \
           -archivePath "build/${APP_NAME}.xcarchive" \
           -exportPath "build/" \
           -exportOptionsPlist "ExportOptions.plist"

# Validate app
echo "Validating app..."
xcrun altool --validate-app \
             --file "build/${APP_NAME}.ipa" \
             --type ios \
             --username "${APPLE_ID}" \
             --password "${APP_PASSWORD}"

# Upload to App Store Connect
echo "Uploading to App Store Connect..."
xcrun altool --upload-app \
             --file "build/${APP_NAME}.ipa" \
             --type ios \
             --username "${APPLE_ID}" \
             --password "${APP_PASSWORD}"

echo "iOS deployment complete!"
```

### Android Play Store Deployment

```
Android Deployment Checklist:
├── Build Configuration
│   ├── Release build signing
│   ├── ProGuard/R8 optimization
│   ├── APK/AAB generation
│   └── Multiple APK support
├── Play Store Requirements
│   ├── AndroidManifest.xml configuration
│   ├── App icons and graphics
│   ├── Permission declarations
│   ├── Target SDK compliance
│   └── 64-bit architecture support
├── Testing
│   ├── Device compatibility testing
│   ├── Android version testing
│   ├── Performance benchmarking
│   └── Security scanning
├── Play Console Setup
│   ├── App listing information
│   ├── Store listing assets
│   ├── Content rating
│   ├── Pricing and distribution
│   └── App signing by Google Play
└── Release Management
    ├── Internal testing
    ├── Closed testing (alpha/beta)
    ├── Open testing
    └── Production release
```

#### Android Build Script

```bash
#!/bin/bash
# Android build and deployment script

APP_NAME="MyKryonApp"
PACKAGE_NAME="com.mycompany.mykryonapp"
VERSION_NAME="1.0.0"
VERSION_CODE="1"

# Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Build Kryon application
echo "Building Kryon application..."
kryc src/app.kry --target=mobile --platform=android --optimize=max -o app/src/main/assets/app.krb

# Update version information
echo "Updating version information..."
sed -i "s/versionName \".*\"/versionName \"${VERSION_NAME}\"/" app/build.gradle
sed -i "s/versionCode .*/versionCode ${VERSION_CODE}/" app/build.gradle

# Build release APK
echo "Building release APK..."
./gradlew assembleRelease

# Build App Bundle (AAB)
echo "Building App Bundle..."
./gradlew bundleRelease

# Sign APK/AAB
echo "Signing release builds..."
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
          -keystore "${KEYSTORE_PATH}" \
          -storepass "${KEYSTORE_PASSWORD}" \
          -keypass "${KEY_PASSWORD}" \
          app/build/outputs/apk/release/app-release-unsigned.apk \
          "${KEY_ALIAS}"

# Align APK
echo "Aligning APK..."
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk \
            app/build/outputs/apk/release/${APP_NAME}-${VERSION_NAME}.apk

# Validate APK
echo "Validating APK..."
aapt dump badging app/build/outputs/apk/release/${APP_NAME}-${VERSION_NAME}.apk

# Upload to Play Console (using Play Console Upload API)
echo "Uploading to Play Console..."
# This would typically use the Google Play Developer API
# or manual upload through the Play Console web interface

echo "Android deployment complete!"
```

## Best Practices

### 1. Touch Interface Design

```c
// Design for touch interfaces
kryon_result_t kryon_optimize_for_touch(kryon_app_t* app) {
    // Ensure minimum touch target sizes
    kryon_set_minimum_touch_target_size(app, 44.0f); // 44pt iOS, 48dp Android
    
    // Add touch feedback
    kryon_enable_touch_feedback(app, true);
    
    // Optimize for one-handed use
    kryon_set_thumb_zone_priority(app, KRYON_THUMB_ZONE_BOTTOM_RIGHT);
    
    // Configure gesture recognition
    kryon_gesture_config_t gesture_config = {
        .tap_timeout = 200,        // ms
        .double_tap_timeout = 300, // ms
        .long_press_duration = 500, // ms
        .swipe_threshold = 20.0f,  // points
        .pinch_threshold = 10.0f   // points
    };
    
    kryon_configure_gestures(app, &gesture_config);
    
    return KRYON_SUCCESS;
}
```

### 2. Battery-Conscious Development

```c
// Implement battery-conscious patterns
kryon_result_t kryon_implement_battery_best_practices(kryon_app_t* app) {
    // Use efficient update patterns
    kryon_set_update_mode(app, KRYON_UPDATE_ON_DEMAND); // Only update when needed
    
    // Implement frame rate adaptation
    kryon_enable_adaptive_frame_rate(app, true);
    
    // Reduce background processing
    kryon_set_background_processing_limit(app, 5); // 5% CPU when backgrounded
    
    // Use efficient rendering techniques
    kryon_enable_occlusion_culling(app, true);
    kryon_enable_frustum_culling(app, true);
    kryon_set_texture_streaming(app, true);
    
    // Monitor thermal state
    kryon_enable_thermal_monitoring(app, kryon_thermal_state_changed);
    
    return KRYON_SUCCESS;
}

void kryon_thermal_state_changed(kryon_app_t* app, kryon_thermal_state_t state) {
    switch (state) {
        case KRYON_THERMAL_NOMINAL:
            // Normal performance
            kryon_set_performance_mode(app, KRYON_PERFORMANCE_HIGH);
            break;
            
        case KRYON_THERMAL_FAIR:
            // Slight reduction
            kryon_set_performance_mode(app, KRYON_PERFORMANCE_MEDIUM);
            break;
            
        case KRYON_THERMAL_SERIOUS:
            // Significant reduction
            kryon_set_performance_mode(app, KRYON_PERFORMANCE_LOW);
            kryon_reduce_frame_rate(app, 30);
            break;
            
        case KRYON_THERMAL_CRITICAL:
            // Emergency throttling
            kryon_set_performance_mode(app, KRYON_PERFORMANCE_MINIMAL);
            kryon_reduce_frame_rate(app, 15);
            kryon_disable_non_essential_features(app);
            break;
    }
}
```

### 3. Cross-Platform Compatibility

```c
// Ensure consistent behavior across platforms
kryon_result_t kryon_ensure_cross_platform_compatibility(kryon_app_t* app) {
    // Normalize coordinate systems
    kryon_set_coordinate_system(app, KRYON_COORDS_TOP_LEFT_ORIGIN);
    
    // Handle platform-specific UI guidelines
    kryon_platform_t platform = kryon_get_current_platform();
    
    switch (platform) {
        case KRYON_PLATFORM_IOS:
            // iOS Human Interface Guidelines
            kryon_set_navigation_style(app, KRYON_NAV_IOS_STYLE);
            kryon_set_default_fonts(app, "SF Pro Text", "SF Pro Display");
            kryon_enable_swipe_back_gesture(app, true);
            break;
            
        case KRYON_PLATFORM_ANDROID:
            // Material Design Guidelines
            kryon_set_navigation_style(app, KRYON_NAV_MATERIAL_STYLE);
            kryon_set_default_fonts(app, "Roboto", "Roboto");
            kryon_enable_material_ripple_effects(app, true);
            break;
    }
    
    // Handle safe area insets
    kryon_enable_safe_area_handling(app, true);
    
    // Adapt to different screen densities
    kryon_enable_density_independent_sizing(app, true);
    
    return KRYON_SUCCESS;
}
```

### 4. Performance Monitoring

```c
// Implement comprehensive performance monitoring
typedef struct kryon_mobile_performance_monitor {
    float target_frame_time;
    float frame_time_samples[60];  // 1 second of samples at 60fps
    int sample_index;
    
    size_t memory_samples[30];     // 30 seconds of memory samples
    int memory_sample_index;
    
    float battery_drain_rate;
    float thermal_level;
    
    kryon_performance_callback_t callback;
} kryon_mobile_performance_monitor_t;

kryon_result_t kryon_setup_performance_monitoring(kryon_app_t* app,
                                                 kryon_performance_callback_t callback) {
    kryon_mobile_performance_monitor_t* monitor = 
        malloc(sizeof(kryon_mobile_performance_monitor_t));
    
    monitor->target_frame_time = 16.67f; // 60 FPS
    monitor->sample_index = 0;
    monitor->memory_sample_index = 0;
    monitor->callback = callback;
    
    // Start monitoring thread
    kryon_start_performance_monitoring_thread(app, monitor);
    
    return KRYON_SUCCESS;
}

void kryon_performance_monitoring_thread(kryon_app_t* app, 
                                       kryon_mobile_performance_monitor_t* monitor) {
    while (kryon_is_running(app)) {
        // Sample frame time
        float frame_time = kryon_get_last_frame_time(app);
        monitor->frame_time_samples[monitor->sample_index] = frame_time;
        monitor->sample_index = (monitor->sample_index + 1) % 60;
        
        // Sample memory usage every second
        if (monitor->sample_index == 0) {
            size_t memory_usage = kryon_get_memory_usage(app);
            monitor->memory_samples[monitor->memory_sample_index] = memory_usage;
            monitor->memory_sample_index = (monitor->memory_sample_index + 1) % 30;
        }
        
        // Check for performance issues
        float avg_frame_time = kryon_calculate_average_frame_time(monitor);
        if (avg_frame_time > monitor->target_frame_time * 1.2f) {
            // Frame time 20% over target
            monitor->callback(app, KRYON_PERF_WARNING_FRAME_TIME, avg_frame_time);
        }
        
        // Check memory growth
        if (monitor->memory_sample_index == 0) {
            float memory_growth = kryon_calculate_memory_growth(monitor);
            if (memory_growth > 1024 * 1024) { // 1MB growth per 30 seconds
                monitor->callback(app, KRYON_PERF_WARNING_MEMORY_LEAK, memory_growth);
            }
        }
        
        kryon_sleep(16); // Check every 16ms (60 Hz)
    }
}
```

---

The Mobile Runtime provides comprehensive support for creating high-performance, battery-efficient mobile applications that feel native on both iOS and Android platforms. By understanding mobile-specific constraints and following platform guidelines, developers can create applications that provide excellent user experiences while maintaining optimal performance and battery life.
