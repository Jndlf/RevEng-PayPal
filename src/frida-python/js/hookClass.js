// var className = "LoginFlowStateManager"
// var className = "LoginFlowOrchestrator"

// var className = "PFSplitPasswordViewController"
// var className = "PFDataTransaction"
var className = "PFAccountCredentials"

// set debug level

/**
 * turn output off:             0
 * most basic output:           1
 * + parameters and ret value : 2
 * + register:                  3
 * + stack                      4
 */

let debug_level = 2

function observeClass(name) {
    var k = ObjC.classes[name];
    // Find the module for the program itself, always at index 0:
    const m = Process.enumerateModules()[0];
    const baseAddr = Module.getBaseAddress(m.name);

    if (debug_level > 0){
        console.log("==========================================");
        console.log("==============  Game Start  ==============");
        console.log("Base Address: ", baseAddr);
        console.log("==========================================");
    }
    k.$ownMethods.forEach(function(m) {
        var impl = k[m].implementation;
        if (debug_level > 3){
            console.log("DEBUG: ", impl.readByteArray(32))
        }
        

        if (debug_level > 0){
            console.log('Hooking ' + name + ' ' + m);
            console.log("==========================================");
        }
        
        Interceptor.attach(impl, {
            onEnter: function(args) {
                
                if (debug_level >= 1){
                    console.log("\n========== Enter function: "+m+" ==========");
                
                }
                if (debug_level >= 3){
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
                        let storedBytes = Memory.readByteArray(a0, 5);
                        console.log("--------------param0--------------");
                        console.log("param 0 - original: "+a0);
                        console.log(storedBytes);

                        // follow the pointer that is found at the desired memory location
                        // it seems to be saved in little endian format, that's why we need 
                        // to convert it
                        let converted = convertLEtoBE(storedBytes, 5, 0);
                        console.log("param 0 - decoded: " + converted);
                        console.log("param 0 - pointer followed");
                        
                        let followedBytes = Memory.readByteArray(ptr(converted), 32);
                        console.log(followedBytes);
                        
                        
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
                        let storedBytes = Memory.readByteArray(a2, 100); 
                        console.log(storedBytes);

                        // following pointers, following pointers, ...
                        // decide how deep you want to go
                        let converted = convertLEtoBE(storedBytes, 5, 0);
                        console.log("param 2 - decoded: " + converted);
                        console.log("param 2 - pointer followed");
                        
                        let followedBytes = Memory.readByteArray(ptr(converted), 32);
                        console.log(followedBytes);
                            
                        let converted2 = convertLEtoBE(followedBytes, 5, 1);
                        console.log("param 2 - followed depth: 2");
                        console.log("param 2 - decoded: " + converted2);
                        let followedBytes2 = Memory.readByteArray(ptr(converted2), 8);
                        console.log(followedBytes2);

                        let converted3 = convertLEtoBE(followedBytes2, 5, 0);
                        console.log("param 2 - followed depth: 3");
                        console.log("param 2 - decoded: " + converted3);
                        let followedBytes3 = Memory.readByteArray(ptr(converted3), 8);
                        console.log(followedBytes3);
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
                // overwrite return values of function m (set m manually)
                if (m == "- canMoveFromState:toState:") {
                    retval.replace(0);
                }

                if (m == "- currentState") {
                    retval.replace(0);
                }

                if (debug_level >= 1){
                console.log("\n========== Leave function: "+m+"==========");
                    var ret = ptr(retval);
                    if (debug_level > 1){
                        try
                        {
                            console.log("return function: "+ret+" "+m);
                            //console.log(Memory.readByteArray(ret, 40));
                        }
                        catch(e)
                        {       
                                console.log("ret value couldn't beretrieved ", e, "\n");
                        }
                    }
                }
            }
        });
    });
}

// takes an ArrayBuffer as input and converts the first 'len' bytes to
// big endian, i.e. reversing the byte order and return the result as a
// string. The result can then be used to create e.g. a new Native Pointer
function convertLEtoBE(arraybuf, len, offset){
    let decoded = new Uint8Array(arraybuf);
    let decString = '0x';

    // create a hex character from each obtained original character
    // and reverse the order
    for(let i = len -1 + offset; i >= offset; i--){
        //console.log("Adding: " + decoded[i].toString(16).padStart(2, "0"));
        decString += (decoded[i].toString(16).padStart(2, "0"));
    }

    return decString;
}



observeClass(className)