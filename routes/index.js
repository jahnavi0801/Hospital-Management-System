const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/auth')

//DB 
const db = require('../app')
var docname;
//Welcome Page
router.get('/', (req, res) => res.render('welcome'))

// Dashboard Page
router.get('/Rep_dashboard',  ensureAuthenticated, (req, res) => {
    var user = req.user.UserType;
    if(user == "Doctor") {
        db.query("select name from users where id="+req.user.id,(err,result) => {
            if (err) throw err;
            docname = result[0].name;      
            res.redirect("/doctor");
        });
    }
    else {
        res.render('Rep_dashboard', {
            UserType: req.user.UserType
        })
    }    
})

//patient registration
router.get("/patientinfo",(req,res) => {
    let diseases = 'select d_name, d_id from diseases'
    db.query(diseases, (err, result) => {
        if(err) throw err
        res.render('patientinfo', {
            diseases: result
        })
    })
});

var obj = {};
//patient registration
router.get("/doctor",(req,res) => {
    console.log(docname);
    obj.docname = docname;
    let pid = "select p_id from patient_info where d_id = (select diseases.d_id from diseases natural join doctor natural join users where users.name = '"+docname +"')";
    db.query(pid,(err,result) => {
        console.log("Result");
        console.log(result);
        obj.pids = result;
        if (err) throw err;    
        res.render("doctor",obj);    
    });       
});

var obj2 ={};
router.post("/viewpatient", (req,res) => {
    var pid = req.body.choosepatient;
    let sql = "select patient_info.p_id ,patient_info.p_name , patient_info.p_age , patient_info.p_bloodgrp , diseases.d_name from diseases natural join patient_info where patient_info.p_id ="+ pid ;
    db.query(sql,(err,result) => {
        console.log("Result");
        console.log(result);
        obj2 = {data: result};
        if (err) throw err;
        res.render("pview",obj2);    
    });       
});

router.post("/prescription", (req,res) => {
    res.render("prescriptionform");
});

//patient info
router.post('/patientdetails', (req, res) => {
    const { date,name,age,gender,DOB,BloodGrp,phone,address,email,d_id } = req.body
    
    let P_errors = []

    // Check required fields
    if(!date || !name || !age || !gender || !DOB || !BloodGrp || !phone || !address || !email || !d_id ) {
        P_errors.push({msg: 'Please fill in all fields'})
    }

    // Check Age
    if(Number(age) < 0) {
        P_errors.push({ msg: 'Age is incorrect' })
    }

    // Check Mobile 
    if(phone.length != 10 || Number(phone)>9999999999) {
        P_errors.push({ msg: 'Mobile Number is incorrect' })
    }

    if(P_errors.length > 0) {
        req.flash('temp',P_errors)
        res.redirect('/patientinfo')
    }
    else{
        // check user exist
        let user = `select p_phn from patient_info where p_phn = ${phone}`
        db.query(user, (err, exists) => {
            if(err) throw err
            if(exists.length > 0) {
                P_errors.push({ msg: `${exists[0].p_phn} Already registered` })
                req.flash('temp', P_errors)
                res.redirect('/patientinfo')
            }

            //insert 
            let details = `insert into patient_info set p_dor="${date}",p_name="${name}",p_age=${age},p_gender="${gender}",p_dob="${DOB}",p_bloodgrp="${BloodGrp}",p_phn = "${phone}", p_addr="${address}",p_emailid="${email}", d_id = ${d_id}`
            db.query(details, (err, saved) => {
            if(err) throw err
            // success
            let doctor = `select users.name, doctor.room_no from users,doctor where users.id = ( select doc_id from diseases where d_id = ${d_id} ) and doctor.doc_id = ( select doc_id from diseases where d_id = ${d_id} )`
            db.query(doctor, (err, doc) => {
                if(err) throw err
                let id = `select id from patient_info where p_phn = "${phone}"`
                db.query(id, (err, userID) => {
                    if(err) throw err
                    else {
                        let temp_success = []
                        temp_success.push({ msg: `You are have been successfully Registered with id_no: ${userID[0].id}`})
                        temp_success.push({ msg: `please proceed to Room.no: ${doc[0].room_no} and Doctor: Dr. ${doc[0].name}`})
                        req.flash('P_success_msg', temp_success)
                        res.redirect('/patientinfo')
                    } 
                })
            })
          })
        })
    }
})

<<<<<<< HEAD
module.exports = router
=======
// Doctor dashboard
router.get('/Doc_dash', (req, res) => {
    res.render('Doc_dash', {
        name: req.user.name,
        specialization: req.user.specialization
    })
})


module.exports = router
>>>>>>> c9fa6efb4731a0d308407b13da4ae970aab19bb4
