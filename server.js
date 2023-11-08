const express = require('express')
const app = express()
const { MongoClient, ObjectId } = require('mongodb')
const methodOverride = require('method-override')

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let db;
const url = 'mongodb+srv://admin:qwer1234@cluster0.me3unix.mongodb.net/?retryWrites=true&w=majority';
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공');
  db = client.db('forum');
  app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
  })
}).catch((err)=>{
  console.log(err);
})

app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
})

app.get('/news', (요청, 응답) => {
    응답.send('오늘 비옴')
})

app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지입니다')
})

app.get('/about', (요청, 응답) => {
    응답.sendFile(__dirname + '/about.html')
})

app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray()
    응답.render('list.ejs', { posts : result })
})

app.get('/time', (요청, 응답) => {
    응답.render('time.ejs', { now : new Date() })
})

app.get('/write', (요청, 응답) => {
  응답.render('write.ejs')
})

app.post('/add', async (요청, 응답) => {
  try {
    if(요청.body.title == ''){
      응답.send('제목입력안함')
    } else {
      await db.collection('post').insertOne({title : 요청.body.title, content : 요청.body.content})
      응답.redirect('/list')
    }
  } catch(e) {
    console.log(e)
    응답.status(500).send('서버 에러남')
  }
})

app.get('/detail/:postId', async (요청, 응답) => {
  try { 
    let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.postId)})
    if (result == null){
      응답.status(400).send('이상한 URL 입력함')
    }
    응답.render('detail.ejs', {result : result})
  } catch(e) {
    console.log(e)
    응답.status(400).send('이상한 URL 입력함')
  }
})

// app.post('/update/:postId', async (요청, 응답) => {
//   try {
//     if(요청.body.title == ''){
//       응답.send('제목입력안함')
//     } else {
//       let result = await db.collection('post').updateOne({_id : new ObjectId(요청.params.postId)}, {$set : {title : 요청.body.title, content : 요청.body.content}})
//       응답.redirect('/list')
//     }
//   } catch(e) {
//     응답.status(500).send('에러남')
//   }
// })

app.get('/edit/:id', async (요청, 응답) => {
  let result = await db.collection('post').findOne({ _id : new ObjectId(요청.params.id)})
  응답.render('edit.ejs', { result : result })
})

// app.post('/edit/:id', async (요청, 응답) => {
//   try {
//     if(요청.body.title == ''){
//       응답.send('제목입력안함')
//     } else {
//       let result = await db.collection('post').updateOne({_id : new ObjectId(요청.params.id)}, {$set : {title : 요청.body.title, content : 요청.body.content}})
//       응답.redirect('/list')
//     }
//   } catch(e) {
//     응답.status(500).send('에러남')
//   }
// })

// app.post('/edit', async (요청, 응답) => {
//   try {
//     if(요청.body.title == ''){
//       응답.send('제목입력안함')
//     } else {
//       let result = await db.collection('post').updateOne({_id : new ObjectId(요청.body.id)}, {$set : {title : 요청.body.title, content : 요청.body.content}})
//       응답.redirect('/list')
//     }
//   } catch(e) {
//     응답.status(500).send('에러남')
//   }
// })

app.put ('/edit', async (요청, 응답) => {
  let result = await db.collection('post').updateMnay({ like : {$gt : 10}}, {$set : {like : 2}})
})

app.delete('/delete', async (요청, 응답) => {
  try { 
    let result = await db.collection('post').deleteOne({ _id : new ObjectId(요청.query.docId)})
    if (result == null){
      응답.status(400).send('이상한 URL 입력함')
    }
    응답.send('삭제완료')
  } catch(e) {
    console.log(e)
    응답.status(400).send('이상한 URL 입력함')
  }
})

app.get('/list/:pageNumber', async (요청, 응답) => {
  let result = await db.collection('post').find().skip((요청.params.pageNumber - 1) * 5).limit(5).toArray()
  응답.render('list.ejs', { posts : result })
})

app.get('/list/next/:pageNumber', async (요청, 응답) => {
  let result = await db.collection('post')
  .find({ _id : {$gt : new ObjectId(요청.params.pageNumber)} }).limit(5).toArray()
  응답.render('list.ejs', { posts : result })
})