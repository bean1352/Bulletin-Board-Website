const express = require('express');
const { body } = require('express-validator');
const { session } = require('passport');

async function start() {

    const express = require('express');
    const app = express();
    const PORT = process.env.PORT || 2000;
    const path = require('path');
    const bodyParser = require('body-parser');
    const mongo = require('./lib/mongoUtil');
    const passport = require('passport');
    const { ensureAuthenticated } = require('./lib/auth');
    const https = require('https');
    const fs = require('fs');
    const spdy = require('spdy')
    const validate = require('./lib/validate');
    const nodemailer = require('nodemailer');
    const flash = require('connect-flash'); 
    const flash2 = require('flash');
    const session = require("express-session");
    const { check, validationResult } = require('express-validator');
    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const prompts = require('prompts');
    var moment = require('moment'); // require
    await mongo.init();

    const { Users } = require('./lib/mongoUtil');
    const { Posts } = require('./lib/mongoUtil');

      // Passport Config
  require('./lib/passport')(passport);

    const opt = {
        key: fs.readFileSync(path.join(__dirname, '/cert/localhost.key')),
        cert: fs.readFileSync(path.join(__dirname,'/cert/localhost.cert')),
        ca: fs.readFileSync(path.join(__dirname,'/cert/localhostCA.cer'))
       
      };
    

      const sess = {
        secret: process.env.SECRET,
        resave: false,
        name: "sessCC", //
        saveUninitialized: true,
    
        cookie: {
          maxAge: 60000,
          sameSite: true, //blocks CORS requests on cookies
        },
      };
      
    


      //Body parser to get dat from forms
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));





  app.use(session(sess));

    // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash())
  // app.use(flash2())



  app.set('view engine', 'ejs');

  app.use(express.static(path.join(__dirname, 'assets')))

  
//   app.use(function(req, res, next){
//     res.locals.success_messages = req.flash('success_messages');
//     res.locals.error_messages = req.flash('error_messages');
//     next();
// });

  app.get('/', (req, res) => {


      let posts = [];
     
        
      let filter = {}

      if(req.user) {

        req.flash('info', 'Welcome, '+ req.user.email);

        switch(req.user.auth){
          case '0':
            filter = {'auth':req.user.auth};
            break;
          case '1':
            filter = {'auth':req.user.auth};
            break;
  
        }
  
  
        Posts.findPosts(filter).then((posts) => {
  
  
          posts.map((post) => {
            post.dateAdded = moment(post.dateAdded).fromNow();
            //check if current user posted this post
            if (req.user._id.equals(post.userID)) {
              post.ownership = true;
              
            }
    
            post.canSave = false;
            //check if current user is a minister, if yes, they can save any post
            if (req.user.auth == '1') {
              post.canSave = true;
              
            }
    
          })
          //return posts array to front end
          res.render('home', {title: "home", posts: posts , message: req.flash('info'), user: req.user});
        })
      } else {
        Posts.findPosts(filter).then((posts) => {


          posts.map((post) => {
            post.dateAdded = moment(post.dateAdded).fromNow();
            //check if current user posted this post
            
              
          })
          //return posts array to front end
          res.render('home', {title: "home",  posts: posts , message: req.flash('info'), user: req.user});
        })
      }   
  })




  app.get('/login', (req, res) => {
   
    res.render('login', { title: 'login', message: "", user: req.user})
  })

  app.get('/register', (req, res) => {
   
    res.render('register', { title: 'register', message: "", user: req.user})
  })

  app.get('/edit', (req, res) => {

    if(!req.user){
      res.redirect('/')
    }
    else if (req.user.auth == 1){
      res.render('edit', { title: 'edit', message: ""})
      
    }


  })

  app.post('/login', (req, res, next) => {

    passport.authenticate('local', function (err, user, info) {
      if (err) {
        console.log('error')
        return next(err);
      }
      if (!user || !user.validateEmail) {

        let errorStr = 'Email and password do not match, do not exist or you have not validated your account!';
        console.log('dont match') 
        res.render('login', { title: 'login', message: errorStr, user: req.user})
        // res.redirect('/login');     
      }
    else{
      req.login(user, function (err) {
 
        let suc = 'You have Successfully Logged in';
        if (err) { return next(err); }
        
        console.log('success logon')
        
      
        
      
        res.redirect('/');
      });
    }


    })(req, res, next);
  })

        
   

  app.post('/register',
   [

    check('name').trim().escape(),
    check('email').isEmail().normalizeEmail(),
    check('password').trim().escape(),
    check('password2').trim().escape(),


  ], 
  (req,res) =>{ 
     //declare user object
     const { name, email, password, password2} = req.body;
     let errors = [];
  
    //  //check if passwords match
     if (password != password2) {
       errors.push({ msg: 'Passwords do not match' });
     }


    
     if (errors.length > 0) {
      //  res.render('register', {
         
      //  });

       res.render('register', { title: 'register', message: 'Passwords do not match', user: req.user})
     } else {
       Users.findUser({ email: email }).then(user => {
         //checks if email is already registered
         if (user) {
          console.log('Email already exists');
          
          res.render('register', { title: 'register', message: 'Email already exists!', user: req.user})
          
         } else {
           //multi factor authentication email object, with dummy email
           var transporter = nodemailer.createTransport({
             service: 'gmail',
             auth: {
               user: 'yourEmail',
               pass: 'yourPassword'
             },
             tls: { rejectUnauthorized: false }
           });

           var auth = 0
           var validateEmail = false;
        
           //defines database user entity
            let newUser = {
             name,
             email,
             password,
             auth,
             validateEmail
           };

           bcrypt.genSalt(10, (err, salt) => {
             bcrypt.hash(newUser.password, salt, (err, hash) => {
               if (err) throw err;
              //  hashing passord and generating a salt
               newUser.password = hash;

               Users.addUser(newUser)
                 .then(user => {
                  //  create json web token expires in 1 hour
                   jwt.sign({ user: newUser._id, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, process.env.EMAIL_SECRET, function (err, token) {
                     const mailOptions = {
                       from: 'yourEmail',
                       to: newUser.email,
                       subject: 'Confirm Email',
                       text: 'Please click the link to register your account with SmartIce4u! \n' + 'http://localhost:3001/validateEmail/' + token
                     };
                     //sent email
                     transporter.sendMail(mailOptions, function (error, info) {
                       if (error) {
                         console.log(error);
                       } else {
                         console.log('Email sent: ' + info.response);
                        
                       }
                     });
                     console.log(token);
                   });

                   res.render('register', { title: 'register', message: 'Please confirm your email to complete registration!', user: req.user})
               
                  res.redirect('/');
                 })
                 .catch(err => console.log(err));
             });
           });

         }
       });
     }

  });

  app.get('/validateEmail/:token', (req, res) => {
    //verify token
    const id = jwt.verify(req.params.token, process.env.EMAIL_SECRET);
    //update database 
    Users.updateUser(id.user, { $set: { validateEmail: true } }).then(user => {
      console.log("updated user")
      // req.flash(
      //   'error_msg',
      //   'Email confirmed'
      // );

      res.redirect('/');
    }).catch(err => console.log(err))
  })

  app.post('/post', (req, res) => {
   
   if(req.user){
    const { content } = req.body;
    //get data from cookie for current user
    const email  = req.user.email
    //convert date output
    const date = new Date(Date.now()).toISOString();
    //define post array consisting of data recovered
    let posts = { userID: req.user._id, content: content, email: email, dateAdded: date }
    //call add post method from post.js and pass post array to insert new entry
    Posts.addPost(posts)
      .then((p) => {

        posts.dateAdded = moment(posts.dateAdded).fromNow()
        //return post to front end
        res.send(posts)
        //res.render('home', { posts: posts,title: 'home', message: req.flash('info') })
      })
    }
    else{
      // req.flash('info', 'You need to Login to make Posts!');
      // console.log('You need to login first')
      // res.redirect('/');
      console.log('You need to login first')
      req.flash('info','You need to login to make posts!');
        

      res.redirect('/');
      
    }
     

  });
  

  app.get('/logout', (req,res) =>{ 
    req.logout();
    console.log('logged out');
    req.flash('info', 'You are logged out');
    res.redirect('/');

  });

  app.post('/sendinvoice', (req,res) =>{
    //declare user object
    const { Name, Email, Subject, Invoice } = req.body;

    let error = validate.validateInvoice(req.body);

    //check if there are errors, if so redirect to register
    if (error) {
      console.log(error);
      req.flash('info','Error');
      res.redirect('/');
    } else {
     
          //multi factor authentication email object, with dummy email
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'deanbraun12345678@gmail.com',
              pass: 'nnX7jdys'
            },
            tls: { rejectUnauthorized: false }
          });


          const mailOptions = {
            from: 'deanbraun12345678@gmail.com',
            to: 'braundean11@gmail.com',
            subject: Subject,
            text: Invoice + '\n\nSent from ' + Name + '\n\n'+ Email
          };
                    
          //sent email
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
             
            }
          });
                   
          
        req.flash('info','Invoice sent');
        

        res.redirect('/');
      
    }

  })

  app.post('/removePost', (req, res) => {
    //delete post by calling deletepost from post.js
    Posts.deletePost(req.body.id).then((p) => {
      res.send('deleted')
    })

  })

spdy
.createServer(opt, app)
.listen(3001, (error) => {
  if (error) {
    console.error(error)
    return process.exit(1)
  } else {
    console.log('Listening on port: ' + 3001 + '.')
  }
})

}

start();
