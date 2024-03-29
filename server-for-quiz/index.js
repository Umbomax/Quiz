// import express from "express";
// import fs from "fs";
// import path from "path";
// import cors from "cors";

const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')

const {MongoClient} = require('mongodb')
const { resolve } = require('path')
const { rejects } = require('assert')
const client = new MongoClient('mongodb+srv://test:Zaq1xsw2345@cluster0.y412clp.mongodb.net/?retryWrites=true&w=majority')
const start = async ()=>{
  try{
    await client.connect()
    console.log('connection sucsessfull')
    
  }catch(e){
    console.log('connection not sucsessfull')
    console.log(e)
  }
}

start()

let dirname = path.resolve();

const app = express();
const jsonParser = express.json();

app.use(express.static(dirname + "/public"));
app.use(cors());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb" }));

const usersJSONPath = "users.json";
const quizesJSONPath = "quizes.json";
app.get("/api/users", function (req, res) {
  const content = fs.readFileSync(usersJSONPath, "utf8");
  const users = JSON.parse(content);
  res.send(users);
});

// получение данных по логину

app.get("/api/users/:login&:pass", async function (req, res) {
  const inputLogin = req.params.login; // получаем login
  const inputPassword = req.params.pass; // получаем login

  const users = client.db().collection('users')

  const currUser = await users.findOne({login:inputLogin})

  if (!currUser){
     res.status(404).send();
}

  if(currUser.password !== inputPassword){
    return res.status(401).send();
  }else{
    res.send(currUser)
  }



  // const allUsers = await users.find().toArray()
     
  // let user = null;
  // // находим в массиве пользователя по login
  // for (let i = 0; i < users.length; i++) {
  //   if (users[i].login === login) {
  //     user = users[i];
  //     if (user.password !== password) {
  //       return res.status(401).send();
  //     }
  //     break;
  //   }
  // }
  // // отправляем пользователя
  // if (user) {
  //   res.send(user);
  // } else {
  //   res.status(404).send();
  // }
});

// получение отправленных данных

app.post("/api/users", jsonParser, async function (req, res) {
  if (!req.body) return res.sendStatus(400);
  

  const userName = req.body.name;
  const userLogin = req.body.login;
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  let user = { name: userName, login: userLogin, email: userEmail, password: userPassword, isAdmin: false };
  const users = client.db().collection('users')
  await users.insertOne(user)
  
  // let data = fs.readFileSync(usersJSONPath, "utf8");
  // let users = JSON.parse(data);
  //поверяем на дубль пользователя
  // for (let i = 0; i < users.length; i++) {
  //   if (users[i].login === userLogin || users[i].email === userEmail) {
  //     return res.status(409).send();
  //   }
  // }
  // находим максимальный id
  // const id = Math.max.apply(
  //   Math,
  //   users.map((o) => {
  //     return o.id;
  //   })
  // );
  // увеличиваем его на единицу
  // user.id = id + 1;
  // добавляем пользователя в массив
  // users.push(user);
  // data = JSON.stringify(users);
  // перезаписываем файл с новыми данными
  // fs.writeFileSync("users.json", data);
  res.send(user);
});
// удаление пользователя по id
app.delete("/api/users/:id", function (req, res) {
  const id = req.params.id;
  let data = fs.readFileSync(usersJSONPath, "utf8");
  let users = JSON.parse(data);
  let index = -1;
  // находим индекс пользователя в массиве
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == id) {
      index = i;
      break;
    }
  }
  if (index > -1) {
    // удаляем пользователя из массива по индексу
    const user = users.splice(index, 1)[0];
    data = JSON.stringify(users);
    fs.writeFileSync("users.json", data);
    // отправляем удаленного пользователя
    res.send(user);
  } else {
    res.status(404).send();
  }
});
// изменение пользователя
app.put("/api/users", jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);

  const userId = req.body.id;
  const userName = req.body.name;
  const userLogin = req.body.login;
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  let data = fs.readFileSync(usersJSONPath, "utf8");
  const users = JSON.parse(data);
  let user;
  for (let i = 0; i < users.length; i++) {
    if (users[i].id == userId) {
      user = users[i];
      break;
    }
  }
  // изменяем данные у пользователя
  if (user) {
    user.name = userName;
    user.login = userLogin;
    user.email = userEmail;
    user.password = userPassword;
    data = JSON.stringify(users);
    fs.writeFileSync("users.json", data);
    res.send(user);
  } else {
    res.status(404).send(user);
  }
});

//получаем данные викторины
app.post("/api/quizes", jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body.answers);

  const quiz = req.body;

  let data = fs.readFileSync(quizesJSONPath, "utf8");
  const quizes = JSON.parse(data);

  const id = Math.max.apply(
    Math,
    quizes.map((o) => {
      return o.id;
    })
  );
  // увеличиваем его на единицу
  quiz.id = id + 1;
  // добавляем пользователя в массив
  quizes.push(quiz);
  data = JSON.stringify(quizes);
  // перезаписываем файл с новыми данными
  fs.writeFileSync("quizes.json", data);
  res.send(quiz);
});
app.get("/api/quizes", function (req, res) {
  const content = fs.readFileSync(quizesJSONPath, "utf8");
  const quizes = JSON.parse(content);
  res.send(quizes);
});

app.put("/api/quizes", jsonParser, function (req, res) {
  if (!req.body) return res.sendStatus(400);

  console.log(req.body);

  const quizName = req.body.quizName;
  const user = req.body.username;
  const result = req.body.result;
  console.log(user);

  let data = fs.readFileSync(quizesJSONPath, "utf8");
  const quizes = JSON.parse(data);

  let quiz;

  for (let i = 0; i < quizes.length; i++) {
    if (quizes[i].quizName == quizName) {
      quiz = quizes[i];
      break;
    }
  }

  if (quiz) {
    let isRecord = false
    if (quiz.results) {
      const lastresult = quiz.results[user] || -1;
      if (result > lastresult) {
        quiz.results[user] = result;
        isRecord = true
      }
    } else {
      quiz.results = {};
      quiz.results[user] = result;
      isRecord = true
    }
    data = JSON.stringify(quizes);
    fs.writeFileSync("quizes.json", data);
    res.send(`${isRecord}`);
  } else {
    res.status(404).send(quiz);
  }
});

app.listen(3000, function () {
  console.log("Сервер ожидает подключения...");
});
