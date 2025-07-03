# Kryon Documentation

**Build cross-platform user interfaces with a compact binary format**

Kryon is a UI framework that compiles declarative `.kry` files into optimized `.krb` binaries for fast, cross-platform rendering.

## What is Kryon?

Kryon consists of two main parts:

- **KRY Language** (`.kry`) - Declarative UI language for describing interfaces
- **KRB Binary** (`.krb`) - Compact binary format optimized for fast parsing

You write UI in `.kry` files, compile with `kryc`, and render with various backends.

## Quick Example

```kry
App {
    window_title: "Hello Kryon"
    window_width: 400
    window_height: 300
    
    Container {
        layout: column center
        padding: 20
        
        Text {
            text: "Welcome to Kryon!"
            font_size: 24
        }
        
        Button {
            text: "Click Me"
            background_color: "#007BFFFF"
            text_color: "#FFFFFFFF"
            padding: 12
            border_radius: 6
        }
    }
}
```

## Current Implementation

Kryon is in active development with these working components:

### Compiler (`kryon-compiler`)
- Rust-based compiler for KRY→KRB transformation
- Basic language parsing and binary generation
- Repository: [github.com/kryonlabs/kryon-compiler](https://github.com/kryonlabs/kryon-compiler)

### Renderer (`kryon-renderer`) 
- Multiple rendering backends:
  - **WGPU**: GPU-accelerated desktop rendering
  - **Ratatui**: Terminal-based UI for CLI applications  
  - **Raylib**: Simple 2D/3D graphics
- Repository: [github.com/kryonlabs/kryon-renderer](https://github.com/kryonlabs/kryon-renderer)

## How It Works

```
┌─────────────┐    ┌──────────┐    ┌─────────────┐
│   app.kry   │───▶│   kryc   │───▶│   app.krb   │
│ (Source UI) │    │(Compiler)│    │ (Binary UI) │
└─────────────┘    └──────────┘    └─────────────┘
                                           │
                                           ▼
                                   ┌─────────────┐
                                   │   Renderer  │
                                   │ (WGPU/etc.) │
                                   └─────────────┘
```

## Platform Support

Current renderer backends support:

- **Desktop**: Windows, macOS, Linux (via WGPU)
- **Terminal**: Any terminal that supports Ratatui
- **Graphics**: Cross-platform via Raylib

## Get Started

Ready to try Kryon? Start with installation:

**[→ Installation Guide](getting-started/installation.md)**

Or explore the documentation:

- **[Hello World](getting-started/hello-world.md)** - Build your first app
- **[Core Concepts](getting-started/core-concepts.md)** - Understand the basics
- **[Language Reference](reference/kry/syntax.md)** - Complete syntax guide
- **[Examples](examples/calculator.md)** - Working projects

## License

Kryon is licensed under [0BSD](https://opensource.org/licenses/0BSD) - public domain equivalent.

---

**Website**: [kryonlabs.com](https://kryonlabs.com) | **Documentation**: [docs.kryonlabs.com](https://docs.kryonlabs.com)