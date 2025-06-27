# Pseudo-Selectors

Pseudo-selectors in KRY provide a powerful way to style elements based on their interactive states. They enable responsive, dynamic styling that reacts to user interactions without requiring scripts, creating more engaging and polished user interfaces.

## Basic Pseudo-Selector Syntax

Pseudo-selectors use CSS-like syntax with the `&:` prefix within element or style definitions:

```kry
Button {
    # Base properties
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    
    # Hover state
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    # Active state (being clicked)
    &:active {
        background_color: "#004085FF"
    }
}
```

## Available Pseudo-Selectors

### :hover

Triggered when the mouse cursor is over the element:

```kry
Button {
    background_color: "#6C757DFF"
    text_color: "#FFFFFFFF"
    
    &:hover {
        background_color: "#5A6268FF"
        cursor: "pointer"
        transform: "translateY(-1px)"  # Subtle lift effect
    }
}

# Hover effects for different elements
Text {
    text_color: "#007BFFFF"
    
    &:hover {
        text_color: "#0056B3FF"
        cursor: "pointer"
        text_decoration: "underline"
    }
}

Container {
    background_color: "#F8F9FAFF"
    border_radius: 8
    padding: 16
    
    &:hover {
        background_color: "#E9ECEFFF"
        shadow_color: "#0000001A"
        shadow_offset_y: 2
        shadow_blur: 8
    }
}
```

### :active

Triggered while the element is being pressed or clicked:

```kry
Button {
    background_color: "#007BFFFF"
    
    &:hover {
        background_color: "#0056B3FF"
    }
    
    &:active {
        background_color: "#004085FF"
        transform: "translateY(1px)"  # Press down effect
        shadow_offset_y: 0            # Reduce shadow when pressed
    }
}

# Different active effects
Container {
    background_color: "#FFFFFFFF"
    border_color: "#DEE2E6FF"
    border_width: 2
    
    &:active {
        border_color: "#007BFFFF"
        background_color: "#F8F9FAFF"
    }
}
```

### :focus

Triggered when the element has keyboard focus:

```kry
Input {
    border_color: "#CED4DAFF"
    border_width: 1
    padding: 8
    
    &:focus {
        border_color: "#007BFFFF"
        border_width: 2
        background_color: "#FFFFFFFF"
        box_shadow: "0 0 0 3px rgba(0, 123, 255, 0.25)"
    }
}

Button {
    background_color: "#007BFFFF"
    
    &:focus {
        border_color: "#FFFFFFFF"
        border_width: 2
        box_shadow: "0 0 0 2px #007BFFFF"
    }
}

# Focus indicators for accessibility
Text {
    padding: 4
    
    &:focus {
        background_color: "#FFF3CDFF"
        border_color: "#FFEAA7FF"
        border_width: 1
        border_radius: 2
    }
}
```

### :disabled

Applies when the element's `disabled` property is true:

```kry
Button {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    
    &:disabled {
        background_color: "#6C757DFF"
        text_color: "#AAAAAAR"
        cursor: "not_allowed"
        opacity: 0.6
    }
    
    # Disabled buttons don't respond to hover
    &:hover:not(:disabled) {
        background_color: "#0056B3FF"
    }
}

Input {
    background_color: "#FFFFFFFF"
    border_color: "#CED4DAFF"
    
    &:disabled {
        background_color: "#E9ECEFFF"
        text_color: "#6C757DFF"
        cursor: "not_allowed"
    }
}
```

### :checked

Applies to checkboxes, radio buttons, and toggle elements when selected:

```kry
# Custom checkbox styling
Button {
    # Represents a checkbox
    width: 20
    height: 20
    background_color: "#FFFFFFFF"
    border_color: "#CED4DAFF"
    border_width: 1
    border_radius: 3
    
    &:checked {
        background_color: "#007BFFFF"
        border_color: "#007BFFFF"
        
        # Add checkmark (pseudo-content, runtime-dependent)
        content: "✓"
        text_color: "#FFFFFFFF"
        font_size: 12
    }
    
    &:hover:not(:disabled) {
        border_color: "#007BFFFF"
    }
    
    &:disabled {
        background_color: "#F8F9FAFF"
        border_color: "#DEE2E6FF"
        
        &:checked {
            background_color: "#E9ECEFFF"
        }
    }
}

# Toggle switch styling
Container {
    # Toggle switch container
    width: 44
    height: 24
    background_color: "#CED4DAFF"
    border_radius: 12
    
    &:checked {
        background_color: "#007BFFFF"
    }
    
    # Toggle indicator
    Container {
        width: 20
        height: 20
        background_color: "#FFFFFFFF"
        border_radius: 10
        pos_x: 2
        pos_y: 2
        transition: "all 0.2s ease"
        
        # Move indicator when checked
        parent:checked & {
            pos_x: 22
        }
    }
}
```

## Combining Pseudo-Selectors

### Multiple States

Combine pseudo-selectors to target specific state combinations:

```kry
Button {
    background_color: "#007BFFFF"
    
    # Hover when not disabled
    &:hover:not(:disabled) {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    # Focus when not disabled
    &:focus:not(:disabled) {
        border_color: "#FFFFFFFF"
        border_width: 2
    }
    
    # Active when not disabled
    &:active:not(:disabled) {
        background_color: "#004085FF"
    }
    
    # Focus and hover together
    &:focus:hover {
        background_color: "#0056B3FF"
        border_color: "#FFFFFFFF"
        border_width: 2
        box_shadow: "0 0 0 3px rgba(255, 255, 255, 0.3)"
    }
    
    # Disabled state overrides all others
    &:disabled {
        background_color: "#6C757DFF"
        cursor: "not_allowed"
        opacity: 0.6
    }
}
```

### Logical Combinations

Use logical operators to create complex state targeting:

```kry
Input {
    border_color: "#CED4DAFF"
    border_width: 1
    
    # Focus OR hover (when not disabled)
    &:focus:not(:disabled),
    &:hover:not(:disabled) {
        border_color: "#007BFFFF"
    }
    
    # Focus AND hover together
    &:focus:hover:not(:disabled) {
        border_color: "#0056B3FF"
        border_width: 2
        box_shadow: "0 0 0 3px rgba(0, 123, 255, 0.25)"
    }
    
    # Invalid input styling (custom property)
    &[invalid]:not(:focus) {
        border_color: "#DC3545FF"
        background_color: "#F8D7DAFF"
    }
    
    # Valid input styling
    &[valid]:not(:focus) {
        border_color: "#28A745FF"
        background_color: "#D4EDDDFF"
    }
}
```

## Pseudo-Selectors in Styles

### Style-Based Pseudo-Selectors

Define pseudo-selectors within style definitions for reuse:

```kry
style "interactive_button" {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    border_width: 0
    cursor: "pointer"
    transition: "all 0.15s ease"
    
    &:hover {
        background_color: "#0056B3FF"
        transform: "translateY(-1px)"
        shadow_color: "#00000020"
        shadow_offset_y: 2
        shadow_blur: 4
    }
    
    &:active {
        background_color: "#004085FF"
        transform: "translateY(0px)"
        shadow_offset_y: 1
        shadow_blur: 2
    }
    
    &:focus {
        border_color: "#FFFFFFFF"
        border_width: 2
        box_shadow: "0 0 0 2px rgba(0, 123, 255, 0.5)"
    }
    
    &:disabled {
        background_color: "#6C757DFF"
        text_color: "#AAAAAAR"
        cursor: "not_allowed"
        opacity: 0.6
        transform: "none"
        shadow_offset_y: 0
        shadow_blur: 0
    }
}

# Apply to multiple buttons
Button {
    text: "Primary Action"
    style: "interactive_button"
}

Button {
    text: "Secondary Action"
    style: "interactive_button"
}
```

### Inheriting Pseudo-Selectors

Pseudo-selectors inherit through style extension:

```kry
style "base_button" {
    padding: 12
    border_radius: 6
    font_weight: 500
    transition: "all 0.2s ease"
    
    &:hover {
        transform: "translateY(-1px)"
        cursor: "pointer"
    }
    
    &:active {
        transform: "translateY(0px)"
    }
    
    &:disabled {
        cursor: "not_allowed"
        opacity: 0.6
    }
}

style "primary_button" {
    extends: "base_button"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    
    &:hover {
        background_color: "#0056B3FF"
        # Inherits transform from base_button
    }
    
    &:active {
        background_color: "#004085FF"
        # Inherits transform from base_button
    }
}

style "danger_button" {
    extends: "base_button"
    background_color: "#DC3545FF"
    text_color: "#FFFFFFFF"
    
    &:hover {
        background_color: "#C82333FF"
        # Inherits transform from base_button
    }
    
    &:active {
        background_color: "#BD2130FF"
        # Inherits transform from base_button
    }
}
```

## Advanced Pseudo-Selector Patterns

### Component State Management

Use pseudo-selectors with components for consistent state styling:

```kry
Define StateButton {
    Properties {
        button_text: String = "Button"
        variant: Enum(primary, secondary, success, danger) = primary
        size: Enum(small, medium, large) = medium
        loading: Bool = false
    }
    
    Button {
        text: $loading ? "Loading..." : $button_text
        disabled: $loading
        
        # Size-based properties
        padding: $size == small ? 8 : ($size == large ? 16 : 12)
        font_size: $size == small ? 12 : ($size == large ? 18 : 14)
        
        # Base variant styling
        @if $variant == primary {
            background_color: "#007BFFFF"
            text_color: "#FFFFFFFF"
            
            &:hover:not(:disabled) {
                background_color: "#0056B3FF"
            }
            
            &:active:not(:disabled) {
                background_color: "#004085FF"
            }
        } @elif $variant == danger {
            background_color: "#DC3545FF"
            text_color: "#FFFFFFFF"
            
            &:hover:not(:disabled) {
                background_color: "#C82333FF"
            }
            
            &:active:not(:disabled) {
                background_color: "#BD2130FF"
            }
        }
        
        # Common interactive states
        &:focus:not(:disabled) {
            border_color: "#FFFFFFFF"
            border_width: 2
        }
        
        &:disabled {
            background_color: "#6C757DFF"
            text_color: "#AAAAAAR"
            cursor: "not_allowed"
            opacity: 0.6
        }
        
        # Loading state
        @if $loading {
            cursor: "wait"
            
            &::after {
                content: ""
                width: 12
                height: 12
                border: "2px solid transparent"
                border_top: "2px solid currentColor"
                border_radius: "50%"
                animation: "spin 1s linear infinite"
            }
        }
    }
}
```

### Form Validation States

Create comprehensive form validation styling:

```kry
style "form_input" {
    padding: 8
    border_radius: 4
    border_width: 1
    border_color: "#CED4DAFF"
    background_color: "#FFFFFFFF"
    font_size: 14
    transition: "all 0.15s ease"
    
    # Focus state
    &:focus {
        border_color: "#007BFFFF"
        border_width: 2
        box_shadow: "0 0 0 3px rgba(0, 123, 255, 0.25)"
    }
    
    # Hover state (when not focused)
    &:hover:not(:focus) {
        border_color: "#ADB5BDFF"
    }
    
    # Disabled state
    &:disabled {
        background_color: "#E9ECEFFF"
        border_color: "#E9ECEFFF"
        text_color: "#6C757DFF"
        cursor: "not_allowed"
    }
    
    # Valid state
    &[data-valid="true"]:not(:focus) {
        border_color: "#28A745FF"
        background_color: "#F8FFF9FF"
        
        &:hover {
            border_color: "#1E7E34FF"
        }
    }
    
    # Invalid state
    &[data-valid="false"]:not(:focus) {
        border_color: "#DC3545FF"
        background_color: "#FFF5F5FF"
        
        &:hover {
            border_color: "#C82333FF"
        }
    }
    
    # Required field indicator
    &[required] {
        # Could add visual indicator for required fields
    }
}

# Usage with validation
Input {
    style: "form_input"
    data-valid: "false"  # Set by validation script
    required: true
}
```

### Progressive Enhancement

Layer pseudo-selectors for progressive enhancement:

```kry
Button {
    # Base styling (works everywhere)
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    
    # Level 1: Basic hover support
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    # Level 2: Enhanced interactions
    &:active {
        background_color: "#004085FF"
    }
    
    &:focus {
        border_color: "#FFFFFFFF"
        border_width: 2
    }
    
    # Level 3: Advanced effects (if supported)
    @supports (transform) {
        transition: "all 0.2s ease"
        
        &:hover {
            transform: "translateY(-1px)"
        }
        
        &:active {
            transform: "translateY(0px)"
        }
    }
    
    @supports (box-shadow) {
        &:hover {
            shadow_color: "#00000020"
            shadow_offset_y: 2
            shadow_blur: 4
        }
        
        &:focus {
            box_shadow: "0 0 0 3px rgba(0, 123, 255, 0.25)"
        }
    }
}
```

## Performance Considerations

### Efficient Pseudo-Selector Usage

```kry
# Efficient: Simple property changes
Button {
    background_color: "#007BFFFF"
    
    &:hover {
        background_color: "#0056B3FF"  # Fast color change
    }
}

# Less efficient: Complex layout changes
Button {
    width: 100
    
    &:hover {
        width: 120  # Triggers layout recalculation
        padding: 20 # More layout changes
    }
}

# Optimal: Transform-based effects
Button {
    background_color: "#007BFFFF"
    
    &:hover {
        transform: "scale(1.05)"  # GPU-accelerated, smooth
    }
}
```

### Minimize Pseudo-Selector Complexity

```kry
# Good: Simple, focused pseudo-selectors
Button {
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
    }
    
    &:active {
        background_color: "#004085FF"
    }
    
    &:disabled {
        opacity: 0.6
        cursor: "not_allowed"
    }
}

# Avoid: Overly complex combinations
Button {
    &:hover:active:focus:not(:disabled):not([aria-pressed="true"]):nth-child(odd) {
        # Too complex, hard to maintain and debug
    }
}
```

## Best Practices

### 1. Provide Clear Visual Feedback

```kry
# Good: Clear state changes
Button {
    background_color: "#007BFFFF"
    
    &:hover {
        background_color: "#0056B3FF"  # Noticeable change
        cursor: "pointer"              # Clear interaction hint
    }
    
    &:active {
        background_color: "#004085FF"  # Clear pressed state
    }
    
    &:focus {
        border_color: "#FFFFFFFF"      # Clear focus indicator
        border_width: 2
    }
}

# Avoid: Subtle or unclear changes
Button {
    background_color: "#007BFFFF"
    
    &:hover {
        background_color: "#007CFFFF"  # Too subtle
    }
}
```

### 2. Maintain Accessibility

```kry
# Accessible focus indicators
Input {
    border_color: "#CED4DAFF"
    
    &:focus {
        border_color: "#007BFFFF"
        border_width: 2
        box_shadow: "0 0 0 3px rgba(0, 123, 255, 0.25)"  # High contrast
    }
}

# Accessible disabled states
Button {
    background_color: "#007BFFFF"
    
    &:disabled {
        background_color: "#6C757DFF"
        text_color: "#FFFFFFFF"        # Maintain contrast
        cursor: "not_allowed"          # Clear disabled indication
        opacity: 0.6
    }
}

# Keyboard navigation support
Container {
    &:focus {
        outline: "2px solid #007BFFFF"  # Visible focus ring
        outline_offset: 2
    }
}
```

### 3. Create Consistent Interaction Patterns

```kry
# Define consistent button behavior
style "interactive_element" {
    transition: "all 0.15s ease"
    
    &:hover {
        cursor: "pointer"
        transform: "translateY(-1px)"
    }
    
    &:active {
        transform: "translateY(0px)"
    }
    
    &:focus {
        border_width: 2
        border_color: "#007BFFFF"
    }
    
    &:disabled {
        cursor: "not_allowed"
        opacity: 0.6
        transform: "none"
    }
}

# Apply consistently
Button { style: "interactive_element" }
Container { style: "interactive_element" }  # For clickable containers
```

### 4. Test Across States

```kry
# Test all state combinations
Button {
    text: "Test Button"
    
    # Normal state
    background_color: "#007BFFFF"
    
    # Hover state
    &:hover {
        background_color: "#0056B3FF"
    }
    
    # Active state
    &:active {
        background_color: "#004085FF"
    }
    
    # Focus state
    &:focus {
        border_color: "#FFFFFFFF"
        border_width: 2
    }
    
    # Disabled state
    &:disabled {
        background_color: "#6C757DFF"
        cursor: "not_allowed"
    }
    
    # Combined states
    &:hover:focus:not(:disabled) {
        # Test this combination
    }
}

# Create test cases
Container {
    Button { text: "Normal" }
    Button { text: "Disabled"; disabled: true }
    Button { text: "Focus Test"; /* manually focus in testing */ }
}
```

### 5. Use Semantic State Names

```kry
# Good: Semantic pseudo-selectors
Button {
    &:hover {        # User is considering interaction
        background_color: "#0056B3FF"
    }
    
    &:active {       # User is actively interacting
        background_color: "#004085FF"
    }
    
    &:focus {        # Element has keyboard focus
        border_color: "#FFFFFFFF"
    }
    
    &:disabled {     # Element cannot be interacted with
        opacity: 0.6
    }
}

# Document custom states
Input {
    &[data-valid="true"] {    # Input contains valid data
        border_color: "#28A745FF"
    }
    
    &[data-loading="true"] {  # Input is processing
        cursor: "wait"
        opacity: 0.7
    }
}
```

---

Pseudo-selectors are essential for creating polished, interactive user interfaces in Kryon. They provide immediate visual feedback to user actions, improve accessibility, and enhance the overall user experience. By following these patterns and best practices, you can create interfaces that feel responsive and professional without requiring complex scripting for basic interactions.
