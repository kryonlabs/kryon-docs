# Terminal Rendering (Ratatui)

The Ratatui backend provides terminal-based UI rendering for CLI applications and text-mode interfaces.

## Features

- Text-based UI rendering in terminal
- Cross-platform terminal support
- ASCII art and Unicode character rendering
- Keyboard and mouse input handling
- Minimal resource usage

## Building

```bash
cd kryon-renderer
cargo build --features ratatui --release
```

## Usage

```bash
# Run KRB file with terminal renderer
./target/release/kryon-renderer-ratatui app.krb
```

## System Requirements

- Any terminal with UTF-8 support
- Works over SSH and remote sessions
- Compatible with terminal multiplexers (tmux, screen)

## Features

- Optimized for CLI tools and server applications
- Works in headless environments
- Perfect for remote administration interfaces
- Minimal memory and CPU usage

## Testing

The Ratatui backend is used for snapshot testing:

```bash
# Run snapshot tests
cargo test -p kryon-ratatui

# Review test changes  
cargo insta review
```

This provides deterministic visual verification of UI rendering.