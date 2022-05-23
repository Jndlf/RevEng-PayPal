const moduleArray = Process.enumerateModules();
	let adr = 0;
	for (let i = 0; i < moduleArray.length; i++) {
		console.log(moduleArray[i].name + ": " + moduleArray[i].base);
		//adr = Module.findExportByName(moduleArray[i].name, 'entry');
		//console.log("Adr found: ", adr);
	}