# Tooling

This document covers the comprehensive toolchain for working with KRB files, including compilers, analyzers, debuggers, and optimization utilities. These tools enable efficient development, debugging, and deployment of Kryon applications.

## Compiler Toolchain

### Primary Compiler (kryc)

The main KRY to KRB compiler with extensive optimization capabilities:

```bash
# Basic compilation
kryc input.kry -o output.krb

# Development build (fast compile, debug info)
kryc input.kry --dev -o debug.krb

# Production build (maximum optimization)
kryc input.kry --release -o production.krb

# Multi-target compilation
kryc input.kry --target=desktop,mobile,web -o builds/

# Include path management
kryc main.kry -I styles/ -I components/ -I ../shared/ -o app.krb
```

### Compiler Options

```bash
# Optimization levels
kryc app.kry --opt=0    # No optimization (fastest compile)
kryc app.kry --opt=1    # Basic optimization (default)
kryc app.kry --opt=2    # Aggressive optimization
kryc app.kry --opt=3    # Maximum optimization (slowest compile)

# Compression settings
kryc app.kry --compress=none      # No compression
kryc app.kry --compress=fast      # LZ4 compression
kryc app.kry --compress=balanced  # Zstd level 6 (default)
kryc app.kry --compress=max       # Zstd level 19

# Target-specific builds
kryc app.kry --target-runtime=1.0  # Compatible with KRB 1.0+
kryc app.kry --target-runtime=1.2  # Use latest features
kryc app.kry --target-platform=embedded  # Optimize for embedded

# Debug options
kryc app.kry --debug-info         # Include source mapping
kryc app.kry --debug-symbols      # Include element names
kryc app.kry --source-maps        # Generate .krb.map file
```

### Compilation Pipeline

The compiler processes files through multiple stages:

```
┌─────────────────────────────────────┐
│          Preprocessing             │
├─────────────────────────────────────┤
│ • Resolve @include directives       │
│ • Expand @variables                 │
│ • Process @script blocks            │
│ • Validate syntax                   │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│            Parsing                  │
├─────────────────────────────────────┤
│ • Build abstract syntax tree       │
│ • Type checking                     │
│ • Semantic analysis                 │
│ • Dependency resolution             │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│          Optimization               │
├─────────────────────────────────────┤
│ • Property deduplication            │
│ • Tree structure compression        │
│ • Dead code elimination             │
│ • Variable resolution               │
└─────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────┐
│         Code Generation             │
├─────────────────────────────────────┤
│ • Binary encoding                   │
│ • String table generation           │
│ • Resource bundling                 │
│ • Checksum calculation              │
└─────────────────────────────────────┘
```

### Build Configuration

```yaml
# .kryconfig - Project configuration file
project:
  name: "MyApp"
  version: "1.0.0"
  author: "Developer Name"

build:
  targets:
    - name: development
      optimization: 1
      compression: fast
      debug_info: true
      
    - name: production  
      optimization: 3
      compression: max
      debug_info: false
      
  includes:
    - "styles/"
    - "components/"
    - "../shared/"
    
  output:
    directory: "dist/"
    naming: "${name}_${target}_${version}.krb"
    
compiler:
  warnings:
    unused_variables: error
    deprecated_features: warn
    missing_properties: warn
    
  features:
    enable_experimental: false
    strict_mode: true
    
optimization:
  string_deduplication: true
  property_sharing: true
  tree_compression: true
  dead_code_elimination: true
  
compression:
  algorithm: zstd
  level: 6
  threshold: 32  # bytes
```

## Analysis Tools

### KRB Inspector (krb-inspect)

Comprehensive analysis of compiled KRB files:

```bash
# Basic file inspection
krb-inspect app.krb

# Detailed analysis with sections
krb-inspect app.krb --sections=all

# Size breakdown analysis
krb-inspect app.krb --size-analysis

# Compression effectiveness
krb-inspect app.krb --compression-report

# Export analysis to JSON
krb-inspect app.krb --format=json -o analysis.json
```

### Inspector Output Example

```
KRB File Analysis: app.krb
═══════════════════════════════════

File Overview:
├── Format Version: 1.2
├── File Size: 15.2 KB (15,543 bytes)
├── Compression: 67% (original: 46.8 KB)
└── Elements: 127 total, 23 unique types

Section Breakdown:
├── Header: 32 bytes (0.2%)
├── String Table: 2.1 KB (13.8%) - 89 strings, 45% compressed
├── Property Blocks: 6.7 KB (43.1%) - 156 blocks, 78% shared
├── Element Tree: 4.2 KB (27.3%) - 127 elements, 12 subtrees shared
├── Scripts: 1.8 KB (11.9%) - 3 Lua scripts, 1,247 lines
└── Resources: 0.4 KB (2.7%) - 8 external resources

Optimization Opportunities:
├── String deduplication: 15 duplicate strings (-234 bytes)
├── Property optimization: 23 redundant properties (-189 bytes)
├── Default value elimination: 45 default values (-267 bytes)
└── Total potential savings: 690 bytes (4.4%)

Performance Estimates:
├── Load time (desktop): ~2.1ms
├── Load time (mobile): ~4.3ms
├── Memory usage: ~28.4 KB
└── First render: ~1.8ms
```

### Property Analyzer (krb-analyze)

Deep analysis of property usage and optimization:

```bash
# Property usage analysis
krb-analyze app.krb --properties

# Find unused styles
krb-analyze app.krb --unused-styles

# Color palette analysis
krb-analyze app.krb --colors

# Font usage report
krb-analyze app.krb --fonts

# Performance hotspots
krb-analyze app.krb --performance
```

### Analysis Report Example

```
Property Usage Analysis
══════════════════════

Most Used Properties:
├── background_color: 67 elements (52.8%)
├── padding: 54 elements (42.5%)
├── text_color: 43 elements (33.9%)
├── font_size: 38 elements (29.9%)
└── border_radius: 31 elements (24.4%)

Property Value Distribution:
├── background_color:
│   ├── "#FFFFFFFF": 23 elements (34.3%)
│   ├── "#007BFFFF": 18 elements (26.9%)
│   ├── "#F8F9FAFF": 12 elements (17.9%)
│   └── Other: 14 values (20.9%)
├── padding:
│   ├── 16px: 21 elements (38.9%)
│   ├── 12px: 15 elements (27.8%)
│   ├── 8px: 10 elements (18.5%)
│   └── Other: 8 values (14.8%)

Optimization Recommendations:
├── Create shared style for common combinations
├── Use variables for repeated color values
├── Consider default padding system
└── Eliminate 12 redundant property assignments

Color Palette (15 unique colors):
├── Primary: #007BFFFF (18 uses)
├── Background: #FFFFFFFF (23 uses)
├── Surface: #F8F9FAFF (12 uses)
├── Text: #212529FF (19 uses)
└── Secondary: #6C757DFF (8 uses)
```

## Debugging Tools

### KRB Debugger (krb-debug)

Interactive debugger for KRB file contents and runtime behavior:

```bash
# Start interactive debugging session
krb-debug app.krb

# Debug specific element
krb-debug app.krb --element="user_profile_card"

# Debug script execution
krb-debug app.krb --script --breakpoints="handleClick,validateForm"

# Memory debugging
krb-debug app.krb --memory --track-leaks

# Performance debugging
krb-debug app.krb --profile --frames=1000
```

### Debugger Commands

```
KRB Debugger Interactive Commands:

File Commands:
  load <file>           Load KRB file
  info                  Show file information
  sections              List all sections
  checksum              Verify file integrity

Element Commands:
  tree                  Show element tree
  element <id>          Inspect specific element
  find <property>       Find elements with property
  path <element>        Show element path
  
Property Commands:
  props <element>       Show element properties
  set <prop> <value>    Set property value
  watch <prop>          Watch property changes
  styles                Show style inheritance

Script Commands:
  scripts               List embedded scripts
  exec <function>       Execute script function
  breakpoint <func>     Set script breakpoint
  step                  Step through script execution
  vars                  Show script variables

Memory Commands:
  memory                Show memory usage
  leaks                 Check for memory leaks
  gc                    Force garbage collection
  pools                 Show memory pool status

Performance Commands:
  profile start         Start performance profiling
  profile stop          Stop and show profile
  frames                Show frame timing
  bottlenecks           Identify performance bottlenecks
```

### Debug Session Example

```
> krb-debug app.krb
KRB Debugger v1.2 - Loading app.krb...
File loaded successfully (15,543 bytes, 127 elements)

(krb-debug) tree
App
├── Container (main_container)
│   ├── Text (app_title)
│   ├── Container (content_area)
│   │   ├── Button (save_button)
│   │   ├── Button (cancel_button)
│   │   └── Input (user_input)
│   └── Text (status_message)

(krb-debug) element save_button
Element: save_button (Button)
├── ID: "save_button"
├── Type: Button (0x04)
├── Property Block: #23
├── Parent: content_area
├── Children: 0
└── Properties:
    ├── text: "Save Document" (string #12)
    ├── background_color: #007BFFFF
    ├── text_color: #FFFFFFFF
    ├── padding: 12
    ├── onClick: "handleSave" (string #34)
    └── style: "primary_button" (style #5)

(krb-debug) watch onClick
Watching property 'onClick' on element 'save_button'

(krb-debug) set text "Save File"
Property 'text' changed: "Save Document" → "Save File"

(krb-debug) profile start
Performance profiling started...

(krb-debug) exec handleSave
Executing script function: handleSave()
Script execution completed (0.42ms)

(krb-debug) profile stop
Performance Profile (1000 frames, 16.67s):
├── Average frame time: 16.67ms
├── Max frame time: 23.41ms  
├── Update time: 2.34ms (14.0%)
├── Render time: 14.33ms (86.0%)
└── Script time: 0.42ms (2.5%)

Bottlenecks:
├── Layout calculation: 8.23ms (49.4% of render)
├── Text rendering: 4.12ms (24.7% of render)
└── Property resolution: 1.98ms (11.9% of render)
```

## Profiling Tools

### Performance Profiler (krb-profile)

Comprehensive performance analysis for KRB files and runtime behavior:

```bash
# Profile loading performance
krb-profile app.krb --load-time

# Profile runtime performance
krb-profile app.krb --runtime --duration=30s

# Profile memory usage
krb-profile app.krb --memory --track-allocations

# Profile script execution
krb-profile app.krb --scripts --detailed

# Generate performance report
krb-profile app.krb --report=html -o performance_report.html
```

### Profiling Output

```
Performance Profile Report
═════════════════════════

Load Performance:
├── File I/O: 0.84ms (18.3%)
├── Validation: 0.21ms (4.6%)
├── String decompression: 1.23ms (26.8%)
├── Property parsing: 1.67ms (36.4%)
├── Element instantiation: 0.64ms (13.9%)
└── Total load time: 4.59ms

Runtime Performance (1000 frames):
├── Frame rate: 59.7 FPS (average)
├── Frame time: 16.72ms (average)
├── Frame variance: ±2.34ms
└── Dropped frames: 3 (0.3%)

Time Distribution:
├── Update phase: 2.89ms (17.3%)
│   ├── Property computation: 1.45ms
│   ├── Layout calculation: 0.98ms
│   └── Event processing: 0.46ms
├── Render phase: 13.83ms (82.7%)
│   ├── Draw calls: 8.92ms
│   ├── Text rendering: 3.41ms
│   └── Compositing: 1.50ms

Memory Profile:
├── Peak memory: 2.8 MB
├── Average memory: 2.3 MB
├── Allocations: 1,247 total
├── Deallocations: 1,244 total
├── Leaks detected: 3 (0.2%)

Hotspots:
├── Text::render() - 28.4% of render time
├── Container::layout() - 19.7% of render time
├── Property::resolve() - 14.2% of total time
└── String::decompress() - 8.9% of load time
```

### Memory Profiler (krb-memory)

Detailed memory usage analysis and leak detection:

```bash
# Memory usage breakdown
krb-memory app.krb --breakdown

# Leak detection
krb-memory app.krb --leaks --duration=60s

# Allocation tracking
krb-memory app.krb --track-allocs --detail

# Memory optimization suggestions
krb-memory app.krb --optimize
```

## Optimization Tools

### Size Optimizer (krb-optimize)

Automated optimization of KRB files for minimal size:

```bash
# Automatic optimization
krb-optimize input.krb -o optimized.krb

# Aggressive optimization (may affect compatibility)
krb-optimize input.krb --aggressive -o optimized.krb

# Custom optimization settings
krb-optimize input.krb --strings=max --properties=aggressive --tree=balanced -o optimized.krb

# Show optimization opportunities without applying
krb-optimize input.krb --dry-run --verbose
```

### Optimization Report

```
Optimization Analysis: app.krb → optimized.krb
════════════════════════════════════════════

Original Size: 15,543 bytes
Optimized Size: 11,247 bytes
Reduction: 4,296 bytes (27.6%)

Applied Optimizations:
├── String deduplication: -1,234 bytes (7.9%)
│   ├── Removed 23 duplicate strings
│   ├── Applied substring optimization
│   └── Increased compression ratio to 78%
├── Property optimization: -1,879 bytes (12.1%)
│   ├── Eliminated 45 default values
│   ├── Shared 67 common property blocks
│   └── Packed boolean arrays
├── Tree compression: -892 bytes (5.7%)
│   ├── Shared 12 identical subtrees
│   ├── Applied pattern templates
│   └── Optimized element ordering
├── Variable resolution: -291 bytes (1.9%)
│   ├── Resolved 34 compile-time variables
│   └── Eliminated unused variables

Performance Impact:
├── Load time: 4.59ms → 3.21ms (-30.1%)
├── Memory usage: 2.8MB → 2.1MB (-25.0%)
├── Parse time: 1.67ms → 1.23ms (-26.3%)
└── First render: No significant change

Recommendations:
├── Consider using more shared styles
├── Eliminate 8 unused color definitions
├── Compress remaining 12 small images
└── Review script dependencies for further reduction
```

### Compatibility Checker (krb-compat)

Verify compatibility across different runtime versions and platforms:

```bash
# Check compatibility with runtime versions
krb-compat app.krb --runtime=1.0,1.1,1.2

# Platform compatibility analysis
krb-compat app.krb --platform=desktop,mobile,web,embedded

# Feature usage analysis
krb-compat app.krb --features

# Generate compatibility matrix
krb-compat app.krb --matrix -o compatibility.html
```

### Compatibility Report

```
Compatibility Analysis: app.krb
══════════════════════════════

Runtime Compatibility:
├── KRB 1.0: ⚠️  Partial (87% compatible)
│   ├── ❌ Uses pseudo-selectors (not supported)
│   ├── ❌ Advanced script features (limited support)
│   └── ✅ Core functionality supported
├── KRB 1.1: ✅ Fully compatible
├── KRB 1.2: ✅ Fully compatible (native)

Platform Compatibility:
├── Desktop: ✅ Fully supported
├── Mobile: ✅ Fully supported  
├── Web: ⚠️  Limited (92% compatible)
│   ├── ❌ Native file access (use fetch API)
│   └── ⚠️  Some script APIs unavailable
├── Embedded: ❌ Not compatible
│   ├── ❌ File size too large (15KB > 8KB limit)
│   ├── ❌ Complex scripts not supported
│   └── ❌ Memory usage exceeds limits

Feature Usage:
├── Core Elements: ✅ All supported
├── Advanced Layout: ✅ Supported in KRB 1.1+
├── Pseudo-selectors: ⚠️  KRB 1.2+ only
├── Script Integration: ⚠️  Platform dependent
├── Resource Loading: ✅ Universally supported

Recommendations:
├── For KRB 1.0: Remove pseudo-selectors, simplify scripts
├── For embedded: Reduce file size, remove scripts
├── For web: Use web-compatible APIs only
└── Consider creating platform-specific builds
```

## Development Tools

### Live Reload Server (krb-serve)

Development server with live reload capabilities:

```bash
# Start development server
krb-serve --watch src/ --port 3000

# With automatic compilation
krb-serve --watch src/ --compile --target=web

# Custom configuration
krb-serve --config krb-serve.json
```

### Server Configuration

```json
{
  "port": 3000,
  "watch": ["src/", "assets/"],
  "ignore": ["*.tmp", "node_modules/"],
  "compile": {
    "enabled": true,
    "target": "development",
    "output": "dist/app.krb"
  },
  "livereload": {
    "enabled": true,
    "delay": 100
  },
  "cors": {
    "enabled": true,
    "origins": ["http://localhost:*"]
  }
}
```

### Project Generator (krb-init)

Bootstrap new Kryon projects with templates:

```bash
# Create new project
krb-init my-app

# Use specific template
krb-init my-app --template=dashboard

# Custom configuration
krb-init my-app --author="John Doe" --license=MIT
```

### Project Templates

```
Available Templates:
├── basic: Simple single-page application
├── dashboard: Admin dashboard with sidebar
├── form: Form-heavy application
├── mobile: Mobile-first responsive design
├── game: Game UI with custom components
├── portfolio: Portfolio/showcase layout
└── custom: Minimal template for custom projects

Generated Structure:
my-app/
├── src/
│   ├── main.kry
│   ├── styles/
│   │   ├── theme.kry
│   │   └── components.kry
│   ├── components/
│   │   ├── buttons.kry
│   │   └── cards.kry
│   └── scripts/
│       └── app.lua
├── assets/
│   ├── images/
│   └── fonts/
├── .kryconfig
├── .gitignore
└── README.md
```

## Integration Tools

### Build System Integration

#### Webpack Plugin

```javascript
// webpack.config.js
const KryonPlugin = require('@kryon/webpack-plugin');

module.exports = {
  plugins: [
    new KryonPlugin({
      entry: './src/main.kry',
      output: './dist/app.krb',
      optimization: 'production',
      watch: process.env.NODE_ENV === 'development'
    })
  ]
};
```

#### Vite Plugin

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import kryon from '@kryon/vite-plugin';

export default defineConfig({
  plugins: [
    kryon({
      src: './src/main.kry',
      dest: './dist/app.krb',
      hot: true // Hot module replacement
    })
  ]
});
```

#### Rollup Plugin

```javascript
// rollup.config.js
import kryon from '@kryon/rollup-plugin';

export default {
  plugins: [
    kryon({
      input: 'src/main.kry',
      output: 'dist/app.krb',
      compress: true
    })
  ]
};
```

### CI/CD Integration

#### GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build Kryon App

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Kryon
      uses: kryon-lang/setup-kryon@v1
      with:
        version: '1.2'
        
    - name: Install dependencies
      run: kryon install
      
    - name: Build application
      run: kryon build --target=production
      
    - name: Run tests
      run: kryon test
      
    - name: Analyze build
      run: krb-analyze dist/app.krb --report=json > analysis.json
      
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: kryon-build
        path: |
          dist/
          analysis.json
```

#### Docker Integration

```dockerfile
# Dockerfile
FROM kryon/builder:1.2 AS builder

WORKDIR /app
COPY src/ ./src/
COPY .kryconfig ./

RUN kryon build --target=production --optimize=max

FROM kryon/runtime:1.2-alpine

COPY --from=builder /app/dist/app.krb /app/
EXPOSE 3000

CMD ["kryon-serve", "/app/app.krb"]
```

## Utility Tools

### Format Converter (krb-convert)

Convert between different Kryon formats:

```bash
# Convert KRB to readable format
krb-convert app.krb --to=kry -o readable.kry

# Convert to JSON representation
krb-convert app.krb --to=json -o app.json

# Convert to XML format
krb-convert app.krb --to=xml -o app.xml

# Batch conversion
krb-convert *.krb --to=kry --output-dir=readable/
```

### Diff Tool (krb-diff)

Compare KRB files and show differences:

```bash
# Compare two KRB files
krb-diff app_v1.krb app_v2.krb

# Show only size differences
krb-diff app_v1.krb app_v2.krb --size-only

# Generate HTML diff report
krb-diff app_v1.krb app_v2.krb --format=html -o diff.html

# Compare directory of KRB files
krb-diff old_build/ new_build/ --recursive
```

### Merge Tool (krb-merge)

Combine multiple KRB files:

```bash
# Merge multiple KRB files
krb-merge header.krb content.krb footer.krb -o combined.krb

# Merge with namespace prefixing
krb-merge --namespace app1.krb app2.krb -o merged.krb

# Selective merging
krb-merge base.krb --include-styles styles.krb --include-scripts scripts.krb
```

## Editor Integration

### VS Code Extension

```json
// .vscode/settings.json
{
  "kryon.compiler.path": "/usr/local/bin/kryc",
  "kryon.compile.onSave": true,
  "kryon.debug.autoAttach": true,
  "kryon.format.tabSize": 2,
  "kryon.lint.enabled": true,
  "kryon.preview.enabled": true
}
```

### Language Server Features

```
Kryon Language Server Features:
├── Syntax highlighting
├── Auto-completion
├── Error diagnostics
├── Go to definition
├── Find references
├── Rename refactoring
├── Code formatting
├── Live preview
├── Integrated debugging
└── Performance hints
```

## Best Practices

### 1. Development Workflow

```bash
# Recommended development workflow
# 1. Initialize project
krb-init my-project --template=dashboard

# 2. Start development server
cd my-project
krb-serve --watch src/ --compile

# 3. Edit files with live reload
# Files automatically recompile and browser refreshes

# 4. Regular analysis during development
krb-analyze dist/app.krb --quick

# 5. Optimize before release
krb-optimize dist/app.krb -o dist/app-optimized.krb

# 6. Verify compatibility
krb-compat dist/app-optimized.krb --platform=all
```

### 2. Performance Monitoring

```bash
# Set up continuous performance monitoring
# 1. Profile during development
krb-profile app.krb --runtime --baseline

# 2. Track performance changes
krb-profile app.krb --compare-to=baseline.json

# 3. Automated performance testing
krb-test app.krb --performance --threshold=16ms

# 4. Memory leak detection
krb-memory app.krb --leaks --ci-mode
```

### 3. Build Optimization

```yaml
# Optimize build pipeline
# .kryconfig
build:
  profiles:
    development:
      optimization: 1
      compression: fast
      debug_info: true
      hot_reload: true
      
    testing:
      optimization: 2
      compression: balanced
      debug_info: true
      test_coverage: true
      
    production:
      optimization: 3
      compression: max
      debug_info: false
      tree_shaking: true

automation:
  pre_build:
    - krb-analyze --quick
    - krb-lint --strict
    
  post_build:
    - krb-compat --verify
    - krb-optimize --if-beneficial
    - krb-test --smoke
```

### 4. Debugging Strategy

```bash
# Systematic debugging approach
# 1. Start with file inspection
krb-inspect app.krb --health-check

# 2. Use interactive debugger for complex issues
krb-debug app.krb --interactive

# 3. Profile performance bottlenecks
krb-profile app.krb --hotspots

# 4. Memory debugging for stability issues
krb-memory app.krb --track-leaks --detailed

# 5. Script debugging for logic issues
krb-debug app.krb --script --step-through
```

---

The Kryon toolchain provides comprehensive support for the entire development lifecycle, from initial project creation to production optimization and debugging. These tools ensure efficient development, optimal performance, and reliable deployment of Kryon applications across all target platforms.
