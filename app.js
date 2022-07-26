const express = require('express');
const app = express();

//Captura los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

app.use('/resources', express.static('public'));
app.use('resources', express.static(__dirname + '/public'));

//Motor de plantillas ejs
app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
 
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const connection = require('./database/db');

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
	const rol = req.body.rol;
	const name = req.body.name;
	const user = req.body.user;
	const password = req.body.password;
	//const image = req.body.image;
	let passwordHash = await bcryptjs.hash(password, 8);

    connection.query('INSERT INTO user SET ?',{rol:rol, name: name, user:user, password:passwordHash}, async (error, results) => {
        if(error){
            console.log(error);
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Registro",
				alertMessage: "¡Registro exitoso!",
				alertIcon: 'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});
            //res.redirect('/');         
        }
	});
})

app.post('/auth', async (req, res) => {
	const user = req.body.user;
	const password = req.body.password;    
    let passwordHash = await bcryptjs.hash(password, 8);

	if (user && password) {
		connection.query('SELECT * FROM user WHERE user = ?', [user], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcryptjs.compare(password, results[0].password)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "Usuario y/o contraseña incorrectas",
                        alertIcon: 'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
                //res.send('Incorrect Username and/or Password!');				
			} else {               
				req.session.loggedin = true;                
				req.session.name = results[0].name;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡Usuario correcto!",
					alertIcon: 'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.send('Por favor ingrese un usuario y contraseña!');
		res.end();
	}
});

app.get('/', (req, res) => {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			name: req.session.name			
		});		
	} else {
		res.render('index',{
			login: false,
			name: 'Debe iniciar sesión',			
		});				
	}
	res.end();
});

app.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/')
	})
});

app.listen(3000, (req, res) => {
    console.log('Server running in http://localhost:3000');
})