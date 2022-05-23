import frida, utils

# debug function
def on_message(message, data):
    if message['type'] == 'send':
        print(message['payload'])
    elif message['type'] == 'error':
        print(message['stack'])

device = frida.get_usb_device()
jsFunctionString = utils.constructStringFromJavaScriptFile("/home/xkyzara/Git/TUD/RevEng-PayPal/src/frida-python/js/moduleMap.js")
# print(device.enumerate_applications())
pid = device.spawn(["com.yourcompany.PPClient"])
session = device.attach(pid)
script = session.create_script(jsFunctionString)
script.on('message', on_message)
script.load()
device.resume(pid)

#sys.stdin.read()