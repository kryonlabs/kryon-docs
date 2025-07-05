# Scripting & DOM API

Kryon's script system provides a powerful, web-like DOM API for dynamic element manipulation and interaction. Scripts are embedded directly in KRY files and executed by the runtime to create interactive user interfaces.

## Overview

The script system bridges the gap between declarative KRY markup and dynamic runtime behavior. It provides:

- **Multi-language support**: Lua, JavaScript, Python, and Wren
- **DOM-like API**: Familiar element traversal and manipulation methods  
- **Event handling**: onClick, onChange, and custom event callbacks
- **Runtime integration**: Seamless interaction with the rendering pipeline

## Supported Languages

### Lua (Recommended)
```lua
@script "lua" {
    function button_clicked()
        local element = getElementById("my_button")
        element:setText("Clicked!")
    end
}
```

### JavaScript
```javascript
@script "javascript" {
    function buttonClicked() {
        const element = getElementById("my_button");
        element.setText("Clicked!");
    }
}
```

### Python
```python
@script "python" {
    def button_clicked():
        element = getElementById("my_button")
        element.setText("Clicked!")
}
```

### Wren
```wren
@script "wren" {
    var buttonClicked = Fn.new {
        var element = getElementById("my_button")
        element.setText("Clicked!")
    }
}
```

## Core DOM API

### Element Access & Modification

#### getElementById(id)
Access elements by their unique ID.

```lua
local button = getElementById("submit_btn")
local container = getElementById("main_container")
```

#### Element Methods
```lua
local element = getElementById("my_element")

-- Text manipulation
element:setText("New text content")
local currentText = element:getText()

-- Visibility control
element:setVisible(true)
element:setVisible(false)

-- State management
element:setChecked(true)  -- For buttons, checkboxes
element:setChecked(false)

-- Style changes
element:setStyle("new_style_name")
```

### DOM Traversal

#### Parent/Child Relationships
```lua
local element = getElementById("child_element")

-- Navigate up the tree
local parent = element:getParent()
local grandparent = parent:getParent()

-- Navigate down the tree
local children = element:getChildren()
local firstChild = element:getFirstChild()
local lastChild = element:getLastChild()

-- Iterate through children
for i, child in ipairs(children) do
    print("Child " .. i .. ": " .. child.id)
end
```

#### Sibling Navigation
```lua
local element = getElementById("middle_item")

-- Navigate between siblings
local nextElement = element:getNextSibling()
local prevElement = element:getPreviousSibling()

-- Navigate through all siblings
local current = element:getParent():getFirstChild()
while current do
    print("Sibling: " .. current.id)
    current = current:getNextSibling()
end
```

### Query & Selection Methods

#### Element Type Queries
```lua
-- Find all buttons in the application
local buttons = getElementsByTag("Button")
for _, button in ipairs(buttons) do
    button:setStyle("button_highlighted")
end

-- Find all containers
local containers = getElementsByTag("Container")
```

#### Style/Class Queries
```lua
-- Find elements using a specific style
local styledElements = getElementsByClass("primary_button")
local errorElements = getElementsByClass("error_text")

-- Apply bulk operations
for _, element in ipairs(errorElements) do
    element:setVisible(false)
end
```

#### CSS-Like Selectors
```lua
-- ID selector
local header = querySelector("#main_header")

-- Class selector  
local buttons = querySelectorAll(".button_style")

-- Tag selector
local allText = querySelectorAll("Text")

-- Combined operations
local primaryButtons = querySelectorAll(".primary_button")
for _, btn in ipairs(primaryButtons) do
    btn:setText("Primary Action")
end
```

#### Root Element Access
```lua
-- Get the root App element
local app = getRootElement()
local allChildren = app:getChildren()
```

## Event Handling

### Built-in Event Handlers

#### onClick Events
```lua
-- In KRY markup
Button {
    id: "action_btn"
    text: "Click Me"
    onClick: "handle_button_click"
}

-- In script
function handle_button_click()
    local btn = getElementById("action_btn")
    btn:setText("Clicked!")
    btn:setStyle("clicked_button_style")
end
```

#### Input Events
```lua
Input {
    id: "username_input"
    onChange: "validate_username"
}

function validate_username()
    local input = getElementById("username_input")
    local text = input:getText()
    
    if string.len(text) < 3 then
        input:setStyle("invalid_input")
    else
        input:setStyle("valid_input")
    end
end
```

### Custom Event System
```lua
-- Register custom event handlers
function setup_custom_events()
    local sidebar = getElementById("sidebar")
    
    -- Custom validation logic
    local inputs = querySelectorAll("Input")
    for _, input in ipairs(inputs) do
        -- Add validation logic
        validate_field(input)
    end
end

function validate_field(input)
    local text = input:getText()
    local parent = input:getParent()
    
    if string.len(text) == 0 then
        parent:setStyle("field_error")
    else
        parent:setStyle("field_normal")
    end
end
```

## Advanced Patterns

### Tab System Implementation
```lua
function switch_tab(tab_id)
    -- Reset all tab buttons
    local tabs = getElementsByClass("tab_button")
    for _, tab in ipairs(tabs) do
        tab:setChecked(false)
    end
    
    -- Activate selected tab
    local activeTab = getElementById(tab_id)
    activeTab:setChecked(true)
    
    -- Show corresponding content
    local contentId = tab_id:gsub("tab_", "") .. "_content"
    show_content(contentId)
end

function show_content(contentId)
    -- Hide all content panels
    local panels = getElementsByClass("content_panel")
    for _, panel in ipairs(panels) do
        panel:setVisible(false)
    end
    
    -- Show selected content
    local content = getElementById(contentId)
    if content then
        content:setVisible(true)
    end
end
```

### Form Validation
```lua
function validate_form()
    local form = getElementById("registration_form")
    local inputs = form:getChildren()
    local isValid = true
    
    for _, child in ipairs(inputs) do
        if child.element_type == "Input" then
            if not validate_input(child) then
                isValid = false
            end
        end
    end
    
    local submitBtn = getElementById("submit_button")
    if isValid then
        submitBtn:setStyle("button_enabled")
        submitBtn:setText("Submit")
    else
        submitBtn:setStyle("button_disabled") 
        submitBtn:setText("Please fix errors")
    end
    
    return isValid
end

function validate_input(input)
    local text = input:getText()
    local isValid = string.len(text) >= 3
    
    if isValid then
        input:setStyle("input_valid")
    else
        input:setStyle("input_invalid")
    end
    
    return isValid
end
```

### Dynamic UI Generation
```lua
function create_user_list(users)
    local container = getElementById("user_list")
    
    -- Clear existing content
    local children = container:getChildren()
    for _, child in ipairs(children) do
        child:setVisible(false)
    end
    
    -- Create user items dynamically
    for i, user in ipairs(users) do
        local userElement = getElementById("user_template")
        if userElement then
            -- Clone and modify template
            setup_user_element(userElement, user, i)
        end
    end
end

function setup_user_element(element, user, index)
    element:setText(user.name)
    element:setVisible(true)
    
    -- Add click handler
    element.onClick = function()
        show_user_details(user.id)
    end
end
```

## Integration with Renderer

### Runtime Integration
```rust
// In Rust renderer code
script_system.setup_bridge_functions(&elements, &krb_file)?;
script_system.register_dom_functions(&elements, &krb_file)?;

// Execute script functions
script_system.call_function("initialize_ui", vec![])?;
```

### Memory Model
The DOM API uses an efficient memory model:

- **Element Data**: Cached in Lua global tables for fast access
- **Proxy Objects**: Lightweight wrappers with traversal methods
- **Pending Changes**: Batched updates for optimal performance
- **Change Detection**: Only modified elements trigger re-renders

### Performance Considerations
```lua
-- Efficient bulk operations
local buttons = getElementsByTag("Button")
for _, btn in ipairs(buttons) do
    btn:setStyle("new_style")  -- Batched style changes
end

-- Avoid excessive queries in loops
local container = getElementById("list_container") -- Cache reference
local children = container:getChildren()           -- Single query

for _, child in ipairs(children) do
    -- Work with cached children
    child:setText("Updated: " .. child:getText())
end
```

## Best Practices

### 1. Element ID Management
```lua
-- Use descriptive, unique IDs
getElementById("user_profile_header")     -- Good
getElementById("h1")                      -- Bad

-- Cache frequently accessed elements
local sidebar = getElementById("main_sidebar")
local content = getElementById("main_content")
```

### 2. Event Handler Organization
```lua
-- Group related handlers
function initialize_navigation()
    setup_tab_handlers()
    setup_menu_handlers()
    setup_search_handlers()
end

function setup_tab_handlers()
    local tabs = getElementsByClass("tab_button")
    for _, tab in ipairs(tabs) do
        -- Setup individual tab logic
    end
end
```

### 3. State Management
```lua
-- Use global state for complex applications
local app_state = {
    current_user = nil,
    active_tab = "home",
    form_data = {}
}

function update_ui_state(new_state)
    -- Update global state
    for key, value in pairs(new_state) do
        app_state[key] = value
    end
    
    -- Refresh UI based on state
    refresh_navigation()
    refresh_content()
end
```

### 4. Error Handling
```lua
function safe_get_element(id)
    local element = getElementById(id)
    if not element then
        print("Warning: Element '" .. id .. "' not found")
        return nil
    end
    return element
end

function safe_update_text(id, text)
    local element = safe_get_element(id)
    if element then
        element:setText(text)
    end
end
```

## Implementation Details

### Location
- **Core Implementation**: `kryon-renderer/crates/kryon-runtime/src/script_system.rs`
- **Lua Bridge**: Pure Lua functions with Rust data preparation
- **Integration**: Called via `register_dom_functions()` after `setup_bridge_functions()`

### Memory Management
- Element hierarchy stored in Lua global tables (`_elements_data`, `_styles_data`)
- Pending changes queued and batched for optimal performance
- Proxy objects provide familiar DOM-like interface

### Language Support
- **Primary**: Lua (fastest, most stable)
- **Secondary**: JavaScript, Python, Wren (experimental)
- **Future**: TypeScript, Rust scripting support planned

---

The DOM API brings web development patterns to native UI development, making Kryon accessible to developers familiar with browser-based JavaScript while maintaining the performance benefits of compiled native applications.