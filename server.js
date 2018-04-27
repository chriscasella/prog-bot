require('dotenv').config();

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const axios = require('axios');
const youtubeSearch = require('youtube-search');
const async = require('async');

//environment variables
const lastSecret = process.env.LAST_SECRET;
const lastApi = process.env.LAST_API;


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

let isSong = (submission) => {
    let title = submission.title;
    const pattern = new RegExp(/\s*-\s*/);
    title.match(pattern) ? parseTitle(title) : ''
    //let split = title.split(' ');
    //split[1] == '-' ? searchSimilarArtists(split[0]) : ''//nothing   
};

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

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    };

    const execSavedArtistSearch = async () => {
        await asyncForEach(savedArtists, async (artist) => {
            await youtubeSearch(artist + ' band', ytOpts, (err, res) => {
                if (err) console.log(err);
                console.log(res[0]);
                parseYtResponse(res[0]);
            });
        })
        console.log('Done')
    }
    execSavedArtistSearch();
    /*
    async.each(artists, (artist)=>{
        
        youtubeSearch(artist + ' band', ytOpts, (err, res) => {
            if (err) console.log(err);
            console.log(res[0]);
            parseYtResponse(res[0]);
        });
    },(err)=>{
        if(err) console.log('error in eachOfSeries:', err);
    });
    */
};

let parseYtResponse =(ytObj)=>{
    let ytVidObj = {
        link:ytObj.link,
        artist: savedArtists[counter]
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

//sortArtists(testData);