// works only for base module so far

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
const funcOffset = 0x524f0c;

// convert it to int for easier arithmetic (and NativePointer can take int as argument)
const funcOffsetInt = parseInt(funcOffset);

// create Native pointers
const baseMemAddr = new NativePointer(baseAddr);
const funcMemAddr = new NativePointer(parseInt(baseAddr) + funcOffsetInt);

// output the address in the running process
console.log("Address of the desired function in memory: ", funcMemAddr);
console.log("Base Addr:", baseMemAddr);

// do you want the register (and stack) printed?
// !! Warning !! lots of output will be generated
const reg = false;

// indicate the span of params that will be printed
// first param has index 0, last param index length -1
const firstParam = 0;
const lastParam = 2;

// indices params, whose MEMORY CONTENT will be printed
const paramMemContent = [0, 1, 2, 3, 4, 5, 6, 7, 8];


// save the address of an object that will be modified  throughout the function processting
let heapObcAddr = 0;



// testing

Interceptor.attach(funcMemAddr, {
    onEnter: function(args) {
        console.log("=============== Attatching and printing args ===============");
        
        // save all (possible arguments as pointers)

        const a1 = ptr(args[0]);
        const a2 = ptr(args[1]);
        const a3 = ptr(args[2]);
        const a4 = ptr(args[3]);
        const a5 = ptr(args[4]);
        const a6 = ptr(args[5]);
        const a7 = ptr(args[6]);
        const a8 = ptr(args[7]);
        const a9 = ptr(args[8]);
        

        // do you want to save the address of a heap object?
        heapObcAddr = a3;

        // create a list that lets you access each one individually
        let arg_list = [a1, a2, a3, a4, a5, a6, a7, a8, a9];
        
        // print the values of the desired arguments first
        let trueAddr = 0
        for (let i = firstParam; i <= lastParam; i++){
            console.log("Parameter ", i, ": ", arg_list[i]);
            trueAddr = removeASLR(arg_list[i])
            if (trueAddr.startsWith("0x1")){
                console.log("-> (no ASLR) : ", trueAddr);
            }
        }

        console.log("----------------- Memory Content -----------------------");

        // now print as much content as desired
        let tmpMem;
        let memContents = [];

        for (let i = firstParam; i <= lastParam; i++){
                if (paramMemContent.includes(i)){
                    tmpMem = getMemContent(arg_list[i], 80, true);
                    memContents.push(tmpMem);
                }
            }
        console.log("----------------- Following Addresses -----------------------");
        
        // each function call traces one Memory Content's addresses
        // set the following parameters accordingly

        // set the address to the buffer that you want to take the pointer address from
        let addrLocation = arg_list[2];
        // in 2Bytes, typically 5 to fit the 64 bit addresses in the given format
        let addrSize = 5;
        // typically 0, but can be any offset withing the content size
        let addrOffset = 16;
        // how often do you want to perform the process of following the pointer with those params? (min 1 for something to happen)
        let depth = 1;
        // where to apply the offset (first level or second level, or maybe even later)
        let offsetDepth = 0;

        console.log("------------------- Address: ", addrLocation, " ----------------");

        followPointer(addrLocation, addrSize, addrOffset, depth, offsetDepth);

        /* need another addrLocation? -> copy variables
        addrLocation = arg_list[3];
        addrSize = 5;
        addrOffset = 0;
        depth = 1;
        offsetDepth = 0;

        console.log("---------------- Address: ", addrLocation, " ----------------");

        */


        // for more params

        /*
        addrLocation = arg_list[4];
        addrSize = 5;
        addrOffset = 32;
        depth = 2;
        offsetDepth = 0;

        console.log("---------------- Address: ", addrLocation, " ----------------");
        followPointer(addrLocation, addrSize, addrOffset, depth, offsetDepth);

        addrLocation = arg_list[5];
        addrSize = 5;
        addrOffset = 32;
        depth = 2;
        offsetDepth = 0;

        console.log("---------------- Address: ", addrLocation, " ----------------");
        followPointer(addrLocation, addrSize, addrOffset, depth, offsetDepth);


        addrLocation = arg_list[6];
        addrSize = 5;
        addrOffset = 16;
        depth = 2;
        offsetDepth = 0;

        console.log("---------------- Address: ", addrLocation, " ----------------");
        followPointer(addrLocation, addrSize, addrOffset, depth, offsetDepth);
        */


        if (reg){
            console.log("========================= Register =================================");
        
            var json_strcontext = JSON.stringify(this.context);
            var json_obj = JSON.parse(json_strcontext);
            
            Object.keys(json_obj).forEach(function(key) {
                var value = json_obj[key];
                console.log("Register "+key+"\t: "+value)
                try {
                    console.log(Memory.readByteArray(ptr(value), 16));
                }
                catch (e) {
                    console.log(e);
                }
                
            });
            console.log("--------------Stack--------------");
            console.log(Memory.readByteArray(ptr(this.context.sp), 400));
            } 

    },
            

    onLeave: function(retval) {
        console.log("=============== Leaving function and printing ret val ==============");
        
        var r = ptr(retval)
        let rContent = getMemContent(r, 160, true);
        

        // following

        let addrLocation = r;
        let addrSize = 5;
        let addrOffset = 16;
        let depth = 1;
        let offsetDepth = 1;

        console.log("---------------- Address: ", r, " ----------------");
        followPointer(addrLocation, addrSize, addrOffset, depth, offsetDepth);

        console.log("---------------- Heap Object that might have changed ----------------");
        getMemContent(heapObcAddr, 160, true);

    }
});



// auxiliary function to retrieve a memory region
// print flag indicates if output is desired
// -> same format each time 
function getMemContent(address, size, print_flag){
    try {
        let mem = Memory.readByteArray(ptr(address), size);
        if (print_flag) {
            console.log("Printing Memory for ", address);
            let trueAddr = removeASLR(address);
            if (trueAddr.startsWith("0x1")){
                console.log("-> (no ASLR) : ", trueAddr);
            }
            console.log("----------------------------------------");
            if (mem) {
                console.log(mem);
            }
            else {
                console.log("mem: ", mem, " --- Probably not a valid pointer in the first place");
            }
            console.log("----------------------------------------");
        }
        return mem;
    } catch (e){
        console.log("Exception occured, but is handled: ", e);
        return 0;
    }
    
}

// takes an ArrayBuffer as input and converts the first 'len' bytes to
// big endian, i.e. reversing the byte order and return the result as a
// string. The result can then be used to create e.g. a new Native Pointer
function convertLEtoBE(arraybuf, len, offset){

    const decoded = new Uint8Array(arraybuf);
    let decString = '0x';

    const decLen = decoded.length;

    if (decLen < len){
        console.log("convertLEtoBE not possible - length issue (requested length: ", len, ", actual length: ", decLen, ")");
        return 0;
    }

    // create a hex character from each obtained original character
    // and reverse the order
    for(let i = len -1 + offset; i >= offset; i--){
        //console.log("Adding: " + decoded[i].toString(16).padStart(2, "0"));
        try{
            decString += (decoded[i].toString(16).padStart(2, "0"));
        }
        catch (e){
            console.log("Exception occured, but is handled: ", e);
        }
        
    }

    return decString;
}

/**
 * 
 * @param {hex address} address 
 * @param {int} size 
 * @param {int} offset 
 * @param {int} depth 
 * @param {int} offset_depth at what level should the offset be applied
 * @returns 
 */
function followPointer(address, size, offset, depth, offset_depth){
    // intended max size from start address
    const contentBuffer = 80;
    // check if more than intended is read
    if (size + offset > contentBuffer){
        console.log("Either size or offset parameter not valid!");
        return 0;
    }

    // perform actual pointer "dereferencing"
    let memBuffer = address;
    let appliedOffset = 0;
    for (let i = 0; i <= depth; i++){

        if (i == offset_depth) {
            appliedOffset = offset;
        }

        // in case that the adress is taken from memory in LE format (e.g. when depth is < 1)
        if (i != 0){
            memBuffer = convertLEtoBE(memBuffer, size, appliedOffset);
            if (memBuffer == 0){
                console.log("Following failed");
                return 0;
            }
        }
        else {
            memBuffer = ptr("0x" + (Number(memBuffer) + appliedOffset).toString(16));
        }
        console.log("---------------- depth ", i, " -------------");
        console.log("Mem addr to print (via getMemContent): ", memBuffer);
        memBuffer = getMemContent(memBuffer, size + 128, true);
        console.log("-------------------------------------------------");
        
        appliedOffset = 0;
    }

    return 1;
}


// obtain address without ASLR
function  removeASLR(address){
    // actual base (i.e. in ghidra)
    const static_base = 0x100000000;
    
    // baseAddr is the shifted base during (this) runtime
    const offset = address - baseAddr;

    // add offset to actual base
    const trueAddr = "0x" + (static_base + offset).toString(16);

    return trueAddr
}