require('dotenv').config();

const express = require('express');
const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const axios = require('axios');
const youtubeSearch = require('youtube-search');
const async = require('async');
const app = express();

//environment variables
const lastSecret = process.env.LAST_SECRET;
const lastApi = process.env.LAST_API;

app.set('port', (process.env.PORT || 5000));

//For avoidong Heroku $PORT error
app.get('/', function (request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function () {
    console.log('App is running, server is listening on port ', app.get('port'));
});

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
    pollTime: 30000
};

const testsubStreamOpts = {
    subreddit: 'testingground4bots',
    results: 1,
    pollTime: 5000
};

const submissions = client.SubmissionStream(subStreamOpts);

submissions.on('submission', (submission)=>{
    console.log(submission);
    currentSubmission = submission;
    isSong(submission);
});

//global variables
let savedArtists = [];
let commentPayload = [];
let counter = 0;
let currentSubmission = null;

//1. On post, regexp on title
let isSong = (submission) => {
    let title = submission.title;
    const pattern = new RegExp(/\s*-\s*/);
    title.match(pattern) ? parseTitle(title) : ''
    //let split = title.split(' ');
    //split[1] == '-' ? searchSimilarArtists(split[0]) : ''//nothing   
};
//2. Looks for hyphen then pushes everything before it to search for similar artists
let parseTitle = (title) => {
    let split = title.split(' ');
    let titleArr = [];
    for(i of split){
        if(i == '-'){
            let joinedTitle = titleArr.join(' ');
            searchSimilarArtists(joinedTitle);
        }else if( i != '-'){
            titleArr.push(i);
        };
    };
};
//3. Does http call to Last.fm for similar artists
let searchSimilarArtists = (artist) => {

    
    axios.get('http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist='+ artist +'&api_key='+ lastApi +'&format=json&limit=3')
    .then((res)=>{
        console.log(res);
        sortArtists(res.data.similarartists.artist);
    }).catch((err)=>{
        console.log('last fm search error:', err);
    });
};
//4. sorts through last.fm object and pushes artists names to savedArtists
let sortArtists = (artists) => {
    savedArtists = [];

    for(artist of artists){
        savedArtists.push(artist.name);
        console.log(artist)
    };

    console.log('savedArtists:', savedArtists);
    searchYouTube(savedArtists);
};
//5. 
let searchYouTube = (artists) => {
    const ytOpts = {
        maxResults: 1,
        key: process.env.YOUTUBE_API
    };

    let prom1 = youtubeSearch(artists[0] + ' band', ytOpts, (err, res) => {
            if (err) console.log(err);
            console.log('------------------------');
            console.log('promise made', res[0]);
        parseYtResponse(res[0], artists[0]);
        });
    let prom2 = youtubeSearch(artists[1] + ' band', ytOpts, (err, res) => {
        if (err) console.log(err);
        console.log('------------------------');
        console.log('promise made', res[0]);
        parseYtResponse(res[0], artists[1]);
    });
    let prom3 = youtubeSearch(artists[2] + ' band', ytOpts, (err, res) => {
        if (err) console.log(err);
        console.log('------------------------');
        console.log('promise made', res[0]);
        parseYtResponse(res[0], artists[2]);
    });

    const promArr = [prom1,prom2,prom3];
};

let parseYtResponse =(ytObj, artist)=>{
    let ytVidObj = {
        link:ytObj.link,
        artist: artist
    };
    commentPayload.push(ytVidObj); 
    counter++;
    counter == 3 ? postComment() : '';
};

let postComment = () =>{
    console.log('commentPayload',commentPayload,'savedArtists', savedArtists);
    let commentText = '**Here are some similar artists for this submission**' +
    '\n\n &nbsp; [' + commentPayload[0].artist + '](' + commentPayload[0].link + ')' +
    '\n\n &nbsp; [' + commentPayload[1].artist + '](' + commentPayload[1].link + ')' +
    '\n\n &nbsp; [' + commentPayload[2].artist + '](' + commentPayload[2].link +')' +
    '\n\n &nbsp; *I am a bot, sent here to spread prog metal* d(>_<)b' ;
    
    currentSubmission.reply(commentText);
    wipeVars();
};

let wipeVars = ()=>{
    savedArtists = [];
    commentPayload = [];
    currentSubmission = null;
    counter = 0;
};

const testData = [
    {
        name: "Textures"
    },
    {
        name: "Gojira"
    },
    {
        name: "Opeth"
    }
];

//searchSimilarArtists('Opeth');