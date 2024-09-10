if (process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const flash = require("connect-flash");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore=require("connect-mongo");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");



const app = express();

const dbUrl=process.env.ATLASDB_URL;
// Database connection
mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
})
const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//     let registeredUser= await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })

// Root route
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Routes for listings and reviews
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 handler

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!!"));
}); 


app.use((err, req, res, next) => {
    // console.error(err); // Log the error for debugging

    // Use a default status code if it's not a valid number
    // let { statusCode = 500, message = "Something went wrong!" } = err;
    // if (isNaN(statusCode) || statusCode < 100 || statusCode > 599) {
    //     statusCode = 500;
    const { statusCode = 500, message = 'Something went wrong!' } = err;
    res.status(statusCode).json({ error: message });
    });

    // Send status code and render error page
//     res.status(statusCode).render("error.ejs", { message });
// });


app.listen(8080, () => {
    console.log("server is listening to port 8080");
});