const { Request, Response } = require('express');
const { isEmail, isMobilePhone } = require('validator');
const { ObjectId } =  require('mongodb');

const bcrypt = require('bcrypt');

const dbInstance = require('./../services/db.service');

const db = dbInstance.getInstance();

/**
 * Creates a session for a user
 * @param {userInfo} user - an object represnting a valid user 
 * @returns {Promise<string>} a string representing the session id
 */
const createUserSession = function(user) {
  return new Promise(async (resolve, reject) => {
    try {      
      const sessionInfo = await db.collection('sessions').updateOne(
        { userId: user._id },
        { 
          $set: { 
            createdAt: new Date()
          }
        },
        { upsert: true }
      )
  
      let sessionId = null;
      if (sessionInfo.upsertedId != null) {
        sessionId = sessionInfo.upsertedId;
      } else {
  
        const { _id } = await db.collection("sessions").findOne({ userId: user._id });
  
        sessionId = _id;
      }
  
      if (!sessionId) {
        throw Error("Something went wrong on our end, please try again");
      }

      resolve(sessionId);
    } catch (error) {
      reject(error);
    }
  })
}

/**
 * Handles the post request for login
 * 
 * @param {Request} req
 * @param {Response} res 
 * 
 * @returns {string} a string representing the session id
 */
const login = async function (req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !isEmail(email)) {
      res.status(400).json({ msg: "Invalid email format, please make sure your email is correct" });
      return;
    }    

    if (!password || typeof password != 'string') {
      res.status(400).json({ msg: "Please specify a password" });
      return;
    }

    const user = await db.collection('users').findOne({ email: email });

    if (!user) {
      res.status(404).json({ msg: "Invalid credentials" });
      return;
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      res.status(404).json({ msg: "Invalid crendentials" });
      return;
    }

    const sessionId = await createUserSession(user);

    res.status(200).json({ user: sessionId });
    return;

  } catch (error) {
    res.status(500).json({ error: error });
    return;
  }
}

/**
 * Handles the pose request for registration
 * 
 * @param {Request} req
 * @param {Response} res 
 * 
 * @returns {string} a string representing the session id
 */
const register = async function(req, res) {
  const { name, email, school, phoneNumber, password } = req.body;

  try {
    
    if (!name || typeof name != 'string') {
      res.status(400).json({ msg: "Invalid username format, please check your username and try again" })
      return;
    }

    if (!email || !isEmail(email)) {
      res.status(400).json({ msg: "Invalid email format, please check your email and try again" })
      return;
    }

    if (!school || typeof school != 'string') {
      res.status(400).json({ msg: "Invalid school format, please check your school and try again" })
      return;
    }

    if (!phoneNumber || !isMobilePhone(phoneNumber, 'en-NG')) {
      res.status(400).json({ msg: "Invalid phone number format, please check your phone number and try again" });
      return;
    }

    if (!password || typeof password != 'string') {
      res.status(400).json({ msg: "Invalid password format, please specify a valid password" });
      return;
    }

    hashPassword = await bcrypt.hash(password, 10);

    // this object get's an _id field in runtime from mongodb
    const user = {
      name,
      email,
      school,
      phoneNumber,
      password: hashPassword
    }

    await db.collection('users').insertOne(user)

    const sessionId = await createUserSession(user);

    res.status(200).json({ user: sessionId });
    return;

  } catch (error) {
    if (error.code == 11000) {
      res.status(400).json({ msg: "A user with this email already exists" });
      return;
    }

    res.status(500).json({ error: error });
    return;
  }
}

/**
 * Logs user out of the application
 * 
 * @param {Request} req
 * @param {Response} res 
 * 
 * @returns {boolean} - indicates if operation was succesful
 */
const logout = async function (req, res) {
  const { sessionId } = req.body;

  try {

    if (!sessionId || typeof sessionId != 'string') {
      res.status(400).json({ msg: "Invalid request" });
      return;
    }

    await db.collection('sessions').deleteOne({ _id: ObjectId(sessionId) });

    return res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).json({ error: error })
    return;
  } 
}

/**
 * @typedef userInfo
 * @property {ObjectId} _id
 * @property {string} name
 * @property {string} email
 * @property {string} school
 * @property {string} phoneNumber
 * @property {string} password
 */

module.exports = {
  login,
  register,
  logout
}