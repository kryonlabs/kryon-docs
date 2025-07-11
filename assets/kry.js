// KRY Language Definition for highlight.js
// Simplified and guaranteed to work version

(function() {
    'use strict';
    
    function registerKryLanguage() {
        if (typeof hljs === 'undefined') {
            setTimeout(registerKryLanguage, 10);
            return;
        }
        
        console.log('KRY Debug: Registering KRY language with hljs version:', hljs.versionString || 'unknown');
        
        // Very simple KRY language definition
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
        
        console.log('KRY Debug: Language registered successfully');
        console.log('KRY Debug: Available languages include KRY:', hljs.listLanguages().includes('kry'));
        
        // Force re-highlight all KRY blocks
        function forceHighlightKry() {
            const blocks = document.querySelectorAll('pre code.language-kry');
            console.log('KRY Debug: Found', blocks.length, 'KRY blocks to highlight');
            
            blocks.forEach(function(block, i) {
                console.log('KRY Debug: Highlighting block', i + 1);
                
                // Remove any previous highlighting
                block.removeAttribute('data-highlighted');
                block.className = 'language-kry';
                
                // Force highlight (support both old and new highlight.js APIs)
                if (typeof hljs.highlightElement === 'function') {
                    hljs.highlightElement(block);
                } else if (typeof hljs.highlightBlock === 'function') {
                    hljs.highlightBlock(block);
                } else {
                    console.log('KRY Debug: No highlighting function available');
                }
                
                console.log('KRY Debug: Block', i + 1, 'processed');
            });
        }
        
        // Try highlighting multiple times to be sure
        forceHighlightKry();
        setTimeout(forceHighlightKry, 100);
        setTimeout(forceHighlightKry, 500);
        setTimeout(forceHighlightKry, 1000);
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', forceHighlightKry);
        }
    }
    
    // Start registration immediately
    registerKryLanguage();
    
    // Also hook into the window load event
    window.addEventListener('load', registerKryLanguage);
    
    // Override hljs.highlightAll if available
    function overrideHighlightAll() {
        if (typeof hljs !== 'undefined' && hljs.highlightAll) {
            const original = hljs.highlightAll;
            hljs.highlightAll = function() {
                console.log('KRY Debug: hljs.highlightAll called');
                if (!hljs.getLanguage('kry')) {
                    registerKryLanguage();
                }
                return original.call(this);
            };
        }
    }
    
    overrideHighlightAll();
    setTimeout(overrideHighlightAll, 100);
    
})();