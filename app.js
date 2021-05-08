// header('Access-Control-Allow-Origin:*');//允许所有来源访问
// header('Access-Control-Allow-Method:POST,GET');//允许访问的方式
const jwt = require('jsonwebtoken');

const express = require('express')
const url = require('url');
const db = require('./mysql');
const bodyParser = require('body-parser')
const querystring = require("querystring");
const app = express()
app.use(bodyParser.json()); //将请求转换成json格式
app.use(express.urlencoded({ extended: true }))

// app.all('*', (req, res, next)=> {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// post
// app.use(bodyParser.urlencoded({
//     extended: false
// }))

//登陆接口
app.post('/api/login',(req,res)=>{
    // console.log('---------------------------------------------------')
    // console.log(req.body)
        let {
            username,
            password
        } = req.body
        if (!username){
            return res.json({
                status: -1,
                msg: '请检查您的用户名'
            })
        }else{
            let sql = "SELECT * FROM user WHERE username = ? "
            db.query(sql, username, (result) => {
                if (!result.length) {
                    return res.json({
                        status: -1,
                        msg: '用户名不存在呢亲'
                    })
                } else {
                    if (result[0].password == password) {
                        let token = jwt.sign({
                                username: result.username,
                                password: result.password
                            }, 'my_token',
                            {expiresIn: '2h'})

                        return res.json({
                            status: 200,
                            msg: '登录成功',
                            token: token,
                            result
                        })
                    }
                    return res.json({
                        status: -2,
                        msg: '密码好像是错误的亲'
                    })
                }
            })
        }
    // })
});
//注册接口
app.post('/api/register',(req,res)=>{
    console.log(req.body)



        let {
            username,password,op,name
        } = req.body
        console.log(req.body)
        let sql = "SELECT * FROM user WHERE username = ? "
        db.query(sql, username, (result) => {
            if (!result.length) {
                let ssql = "INSERT INTO user (username,password,op,name) VALUES(?,?,?,?)"
                let  addSqlParams =[username,password,op,name];
                db.query (ssql,addSqlParams,function (result,fields) {
                    return res.json({
                        status: 200,
                        msg: '注册成功',
                    })
                })
            }else {
                return res.json({
                    status:-1,
                    msg:'用户名已存在'
                })
            }


        })





    // })
});
//-----------查询----------------------------------------------
//查询学生接口
app.get('/api/student',(req,res)=>{
    const query  = url.parse(req.url, true);
    console.log( query )
    db.query('select * from user where op= 0 ', [],function(result,fields){
    console.log('查询结果：');
    console.log(result);
    res.send({result,status:200})
})
})
//查询所有老师接口
app.get('/api/teacher',(req,res)=>{
    const query  = url.parse(req.url, true);
    console.log( query )
    db.query('select * from user where op = 1', [],function(result,fields){
        console.log('查询结果：');
        console.log(result);
        res.send({result,status:200})
    })
})
///查询课程接口
app.get('/api/course',(req,res)=>{
    const query  = url.parse(req.url, true);
    console.log( query )
    db.query('select * from course', [],function(result,fields){
        console.log('查询结果：');
        console.log(result);
        res.send({result,status:200})
    })
})
//查询考试接口
app.get('/api/exam',(req,res)=>{
    const query  = url.parse(req.url, true);
    console.log( query )
    db.query('select * from tch_exam', [],function(result,fields){
        console.log('查询结果：');
        console.log(result);
        res.send({result,status:200})
    })
})
//查询所有人的接口
app.get('/api/all',(req,res)=>{
    const query  = url.parse(req.url, true);
    console.log( query )
    db.query('select * from user', [],function(result,fields){
        console.log('查询结果：');
        console.log(result);
        res.send({result,status:200})
    })
})

app.get('/api/test',(req,res)=>{
    const query  = url.parse(req.url, true);
    console.log( query )
    const sql = "select teacher.id,teacher.tname,user.username ,user.name from teacher inner join user on teacher.id = user.username "
    db.query(sql, [],function(result,fields){
        console.log('查询结果：');
        console.log(result);
        res.send({result,status:200})
    })
})


//成绩查询接口

//--------------------增加------------------------------



//----------修改----------------------




//---------------删除-----------------------------
//删除学生信息
app.post('/api/deletestu',(req,res)=>{
    //1.创建数组保存 post传过来的数据
    let arr = []
    //2.数据接收..
    req.on("data", (buffer) => {
        console.log(buffer);
        arr.push(buffer);
    });
    //3.接收结束，解析数据
    req.on("end", () => {
        let buffer = Buffer.concat(arr);
        console.log('准备解析');

        //解析
        let ss = querystring.parse(buffer.toString());
        console.log(ss);
        let {sname} = ss
        if (sname=='老萝卜'){
            return res.json({
                status:-1,
                msg:'该用户不能删除'
            })
        }else{
            let sql = "SELECT * FROM student WHERE sname = ? "
            db.query(sql, sname, (result) => {
                if (!result.length) {
                    return res.json({
                        status:-1,
                        msg:'用户名不存在'
                    })
                }else {
                    let sql2 = 'delete from  student  where sname= ?'
                    // let where_value = [params.username];
                    // console.log(sql)
                    // console.log(where_value)
                    db.query(sql2 , sname ,  (result)=> {
                        console.log(1)
                        console.log(result)
                        if (result.affectedRows>0) {
                            console.log(result)
                            console.log('删除成功');
                            // res.send({status:200,'删除成功'})
                            return res.json({
                                status: 200,
                                msg: '删除成功',
                            })
                        }
                    });

                }
            })
        }

    })
});
//删除老师信息
app.post('/api/deleteteach',(req,res)=>{
    //1.创建数组保存 post传过来的数据
    let arr = []
    //2.数据接收..
    req.on("data", (buffer) => {
        console.log(buffer);
        arr.push(buffer);
    });
    //3.接收结束，解析数据
    req.on("end", () => {
        let buffer = Buffer.concat(arr);
        console.log('准备解析');

        //解析
        let ss = querystring.parse(buffer.toString());
        console.log(ss);
        let {tname} = ss
        if (tname=='王老师'){
            return res.json({
                status:-1,
                msg:'该用户不能删除'
            })
        }else{
            let sql = "SELECT * FROM teacher WHERE tname = ? "
            db.query(sql, tname, (result) => {
                if (!result.length) {
                    return res.json({
                        status:-1,
                        msg:'用户名不存在'
                    })
                }else {
                    let sql2 = 'delete from  teacher  where tname= ?'
                    // let where_value = [params.username];
                    // console.log(sql)
                    // console.log(where_value)
                    db.query(sql2 , tname ,  (result)=> {
                        console.log(1)
                        console.log(result)
                        if (result.affectedRows>0) {
                            console.log(result)
                            console.log('删除成功');
                            // res.send({status:200,'删除成功'})
                            return res.json({
                                status: 200,
                                msg: '删除成功',
                            })
                        }
                    });

                }
            })
        }

    })
});
//老师删除课程信息
app.post('/api/deletecourse',(req,res)=>{
    //1.创建数组保存 post传过来的数据
    let arr = []
    //2.数据接收..
    req.on("data", (buffer) => {
        console.log(buffer);
        arr.push(buffer);
    });
    //3.接收结束，解析数据
    req.on("end", () => {
        let buffer = Buffer.concat(arr);
        console.log('准备解析');

        //解析
        let ss = querystring.parse(buffer.toString());
        console.log(ss);
        let {cname} = ss
        if (!cname){
            return res.json({
                status:-1,
                msg:'出错了,传参'
            })
        }else  if (cname=='java 基础'){
            return res.json({
                status:-1,
                msg:'该课程不能删除'
            })
        }else{
            let sql = "SELECT * FROM course WHERE cname = ? "
            db.query(sql, cname, (result) => {
                if (!result.length) {
                    return res.json({
                        status:-1,
                        msg:'课程不存在'
                    })
                }else {
                    let sql2 = 'delete from  course  where cname= ?'
                    // let where_value = [params.username];
                    // console.log(sql)
                    // console.log(where_value)
                    db.query(sql2 , cname ,  (result)=> {
                        console.log(1)
                        console.log(result)
                        if (result.affectedRows>0) {
                            console.log(result)
                            console.log('删除成功');
                            // res.send({status:200,'删除成功'})
                            return res.json({
                                status: 200,
                                msg: '删除成功',
                            })
                        }
                    });

                }
            })
        }

    })
});





// app.post('/post',(req,res)=>{
//     res.send('post傻子')
// })
// app.put('/',(req,res) => {
//     res.send('put请求')
// })
// app.delete('/',(req,res) => {
//     res.send('delete')
// })
//



//查
// db.query('select * from t_student', [],function(result,fields){
//     console.log('查询结果：');
//     console.log(result);
// });

// 增
//语句
// const  addSql = 'INSERT INTO t_student(sname,ssex,sage) VALUES(?,?,?)';
//参数
// const  addSqlParams =['胡8', '1','17'];
//添加
// db.query(addSql,addSqlParams,function(result,fields){
//     console.log('添加成功')
// })


//删
// const  delSql = 'DELETE FROM t_class WHERE id=6 ';
// const delParams = [id="6"]
// db.query(delSql,[],function (result,fields) {
//     console.log("删除成功")
//
// })

// 改
//语句
// const  UpSql = 'UPDATE t_student SET sage="18" WHERE sid=5 ';
// //添加
// db.query(UpSql,[],function(result,fields){
//     console.log('更新成功成功')
// })


// app.delete()

app.listen(8088,()=>{
    console.log(" http://10.36.136.34:8088")
})