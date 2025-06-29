# Kryon Documentation

Build efficient, cross-platform user interfaces

## Overview

This repository contains the documentation for Kryon, built using [mdBook](https://rust-lang.github.io/mdBook/).

## Prerequisites

- [Rust](https://rustup.rs/) (for mdBook)
- [mdBook](https://rust-lang.github.io/mdBook/guide/installation.html)

## Installation

1. Install Rust if you haven't already:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. Install mdBook:
   ```bash
   cargo install mdbook
   ```

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/kryonlabs/kryon-docs.git
   cd kryon-docs
   ```

2. Serve the book locally with live reload:
   ```bash
   mdbook serve
   ```

3. Open your browser to `http://localhost:3000`

## Building

To build the static website:

```bash
mdbook build
```

The generated site will be in the `book/` directory.

## Deployment

This repository uses GitHub Actions to automatically build and deploy the documentation to GitHub Pages when changes are pushed to the main branch.

## Contributing

1. Edit the markdown files in the `src/` directory
2. Test your changes locally with `mdbook serve`
3. Submit a pull request

## Structure

- `src/` - Source markdown files
- `book.toml` - mdBook configuration
- `assets/` - Custom CSS and other assets
- `book/` - Generated static site (auto-generated)

