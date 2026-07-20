function zipStr(str) {
	let zip = str;
	const regex = /(.+)\1/;
	let status;

	do {
		zip = zip.replace(regex, "$1");
		status = regex.test(zip);
	} while(status);

	return zip;
}

console.log(zipStr('abbaabbafffbezza')); // abafbeza
