// KRY Language Definition for highlight.js
// Production version for mdBook integration

(function() {
    'use strict';
    
    function registerKryLanguage() {
        if (typeof hljs === 'undefined') {
            setTimeout(registerKryLanguage, 50);
            return;
        }
        
        // Register KRY language for highlight.js
        hljs.registerLanguage('kry', function(hljs) {
            return {
                name: 'KRY',
                aliases: ['kry'],
                keywords: {
                    keyword: 'Define Properties style include variables script function if else for while',
                    built_in: 'App Container Text Button Input Image Canvas Checkbox Radio Slider List Grid Scrollable Tabs Video',
                    type: 'String Number Boolean Int Float Bool Color',
                    literal: 'true false'
                },
                contains: [
                    // Comments
                    {
                        className: 'comment',
                        begin: '#',
                        end: '$'
                    },
                    {
                        className: 'comment', 
                        begin: '//',
                        end: '$'
                    },
                    
                    // Strings
                    {
                        className: 'string',
                        begin: '"',
                        end: '"',
                        contains: [{begin: '\\\\.'}]
                    },
                    
                    // Variables
                    {
                        className: 'variable',
                        begin: '\\$\\w+'
                    },
                    
                    // Numbers and colors
                    {
                        className: 'number',
                        begin: '\\b\\d+(?:\\.\\d+)?(?:px|em|rem|vw|vh|deg|rad|turn|%)?\\b'
                    },
                    {
                        className: 'number',
                        begin: '#[0-9a-fA-F]{3,8}\\b'
                    },
                    
                    // Directives
                    {
                        className: 'meta',
                        begin: '@\\w+'
                    },
                    
                    // Properties (key: value)
                    {
                        className: 'attr',
                        begin: '\\b\\w+(?=\\s*:)'
                    }
                ]
            };
        });
        
        // Re-highlight all KRY blocks
        function highlightKryBlocks() {
            const blocks = document.querySelectorAll('pre code.language-kry');
            
            blocks.forEach(function(block) {
                // Remove any previous highlighting
                block.removeAttribute('data-highlighted');
                block.className = 'language-kry';
                
                // Force highlight (support both old and new highlight.js APIs)
                if (typeof hljs.highlightElement === 'function') {
                    hljs.highlightElement(block);
                } else if (typeof hljs.highlightBlock === 'function') {
                    hljs.highlightBlock(block);
                }
            });
        }
        
        // Try highlighting multiple times to catch all scenarios
        highlightKryBlocks();
        setTimeout(highlightKryBlocks, 100);
        setTimeout(highlightKryBlocks, 500);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', highlightKryBlocks);
        }
    }
    
    // Start registration immediately
    registerKryLanguage();
    
    // Also hook into the window load event
    window.addEventListener('load', registerKryLanguage);
    
    // Override hljs.highlightAll if available - do this IMMEDIATELY
    function overrideHighlightAll() {
        if (typeof hljs !== 'undefined') {
            console.log('KRY Debug: Setting up hljs override...');
            
            // Register KRY immediately if hljs is available
            if (!hljs.getLanguage('kry')) {
                registerKryLanguage();
            }
            
            if (hljs.highlightAll) {
                const original = hljs.highlightAll;
                hljs.highlightAll = function() {
                    console.log('KRY Debug: hljs.highlightAll intercepted');
                    if (!hljs.getLanguage('kry')) {
                        registerKryLanguage();
                    }
                    return original.call(this);
                };
                console.log('KRY Debug: hljs.highlightAll overridden');
            }
        } else {
            setTimeout(overrideHighlightAll, 5);
        }
    }
    
    // Start override immediately
    overrideHighlightAll();
    
})();