# Installation

Get up and running with Kryon in minutes.

## Prerequisites

- [Rust](https://rustup.rs/) 1.70 or newer

## Install Compiler

Build the Kryon compiler from source:

```bash
# Clone the repository
git clone https://github.com/kyronlabs/kryon-compiler.git
cd kryon-compiler

# Build with Rust
cargo build --release

# Install globally (optional)
cargo install --path .
```

## Install Renderer

Build the Kryon renderer with your preferred backend:

```bash
# Clone the renderer
git clone https://github.com/kryonlabs/kryon-renderer.git
cd kryon-renderer

# Build all backends
cargo build --workspace --release

# Or build specific backend
cargo build --no-default-features --features wgpu --release     # Desktop
cargo build --no-default-features --features ratatui --release  # Terminal  
cargo build --no-default-features --features raylib --release   # Graphics
```

## Verify Installation

Check that tools are working:

```bash
# Test compiler
cd kryon-compiler
cargo run -- --help

# Test renderer
cd kryon-renderer  
cargo run --bin kryon-renderer-wgpu -- --help
```

## Create Your First App

Create a simple app to test setup:

```bash
mkdir my-kryon-app
cd my-kryon-app
```

Create `main.kry`:

```kry
App {
    window_title: "My First Kryon App"
    window_width: 400
    window_height: 300
    
    Container {
        layout: column center
        padding: 20
        
        Text {
            text: "Hello, Kryon!"
            font_size: 24
        }
    }
}
```

Compile and run:

```bash
# Compile
../kryon-compiler/target/release/kryc main.kry -o app.krb

# Run with desktop renderer
../kryon-renderer/target/release/kryon-renderer-wgpu app.krb

# Or run with terminal renderer
../kryon-renderer/target/release/kryon-renderer-ratatui app.krb
```

## Development Commands

Common commands during development:

```bash
# Compiler
cargo run -- input.kry -o output.krb         # Basic compilation
cargo run -- compile input.kry --watch       # Watch mode
cargo test                                   # Run tests

# Renderer  
cargo test -p kryon-ratatui                  # Run snapshot tests
cargo insta review                           # Review test changes
cargo build --workspace                      # Build all backends
```

## Troubleshooting

**Build fails**: Ensure Rust 1.70+ is installed:
```bash
rustc --version
rustup update
```

**Command not found**: Add cargo bin to PATH:
```bash
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Runtime errors**: Check the error output and ensure your KRB file was compiled successfully.

## What's Next?

**[→ Create Your First App](hello-world.md)**