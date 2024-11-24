import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import bodyParser from 'body-parser'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import {User}  from './models/userSchema.js'

const SECRET_KEY ='secret'
//connect to express app
const app = express()

//connect to mongodb
await mongoose.connect('mongodb://127.0.0.1:27017/auth-example',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    app.listen(3001, ()=> {
        console.log('Server connected to port 3001 and MongoDB')
    })
})
.catch((error)=>{
    console.log('Unable to connect to server and/or Mongodb', error)
})

//middleware
app.use(bodyParser.json());
app.use(cors());


//routes
//User Registration 
app.post('/register',async(req, res)=>{
    try{
        const{email, username, password} =req.body
        const hashPassword = await bcrypt.hash(password,10)
        const newUser = new User({email,username, password: hashPassword})
        await newUser.save()
        res.status(201).json({message:'User created successfully.'})
    } catch(error) {
        res.status(500).json({error: 'Error signing up.'})
    }
})

//Get Request
app.get('/register', async(req,res)=>{
    try{
        const users = await User.find()
        res.status(201).json({users})
    }catch (error) {
        res.status(500).json({error: 'Unable to get users.'})
    }
})

//Login
app.post('/login', async(req,res)=>{
    try{
        const {username, password} = req.body
        const user = await User.findOne({username})
        if(!user) {
            return res.status(401).json({error: 'Invalid credentials.'})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid) {
            return res.status(401).json({error: 'Invalid credentials.'})
        }
        const token =jwt.sign({userId: user._id}, SECRET_KEY, {expiresIn: '1hr'})
        res.json({ message: 'Login successful' })
    }catch(error) {
        res.status(500).json({ error: 'Error logging in' })

    }
})