const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const morgan = require('morgan')
const path = require('path');
const exphbs = require('express-handlebars');
const passport = require('passport')
const mongoose = require('mongoose');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override')

dotenv.config({ path: './config/config.env' })
require('./config/passport')(passport);
connectDB();

const app = express();
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method
      delete req.body._method
      return method
    }
  })
)

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  })
);
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

app.engine('.hbs', exphbs({
  helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
  },
  defaultLayout: 'main', extname: '.hbs'
}))
app.set('view engine', '.hbs');

app.use(passport.initialize())
app.use(passport.session())

app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})

app.use(express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/index.js'));
app.use('/auth', require('./routes/auth.js'))
app.use('/codes', require('./routes/codes.js'));



const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
