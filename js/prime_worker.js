// -*- mode: js; coding: utf-8 -*-

(function (global) {
    'use strict'
    
    function create_asm_module (stdlib) {
        'use asm'
        
        function find_prime (prime_from) {
            prime_from = prime_from | 0
            
            var d = 0
            
            if (!((prime_from | 0) % 2)) {
                prime_from = prime_from + 1 | 0
            }
            
            for (;;) {
                for (d = 3; (d | 0) < (prime_from | 0); d = d + 2 | 0) {
                    if (!((prime_from | 0) % (d | 0))) {
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
    
    global.onmessage = function (evt) {
        if (evt.data.version != '2013_07_15_12_04') {
            return
        }
        
        var prime_from = evt.data.prime_from | 0
        var prime_count = evt.data.prime_count | 0
        
        for (var prime_i = 0; prime_i < prime_count; ++prime_i) {
            prime_from = asm_module.find_prime(prime_from)
            
            postMessage({
                    prime: prime_from,
                    })
            
            prime_from += 2
        }
        
        postMessage({
                done: true,
                })
    }
})(this)
