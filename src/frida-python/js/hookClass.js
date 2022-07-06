// var className = "LoginFlowStateManager"
var className = "LoginFlowOrchestrator"

// set debug level

/**
 * turn output off:             0
 * most basic output:           1
 * + parameters and ret value : 2
 * + register:                  3
 * + stack                      4
 */

let debug_level = 4

function observeClass(name) {
    var k = ObjC.classes[name];
    if (debug_level > 0){
        console.log("==========================================");
        console.log("==============  Game Start  ==============");
    }
    k.$ownMethods.forEach(function(m) {
        var impl = k[m].implementation;

        if (debug_level > 0){
            console.log('Hooking ' + name + ' ' + m);
            console.log("==========================================");
        }
        
        Interceptor.attach(impl, {
            onEnter: function(args) {
                if (debug_level >= 3){
                    console.log("\n========== Enter function: "+m+" ==========");
                    console.log("--------------Register------------------")
                }
                
                var json_strcontext = JSON.stringify(this.context);
                var json_obj = JSON.parse(json_strcontext);
                
                Object.keys(json_obj).forEach(function(key) {
                  var value = json_obj[key];
                  if (debug_level >= 3){
                    console.log("Register "+key+"\t: "+value)
                  }
                });
                if (debug_level >= 3){
                    console.log("----------------------------------------")
                }
                if (debug_level == 4){
                    console.log("--------------Stack--------------");
                    console.log(Memory.readByteArray(ptr(this.context.sp), 400));
                }
                var a0 = ptr(args[0]);
                var a1 = ptr(args[1]);
                var a2 = ptr(args[2]);
                var a3 = ptr(args[3]);
                var a4 = ptr(args[4]);
                var a5 = ptr(args[5]);
                var a6 = ptr(args[6]);
                var a7 = ptr(args[7]);
                var a8 = ptr(args[8]);

                if (debug_level >= 2){
                    try
                    {
                        
                        console.log("--------------param0--------------");
                        console.log("param 0: "+a0);
                        console.log(Memory.readByteArray(a0, 100));
                    }
                    catch(e)
                    {
                        console.log("param 0 value couldn't beretrieved ", e, "\n");
                    }

                    try
                    {
                        console.log("--------------param1--------------");
                        console.log("param 1: "+a1);
                        console.log(Memory.readByteArray(a1, 100));
                    }
                    catch(e)
                    {
                        console.log("param 1 value couldn't beretrieved ", e, "\n");
                    }

                    try
                    {
                        console.log("--------------param2--------------");
                        console.log("param 2: "+a2);
                        console.log(Memory.readByteArray(a2, 100));
                    }
                    catch(e)
                    {
                        console.log("param 2 value couldn't beretrieved ", e, "\n");
                    }

                    try
                    {
                        console.log("--------------param3--------------");
                        console.log("param 3: "+a3);
                        console.log(Memory.readByteArray(a3, 100));
                    }
                    catch(e)
                    {
                        console.log("param 3 value couldn't beretrieved ", e, "\n");
                    }


                    try
                    {
                        console.log("--------------param4--------------");
                        console.log("param 4: "+a4);
                        console.log(Memory.readByteArray(a4, 100));
                    }
                    catch(e)
                    {
                        console.log("param 4 value couldn't beretrieved ", e, "\n");
                    }

                    try
                    {
                        console.log("--------------param5--------------");
                        console.log("param 5: "+a5);
                        console.log(Memory.readByteArray(a5, 100));
                    }
                    catch(e)
                    {
                        console.log("param 5 value couldn't beretrieved ", e, "\n");
                    }

                    try
                    {
                        console.log("--------------param6--------------");
                        console.log("param 6: "+a6);
                        console.log(Memory.readByteArray(a6, 100));
                    }
                    catch(e)
                    {
                        console.log("param 6 value couldn't beretrieved ", e, "\n");
                    }
                    // var log = Thread.backtrace(this.context, Backtracer.ACCURATE).map(DebugSymbol.fromAddress).join('\n');
                    // console.log(log);
                }
                },
            

            onLeave: function(retval) {
                if (debug_level >= 1){
                console.log("\n========== Leave function: "+m+"==========");
                    var ret = ptr(retval);
                    try
                    {
                        console.log("return function: "+ret);
                         console.log(Memory.readByteArray(ret, 40));
                    }
                    catch(e)
                    {       
                            console.log("ret value couldn't beretrieved ", e, "\n");
                    }
                }
            }
        });
    });
}



observeClass(className)