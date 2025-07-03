# Graphics Rendering (Raylib)

The Raylib backend provides simple 2D/3D graphics rendering for games and multimedia applications.

## Features

- Easy-to-use 2D and 3D graphics
- Built-in audio support
- Cross-platform window management
- Simple game development workflow
- Lightweight and fast

## Building

```bash
cd kryon-renderer
cargo build --features raylib --release
```

## Usage

```bash
# Run KRB file with Raylib renderer
./target/release/kryon-renderer-raylib app.krb
```

## System Requirements

- **Windows**: Windows 7+
- **macOS**: macOS 10.12+
- **Linux**: X11 or Wayland support

## Use Cases

- Game prototypes and simple games
- Educational applications
- Graphics demonstrations
- Multimedia presentations

## Performance

Best suited for:
- Simple to moderate complexity graphics
- 2D games and animations
- Rapid prototyping
- Learning graphics programming

The Raylib backend provides an easy entry point for graphics programming while maintaining good performance for most use cases.