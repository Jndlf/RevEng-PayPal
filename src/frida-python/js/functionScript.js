// works onlyy for base module so far

// with this function, you can check where to find a function in Memory
// for that, use the offset of the function (functionOffset) 
// you found in ghidra or any other disassebling tool 

// to make sure that this offset matches the actual offset in the program (that you can then use with frida e.g.)
// check whether the output you get matches the output you would expect


// Find the module for the program itself, always at index 0:
const m = Process.enumerateModules()[0];

// Or load a module by name:
//const m = Module.load('PayPal');


// get the base address, this will be necessary to calculate the actual address of the function

const baseAddr = Module.getBaseAddress(m.name);

// If your address is 0x10013acf4, your offset is 0x13acf4 
const funcOffset = 0x4b0081c;

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
console.log("Base Addr:", baseMemAddr);
console.log("Address of the desired function in memory: ", funcMemAddr);


// you might have to increase the sire of the byte array output in order to see where you are
// compare the output with you disassembler and if necessary, adapt hiddenOffset
console.log(funcMemAddr.readByteArray(48));



//callFunc(404);
Interceptor.attach(funcMemAddr, {
    onEnter(args) {
        console.log("Amount of args: ", args.length);
        console.log("Parameters of Func being called: ", args[0], " ", args[1], " ", args[2]);
        console.log(args[0].readByteArray(8), "\n");
        console.log(args[1].readByteArray(8), "\n");
        console.log(args[2].readByteArray(8), "\n");
    },
    onLeave(retval) {
        console.log("Retval of leaving Func: ", retval);
    }
});
console.log("Intercepted");