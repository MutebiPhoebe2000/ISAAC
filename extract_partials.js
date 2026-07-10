const fs = require('fs');

fs.mkdirSync('views/partials', { recursive: true });

// Extract navbar
const indexPug = fs.readFileSync('views/index.pug', 'utf8');
const navStart = indexPug.indexOf('    nav.navbar.navbar-expand-lg');
const navEnd = indexPug.indexOf('    //  ===== HERO ===== ');
if (navStart > -1 && navEnd > -1) {
    const navContent = indexPug.substring(navStart, navEnd);
    // write to partials, removing 4 spaces of indentation
    const unindented = navContent.split('\n').map(line => line.startsWith('    ') ? line.substring(4) : line).join('\n');
    fs.writeFileSync('views/partials/navbar.pug', unindented);
}

// Extract footer
const footerStart = indexPug.indexOf('    footer.summit-footer.py-5');
const footerEnd = indexPug.indexOf('    script(src=');
if (footerStart > -1 && footerEnd > -1) {
    const footerContent = indexPug.substring(footerStart, footerEnd);
    const unindented = footerContent.split('\n').map(line => line.startsWith('    ') ? line.substring(4) : line).join('\n');
    fs.writeFileSync('views/partials/footer.pug', unindented);
}

function replaceInFile(file, matchStart, matchEnd, includeStatement) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
    const start = content.indexOf(matchStart);
    const end = content.indexOf(matchEnd);
    if (start > -1 && end > -1) {
        const newContent = content.substring(0, start) + '    include partials/' + includeStatement + '\n' + content.substring(end);
        fs.writeFileSync(file, newContent);
    }
}

replaceInFile('views/index.pug', '    nav.navbar', '    //  ===== HERO ===== ', 'navbar.pug');
replaceInFile('views/index.pug', '    footer.summit-footer', '    script(src=', 'footer.pug');

// Fix URLs in navbar
let nav = fs.readFileSync('views/partials/navbar.pug', 'utf8');
nav = nav.replace(/pages\/auth\.html/g, '/auth');
nav = nav.replace(/index\.html/g, '/');
fs.writeFileSync('views/partials/navbar.pug', nav);

console.log("Partials extracted.");
