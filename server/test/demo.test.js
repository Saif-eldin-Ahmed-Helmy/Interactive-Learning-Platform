const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');
const { demoCourses, demoLearners, demoId } = require('../dist/demo/data');
const { seedDemo } = require('../dist/demo/seed');
const { Course } = require('../dist/models/Course');
const { Progress } = require('../dist/models/Progress');
const { User } = require('../dist/models/User');
const { Lesson } = require('../dist/models/Lesson');
const { getNextLesson } = require('../dist/controllers/progressController');
const { getUserProfile } = require('../dist/controllers/userController');
const { Badge } = require('../dist/models/Badge');
const response = () => ({ statusCode: 200, status(n) { this.statusCode=n;return this; }, sendStatus(n) { this.statusCode=n;return this; }, json(body) {this.body=body;return this;} });

test('demo content links every module, lesson, quiz and local thumbnail', () => {
  assert.equal(demoCourses.length,4);
  for(const {course,lessons,quizzes} of demoCourses) {
    assert.match(course.thumbnailUrl,/^\/Images\//);
    assert.deepEqual(course.modules.flatMap(module=>module.lessons),lessons.map(lesson=>lesson._id));
    for(const lesson of lessons) {
      assert.equal(lesson.courseId,course._id);
      assert.equal(quizzes.find(quiz=>quiz._id===lesson.quizId).lessonId,lesson._id);
      assert.ok(!lesson.codeExercise.starterCode.includes(lesson.codeExercise.expectedOutput));
    }
  }
});

test('resume skips completed lessons and profile reads actual earned badge records', async t => {
  const id=demoId('html');
  t.mock.method(Course,'findById',async()=>demoCourses[0].course);
  t.mock.method(Progress,'findOne',async()=>({completedLessons:[{lessonId:demoCourses[0].lessons[0]._id}]}));
  const res=response();await getNextLesson({params:{courseId:id},session:{userId:'student'}},res);
  assert.equal(res.body.data.lessonIndex,1);
  t.mock.method(User,'findById',()=>({select:async()=>({name:'Learner'})}));
  const queries=[];
  t.mock.method(Badge,'find',query=>{queries.push(query);return{sort:()=>({limit:async()=>[{name:'Earned badge'}]})};});
  t.mock.method(Progress,'countDocuments',async()=>0);
  const profile=response();await getUserProfile({session:{userId:'student'}},profile);
  assert.deepEqual(queries,[{userId:'student'}]);assert.equal(profile.body.data.badges.length,1);
});

test('fresh database seeds real data and a repeat launch preserves edits, progress and unenrollment', {skip:!process.env.MONGODB_TEST_URI}, async()=>{
  const dbName='learning_test_'+randomUUID().replaceAll('-','');
  const uri=new URL(process.env.MONGODB_TEST_URI);uri.pathname='/'+dbName;
  try {
    await seedDemo(uri.toString());
    await mongoose.connect(uri.toString());
    assert.equal(await Course.countDocuments(),4);assert.equal(await Lesson.countDocuments(),16);
    const userId=demoId(demoLearners[0].key);const courseId=demoCourses[0].course._id;
    await User.updateOne({_id:userId},{$set:{name:'Edited learner'},$pull:{enrolledCourses:courseId}});
    await Progress.deleteOne({userId,courseId});
    await Progress.updateOne({userId,courseId:demoCourses[1].course._id},{$set:{overallProgress:75}});
    await mongoose.disconnect();await seedDemo(uri.toString());await mongoose.connect(uri.toString());
    assert.equal(await Course.countDocuments(),4);assert.equal(await User.countDocuments(),3);
    assert.equal((await User.findById(userId)).name,'Edited learner');
    assert.equal(await Progress.countDocuments({userId,courseId}),0);
    assert.equal((await Progress.findOne({userId,courseId:demoCourses[1].course._id})).overallProgress,75);
  } finally { if(mongoose.connection.readyState===0)await mongoose.connect(uri.toString());await mongoose.connection.dropDatabase();await mongoose.disconnect(); }
});
