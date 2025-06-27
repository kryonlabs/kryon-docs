# Kryon Runtime - Minimal AI Specification

## Overview
Unified execution environment for KRB applications across desktop, mobile, web, and embedded platforms.

## Runtime Architecture
- **Application Layer** - KRB application execution
- **Script Engine** - Multi-language support (Lua, JavaScript, Python, Wren)
- **Element System** - Layout, rendering, events, state management
- **KRB Loader** - File I/O, parsing, validation, caching
- **Platform Layer** - Graphics, input, audio, file system abstraction

## Platform Support

### Desktop
- **Platforms**: Windows 10+, macOS 11+, Linux
- **Graphics**: DirectX 11/12, Metal, OpenGL/Vulkan
- **Memory**: 256MB max, 64MB cache
- **Performance**: 0.2-16.7ms/frame for 60 FPS

### Mobile
- **Platforms**: iOS 14.0+, Android 7.0+
- **Graphics**: Metal, Vulkan/OpenGL ES
- **Memory**: 64-128MB limit, battery-optimized
- **Performance**: 0.8-22.1ms/frame for 60 FPS
- **Features**: Touch/gestures, battery optimization, app lifecycle

### Web
- **Browsers**: Chrome 84+, Firefox 79+, Safari 14+, Edge 84+
- **Technology**: WebAssembly with SIMD/threading
- **Graphics**: WebGL 2.0/WebGPU
- **Performance**: 1.2-35.2ms/frame for 60 FPS
- **Features**: PWA support, offline capability

### Embedded
- **Platforms**: ARM Cortex-M, RISC-V, ESP32, STM32
- **Memory**: 32KB-128KB RAM, 128KB-512KB Flash
- **Performance**: 8.3-25.0ms/frame for 24-60 FPS
- **Features**: Ultra-lightweight runtime (50-200KB)

## Performance Metrics

### Loading Performance (typical applications)
```
Desktop: 0.8ms (5KB) to 280ms (5MB)
Mobile:  1.5ms (5KB) to 520ms (5MB)
Web:     2.1ms (5KB) to 780ms (5MB)
Embedded: 4.2ms (5KB) to 156ms (500KB max)
```

### Memory Management
- **Desktop**: Aggressive caching enabled
- **Mobile**: Battery-optimized allocation
- **Web**: Browser memory pressure handling
- **Embedded**: Static pools, frame-based allocation

## Runtime Variants
- **Full Runtime**: Complete features (2-5MB)
- **Minimal Runtime**: Core functionality (500KB-1MB)
- **Embedded Runtime**: Ultra-lightweight (50-200KB)
- **Web Runtime**: Browser-optimized (1-3MB)
- **Server Runtime**: Headless operation

## Scripting Support
- **Languages**: Lua (primary), JavaScript, Python, Wren
- **Features**: UI manipulation, event handling, state management
- **API**: Element access, property manipulation, variable access
- **Integration**: Embedded in KRB files (v1.2+)

## Security Features
- Content Security Policy (web)
- Resource integrity checking
- Cross-origin isolation support
- Secure resource loading with hash validation

## Key Points for AI
1. **Cross-platform consistency** - Same KRB runs everywhere
2. **Performance-optimized** - Fast loading, efficient memory use
3. **Scalable** - From embedded (32KB RAM) to desktop (256MB)
4. **Script-enabled** - Runtime manipulation capabilities
5. **Platform-aware** - Adapts to platform constraints and capabilities
6. **Developer-friendly** - Comprehensive toolchain and debugging support
7. **Production-ready** - Error handling, crash reporting, monitoring