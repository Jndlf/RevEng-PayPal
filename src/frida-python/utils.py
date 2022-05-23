

def constructStringFromJavaScriptFile(pathToFile):
    javaScriptString = '\n'
    with open(pathToFile) as f:
        lines = f.readlines()
    for line in lines:
        javaScriptString += line
    javaScriptString += '\n'
    return javaScriptString
