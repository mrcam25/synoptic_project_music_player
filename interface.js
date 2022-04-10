// Declare variables

let now_playing = document.querySelector('.now-playing');
let track_art = document.querySelector('.track-art');
let track_name = document.querySelector('.track-name-text');
let track_artist = document.querySelector('.track-artist');

let playpause_btn = document.querySelector('.playpause-track');
let next_btn = document.querySelector('.next-track');
let prev_btn = document.querySelector('.prev-track');

let seek_slider = document.querySelector('.seek_slider');
let volume_slider = document.querySelector('.volume_slider');
let curr_time = document.querySelector('.current_time');
let tot_dur = document.querySelector('.total_duration');
let randomIcon = document.querySelector('.fa-random');
let curr_track = document.createElement('audio');

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let updateTimer;

let fileInput = document.querySelector('#file');
let musiclist = document.querySelector('.music-list');

const arrMusicList = [] ;

let trackHead = document.querySelector('#track-header');
let albumHead = document.querySelector('#album-header');

const jsmediatags = window.jsmediatags;

// Functions and Event Listeners

// The below listener's function is to read the input audio file, push the metadata into an array,
// add the metadata to the playlist and play the track

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    jsmediatags.read(file, {
        onSuccess: function(tag){

            const picData = tag.tags.picture.data;
            const picFormat = tag.tags.picture.format;
            let base64string = "";
            const tbodyEL = document.querySelector('tbody');

            tbodyEL.innerHTML += `
                <tr>
                    <td>${tag.tags.title}</td>
                    <td>${tag.tags.album}</td>             
                </tr>

            ` ;

            for(let i = 0; i < picData.length; i++) {
                base64string += String.fromCharCode(picData[i]);
            }

                track_art.style.backgroundImage = `url(data:${picFormat};base64,${window.btoa(base64string)})`;
                track_name.textContent = tag.tags.title;
                track_artist.textContent = tag.tags.artist;

            arrPush();            
            nextTrack();
            
        } 
        ,
        onError: function(error){
            console.log(error);
        }
    })

});

// The event listener's function is to listen to the Previous track button and then pull the
// metadata from the array to populate the fields in the player

prev_btn.addEventListener("click", prevBtnData) ; 

function prevBtnData() {
    console.log(track_index);

    const picData = arrMusicList[track_index].img;
    let base64string = "";

    
    for(let i = 0; i < picData.length; i++) {
        base64string += String.fromCharCode(picData[i]);
    }

    track_art.style.backgroundImage = arrMusicList[track_index].img;
    track_name.textContent = arrMusicList[track_index].name;
    track_artist.textContent = arrMusicList[track_index].artist;
    
} ;

// This function takes the metadata from the audio file and pushes it into an array

function arrPush() {
    console.log(arrMusicList.length, "Pre push array length");
    console.log(track_index, "pre push t index");
    

    arrMusicList.push({'img': track_art.style.backgroundImage, 
                        'name': track_name.textContent, 
                        'artist': track_artist.textContent, 
                        'music': 'music/'+track_name.textContent+'.mp3'});

    console.log(arrMusicList.length, "post push array length");
    console.log(track_index, "post push t index");
};

// This function shows or hides the playlist when called

function togglePlaylist() {
    if (musiclist.classList.contains('music-list-revealed')) {
        musiclist.classList.remove('music-list-revealed');
    } else {
        musiclist.classList.add('music-list-revealed');
    }
} ;

// This function matches the text input from the playlist search and 
// removes rows which don't match

findText();

function findText() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    table = document.getElementById("music-table");
    tr = table.getElementsByTagName("tr");
  
    // Loop through all table rows, and hide those which don't match the search query
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
} ;

// This function, when called, orders the tracks in the playlist by track or album name

function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("music-table");
  switching = true;
  // Set the sorting direction to ascending:
  dir = "asc";
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
} ;

// This function clears the interval, resets the clocks and loads the tracks information, ready to be read

loadTrack(track_index);

function loadTrack(track_index) {

   // console.log("load started");
  //  console.log("load start ti: " + track_index);
    clearInterval(updateTimer);
  //  console.log("timer updated");
    reset();
  //  console.log("reset done");
    
    curr_track.src = arrMusicList[track_index].music;
    
    track_art.style.backgroundImage = "url(" + arrMusicList[track_index].img + ")";
    track_name.textContent = arrMusicList[track_index].name;
    track_artist.textContent = arrMusicList[track_index].artist;
    now_playing.textContent = "Now playing track " + (track_index + 1) + " of " + arrMusicList.length;

    updateTimer = setInterval(setUpdate, 1000);

    //console.log("ti from loadTrack fn: " + track_index);

    curr_track.addEventListener('ended', nextTrack);
};

// This function resets the timestamps and seek slider position

function reset() {
    curr_time.textContent = "00:00";
    tot_dur.textContent = "00:00";
    seek_slider.value = 0;
} ;

// This function asks if isRandom is "true" or "false"
// Based on the response, is calls one of two functions

function randomTrack() {
    isRandom ? pauseRandom() : playRandom() ;
};

function playRandom() {
    isRandom = true;
    randomIcon.classList.add('randomActive');
};

function pauseRandom() {
    isRandom = false;
    randomIcon.classList.remove('randomActive');
};

function repeatTrack() {
    let current_index = track_index;
    loadTrack(current_index);
    playTrack();  
};

// This function asks if isPlaying is "true" or "false"
// Based on the response, it calls one of two functions

function playpauseTrack() {
    isPlaying ? pauseTrack() : playTrack();
};

function playTrack() {
    console.log("");
    console.log("play - track index: "+track_index);
    curr_track.play(track_index);
    isPlaying = true;
    track_art.classList.add('rotate');
    playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
};

function pauseTrack() {
    console.log("pause");
    curr_track.pause(track_index);
    isPlaying = false;
    track_art.classList.remove('rotate');
    playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
};

// This function changes the current track to the next track
// If isRandom is "true", it will randomly select a track index position based
// around a mathematical formula

function nextTrack() {
    if(track_index < arrMusicList.length - 1 && isRandom === false) {
        track_index += 1;
    } else if(track_index < arrMusicList.length - 1 && isRandom === true) {
        let random_index = Number.parseInt(Math.random() * arrMusicList.length);
        track_index = random_index;
    } else {
        track_index = 0;
    }
    loadTrack(track_index);

        console.log("nextTrack indx:" + track_index);
    
        const picData = arrMusicList[track_index].img;
        let base64string = "";
    
        
        for(let i = 0; i < picData.length; i++) {
            base64string += String.fromCharCode(picData[i]);
        }
    
        track_art.style.backgroundImage = arrMusicList[track_index].img;
        track_name.textContent = arrMusicList[track_index].name;
        track_artist.textContent = arrMusicList[track_index].artist;
        
    playTrack();
};


function prevTrack() {
    if(track_index > 0) {
        track_index -= 1; 
    } else{
        track_index = arrMusicList.length - 1;
    }
    loadTrack(track_index);
    playTrack();
};

function seekTo() {
    let seekto = curr_track.duration * (seek_slider.value / 100);
    curr_track.currentTime = seekto;
};

function setVolume() {
    curr_track.volume = volume_slider.value / 100;
};

function setUpdate() {
    let seekPosition = 0;
    if((curr_track.duration)){
        seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seek_slider.value = seekPosition;

        let currMins = Math.floor(curr_track.currentTime / 60);
        let currSecs = Math.floor(curr_track.currentTime - currMins * 60);
        let durMins = Math.floor(curr_track.duration / 60);
        let durSecs = Math.floor(curr_track.duration - durMins * 60);

        if(currSecs < 10) {
            currSecs = "0" + currSecs;
        }
        if(durSecs < 10) {
            durSecs = "0" + durSecs;
        }
        if(currMins < 10) {
            currMins = "0" + currMins;
        }
        if(durMins < 10) {
            durMins = "0" + durMins;
        }

        curr_time.textContent = currMins + ":" + currSecs;
        tot_dur.textContent = durMins + ":" + durSecs;
    };

};

