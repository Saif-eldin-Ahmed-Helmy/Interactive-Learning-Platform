const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const mongoose = require('mongoose');
const { seedDemo } = require('../dist/demo/seed');
const { demoCourses } = require('../dist/demo/data');
const wait = ms => new Promise(resolve => setTimeout(resolve,ms));

test('seeded app supports normal login, learning, saved progress, profile edits and logout over HTTP', {skip:!process.env.MONGODB_TEST_URI,timeout:30000}, async()=>{
  const uri=new URL(process.env.MONGODB_TEST_URI);
  uri.pathname='/learning_test_'+randomUUID().replaceAll('-','');
  const credentials={saif:randomBytes(20).toString('hex'),maaly:randomBytes(20).toString('hex')};
  await seedDemo(uri.toString(),credentials);
  const listener=net.createServer();await new Promise(resolve=>listener.listen(0,'127.0.0.1',resolve));
  const port=listener.address().port;await new Promise(resolve=>listener.close(resolve));
  const child=spawn(process.execPath,['dist/server.js'],{cwd:path.join(__dirname,'..'),windowsHide:true,stdio:'ignore',
    env:{...process.env,MONGODB_URI:uri.toString(),PORT:String(port),HOST:'127.0.0.1',SESSION_SECRET:randomBytes(48).toString('hex'),SERVE_CLIENT:'false',NODE_ENV:'test'}});
  let cookie='';const url=`http://127.0.0.1:${port}`;
  const request=async(route,method='GET',body)=>{
    const response=await fetch(url+'/api'+route,{method,headers:{'Content-Type':'application/json',cookie},body:body===undefined?undefined:JSON.stringify(body)});
    if(response.headers.get('set-cookie')) cookie=response.headers.get('set-cookie').split(';')[0];
    return {status:response.status,data:await response.json()};
  };
  try{
    for(let i=0;i<80;i++){try{if((await fetch(url+'/health')).ok)break;}catch{}await wait(100);}
    assert.equal((await request('/courses')).status,401);
    assert.equal((await request('/auth/login','POST',{email:'saif@demo.example.test',password:credentials.saif})).status,200);
    const catalog=await request('/courses');assert.equal(catalog.data.data.length,4);
    const html=demoCourses[0];const lesson=html.lessons[0];
    assert.equal((await request('/courses/'+html.course._id)).data.data.modules[0].lessons[0].title,lesson.title);
    const js=demoCourses[2];assert.equal((await request('/courses/'+js.course._id+'/enroll','POST',{})).status,200);
    assert.equal((await request('/progress/video/'+lesson._id+'/save','POST',{currentTime:42})).status,200);
    assert.equal((await request('/progress/video/'+lesson._id)).data.data.currentTime,42);
    const quiz=html.quizzes[0];const submission={answers:quiz.questions.map(q=>q.correctAnswerIndex),courseId:html.course._id,lessonId:lesson._id};
    const result=await request('/quiz/'+quiz._id+'/submit','POST',submission);
    assert.equal(result.status,200);assert.equal(result.data.data.passed,true);assert.equal(result.data.data.percentage,100);
    const points=(await request('/users/profile')).data.data.user.points;
    await request('/quiz/'+quiz._id+'/submit','POST',submission);
    assert.equal((await request('/users/profile')).data.data.user.points,points);
    assert.equal((await request(`/progress/course/${html.course._id}/lesson/${lesson._id}/progress`,'POST',{timeSpent:15})).status,200);
    assert.equal((await request('/progress/course/'+html.course._id+'/next-lesson')).data.data.lessonIndex,1);
    assert.equal((await request('/users/profile/name','PUT',{name:'Updated Learner'})).status,200);
    assert.equal((await request('/users/profile')).data.data.user.name,'Updated Learner');
    assert.ok((await request('/users/profile')).data.data.badges.length>0);
    assert.equal((await request('/achievements')).data.data.stats.total,6);
    assert.equal((await request('/courses','POST',{title:'Unauthorized course',description:'Test',category:'HTML',difficulty:'beginner'})).status,403);
    assert.equal((await request('/auth/logout','POST',{})).status,200);
    assert.equal((await request('/auth/me')).status,401);
  } finally{
    child.kill();await new Promise(resolve=>child.once('exit',resolve));
    await mongoose.connect(uri.toString());await mongoose.connection.dropDatabase();await mongoose.disconnect();
  }
});
