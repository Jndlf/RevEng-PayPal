// Find the module for the program itself, always at index 0:
const m = Process.enumerateModules()[0];

// Or load a module by name:
//const m = Module.load('PayPal');


// get the base address, this will be necessary to calculate the actual address of the function

const baseAddr = Module.getBaseAddress(m.name);

// If your address is 0x10013acf4, your offset is 0x13acf4 
const funcOffset = 0x4d7f1c8;

// convert it to int for easier arithmetic (and NativePointer can take int as argument)
const funcOffsetInt = parseInt(funcOffset);

// in my case, there was always a deviation from the ghidra address and the actual process address
// it's always only a few bytes (or a few thousand lol), but you might need to figure it out. If not, set to 0
// keep in mind that both directions are possible
const hidden_offset = 0;

// create Native pointers
const baseMemAddr = new NativePointer(baseAddr);
const funcMemAddr = new NativePointer(parseInt(baseAddr) + funcOffsetInt + hidden_offset);
//console.log("baseAddr: ", baseAddr);
// output the address in the running process
console.log("Address of the desired function in memory: ", funcMemAddr);
console.log("Base Addr:", baseMemAddr);


Interceptor.attach(funcMemAddr, {
    onEnter: function(args) {
        console.log("=============== Attatching and printing first 3 args ===============");
        console.log(args[0]);
        console.log(args[1]);
        console.log(args[2]);

        let arg0 = ptr(args[0]);

        arg0.writeUtf8String("give me a crash pls");

        console.log("====================================================================");
    },
            

    onLeave: function(retval) {
        console.log("=============== Leaving function and printing ret val ==============");
        console.log(retval)
    }
});