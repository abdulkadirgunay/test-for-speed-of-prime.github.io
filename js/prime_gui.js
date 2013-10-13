// -*- mode: js; coding: utf-8 -*-

(function (global) {
    'use strict'
    
    var module = global.app__prime_gui = {
            async_prompt: function (text, val, callback) {
                setTimeout(function () {
                    try {
                        var result = prompt(text, val)
                        
                        callback(null, result)
                    } catch (err) {
                        callback(err, null)
                    }
                }, 0)
            },
            
            async_alert: function (text) {
                setTimeout(function () {
                    alert(text)
                }, 0)
            },
            
            html_escape: function (val) {
                var elem = document.createElement('span')
                
                elem.textContent = val
                return elem.innerHTML
            },
            
            html_unescape: function (val) {
                var elem = document.createElement('span')
                
                elem.innerHTML = val
                return elem.textContent
            },
            
            TestCtx: function () {},
            
            write_to_log: function (test_ctx, text) {
                test_ctx.log_elem.innerHTML += module.html_escape(text) + '\n'
            },
            
            write_to_log_with_bold: function (test_ctx, text) {
                test_ctx.log_elem.innerHTML += '<b>' + module.html_escape(text) + '</b>\n'
            },
            
            write_to_log_with_date: function (test_ctx, text) {
                test_ctx.log_elem.innerHTML +=
                        '<b>' + module.html_escape(new Date().toLocaleString()) + '</b>: ' +
                        module.html_escape(text) + '\n'
            },
            
            write_to_log_with_date_html: function (test_ctx, html) {
                test_ctx.log_elem.innerHTML +=
                        '<b>' + module.html_escape(new Date().toLocaleString()) + '</b>: ' +
                        html + '\n'
            },
            
            on_prime_worker_msg: function (test_ctx, data) {
                if (test_ctx.is_closed || !test_ctx.is_busy) {
                    return
                }
                
                if (data.done) {
                    test_ctx.is_busy = false
                    test_ctx.end_time = Date.now()
                    var work_time = test_ctx.end_time - test_ctx.begin_time
                    
                    module.write_to_log_with_date_html(
                            test_ctx,
                            'end of test (work time is <span class="log_result_text">' + module.html_escape(work_time) + 'ms</span>)'
                            )
                    
                    return
                }
                
                module.write_to_log_with_date(
                        test_ctx,
                        'found prime (' + data.prime + ')'
                        )
            },
            
            run_test: function (test_ctx, kwargs) {
                if (kwargs === undefined) {
                    kwargs = {}
                }
                
                if (kwargs.disable_asm === undefined) {
                    kwargs.disable_asm = false
                }
                
                if (test_ctx.is_closed) {
                    return
                }
                
                if (test_ctx.is_busy) {
                    module.async_alert('error: test already is running')
                    return
                }
                
                test_ctx.is_busy = true
                
                module.async_prompt('Prime From', '500000000', function (err, prime_from) {
                    if (test_ctx.is_closed) {
                        return
                    }
                    
                    if (prime_from === null || prime_from === '') {
                        test_ctx.is_busy = false
                        return
                    }
                    
                    prime_from = new Number(prime_from)
                    
                    if (isNaN(prime_from) || prime_from <= 0) {
                        module.async_alert('error: invalid value')
                        test_ctx.is_busy = false
                        return
                    }
                    
                    module.async_prompt('Prime Count', '10', function (err, prime_count) {
                        if (test_ctx.is_closed) {
                            return
                        }
                        
                        if (prime_count === null || prime_count === '') {
                            test_ctx.is_busy = false
                            return
                        }
                        
                        prime_count = new Number(prime_count)
                        
                        if (isNaN(prime_count) || prime_count <= 0) {
                            module.async_alert('error: invalid value')
                            test_ctx.is_busy = false
                            return
                        }
                        
                        test_ctx.prime_from = prime_from
                        test_ctx.prime_count = prime_count
                        test_ctx.begin_time = Date.now()
                        
                        module.write_to_log_with_date(
                                test_ctx,
                                'begin test (' +
                                        (kwargs.disable_asm?'disable_asm; ':'') +
                                        'prime_from is ' + test_ctx.prime_from + '; ' +
                                        'prime_count is ' + test_ctx.prime_count +
                                        ')'
                                )
                        
                        test_ctx.prime_worker.postMessage({
                                version: test_ctx.version,
                                prime_from: test_ctx.prime_from,
                                prime_count: test_ctx.prime_count,
                                disable_asm: kwargs.disable_asm,
                                })
                    })
                })
            },
            
            init_log: function (test_ctx) {
                module.write_to_log_with_bold(
                        test_ctx,
                        'Test Version: ' + test_ctx.version + '\n' +
                        'Browser: ' + navigator.userAgent + '\n'
                        )
            },
            
            init_elem: function (elem, prime_worker_url) {
                if (!elem) {
                    return
                }
                
                var run_test_button = document.createElement('a')
                run_test_button.href = '#'
                run_test_button.textContent = 'Run Test'
                
                var run_disable_asm_test_button = document.createElement('a')
                run_disable_asm_test_button.href = '#'
                run_disable_asm_test_button.textContent = 'Run Test (disable_asm)'
                
                var clear_log_button = document.createElement('a')
                clear_log_button.href = '#'
                clear_log_button.textContent = 'Clear Log'
                
                var buttons_block = document.createElement('div')
                buttons_block.style.margin = '1em 0'
                buttons_block.appendChild(run_test_button)
                buttons_block.appendChild(document.createTextNode(' | '))
                buttons_block.appendChild(run_disable_asm_test_button)
                buttons_block.appendChild(document.createTextNode(' | '))
                buttons_block.appendChild(clear_log_button)
                
                var log_elem = document.createElement('pre')
                log_elem.style.margin = '1em 0 500px'
                log_elem.style.border = '1px solid'
                log_elem.style.padding = '2em'
                
                var prime_worker = new Worker(prime_worker_url)
                
                var test_ctx = new module.TestCtx
                test_ctx.version = '2013_10_13_02_11'
                test_ctx.is_closed = false
                test_ctx.is_busy = false
                test_ctx.log_elem = log_elem
                test_ctx.prime_worker = prime_worker
                
                prime_worker.addEventListener('message', function (evt) {
                    module.on_prime_worker_msg(test_ctx, evt.data)
                })
                
                run_test_button.addEventListener('click', function (evt) {
                    evt.preventDefault()
                    
                    module.run_test(test_ctx)
                })
                
                run_disable_asm_test_button.addEventListener('click', function (evt) {
                    evt.preventDefault()
                    
                    module.run_test(test_ctx, {disable_asm: true})
                })
                
                clear_log_button.addEventListener('click', function (evt) {
                    evt.preventDefault()
                    
                    test_ctx.log_elem.innerHTML = ''
                    module.init_log(test_ctx)
                })
                
                module.init_log(test_ctx)
                
                elem.innerHTML = ''
                elem.appendChild(buttons_block)
                elem.appendChild(log_elem)
            },
            }
})(this)
