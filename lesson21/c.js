
function calc(text) {
	function compute(expression) {
		try {
			expression = expression.replace(/\*\*/, '^');

			return new Function(`return ${expression}`)();
		} catch {
			return expression;
		}
	}

	let prev;
	let result = text;

	do {
		prev = result;
		result = result.replace(/\(([^()]+)\)/g, (_match, expression) => {
			return compute(expression);
		})
	} while (result !== prev);

	do {
		prev = result;
		result = result.replace(/(\d+)\s*([+\-*/]|\*\*)\s*(\d+)/g, (_match, ...args) => {
			const [a, op, b] = args;
			return compute(`${a}${op}${b}`);
		})
	} while (result !== prev);

	return result;
}

const res = calc(`
Какой-то текст (10 + 15 - 24) ** 2
Еще какой то текст 2 * 10
`);

console.log(res);
// == `
// Какой-то текст 1
// Еще какой-то текст 20
