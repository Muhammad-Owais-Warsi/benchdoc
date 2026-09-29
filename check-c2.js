const fs = require('fs');
const h = fs.readFileSync('examples/preview/13-quasar-one.html', 'utf8');
const body = h.slice(h.indexOf('</style>'));
const re = new RegExp('<details class="check">', 'g');
console.log('details.check count:', (body.match(re) || []).length);
console.log('static check-row divs:', (body.match(/<div class="check-row">/g) || []).length);
const i = body.indexOf('class="checks"');
console.log(body.slice(i, i + 600));
