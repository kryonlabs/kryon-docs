#!/bin/bash

# Install Rust and mdBook
curl https://sh.rustup.rs -sSf | sh -s -- -y
source $HOME/.cargo/env

# Install mdBook (latest or pin a version like --version 0.4.37)
cargo install mdbook

# Build the book
mdbook build
