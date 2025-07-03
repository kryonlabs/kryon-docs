# Desktop Rendering (WGPU)

The WGPU backend provides GPU-accelerated rendering for desktop applications on Windows, macOS, and Linux.

## Features

- Hardware-accelerated graphics via GPU
- Cross-platform window management  
- High-performance rendering suitable for complex UIs
- Supports modern graphics APIs (Vulkan, Metal, DirectX 12, OpenGL)

## Building

```bash
cd kryon-renderer
cargo build --features wgpu --release
```

## Usage

```bash
# Run KRB file with WGPU renderer
./target/release/kryon-renderer-wgpu app.krb
```

## System Requirements

- **Windows**: Windows 10+ with DirectX 11/12 support
- **macOS**: macOS 10.14+ with Metal support  
- **Linux**: OpenGL 3.3+ or Vulkan support

## Performance

The WGPU backend is optimized for:
- Complex layouts with many elements
- Real-time animations and effects
- High frame rate applications (60+ FPS)
- Large screen resolutions

Best suited for desktop applications requiring rich UI and smooth interactions.