# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the Kryon documentation project.

## Project Overview

The `kryon-docs` project provides comprehensive documentation for the KryonLabs UI framework using mdBook. The documentation covers the KRY language, KRB binary format, runtime systems, and practical examples for building cross-platform applications.

## Essential Commands

### Building Documentation
```bash
# Install mdBook if not already installed
cargo install mdbook

# Build documentation
cd kryon-docs && mdbook build

# Serve documentation with live reload (recommended for development)
mdbook serve                    # Serves on http://localhost:3000

# Clean build artifacts
mdbook clean
```

### Development Workflow
```bash
# Watch for changes and auto-rebuild
mdbook serve --open            # Opens browser automatically

# Build for production deployment
mdbook build --dest-dir ./dist

# Check for broken links
mdbook test
```

## Documentation Structure

The documentation is organized into comprehensive sections covering all aspects of the Kryon framework:

### Core Documentation (`src/`)
- **`getting-started/`**: Installation, hello world, core concepts
- **`reference/`**: Complete language and format specifications
  - **`kry/`**: KRY language syntax, elements, styles, components, scripts
  - **`krb/`**: KRB binary format specification and tooling
- **`runtime/`**: Platform-specific runtime guides (desktop, mobile, web, embedded, terminal)
- **`styling/`**: CSS-like styling system with layout engines
- **`cookbook/`**: Practical examples and common patterns
- **`examples/`**: Step-by-step tutorials (calculator, todo-list)
- **`specifications/`**: Technical implementation guides

## Key Documentation Features

### Recent Improvements
- ✅ **DOM API Documentation**: Complete reference for script system element manipulation
- ✅ **Layout System Guide**: Absolute vs flex positioning, layout flags explanation
- ✅ **Percentage Support**: CSS-like percentage sizing documentation
- ✅ **Multi-Backend Support**: Comprehensive runtime backend coverage
- ✅ **Script Integration**: Lua, JavaScript, Python, Wren support details

### Content Standards
- **Code Examples**: All examples are tested against working KRY/KRB files
- **Cross-References**: Links between related concepts and implementations
- **API Documentation**: Complete method signatures and usage examples
- **Troubleshooting**: Common issues and solutions documented
- **Version Coverage**: Documentation reflects current implementation status

## Configuration (`book.toml`)

The documentation build is configured with:
- **Title**: "KryonLabs Documentation"
- **Custom CSS**: Enhanced styling in `assets/custom.css`
- **Theme**: Clean, accessible design with code highlighting
- **Output**: Static HTML suitable for web deployment

## Content Guidelines

### Writing Standards
1. **Clarity**: Technical concepts explained clearly with examples
2. **Completeness**: Cover both basic usage and advanced features
3. **Accuracy**: All code examples must compile and run correctly
4. **Consistency**: Uniform formatting and terminology throughout

### Code Examples
- Use real, working KRY/KRB code when possible
- Include complete examples rather than fragments
- Show expected output or behavior
- Reference corresponding files in `kryon-renderer/examples/`

### Updates Required
- Keep API documentation synchronized with implementation changes
- Update status indicators (✅🟡🔴) based on current development
- Add new features as they are implemented
- Maintain cross-references between docs and code

## Development Status

### Documentation Coverage
- ✅ **Core Language**: Complete KRY syntax and semantics
- ✅ **Runtime Systems**: Multi-backend deployment guides
- ✅ **Script Integration**: DOM API and multi-language support
- ✅ **Layout Engine**: Absolute and flex positioning systems
- 🟡 **Advanced Features**: Animation, resource management (planned)
- 🔴 **Performance**: Optimization guides and benchmarking

### Recent Additions
- **Layout troubleshooting**: Debugging flex vs absolute positioning issues
- **DOM API reference**: getElementById, setVisible, element traversal methods
- **Percentage sizing**: CSS-like responsive layout documentation
- **Multi-backend guides**: Platform-specific deployment instructions

## Integration with Codebase

The documentation project integrates closely with the main Kryon codebase:

- **Examples sync**: Documentation examples mirror `/examples/` directory
- **API coverage**: Script system APIs documented with implementation
- **Status tracking**: Development status reflects current `ROADMAP.md` files
- **Testing**: Documentation examples validated against working code

## Deployment

The documentation is designed for:
- **Local development**: `mdbook serve` for rapid iteration
- **Static hosting**: Generated HTML suitable for GitHub Pages, Netlify
- **Offline use**: Complete documentation available without internet
- **Search**: Full-text search functionality built-in

Focus on keeping documentation current with implementation changes and providing clear, practical guidance for Kryon framework users.