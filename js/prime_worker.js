// -*- mode: js; coding: utf-8 -*-

(function (global) {
    'use strict'
    
    function create_asm_module (stdlib) {
        'use asm'
        
        function max (a, b) {
            a = a | 0
            b = b | 0
            
            if ((b | 0) > (a | 0)) {
                return b | 0
            }
            
            return a | 0
        }
        
        function find_prime (prime_from) {
            prime_from = prime_from | 0
            
            var d = 0
            
            prime_from = max(2, prime_from) | 0
            
            if ((prime_from | 0) == 2) {
                return prime_from | 0
            }
            
            if (!((prime_from | 0) % 2 | 0)) {
                prime_from = prime_from + 1 | 0
            }
            
            for (;;) {
                for (d = 3; (d | 0) < (prime_from | 0); d = d + 2 | 0) {
                    if (!((prime_from | 0) % (d | 0) | 0)) {
                        break
                    }
                }
                
                if ((d | 0) >= (prime_from | 0)) {
                    break
                }
                
                prime_from = prime_from + 2 | 0
            }
            
            return prime_from | 0
        }
        
        return {
            find_prime: find_prime,
        }
    }
    
    function create_disable_asm_module (stdlib) {
        // not use asm
        
        function max (a, b) {
            a = a | 0
            b = b | 0
            
            if ((b | 0) > (a | 0)) {
                return b | 0
            }
            
            return a | 0
        }
        
        function find_prime (prime_from) {
            prime_from = prime_from | 0
            
            var d = 0
            
            prime_from = max(2, prime_from) | 0
            
            if ((prime_from | 0) == 2) {
                return prime_from | 0
            }
            
            if (!((prime_from | 0) % 2 | 0)) {
                prime_from = prime_from + 1 | 0
            }
            
            for (;;) {
                for (d = 3; (d | 0) < (prime_from | 0); d = d + 2 | 0) {
                    if (!((prime_from | 0) % (d | 0) | 0)) {
                        break
                    }
                }
                
                if ((d | 0) >= (prime_from | 0)) {
                    break
                }
                
                prime_from = prime_from + 2 | 0
            }
            
            return prime_from | 0
        }
        
        return {
            find_prime: find_prime,
        }
    }
    
    var asm_module = create_asm_module(global)
    var disable_asm_module = create_disable_asm_module(global)
    
    global.onmessage = function (evt) {
        if (evt.data.version != '2013_10_13_02_11') {
            return
        }
        
        var prime_from = evt.data.prime_from | 0
        var prime_count = evt.data.prime_count | 0
        
        var current_asm_module
        if(!evt.data.disable_asm) {
            current_asm_module = asm_module
        } else {
            current_asm_module = disable_asm_module
        }
        
        for (var prime_i = 0; prime_i < prime_count; ++prime_i) {
            prime_from = current_asm_module.find_prime(prime_from)
            
            postMessage({
                    prime: prime_from,
                    })
            
            prime_from += 1
        }
        
        postMessage({
                done: true,
                })
    }
})(this)
