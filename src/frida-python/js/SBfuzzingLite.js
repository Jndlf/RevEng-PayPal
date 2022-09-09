/**
 * 
 * @author mglaess
 * substitute random bytes in the password that is retrieved from the keychain
 * 
 */
// Find the module for the program itself, always at index 0:
const m = Process.enumerateModules()[0];



// get the base address, this will be necessary to calculate the actual address of the function

const baseAddr = Module.getBaseAddress(m.name);

// If your address is 0x10013acf4, your offset is 0x13acf4 
const funcOffset = 0x524f0c;

// convert it to int for easier arithmetic (and NativePointer can take int as argument)
const funcOffsetInt = parseInt(funcOffset);

// create Native pointers
const baseMemAddr = new NativePointer(baseAddr);
const funcMemAddr = new NativePointer(parseInt(baseAddr) + funcOffsetInt);


// console.log("baseAddr: ", baseAddr);
// output the address in the running process
console.log("Address of the desired function in memory: ", funcMemAddr);
console.log("Base Addr:", baseMemAddr);



Interceptor.attach(funcMemAddr, {
    onEnter: function(args){
        console.log("EnterSchmenter");
    },

    onLeave: function(retval) {
        console.log("=============== Modifying content ==============");
        
        var r = ptr(retval)
        let rContent = getMemContent(r, 160, true);
        

        // following

        let addrLocation = r;
        let addrSize = 5;
        let addrOffset = 16;
        let depth = 0;
        let offsetDepth = 0;

        console.log("---------------- Address: ", r, " ----------------");
        // before
        let passwordAddr = ptr("0x" + (Number(r) + addrOffset + 1).toString(16));
        getMemContent(passwordAddr, 40, true);
        // manuplulate
        simpleManipulatorAtAddress(passwordAddr, 20);
        getMemContent(passwordAddr, 40, true);

    }
});


function simpleManipulatorAtAddress(addr, lengthToWrite) {

    let createdBytes = [];
    for (let i = 0; i < lengthToWrite; i++){
        createdBytes.push(Math.floor(Math.random() * 256));
        /* ** if there where 0 bytes inbetween the letters (such as PayPal)
        if (i % 2 == 0) {
            createdBytes.push(0);
        }
        else {
            createdBytes.push(Math.floor(Math.random() * 255));
        }
        */
    }
    let randomArray = Array.from(createdBytes);
    ptr(addr).writeByteArray(randomArray);

}



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
    let savedPointer = 0;
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

        savedPointer = memBuffer;

        console.log("---------------- depth ", i, " -------------");
        console.log("Mem addr to print (via getMemContent): ", memBuffer);
        memBuffer = getMemContent(memBuffer, size + 128, true);
        console.log("-------------------------------------------------");
        
        appliedOffset = 0;
    }

    return savedPointer;
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