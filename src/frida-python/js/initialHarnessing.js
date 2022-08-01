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
const funcOffset = 0x4b9db98;

// convert it to int for easier arithmetic (and NativePointer can take int as argument)
const funcOffsetInt = parseInt(funcOffset);

// create Native pointers
const baseMemAddr = new NativePointer(baseAddr);
const funcMemAddr = new NativePointer(parseInt(baseAddr) + funcOffsetInt);


console.log(funcMemAddr.readByteArray(32));

//console.log("baseAddr: ", baseAddr);
// output the address in the running process
console.log("Address of the desired function in memory: ", funcMemAddr);
console.log("Base Addr:", baseMemAddr);



Interceptor.attach(funcMemAddr, {
    onLeave: function(retval) {
        console.log("=============== Modifying content ==============");
        
        var r = ptr(retval)
        
        let storedBytes = Memory.readByteArray(r, 32);

        // follow the pointer that is found at the desired memory location
        // it seems to be saved in little endian format, that's why we need 
        // to convert it
        let followedBytes = convertLEtoBE(storedBytes, 5, 16);
        let storedBytes2 = Memory.readByteArray(ptr(followedBytes), 48);
        console.log("Depth 2 at " + ptr(followedBytes));
        console.log(storedBytes2);
    }
});



// testing

Interceptor.attach(funcMemAddr, {
    onEnter: function(args) {
        console.log("=============== Attatching and printing first 3 args ===============");
        
        let a1 = ptr(args[0]);
        let a2 = ptr(args[1]);
        //let a3 = ptr(args[2]);
        //let a4 = ptr(args[3]);
        
        
        console.log(a1);
        console.log(a2);
        //console.log(a3);
        //console.log(a4);

        console.log(Memory.readByteArray(a1, 100));
        console.log(Memory.readByteArray(a2, 100));
        //console.log(Memory.readByteArray(a3, 100));
        //console.log(Memory.readByteArray(a4, 100));

        /*
        console.log("follow pointers");
        let storedBytes = Memory.readByteArray(a3, 100);
        let followedBytes = convertLEtoBE(storedBytes, 5, 16);        
        console.log(Memory.readByteArray(ptr(followedBytes), 32));
        */

        //storedBytes = Memory.readByteArray(a4, 100);
        //followedBytes = convertLEtoBE(storedBytes, 5, 16);        
        //console.log(Memory.readByteArray(ptr(followedBytes), 48));
        
        console.log("========================= Register =================================");
        
        var json_strcontext = JSON.stringify(this.context);
        var json_obj = JSON.parse(json_strcontext);
        
        Object.keys(json_obj).forEach(function(key) {
        var value = json_obj[key];
        console.log("Register "+key+"\t: "+value)
    });
    },
            

    onLeave: function(retval) {
        console.log("=============== Leaving function and printing ret val ==============");
        
        var r = ptr(retval)
        
        let storedBytes = Memory.readByteArray(r, 100);

        console.log(r)
        console.log(storedBytes);

        // follow the pointer that is found at the desired memory location
        // it seems to be saved in little endian format, that's why we need 
        // to convert it
        let followedBytes = convertLEtoBE(storedBytes, 5, 16);
        let pointer = ptr(followedBytes);
        let storedBytes2 = Memory.readByteArray(pointer, 48);
        console.log("before");
        console.log(storedBytes2);
        let randomArray = Array.from({length: 40}, () => Math.floor(Math.random() * 255));
        pointer.writeByteArray(randomArray);
        storedBytes2 = Memory.readByteArray(pointer, 48);
        console.log("after");
        console.log(storedBytes2);
        

        
    }
});



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
};