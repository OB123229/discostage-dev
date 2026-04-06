// Discover Stage — js/data.js
// Mock data for events and artists
// Replace with real API calls when backend is ready

const GENRES = ['All', 'Indie', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz'];

const EVENTS = [
  { id:'1', title:'The Midnight Echoes Live', artist:'The Midnight Echoes', verified:true,  date:'Fri, Feb 27', time:'8:00 PM', venue:'The Underground', area:'Downtown',  rating:4.8, interested:127, genre:'Indie Rock',  vibe:'High Energy • Intimate', color:'#7B5EA7' },
  { id:'2', title:'Jay Smooth Live Set',      artist:'Jay Smooth',         verified:true,  date:'Sat, Mar 1',  time:'9:00 PM', venue:'Club Nova',       area:'Midtown',   rating:4.6, interested:89,  genre:'Hip-Hop',    vibe:'Chill • Intimate',    color:'#4A6FA5' },
  { id:'3', title:'Voltage Electric Night',   artist:'Voltage',            verified:false, date:'Sun, Mar 2',  time:'7:30 PM', venue:'Rooftop Stage',  area:'Uptown',    rating:4.9, interested:203, genre:'Rock',       vibe:'High Energy • Outdoor',color:'#6B4C9A' },
  { id:'4', title:'DJ Nova Sunset',           artist:'DJ Nova',            verified:true,  date:'Mon, Mar 3',  time:'10:00 PM',venue:'The Loft',        area:'Eastside',  rating:4.7, interested:156, genre:'Electronic', vibe:'Chill • Dance',       color:'#3D5A80' },
];

const ARTISTS = [
  { id:'1', name:'Jay Smooth',         genre:'Hip-Hop',    followers:5634, events:3 },
  { id:'2', name:'Voltage',            genre:'Rock',        followers:4251, events:4 },
  { id:'3', name:'DJ Nova',            genre:'Electronic',  followers:3892, events:5 },
  { id:'4', name:'The Midnight Echoes',genre:'Indie Rock',  followers:2847, events:3 },
];

const TOWNS = [
  {name:'Boulder',       state:'CO'}, {name:'Austin',        state:'TX'},
  {name:'Madison',       state:'WI'}, {name:'Ann Arbor',     state:'MI'},
  {name:'Eugene',        state:'OR'}, {name:'Chapel Hill',   state:'NC'},
  {name:'Berkeley',      state:'CA'}, {name:'Charlottesville',state:'VA'},
  {name:'Nashville',     state:'TN'}, {name:'Tempe',         state:'AZ'},
  {name:'Athens',        state:'GA'}, {name:'Gainesville',   state:'FL'},
];
