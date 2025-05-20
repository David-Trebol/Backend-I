const exphbs = require('express-handlebars');
const path = require('path');

const configHandlebars = (app) => {
    app.engine('handlebars', exphbs.engine({
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, '../views/layouts'),
        partialsDir: path.join(__dirname, '../views/partials'),
        extname: '.handlebars'
    }));

    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, '../views'));
};

module.exports = configHandlebars; 