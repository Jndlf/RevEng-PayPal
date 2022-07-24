import frida, utils
import sys

# debug function
def on_message(message, data):
    if message['type'] == 'send':
        print(message['payload'])
    elif message['type'] == 'error':
        print(message['stack'])

device = frida.get_usb_device()
jsFunctionString = utils.constructStringFromJavaScriptFile("js/overwriteRetAddrContent.js")
#jsFunctionString = utils.constructStringFromJavaScriptFile("js/findFunctionAndTrace.js")
#jsFunctionString = utils.constructStringFromJavaScriptFile("js/hookClass.js")
#jsFunctionString = utils.constructStringFromJavaScriptFile("js/overwriteFuncParams.js")
# print(device.enumerate_applications())
pid = device.spawn(["com.yourcompany.PPClient"])
session = device.attach(pid)
script = session.create_script(jsFunctionString)
script.on('message', on_message)
script.load()
device.resume(pid)
#utils.stripGhidraCopyToInstructionBytes("data/entry.txt")

sys.stdin.read()

