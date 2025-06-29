#!/bin/bash

set -e  # Stop on first error

# Install Rust (if not already installed)
if ! command -v cargo &> /dev/null; then
  echo "Installing Rust..."
  curl https://sh.rustup.rs -sSf | sh -s -- -y
  source $HOME/.cargo/env
else
  echo "Rust is already installed."
fi

# Add Cargo to PATH (important for Netlify)
export PATH="$HOME/.cargo/bin:$PATH"

# Install mdBook
echo "Installing mdBook..."
cargo install mdbook --version 0.4.37

# Build the documentation
echo "Building the book..."
mdbook build
