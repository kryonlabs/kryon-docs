# Styles

Styles in KRY provide a powerful way to define reusable property sets that can be applied to multiple elements. This system promotes consistency, maintainability, and efficient code organization.

## Basic Style Definition

Styles are defined using the `style` keyword followed by a name and property block:

```kry
style "button_primary" {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    font_weight: bold
}

# Apply the style to elements
Button {
    text: "Primary Action"
    style: "button_primary"
}

Button {
    text: "Another Primary Button"
    style: "button_primary"
}
```

## Style Naming Conventions

Use descriptive, consistent names for styles:

```kry
# Good: Semantic naming
style "button_primary" { /* primary action buttons */ }
style "button_secondary" { /* secondary action buttons */ }
style "card_elevated" { /* elevated card containers */ }
style "text_heading" { /* heading text */ }
style "form_input" { /* form input fields */ }

# Good: Component-based naming
style "navbar_item" { /* navigation bar items */ }
style "sidebar_button" { /* sidebar buttons */ }
style "modal_header" { /* modal headers */ }

# Avoid: Unclear or presentational naming
style "big_blue_button" { /* unclear purpose */ }
style "style1" { /* meaningless name */ }
style "red_text" { /* tied to implementation */ }
```

## Style Inheritance

### Basic Inheritance

Styles can extend other styles using the `extends` property:

```kry
# Base button style
style "button_base" {
    padding: 12
    border_radius: 6
    font_weight: normal
    border_width: 0
    cursor: "pointer"
}

# Primary button extends base
style "button_primary" {
    extends: "button_base"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    font_weight: bold
}

# Secondary button extends base
style "button_secondary" {
    extends: "button_base"
    background_color: "transparent"
    text_color: "#007BFFFF"
    border_color: "#007BFFFF"
    border_width: 1
}

# Usage
Button {
    text: "Primary"
    style: "button_primary"
}

Button {
    text: "Secondary"
    style: "button_secondary"
}
```

### Multiple Inheritance

Styles can inherit from multiple parent styles:

```kry
# Base styles
style "rounded" {
    border_radius: 8
}

style "elevated" {
    shadow_color: "#00000020"
    shadow_offset_x: 0
    shadow_offset_y: 2
    shadow_blur: 4
}

style "padded" {
    padding: 16
}

# Combined style
style "card" {
    extends: ["rounded", "elevated", "padded"]
    background_color: "#FFFFFFFF"
    border_color: "#E9ECEFFF"
    border_width: 1
}

Container {
    style: "card"
    
    Text { text: "Card content" }
}
```

### Inheritance Resolution

When multiple inherited styles define the same property, the last one wins:

```kry
style "style_a" {
    background_color: "#FF0000FF"    # Red
    padding: 8
}

style "style_b" {
    background_color: "#00FF00FF"    # Green
    margin: 4
}

style "combined" {
    extends: ["style_a", "style_b"]  # style_b's background_color wins
    text_color: "#000000FF"
}

# Final computed properties:
# background_color: "#00FF00FF" (from style_b)
# padding: 8 (from style_a)
# margin: 4 (from style_b)
# text_color: "#000000FF" (from combined)
```

## Advanced Style Patterns

### Hierarchical Style Organization

Organize styles in logical hierarchies:

```kry
# Base component styles
style "button_base" {
    padding: 12
    border_radius: 6
    font_weight: normal
    cursor: "pointer"
    
    &:hover {
        opacity: 0.9
    }
    
    &:active {
        opacity: 0.8
    }
    
    &:disabled {
        cursor: "not_allowed"
        opacity: 0.6
    }
}

# Size variants
style "button_small" {
    extends: "button_base"
    padding: 8
    font_size: 14
}

style "button_large" {
    extends: "button_base"
    padding: 16
    font_size: 18
}

# Color variants
style "button_primary" {
    extends: "button_base"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
}

style "button_danger" {
    extends: "button_base"
    background_color: "#DC3545FF"
    text_color: "#FFFFFFFF"
}

# Combined variants
style "button_primary_large" {
    extends: ["button_primary", "button_large"]
}

style "button_danger_small" {
    extends: ["button_danger", "button_small"]
}
```

### Conditional Styles

Create styles for different states or contexts:

```kry
# Base input style
style "input_base" {
    padding: 8
    border_width: 1
    border_radius: 4
    font_size: 14
    
    &:focus {
        border_width: 2
        border_color: "#007BFFFF"
    }
}

# Valid state
style "input_valid" {
    extends: "input_base"
    border_color: "#28A745FF"
    
    &:focus {
        border_color: "#1E7E34FF"
    }
}

# Error state
style "input_error" {
    extends: "input_base"
    border_color: "#DC3545FF"
    
    &:focus {
        border_color: "#C82333FF"
    }
}

# Usage with dynamic style assignment
Input {
    placeholder: "Enter email"
    style: "input_base"  # Default
    # Style can be changed via script based on validation
}
```

### Theme-Based Styles

Create cohesive themes using style inheritance:

```kry
@variables {
    # Light theme colors
    theme_primary: "#007BFFFF"
    theme_secondary: "#6C757DFF"
    theme_background: "#FFFFFFFF"
    theme_surface: "#F8F9FAFF"
    theme_text: "#212529FF"
    theme_text_muted: "#6C757DFF"
}

# Base theme styles
style "theme_surface" {
    background_color: $theme_surface
    text_color: $theme_text
}

style "theme_card" {
    extends: "theme_surface"
    border_radius: 8
    border_color: "#E9ECEFFF"
    border_width: 1
    padding: 16
}

style "theme_button" {
    background_color: $theme_primary
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    
    &:hover {
        background_color: "#0056B3FF"
    }
}

# Usage
Container {
    style: "theme_card"
    
    Text {
        text: "Card Title"
        font_weight: bold
    }
    
    Button {
        text: "Action"
        style: "theme_button"
    }
}
```

## Pseudo-Selectors in Styles

Styles can include pseudo-selector definitions:

```kry
style "interactive_button" {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    transition: "all 0.2s ease"
    
    &:hover {
        background_color: "#0056B3FF"
        cursor: "pointer"
        transform: "translateY(-1px)"
    }
    
    &:active {
        background_color: "#004085FF"
        transform: "translateY(0px)"
    }
    
    &:focus {
        border_color: "#80BDFFFF"
        border_width: 2
    }
    
    &:disabled {
        background_color: "#6C757DFF"
        cursor: "not_allowed"
        opacity: 0.6
    }
}

Button {
    text: "Interactive Button"
    style: "interactive_button"
}
```

### Pseudo-Selector Inheritance

Pseudo-selectors inherit and can be overridden:

```kry
style "base_interactive" {
    background_color: "#F8F9FAFF"
    
    &:hover {
        background_color: "#E9ECEFFF"
    }
}

style "primary_interactive" {
    extends: "base_interactive"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    
    &:hover {
        background_color: "#0056B3FF"  # Overrides parent hover
    }
    
    &:active {
        background_color: "#004085FF"  # Adds new state
    }
}
```

## Style Organization Strategies

### File-Based Organization

Split styles across multiple files for maintainability:

```kry
# styles/variables.kry
@variables {
    primary: "#007BFFFF"
    secondary: "#6C757DFF"
    spacing_sm: 8
    spacing_md: 16
    border_radius: 6
}

# styles/base.kry
@include "variables.kry"

style "base_element" {
    font_family: "Arial"
    font_size: 14
    color: $secondary
}

# styles/buttons.kry
@include "base.kry"

style "button_base" {
    extends: "base_element"
    padding: $spacing_sm
    border_radius: $border_radius
    cursor: "pointer"
}

style "button_primary" {
    extends: "button_base"
    background_color: $primary
    text_color: "#FFFFFFFF"
}

# styles/cards.kry
@include "base.kry"

style "card_base" {
    extends: "base_element"
    background_color: "#FFFFFFFF"
    border_radius: $border_radius
    padding: $spacing_md
}

# main.kry
@include "styles/buttons.kry"
@include "styles/cards.kry"

App {
    Container {
        style: "card_base"
        
        Button {
            text: "Action"
            style: "button_primary"
        }
    }
}
```

### Component-Based Organization

Group styles by UI component:

```kry
# Navigation styles
style "nav_container" {
    layout: row
    background_color: "#343A40FF"
    padding: 16
    gap: 20
}

style "nav_item" {
    text_color: "#FFFFFFFF"
    padding: 8
    border_radius: 4
    
    &:hover {
        background_color: "#495057FF"
        cursor: "pointer"
    }
}

style "nav_item_active" {
    extends: "nav_item"
    background_color: "#007BFFFF"
}

# Form styles
style "form_container" {
    layout: column
    gap: 16
    padding: 24
}

style "form_input" {
    padding: 8
    border_radius: 4
    border_width: 1
    border_color: "#CED4DAFF"
    font_size: 14
    
    &:focus {
        border_color: "#007BFFFF"
        border_width: 2
    }
}

style "form_button" {
    background_color: "#28A745FF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 4
    font_weight: bold
}
```

## Dynamic Style Application

Styles can be changed at runtime through scripts:

```kry
# Define multiple button states
style "button_default" {
    background_color: "#6C757DFF"
    text_color: "#FFFFFFFF"
}

style "button_active" {
    background_color: "#28A745FF"
    text_color: "#FFFFFFFF"
}

style "button_warning" {
    background_color: "#FFC107FF"
    text_color: "#000000FF"
}

# Script to change styles
@script "lua" {
    function toggleButtonState()
        local button = kryon.getElementById("status_button")
        local current_style = button.style
        
        if current_style == "button_default" then
            button.style = "button_active"
            button.text = "Active"
        elseif current_style == "button_active" then
            button.style = "button_warning"
            button.text = "Warning"
        else
            button.style = "button_default"
            button.text = "Default"
        end
    end
}

Button {
    id: "status_button"
    text: "Default"
    style: "button_default"
    onClick: "toggleButtonState"
}
```

## Style Performance Considerations

### Efficient Style Definitions

```kry
# Efficient: Reuse common properties
style "base_spacing" {
    padding: 16
    margin: 8
}

style "card" {
    extends: "base_spacing"
    background_color: "#FFFFFFFF"
    border_radius: 8
}

style "panel" {
    extends: "base_spacing"
    background_color: "#F8F9FAFF"
    border: 1
}

# Less efficient: Duplicate properties
style "card_inefficient" {
    padding: 16        # Duplicated
    margin: 8          # Duplicated
    background_color: "#FFFFFFFF"
    border_radius: 8
}

style "panel_inefficient" {
    padding: 16        # Duplicated
    margin: 8          # Duplicated
    background_color: "#F8F9FAFF"
    border: 1
}
```

### Minimize Style Complexity

```kry
# Good: Simple, focused styles
style "button_primary" {
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
}

# Avoid: Overly complex styles
style "complex_style" {
    # Too many properties in one style
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    width: 200
    height: 40
    font_size: 16
    font_weight: bold
    margin: 8
    border_width: 1
    border_color: "#0056B3FF"
    shadow_color: "#00000020"
    shadow_offset_x: 2
    shadow_offset_y: 2
    # ... many more properties
}
```

## Best Practices

### 1. Use Semantic Names

```kry
# Good: Semantic naming
style "primary_action" { /* for main actions */ }
style "destructive_action" { /* for delete/remove actions */ }
style "content_card" { /* for content containers */ }
style "navigation_item" { /* for nav elements */ }

# Avoid: Implementation-based naming
style "blue_button" { /* tied to color */ }
style "big_text" { /* tied to size */ }
style "rounded_box" { /* tied to shape */ }
```

### 2. Create Style Hierarchies

```kry
# Base styles
style "element_base" { /* common properties */ }
style "interactive_base" { /* interactive elements */ }
style "text_base" { /* text elements */ }

# Component styles
style "button" { extends: "interactive_base" }
style "input" { extends: "interactive_base" }
style "heading" { extends: "text_base" }

# Variant styles
style "button_primary" { extends: "button" }
style "button_secondary" { extends: "button" }
style "heading_large" { extends: "heading" }
```

### 3. Keep Styles Focused

```kry
# Good: Focused responsibility
style "layout_card" {
    # Only layout properties
    padding: 16
    border_radius: 8
    gap: 12
}

style "visual_elevated" {
    # Only visual properties
    background_color: "#FFFFFFFF"
    shadow_color: "#00000010"
    shadow_offset_y: 2
    shadow_blur: 8
}

style "card" {
    # Combine focused styles
    extends: ["layout_card", "visual_elevated"]
}

# Avoid: Mixed responsibilities
style "everything_card" {
    # Layout, visual, interactive, text properties mixed
    padding: 16
    background_color: "#FFFFFFFF"
    onClick: "handleClick"
    font_size: 14
    cursor: "pointer"
    # ...
}
```

### 4. Document Style Purpose

```kry
# Document style intent with comments
style "primary_action" {
    # Primary action buttons - high emphasis
    # Used for main actions like "Save", "Submit", "Continue"
    background_color: "#007BFFFF"
    text_color: "#FFFFFFFF"
    padding: 12
    border_radius: 6
    font_weight: bold
}

style "secondary_action" {
    # Secondary action buttons - medium emphasis
    # Used for alternative actions like "Cancel", "Back"
    extends: "primary_action"
    background_color: "transparent"
    text_color: "#007BFFFF"
    border_color: "#007BFFFF"
    border_width: 1
}
```

### 5. Test Style Combinations

```kry
# Ensure styles work well together
style "elevated" {
    shadow_color: "#00000020"
    shadow_offset_y: 2
    shadow_blur: 4
}

style "rounded" {
    border_radius: 8
}

style "card" {
    extends: ["elevated", "rounded"]
    background_color: "#FFFFFFFF"
    padding: 16
    
    # Test that combination looks correct
}
```

---

Styles are essential for creating maintainable, consistent user interfaces in Kryon. By understanding inheritance, organization patterns, and best practices, you can build scalable style systems that adapt to changing requirements. Next, explore [Variables](variables.md) to learn about parameterizing your styles and creating flexible design systems.