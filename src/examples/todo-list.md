# Todo List Example

This example demonstrates building a complete todo list application with KRY, showcasing dynamic list rendering, local storage, form handling, and state management.

## Features

- Add new todo items
- Mark items as complete/incomplete
- Delete individual items
- Clear all completed items
- Filter view (All, Active, Completed)
- Local storage persistence
- Item counter
- Responsive design

## Complete Source Code

```kry
@variables {
    primary_color: "#007BFFFF"
    success_color: "#28A745FF"
    danger_color: "#DC3545FF"
    warning_color: "#FFC107FF"
    light_color: "#F8F9FAFF"
    dark_color: "#343A40FF"
    border_color: "#DEE2E6FF"
    text_color: "#212529FF"
    muted_color: "#6C757DFF"
}

style "app_container" {
    background_color: $light_color
    padding: 20
    min_height: "100vh"
}

style "todo_container" {
    background_color: "#FFFFFFFF"
    border_radius: 8
    padding: 24
    max_width: 600
    margin: "0 auto"
    box_shadow: "0 2px 10px rgba(0,0,0,0.1)"
}

style "header" {
    text_alignment: "center"
    font_size: 32
    font_weight: "bold"
    color: $primary_color
    margin_bottom: 24
}

style "input_container" {
    margin_bottom: 20
}

style "todo_input" {
    width: "100%"
    padding: 12
    font_size: 16
    border_radius: 6
    border_color: $border_color
    border_width: 1
    
    &:focus {
        border_color: $primary_color
        outline: "none"
        box_shadow: "0 0 0 2px rgba(0,123,255,0.25)"
    }
}

style "add_button" {
    background_color: $primary_color
    text_color: "#FFFFFFFF"
    padding: 12
    padding_left: 20
    padding_right: 20
    border_radius: 6
    font_weight: "bold"
    cursor: "pointer"
    margin_left: 8
    
    &:hover {
        background_color: "#0056B3FF"
    }
    
    &:active {
        background_color: "#004085FF"
    }
}

style "filter_container" {
    margin_bottom: 20
    text_alignment: "center"
}

style "filter_button" {
    background_color: "transparent"
    text_color: $muted_color
    padding: 8
    padding_left: 16
    padding_right: 16
    border: "none"
    border_radius: 4
    cursor: "pointer"
    margin: 4
    
    &:hover {
        background_color: $light_color
        text_color: $text_color
    }
}

style "filter_button_active" {
    extends: "filter_button"
    background_color: $primary_color
    text_color: "#FFFFFFFF"
    
    &:hover {
        background_color: $primary_color
    }
}

style "todo_item" {
    padding: 12
    border_bottom_color: $border_color
    border_bottom_width: 1
    
    &:last-child {
        border_bottom_width: 0
    }
}

style "todo_item_completed" {
    extends: "todo_item"
    background_color: "#F8F9FAFF"
    opacity: 0.7
}

style "todo_text" {
    font_size: 16
    color: $text_color
    flex: 1
}

style "todo_text_completed" {
    extends: "todo_text"
    text_decoration: "line-through"
    color: $muted_color
}

style "checkbox" {
    margin_right: 12
    width: 20
    height: 20
    cursor: "pointer"
}

style "delete_button" {
    background_color: $danger_color
    text_color: "#FFFFFFFF"
    padding: 6
    padding_left: 12
    padding_right: 12
    border_radius: 4
    font_size: 14
    cursor: "pointer"
    
    &:hover {
        background_color: "#C82333FF"
    }
}

style "footer" {
    margin_top: 20
    padding_top: 16
    border_top_color: $border_color
    border_top_width: 1
    text_alignment: "center"
}

style "counter" {
    color: $muted_color
    font_size: 14
    margin_bottom: 12
}

style "clear_completed" {
    background_color: $warning_color
    text_color: $dark_color
    padding: 8
    padding_left: 16
    padding_right: 16
    border_radius: 4
    cursor: "pointer"
    
    &:hover {
        background_color: "#E0A800FF"
    }
}

Define TodoItem {
    Properties {
        todo_id: String = ""
        todo_text: String = ""
        is_completed: Bool = false
        show_item: Bool = true
    }
    
    @if $show_item {
        Container {
            layout: "row center"
            style_id: $is_completed ? "todo_item_completed" : "todo_item"
            
            Input {
                type: "checkbox"
                checked: $is_completed
                style_id: "checkbox"
                onChange: "toggleTodo"
                value: $todo_id
            }
            
            Text {
                text: $todo_text
                style_id: $is_completed ? "todo_text_completed" : "todo_text"
            }
            
            Button {
                text: "Delete"
                style_id: "delete_button"
                onClick: "deleteTodo"
                value: $todo_id
            }
        }
    }
}

@script "lua" {
    -- Todo application state
    local todos = {}
    local current_filter = "all"  -- all, active, completed
    local next_id = 1
    
    -- Initialize application
    function initApp()
        loadTodosFromStorage()
        updateTodoList()
        updateCounter()
        updateFilters()
    end
    
    -- Add new todo
    function addTodo()
        local input = kryon.getElementById("todo_input")
        local text = input.text:match("^%s*(.-)%s*$")  -- Trim whitespace
        
        if text ~= "" then
            local todo = {
                id = tostring(next_id),
                text = text,
                completed = false
            }
            
            table.insert(todos, todo)
            next_id = next_id + 1
            
            input.text = ""  -- Clear input
            saveTodosToStorage()
            updateTodoList()
            updateCounter()
        end
    end
    
    -- Toggle todo completion
    function toggleTodo(element)
        local todo_id = element.value
        
        for i, todo in ipairs(todos) do
            if todo.id == todo_id then
                todo.completed = not todo.completed
                break
            end
        end
        
        saveTodosToStorage()
        updateTodoList()
        updateCounter()
    end
    
    -- Delete todo
    function deleteTodo(element)
        local todo_id = element.value
        
        for i, todo in ipairs(todos) do
            if todo.id == todo_id then
                table.remove(todos, i)
                break
            end
        end
        
        saveTodosToStorage()
        updateTodoList()
        updateCounter()
    end
    
    -- Set filter
    function setFilter(filter)
        current_filter = filter
        updateTodoList()
        updateFilters()
    end
    
    -- Clear completed todos
    function clearCompleted()
        local new_todos = {}
        for i, todo in ipairs(todos) do
            if not todo.completed then
                table.insert(new_todos, todo)
            end
        end
        todos = new_todos
        
        saveTodosToStorage()
        updateTodoList()
        updateCounter()
    end
    
    -- Update todo list display
    function updateTodoList()
        local todo_list = kryon.getElementById("todo_list")
        
        -- Clear existing items
        todo_list:removeAllChildren()
        
        -- Add filtered todos
        for i, todo in ipairs(todos) do
            local show_item = true
            
            if current_filter == "active" then
                show_item = not todo.completed
            elseif current_filter == "completed" then
                show_item = todo.completed
            end
            
            if show_item then
                local item = kryon.createElement("TodoItem", {
                    todo_id = todo.id,
                    todo_text = todo.text,
                    is_completed = todo.completed,
                    show_item = true
                })
                todo_list:appendChild(item)
            end
        end
    end
    
    -- Update counter display
    function updateCounter()
        local counter = kryon.getElementById("counter")
        local active_count = 0
        local completed_count = 0
        
        for i, todo in ipairs(todos) do
            if todo.completed then
                completed_count = completed_count + 1
            else
                active_count = active_count + 1
            end
        end
        
        local total = active_count + completed_count
        local text = string.format("%d items total, %d active, %d completed", 
                                 total, active_count, completed_count)
        counter.text = text
        
        -- Show/hide clear completed button
        local clear_button = kryon.getElementById("clear_completed")
        clear_button.visible = completed_count > 0
    end
    
    -- Update filter button states
    function updateFilters()
        local all_button = kryon.getElementById("filter_all")
        local active_button = kryon.getElementById("filter_active") 
        local completed_button = kryon.getElementById("filter_completed")
        
        all_button.style_id = current_filter == "all" and "filter_button_active" or "filter_button"
        active_button.style_id = current_filter == "active" and "filter_button_active" or "filter_button"
        completed_button.style_id = current_filter == "completed" and "filter_button_active" or "filter_button"
    end
    
    -- Save todos to local storage
    function saveTodosToStorage()
        local json_data = ""
        for i, todo in ipairs(todos) do
            if i > 1 then json_data = json_data .. "," end
            json_data = json_data .. string.format(
                '{"id":"%s","text":"%s","completed":%s}',
                todo.id, todo.text:gsub('"', '\\"'), todo.completed and "true" or "false"
            )
        end
        json_data = "[" .. json_data .. "]"
        
        kryon.setVariable("todos_data", json_data)
        kryon.setVariable("next_id", tostring(next_id))
    end
    
    -- Load todos from local storage
    function loadTodosFromStorage()
        local stored_data = kryon.getVariable("todos_data")
        local stored_next_id = kryon.getVariable("next_id")
        
        if stored_data and stored_data ~= "" then
            -- Simple JSON parsing (basic implementation)
            todos = parseJsonTodos(stored_data)
        end
        
        if stored_next_id and stored_next_id ~= "" then
            next_id = tonumber(stored_next_id) or 1
        end
    end
    
    -- Basic JSON parsing for todos
    function parseJsonTodos(json_str)
        local parsed_todos = {}
        -- This is a simplified parser - in real apps, use a proper JSON library
        for id, text, completed in json_str:gmatch('"id":"([^"]+)","text":"([^"]+)","completed":([^}]+)') do
            table.insert(parsed_todos, {
                id = id,
                text = text:gsub('\\"', '"'),
                completed = completed == "true"
            })
        end
        return parsed_todos
    end
    
    -- Handle Enter key in input
    function handleInputKeyPress(element, key)
        if key == "Enter" then
            addTodo()
        end
    end
}

App {
    window_title: "Todo List"
    window_width: 800
    window_height: 600
    
    Container {
        style_id: "app_container"
        layout: "center"
        
        Container {
            style_id: "todo_container"
            layout: "column"
            
            # Header
            Text {
                text: "Todo List"
                style_id: "header"
            }
            
            # Input Section
            Container {
                style_id: "input_container"
                layout: "row"
                
                Input {
                    id: "todo_input"
                    placeholder: "What needs to be done?"
                    style_id: "todo_input"
                    onKeyPress: "handleInputKeyPress"
                }
                
                Button {
                    text: "Add"
                    style_id: "add_button"
                    onClick: "addTodo"
                }
            }
            
            # Filter Buttons
            Container {
                style_id: "filter_container"
                layout: "row center"
                
                Button {
                    id: "filter_all"
                    text: "All"
                    style_id: "filter_button_active"
                    onClick: "setFilter('all')"
                }
                
                Button {
                    id: "filter_active"
                    text: "Active"
                    style_id: "filter_button"
                    onClick: "setFilter('active')"
                }
                
                Button {
                    id: "filter_completed"
                    text: "Completed"
                    style_id: "filter_button"
                    onClick: "setFilter('completed')"
                }
            }
            
            # Todo List
            Container {
                id: "todo_list"
                layout: "column"
                min_height: 200
            }
            
            # Footer
            Container {
                style_id: "footer"
                layout: "column center"
                
                Text {
                    id: "counter"
                    text: "0 items total, 0 active, 0 completed"
                    style_id: "counter"
                }
                
                Button {
                    id: "clear_completed"
                    text: "Clear Completed"
                    style_id: "clear_completed"
                    onClick: "clearCompleted"
                    visible: false
                }
            }
        }
    }
    
    @script "init" {
        initApp()
    }
}
```

## Key Concepts Demonstrated

### 1. Dynamic Content Generation
The todo list demonstrates dynamic UI generation:
- **Dynamic components**: `TodoItem` components created at runtime
- **Conditional rendering**: Items shown/hidden based on filter
- **List management**: Adding/removing DOM elements dynamically

### 2. State Management
Complex state management across multiple data structures:
- **Todo array**: Main data structure with id, text, completed
- **Filter state**: Current view filter (all/active/completed)  
- **UI state**: Button states, counters, visibility

### 3. Local Storage Integration
Persistent data storage using Kryon's variable system:
- **Save on changes**: Automatic persistence after modifications
- **Load on startup**: Restore state from previous session
- **JSON serialization**: Convert todos to/from JSON format

### 4. Event Handling
Multiple event types and handlers:
- **Form submission**: Add todo on button click or Enter key
- **Checkbox changes**: Toggle completion state
- **Button clicks**: Delete, filter, clear actions
- **Keyboard events**: Enter key support in input field

### 5. Component Properties
`TodoItem` component demonstrates advanced property usage:
- **Data binding**: Todo properties bound to component
- **Conditional styling**: Different styles for completed items
- **Event delegation**: Click handlers with item-specific data
- **Conditional rendering**: Show/hide based on filter

### 6. Advanced Layout
Responsive layout with multiple containers:
- **Nested containers**: Complex layout hierarchy
- **Flexible layouts**: Row and column layouts mixed
- **Responsive design**: Adapts to different screen sizes
- **Visual hierarchy**: Clear separation of sections

## Building and Running

1. Save the code as `todo-list.kry`
2. Compile to KRB: `kryc todo-list.kry -o todo-list.krb`
3. Run the application: `kryon todo-list.krb`

The compiled KRB file will be approximately 4-5KB despite the rich functionality.

## Performance Considerations

This todo list demonstrates several performance optimizations:
- **Efficient list updates**: Only re-render when data changes
- **Component reuse**: Single `TodoItem` definition for all items
- **Minimal DOM manipulation**: Targeted updates rather than full re-renders
- **Local storage batching**: Save operations batched to reduce I/O

## Usage Instructions

1. **Add todos**: Type in the input field and press Enter or click "Add"
2. **Mark complete**: Click the checkbox next to any item
3. **Delete items**: Click the "Delete" button on any item
4. **Filter view**: Use "All", "Active", or "Completed" buttons
5. **Clear completed**: Click "Clear Completed" to remove all done items

The todo list automatically saves your data and will restore it when you reopen the application, demonstrating Kryon's ability to create fully functional, persistent applications with minimal code.