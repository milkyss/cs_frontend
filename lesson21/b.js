function format(pattern, args) {
	const paramsRegex = /\$\{(?<name>.+?)}/g;
	const params = pattern.matchAll(paramsRegex);

	for (const param of params) {
		const name = param[1];
		if (!args[name]) {
			continue;
		}

		pattern = pattern.replace(param[0], args[name]);
	}

	return pattern;
}

const res = format('Hello, ${user}! Your age is ${age}.', {user: 'Bob', age: 10});
console.log(res);