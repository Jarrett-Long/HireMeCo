﻿var express = require('express');
var passport = require('passport');
var Account = require('./models/account.js');
var Heuristic = require('./models/CalculateMatch.js');
var path = require("path");
var router = express.Router();
var JobModel = require('./models/job.js');



router.get('/', function (req, res) {
    //res.render('index', { user : req.user });
    console.log("index.js: directing to: " + path.join(__dirname, '../public', '/views/index.html'));
    res.sendFile(path.join(__dirname, '../public', '/views/index.html'), { user : req.user } );
});

//=============================== JOB STUFF ================

var Job = require('./models/jobModel.js');
router.post('/job', Job.add);
router.get('/job', Job.matchSeeker);


// ================== LOGIN ===============================
router.get('/login', function (req, res) {
    console.log("index.js: GET /login, sendfile:" + path.join(__dirname, '../public', '/views/modules/login.html'));
    res.sendFile(path.join(__dirname, '../public', '/views/modules/login.html'), { user : req.user } );
});


router.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      console.log("index.js: An error occured: " + err);
      return res.status(500).json({err: err});
    }
    if (!user) {
      console.log("index.js: cannot find user: " + info);
      return res.status(401).json({err: info});
    }
    req.logIn(user, function(err) {
      if (err) {
        console.log("index.js: could not log in user: " + err);
        return res.status(500).json({err: 'Could not log in user'});
      }
      if (user.accountType == "job-seeker") {
        results = [];//Job.getMatchedJobs(req.user);
        JobModel.find().populate('Company').exec(function(err, jobs) {
          if (err) Job.handleError(err, res);

          //get every single job and match it
          jobs.forEach(function(job) {
              results.push(new Job.ResultItem(job, Heuristic(user, job)));
          });
          console.log(results);
          //sort results by best match
          results = results.sort(function(a, b) {
              return b.score - a.score;
          });
          console.log(results);
          //store the results
          req.user.MatchedJobs = results;

          console.log("Login successful!");
          res.status(200).json({
            status: 'Employee login successful!',
            user: user
          });
        });
      }
      else {
        JobModel.find({ Company: user._id })
          .populate('Company')
          .exec(function(err, jobs) {
          if (err) Job.handleError(error, response);
          console.log("Login successful!");
          res.status(200).json({
            status: 'Employer login successful!',
            user: user,
            postedjobs: jobs
          });
        });
      }
    });
  })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.sendFile(path.join(__dirname, '../public', '/views/index.html'), { user : req.user } );
});

router.post('/getCompany', function(req, res) {
  Account.findById(req.body._id).populate('jobs').exec(function(err, company) {
    if (err) Job.handleError(err, res);
    console.log(company);
    res.status(200).json({
      status: "We good",
      company: company
    });
  });
});

// ================== REGISTRATION ===============================
router.get('/register', function (req, res) {
    console.log("index.js: GET /register, sendfile:" + path.join(__dirname, '../public', '/views/modules/register.html'));
    res.sendFile(path.join(__dirname, '../public', '/views/modules/register.html'), { } );
});


router.post('/register', function(req, res) {
  console.log("index.js: Entered Register Post.")
  Account.register(
      new Account(
          {
              accountType: req.body.accountType,
              username: req.body.username,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              description: req.body.description,
              education: req.body.education,
              major: req.body.major,
              concentration: req.body.concentration,
              companyName: req.body.companyName,
              location: req.body.location,
              CompanySize: req.body.CompanySize,
              CompanyType: req.body.CompanyType,
              WorkEnvironment: req.body.WorkEnvironment,
              SkillList: req.body.SkillList,
              SurveyList: req.body.SurveyList
          }),
          req.body.password,
          function(err, account) {
               if (err) {
                 console.log("index.js: What! What happened! :o ");
                 console.log(err);
                 return res.status(500).json({err: err});
               }
               passport.authenticate('local')(req, res, function () {
                 console.log("Successful Registration");
                 return res.status(200).json({ status: 'Registration successful!' });
    });
  });
});


module.exports = router;