import frida, sys

# debug function
def on_message(message, data):
    if message['type'] == 'send':
        print(message['payload'])
    elif message['type'] == 'error':
        print(message['stack'])

enumerateModules = """
	const moduleArray = Process.enumerateModules();
	let adr = 0;
	for (let i = 0; i < moduleArray.length; i++){
		console.log(moduleArray[i].name + ": " + moduleArray[i].base);
		//adr = Module.findExportByName(moduleArray[i].name, 'entry');
		//console.log("Adr found: ", adr);
	}
	
	
"""

functionScript = """
	const baseAddr = Module.getBaseAddress('PayPal');
	// 0xa75c is the offset of the entry function, convert to int
	const entryOffsetInt = 16788316
	// actual offset: 0x1002b5c
	// offset in ghidra: 0x1002b5c

	const hidden_offset = 192
	// create Native pointers
	const baseMemAddr = new NativePointer(baseAddr);
	const entryMemAddr = new NativePointer(parseInt(baseAddr) + entryOffsetInt + hidden_offset);
	console.log("baseAddr: ", baseAddr);
	console.log("entryAddr: ", entryMemAddr);
	console.log(entryMemAddr.readByteArray(8));
	//const callFunc = new NativeFunction(entryMemAddr, 'void', ['int32']);

	//callFunc(404);
	Interceptor.attach(entryMemAddr, {
		onEnter(args) {
			console.log("Parameters of Func being called: ", args[0]);
		},
		onLeave(retval) {
			console.log("Retval of leaving Func: ", retval);
		}
	});
	console.log("Intercepted");
"""

device = frida.get_usb_device()
# print(device.enumerate_applications())
pid = device.spawn(["com.yourcompany.PPClient"])
session = device.attach(pid)
script = session.create_script(functionScript)
script.on('message', on_message)
script.load()
device.resume(pid)

#sys.stdin.read()