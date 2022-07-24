// Find the module for the program itself, always at index 0:
const m = Process.enumerateModules()[0];

// Or load a module by name:
//const m = Module.load('PayPal');


// get the base address, this will be necessary to calculate the actual address of the function

const baseAddr = Module.getBaseAddress(m.name);

// If your address is 0x10013acf4, your offset is 0x13acf4 
const funcOffset = 0x4b9db7c;

// convert it to int for easier arithmetic (and NativePointer can take int as argument)
const funcOffsetInt = parseInt(funcOffset);


// create Native pointers
const baseMemAddr = new NativePointer(baseAddr);
const funcMemAddr = new NativePointer(parseInt(baseAddr) + funcOffsetInt);
//console.log("baseAddr: ", baseAddr);
// output the address in the running process
console.log("Address of the desired function in memory: ", funcMemAddr);
console.log("Base Addr:", baseMemAddr);


Interceptor.attach(funcMemAddr, {
    onEnter: function(args) {
        console.log("=============== Attatching and printing first 3 args ===============");
        console.log(args[0]);
        console.log(args[1]);

        //arg2.writeUtf8String(fuzz_input(8));
        //console.log(Memory.writeByteArray(arg2, [0x41, 0x41, 0x41, 0x41]));
        
        // arg1.writeUtf8String(fuzz_input(8));
        // arg2.writeUtf8String(fuzz_input(8));

        console.log("====================================================================");
    },
            

    onLeave: function(retval) {
        console.log("=============== Leaving function and overwrite content ==============");
        console.log(retval)

        let storedBytes = Memory.readByteArray(retval, 64);
        console.log("=== unaltered ===")
        console.log(storedBytes);

        let usernameAddr = new NativePointer(parseInt(retval) + 17);

        usernameAddr.writeByteArray([0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41, 0x41]);

        console.log("=== altered ===")
        storedBytes = Memory.readByteArray(retval, 64);

        console.log(storedBytes);
    }
});
