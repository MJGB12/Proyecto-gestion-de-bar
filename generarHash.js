const bcrypt = require('bcrypt');

(async () => {
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Hash generado:', hash);
})();