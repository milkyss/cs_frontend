const emailRegex = /^(?!.*\.\.)[^.][a-z0-9_.-]+[^.]@[a-z0-9.-]+\.[a-z]{2,6}$/i;

/* объяснение по кусочкам
* /^(...)$/ - захват всего текста от начала до конца
* (?!.*\.\.) - отрицательный просмотр вперед - проверяет, нет ли двух точек подряд, шаблон (?!...)
* [^.]...[^.] - проверяем, нет ли точки в начале или конце локальной части
* [a-z0-9_.-]+ - символы локальной части, при необходимости можно дополнить
* @[a-z0-9.-]+\.[a-z-]{2,6} - домен + доменная зона, разделяемые точкой
* [a-z]{2,6} - разрешаем в доменной зоне от 2 до 6 символов
* /.../i - регистронезависимый поиск, но можно добавить везде, где допускается буква, A-Z
*/

console.log(emailRegex.test("user@example.com"));      // true
console.log(emailRegex.test("test@mail.ru"));          // true
console.log(emailRegex.test("user123@domain.org"));    // true
console.log(emailRegex.test("invalid-email"));         // false
console.log(emailRegex.test("user@.com"));             // false
console.log(emailRegex.test("user@domain"));           // false
console.log(emailRegex.test("user@domain.c"));         // false
console.log(emailRegex.test("user@domain.com"));       // true
console.log(emailRegex.test("user-rus90@domain.com")); // true
console.log(emailRegex.test(".user@domain.com"));      // false
console.log(emailRegex.test("user.@domain.com"));      // false
console.log(emailRegex.test("user..123@domain.com"));  // false
console.log(emailRegex.test("user.12.3@domain.com"));  // true
console.log(emailRegex.test("USER@domain.com"));       // true
