require('dotenv').config();

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const axios = require('axios');
const youtubeSearch = require('youtube-search');

//environment variables
const lastApi = process.env.LAST_API;
const lastSecret = process.env.LAST_SECRET;


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
    isSong(submission);
});

//global variables
let savedArtists = [];
let commentPayload = [];
let counter = 0;

let isSong = (submission) => {
    let title = submission.title;
    let split = title.split(' ');
    split[1] == '-' ? searchSimilarArtists(split[0]) : ''//nothing   
};

let searchSimilarArtists = (artist) => {
    axios.get('http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist='+ artist +'&api_key='+ lastApi +'&format=json&limit=3')
    .then((res)=>{
        console.log(res);
        sortArtists(res.data.similarartists.artist);
    }).catch((err)=>{
        console.log('last fm search error:', err);
    });
};

let sortArtists = (artists) => {
    savedArtists = [];
    for(artist of artists){
        savedArtists.push(artist.name);
        console.log(artist)
    };
    console.log('savedArtists:', savedArtists);
    searchYouTube(savedArtists);
};

let searchYouTube = (artists) => {
    const ytOpts = {
        maxResults: 1,
        key: process.env.YOUTUBE_API
    };
    for(i of artists){
        youtubeSearch(i + ' band', ytOpts, (err, res)=>{
            if(err) console.log(err);
            console.log(res[0]); 
            parseYtResponse(res[0]);
        });
    };
};

let parseYtResponse =(ytObj)=>{
    let ytVidObj = {
        link:ytObj.link,
        artist: savedArtists[counter]
    };
    commentPayload.push(ytVidObj); 
    counter++;
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

sortArtists(testData);