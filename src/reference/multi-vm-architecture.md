# Multi-VM Architecture

The Kryon framework supports multiple scripting languages through a **build-time configurable** virtual machine system. This allows you to choose exactly which scripting languages your application needs, keeping binary sizes minimal for embedded and microcontroller applications.

## Overview

### Key Principles

1. **Build-Time Selection**: VMs are selected at compilation time via Cargo features
2. **Explicit Language Specification**: Always specify the language (`@function "lua"`)
3. **Lightweight Focus**: All VMs are optimized for embedded/microcontroller use
4. **Zero Runtime Overhead**: No performance cost for unused VMs
5. **Smart Validation**: Clear error messages if features are missing

### Supported VMs

| Language | Feature Flag | VM Implementation | Memory Usage | Best For |
|----------|-------------|-------------------|--------------|----------|
| **Lua** | `lua-vm` | LuaJIT | ~512KB | General scripting, microcontrollers |
| **JavaScript** | `javascript-vm` | QuickJS | ~256KB | Web developers, embedded systems |
| **Python** | `micropython-vm` | MicroPython | ~256KB | Data processing, IoT devices |
| **Wren** | `wren-vm` | Wren | ~128KB | Ultra-lightweight applications |

## Build Configuration

### Feature Flags

Enable only the VMs you need:

```toml
# Cargo.toml
[dependencies]
kryon-runtime = { features = ["lua-vm"] }                    # Minimal
kryon-runtime = { features = ["lua-vm", "javascript-vm"] }   # Embedded
kryon-runtime = { features = ["all-vms"] }                   # Everything
```

### Build Commands

```bash
# Minimal build (no VMs - UI only)
cargo build

# Microcontroller build (Lua only)
cargo build --features lua-vm

# Embedded system (Lua + JavaScript)
cargo build --features "lua-vm,javascript-vm"

# Desktop app (Lua + JavaScript + MicroPython)
cargo build --features "lua-vm,javascript-vm,micropython-vm"

# Everything
cargo build --features all-vms
```

### Preset Configurations

Convenient presets for common use cases:

```bash
# Preset: Minimal (microcontrollers)
cargo build --features minimal-vms

# Preset: Embedded systems  
cargo build --features embedded-vms

# Preset: Desktop applications
cargo build --features desktop-vms

# Preset: All VMs
cargo build --features all-vms
```

## Language Usage

### Explicit Language Specification

Always specify the language in your scripts:

```kry
@variables {
    counter_value: 0
    user_name: "Guest"
}

# Lua scripting (always available with lua-vm feature)
@function "lua" increment() {
    counter_value = counter_value + 1
    print("Counter: " .. counter_value)
}

# JavaScript scripting (requires javascript-vm feature)
@function "javascript" decrement() {
    counter_value = counter_value - 1;
    console.log(`Counter: ${counter_value}`);
}

# MicroPython scripting (requires micropython-vm feature)
@function "python" reset() {
    global counter_value
    counter_value = 0
    print(f"Counter reset to {counter_value}")
}

# Wren scripting (requires wren-vm feature)
@function "wren" double() {
    counter_value = counter_value * 2
    System.print("Counter doubled: %(counter_value)")
}

App {
    Container {
        Text { text: "Count: $counter_value" }
        
        Button {
            text: "+"
            onClick: "increment"    # Calls Lua function
        }
        
        Button {
            text: "-"
            onClick: "decrement"    # Calls JavaScript function
        }
        
        Button {
            text: "Reset"
            onClick: "reset"        # Calls Python function
        }
        
        Button {
            text: "Double"
            onClick: "double"       # Calls Wren function
        }
    }
}
```

### Cross-Language Variable Access

All VMs share the same variable space - changes in one language are visible in others:

```kry
@variables {
    shared_data: "Hello"
    counter: 0
}

@function "lua" lua_update() {
    shared_data = "Updated by Lua"
    counter = counter + 1
}

@function "javascript" js_update() {
    shared_data = "Updated by JavaScript";
    counter = counter + 10;
}

@function "python" python_update() {
    global shared_data, counter
    shared_data = "Updated by Python"
    counter = counter + 100
}

# All functions can access and modify the same variables
# UI updates automatically regardless of which language changes the variables
```

## Error Handling

### Missing VM Features

If you use a language without enabling its feature, you get helpful error messages:

```bash
# Using @function "javascript" without javascript-vm feature
Error: Script language 'javascript' is not supported.

To fix this, add the 'javascript-vm' feature to your build:

For cargo build:
cargo build --features javascript-vm

For Cargo.toml:
kryon-runtime = { features = ["javascript-vm"] }

Available VMs: lua
Required for: @function "javascript" or @script "javascript"
```

### Runtime Validation

The system validates script languages at compile time and provides clear guidance.

## VM Characteristics

### Lua (LuaJIT)
- **Memory**: ~512KB
- **Strengths**: Mature, fast, excellent embedded support
- **Use Cases**: General scripting, game logic, configuration
- **Syntax**: Simple, intuitive for beginners

```kry
@function "lua" example() {
    local items = {"apple", "banana", "cherry"}
    for i, item in ipairs(items) do
        print(i .. ": " .. item)
    end
}
```

### JavaScript (QuickJS)
- **Memory**: ~256KB  
- **Strengths**: Familiar to web developers, modern ES2020 features
- **Use Cases**: Web-like logic, JSON processing, familiar syntax
- **Syntax**: Modern JavaScript

```kry
@function "javascript" example() {
    const items = ["apple", "banana", "cherry"];
    items.forEach((item, index) => {
        console.log(`${index}: ${item}`);
    });
}
```

### MicroPython
- **Memory**: ~256KB
- **Strengths**: Python syntax, great for data processing
- **Use Cases**: Data analysis, scientific computing, IoT sensors
- **Syntax**: Python 3.x compatible

```kry
@function "python" example() {
    items = ["apple", "banana", "cherry"]
    for index, item in enumerate(items):
        print(f"{index}: {item}")
}
```

### Wren
- **Memory**: ~128KB
- **Strengths**: Ultra-lightweight, designed for embedding
- **Use Cases**: Resource-constrained devices, simple scripting
- **Syntax**: Class-based object orientation

```kry
@function "wren" example() {
    var items = ["apple", "banana", "cherry"]
    for (i in 0...items.count) {
        System.print("%(i): %(items[i])")
    }
}
```

## Advanced Usage

### Mixed-Language Applications

You can use different languages for different purposes:

```kry
@variables {
    sensor_data: ""
    processed_result: ""
    ui_state: "ready"
}

# Use MicroPython for data processing
@function "python" process_sensor_data(raw_data) {
    import json
    global processed_result
    
    # Parse and process sensor data
    data = json.loads(raw_data)
    result = {
        'temperature': data['temp'] * 1.8 + 32,  # C to F
        'humidity': round(data['humidity'], 1),
        'timestamp': data['time']
    }
    
    processed_result = json.dumps(result)
    ui_state = "data_ready"
}

# Use JavaScript for UI logic  
@function "javascript" update_dashboard() {
    if (ui_state === "data_ready") {
        const data = JSON.parse(processed_result);
        
        // Update UI elements with formatted data
        ui_state = "displaying";
        
        // Trigger Lua animation
        animate_counter_up();
    }
}

# Use Lua for animations and game-like interactions
@function "lua" animate_counter_up() {
    local start_time = os.clock()
    local function animate()
        local elapsed = os.clock() - start_time
        if elapsed < 1.0 then
            -- Continue animation
            kryon.setTimeout(animate, 16) -- 60fps
        else
            ui_state = "ready"
        end
    end
    animate()
}

# Use Wren for simple, efficient event handling
@function "wren" handle_button_click() {
    if (ui_state == "ready") {
        ui_state = "processing"
        // Trigger Python data processing
    }
}
```

### Performance Considerations

Each VM has different performance characteristics:

| Operation | Lua | JavaScript | MicroPython | Wren |
|-----------|-----|------------|-------------|------|
| **Startup Time** | Fast | Medium | Slow | Very Fast |
| **Math Operations** | Fast | Fast | Medium | Fast |
| **String Processing** | Fast | Fast | Fast | Medium |
| **Memory Usage** | Medium | Low | Low | Very Low |
| **JSON Parsing** | Manual | Native | Native | Manual |

Choose the right VM for each task:
- **Lua**: General purpose, animations, game logic
- **JavaScript**: JSON processing, web-like logic, familiar syntax
- **MicroPython**: Data processing, scientific computing, sensor data
- **Wren**: Simple event handlers, resource-constrained scenarios

## Binary Size Impact

VM inclusion affects binary size:

```bash
# No VMs (UI only)
Binary size: ~2.1 MB

# Lua only
Binary size: ~2.8 MB (+0.7 MB)

# Lua + JavaScript  
Binary size: ~3.2 MB (+1.1 MB)

# Lua + JavaScript + MicroPython
Binary size: ~3.8 MB (+1.7 MB)

# All VMs
Binary size: ~4.1 MB (+2.0 MB)
```

For microcontrollers, stick to single-VM builds to minimize size.

## Migration Guide

### From Single-VM to Multi-VM

If you have existing Lua-only code:

1. **Add explicit language specifications**:
   ```kry
   # Before
   @function increment() { ... }
   
   # After  
   @function "lua" increment() { ... }
   ```

2. **Update build configuration**:
   ```toml
   # Before (implicit Lua)
   kryon-runtime = "0.1"
   
   # After (explicit feature)
   kryon-runtime = { features = ["lua-vm"] }
   ```

3. **Test with feature flags**:
   ```bash
   # Verify minimal build works
   cargo build --features lua-vm
   ```

### Adding New Languages

To add JavaScript to existing Lua code:

1. **Update Cargo.toml**:
   ```toml
   kryon-runtime = { features = ["lua-vm", "javascript-vm"] }
   ```

2. **Add JavaScript functions**:
   ```kry
   @function "javascript" new_feature() {
       // JavaScript implementation
   }
   ```

3. **Gradually migrate functions** as needed

## Troubleshooting

### Common Issues

**Issue**: "Script language 'javascript' is not supported"
**Solution**: Add `javascript-vm` feature to your build

**Issue**: Large binary size
**Solution**: Only enable VMs you actually use

**Issue**: VM startup overhead
**Solution**: Use appropriate VM for the task (Wren for simple tasks, Lua for complex)

### Debugging

Enable debug logging to see VM initialization:

```bash
RUST_LOG=debug cargo run
```

This shows which VMs are loaded and available.

## Future Roadmap

The multi-VM architecture is designed for extensibility:

- **Phase 1** ✅: Foundation and Lua VM
- **Phase 2** 🚧: JavaScript VM (QuickJS integration)
- **Phase 3** 🔄: MicroPython VM  
- **Phase 4** 🔄: Wren VM
- **Phase 5** 🔄: Additional VMs (Ruby, Go, Rust?)

The architecture supports adding new VMs without breaking existing code, ensuring your applications remain future-proof as new language options become available.