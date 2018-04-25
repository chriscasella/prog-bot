require('dotenv').config();

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');

const r = new Snoowrap({
    userAgent: 'prog-bot',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});

const client = new Snoostorm(r);

const streamOpts = {
    subreddit: 'progmetal',
    results: 1,
    pollTime: 5000
};

const subStreamOpts = {
    subreddit: 'progmetal',
    results: 1,
    pollTime: 5000
};

const testsubStreamOpts = {
    subreddit: 'testingground4bots',
    results: 1,
    pollTime: 5000
};

const comments = client.CommentStream(streamOpts);

const submissions = client.SubmissionStream(testsubStreamOpts);

comments.on('comment', (comment)=>{
    console.log(comment);
});

submissions.on('submission', (submission)=>{
    console.log(submission);
})

let isSong = (submission) => {
    let title = submission.title;
    let split = title.split(' ');
    split[1] == '-' ? search : ''//nothing   
};

let search = () => {

};