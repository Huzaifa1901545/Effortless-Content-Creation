const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const util = require('util');
const Promise = require('bluebird');
const nodemailer = require('nodemailer');



require("./db/conn");
const Register = require("./models/registers");

const port = process.env.PORT || 3001;
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path)



app.use(async(req, res, next) => {
    if (req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, 'mynameishuzaifaasifiamdoingcoding');
            const user = await Register.findOne({ _id: decoded._id, 'tokens.token': req.cookies.token });
            if (user) {
                req.user = user;
                res.locals.isAuthenticated = true;
            } else {
                res.locals.isAuthenticated = false;
            }
        } catch (e) {
            res.locals.isAuthenticated = false;
        }
    } else {
        res.locals.isAuthenticated = false;
    }
    next();
});

// Signup
app.get("/signup", (req, res) => {
    res.render("signup", { isAuthenticated: !!req.user });
});

app.post('/signup', async(req, res) => {
    try {
        const user = new Register(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/login');
    } catch (e) {
        if (e.code === 11000 && e.keyPattern.email) {
            res.status(400).send({ error: 'Email already exists' });
        } else {
            res.status(400).send(e);
        }
    }
});

// Login
app.get("/login", (req, res) => {
    res.render("login", { isAuthenticated: !!req.user });
});

app.post('/login', async(req, res) => {
    try {
        const user = await Register.findOne({ email: req.body.email });

        if (!user || !await bcrypt.compare(req.body.password, user.password)) {
            return res.status(400).send('Unable to login');

        }

        const token = await user.generateAuthToken();
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/');
    } catch (e) {
        res.status(400).send();
    }
});

// Logout
app.get('/logout', async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.clearCookie('token'); // Clear the 'token' cookie
        res.redirect('/login');
    } catch (e) {
        res.status(500).send();
    }
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});
app.post('/forgot-password', async(req, res) => {
    const { email } = req.body;
    const user = await Register.findOne({ email });

    if (!user) {
        return res.render('forgot-password', { error: 'No account with that email found.' });
    }

    // If user exists, render the reset-password page
    res.render('reset-password', { email });
});
app.get('/reset-password', (req, res) => {
    res.render('reset-password', { email: req.query.email });
});

app.post('/reset-password', async(req, res) => {
    const { email, password, confirmpassword } = req.body;

    console.log('Received email:', email);
    console.log('Received password:', password);
    console.log('Received confirmpassword:', confirmpassword);

    if (!email) {
        return res.status(400).send('Email is required');
    }

    if (password !== confirmpassword) {
        console.log('Passwords do not match for email:', email);
        return res.render('reset-password', { email, error: 'Passwords do not match' });
    }

    try {
        const user = await Register.findOne({ email });
        if (!user) {
            console.log('No account found with that email:', email);
            return res.render('reset-password', { email, error: 'No account with that email found.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword; // Update the password field with the hashed new password
        console.log(user.password)
        await user.save();
        console.log('Password updated successfully for user:', email);

        // Redirect to login page after successful password update
        res.redirect('/login');
    } catch (e) {
        console.error('Error occurred while resetting the password:', e);
        res.status(500).send({ error: 'An error occurred while resetting the password' });
    }
});





// Other routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get('/tutorial', (req, res) => {
    res.render('tutorial');
});

app.get('/feedback', (req, res) => {
    res.render('feedback');
});




app.get("/create", (req, res) => {
    if (req.user) {
        // Display tutorial page with authenticated user content
        res.render("create", { isAuthenticated: true });
    } else {
        // Display tutorial page with non-authenticated user content
        res.render("create", { isAuthenticated: false });
    }
});



app.get("/texttutorial", (req, res) => {
    if (req.user) {
        // Display tutorial page with authenticated user content
        res.render("texttutorial", { isAuthenticated: true });
    } else {
        // Display tutorial page with non-authenticated user content
        res.render("texttutorial", { isAuthenticated: false });
    }
});

app.get("/videotutorial", (req, res) => {
    if (req.user) {
        // Display tutorial page with authenticated user content
        res.render("videotutorial", { isAuthenticated: true });
    } else {
        // Display tutorial page with non-authenticated user content
        res.render("videotutorial", { isAuthenticated: false });
    }
});


app.get("/privacypolicy", (req, res) => {
    if (req.user) {
        // Display tutorial page with authenticated user content
        res.render("privacypolicy", { isAuthenticated: true });
    } else {
        // Display tutorial page with non-authenticated user content
        res.render("privacypolicy", { isAuthenticated: false });
    }
});













const { spawn } = require('child_process');

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));



// Parse JSON bodies
app.use(bodyParser.json());

// Route for scraping
// ...



app.post('/scrape', (req, res) => {
    const { url, htmlCheckbox, cssCheckbox, javascriptCheckbox, responsiveCheckbox, generateHashtags } = req.body;

    let pythonScriptPath;
    if (htmlCheckbox) {
        pythonScriptPath = path.join(__dirname, 'scraper.py');
    } else if (cssCheckbox) {
        pythonScriptPath = path.join(__dirname, 'css_scraper.py');
    } else if (javascriptCheckbox) {
        pythonScriptPath = path.join(__dirname, 'js_scraper.py');
    } else if (responsiveCheckbox) {
        pythonScriptPath = path.join(__dirname, 'responsive_scraper.py');
    } else {
        pythonScriptPath = path.join(__dirname, 'default_scraper.py');
    }

    const pythonProcess = spawn('python', [pythonScriptPath, url]);
    let responseData = [];

    pythonProcess.stdout.on('data', (data) => {
        responseData.push(data);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error from Python: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: 'An error occurred while scraping the webpage.' });
        }

        const buffer = Buffer.concat(responseData);
        const base64Data = buffer.toString('utf8');
        console.log(`Received Base64 Data Length: ${base64Data.length}`); // Debug log
        console.log(`Received Base64 Data: ${base64Data}`); // Debug log

        if (generateHashtags) {
            const hashtagProcess = spawn('python', [path.join(__dirname, 'hashtag_generator.py'), url]);

            hashtagProcess.stdout.on('data', (data) => {
                hashtags = data.toString().trim().split('\n');
            });

            hashtagProcess.stderr.on('data', (data) => {
                console.error(`Error from Hashtag Generator: ${data}`);
            });

            hashtagProcess.on('close', (code) => {
                if (code === 0) {
                    if (responsiveCheckbox) {
                        res.json({ video: base64Data, hashtags });
                    } else {
                        res.json({ image: base64Data, hashtags });
                    }
                } else {
                    res.status(500).json({ error: 'An error occurred while generating hashtags.' });
                }
            });
        } else {
            if (responsiveCheckbox) {
                res.json({ video: base64Data, hashtags: [] });
            } else {
                res.json({ image: base64Data, hashtags: [] });
            }
        }
    });
});



app.post('/submit-feedback', (req, res) => {
    const { name, email, message } = req.body;

    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // or 'STARTTLS'
        auth: {
            user: 'asifhuzaifa165@gmail.com', // your email
            pass: 'wvhpdnyfwmjfhxqj' // your email password   wvhpdnyfwmjfhxqj
        }
    });

    // Setup email data
    let mailOptions = {
        from: '"EFC Feedback" <your-email@gmail.com>', // sender address
        to: 'your-email@gmail.com', // list of receivers
        subject: 'New Feedback Received', // Subject line
        text: `You have received new feedback from ${name} (${email}):\n\n${message}`, // plain text body
        html: `<p>You have received new feedback from <strong>${name}</strong> (${email}):</p><p>${message}</p>` // html body
    };

    // Send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        res.send('Feedback submitted successfully');
    });
});


app.listen(port, () => {
    console.log(`port no ${port}`);
})