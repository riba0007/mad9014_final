"use strict"

var app = {
    pages: [], 
    links: [], 
    matchList: {},
    
    initialize: function() {
        document.addEventListener('deviceready', app.onDeviceReady.bind(this), false);
    },
    
    onDeviceReady: function() {
        app.loadApp();
    },
    
    nav: function(ev) {
        ev.preventDefault();
        let id = ev.currentTarget.getAttribute("data-ref");
        
        app.pages.forEach(function(item) {
            item.id == id ? item.classList.add("active"):item.classList.remove("active");
        });
    },
    
    getScores: function(ev) {
        let url = new Request("https://griffis.edumedia.ca/mad9014/sports/quidditch.php");
        fetch(url)  
            .then(function(response){
                return response.json(); 
            })
            .then(function(jsonResponse){
                app.matchList = jsonResponse;
                app.matchList.timestamp = new Date().getTime();
            
                localStorage.setItem("riba0007.matchList", JSON.stringify(app.matchList)); 
            })
            .then(function(){
                app.drawScores();
                app.drawTimetable();
        });
    },
    
    getTeamImage: function(teamName){
        return "<svg viewBox='0 0 100 100'><use xlink:href='#"+teamName+"'></use></svg>";
    },
    
    drawTimetable: function(){
        
        //sort by date
        app.matchList.scores.sort(function(a,b) {
            return (new Date(a.date) < new Date(b.date)) ? -1 : (new Date(a.date) >new Date(b.date)) ? 1 : 0;
        });
        
        //create HTML
        let innerHTML = "<h1>Timetable</h1>";
        
        app.matchList.scores.forEach(function(item){
            innerHTML = innerHTML.concat("<table><tr><th colspan=3>",item.date,"</th></tr>");
            item.games.forEach(function(game){
                innerHTML = innerHTML.concat("<tr><td>",app.getTeamImage(app.getTeamName(game.home)),
                                             "</td><td>X</td><td>",app.getTeamImage(app.getTeamName(game.away)),"</td></tr>");
            });
            innerHTML = innerHTML.concat("</table>");
        });
        let section = document.getElementById("T");
        section.innerHTML = innerHTML;
    },
    
    calculateScores: function(){
        // score[n][0] = team id
        // score[n][1] = wins
        // score[n][2] = ties
        // score[n][3] = losses
        let scores = [];
        
        //get teams
        app.matchList.teams.forEach(function(item){
            scores.push([item.id,0,0,0]);
        });
        
        //calculates games won
        app.matchList.scores.forEach(function(item){
            item.games.forEach(function(game){
                //home team
                let index = scores.map(function(x){return x[0];}).indexOf(game.home);
                game.home_score > game.away_score ? scores[index][1]++ : game.home_score == game.away_score ? scores[index][2]++ : scores[index][3]++;
                
                //away team
                index = scores.map(function(x){return x[0];}).indexOf(game.away);
                game.away_score > game.home_score ? scores[index][1]++ : game.away_score == game.home_score ? scores[index][2]++ : scores[index][3]++;
            });
        });
        
        //sort by score (wins / ties / less losses)
        scores.sort(function(a,b) {
            return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : a[2] < b[2] ? 1 : a[2] > b[2] ? -1 : a[3] > b[3] ? 1 : a[3] < b[3] ? -1 : 0;
        });
        
        return scores;
    },
    
    drawScores: function(){ 
        let scores = app.calculateScores();
        
        //create HTML
        let innerHTML = "<table><h1>Scores</h1><tr><th>Team</th><th>Wins</th><th>Ties</th><th>Losses</th></tr>";
        
        scores.forEach(function(item){
            innerHTML = innerHTML.concat("<tr><td>",app.getTeamImage(app.getTeamName(item[0])),"</td><td>",item[1],"</td><td>",item[2],"</td><td>",item[3],"</td></tr>");
        });
        
        innerHTML = innerHTML.concat("</table>");
        
        let section = document.getElementById("S");
        section.innerHTML = innerHTML;
    },
    
    getTeamName: function(id){
        return app.matchList.teams[app.matchList.teams.map(function(x){return x.id;}).indexOf(id)].name;
    },
    
    loadItens: function(){
        app.pages = document.querySelectorAll('[data-role="page"]');
        app.links = document.querySelectorAll('[data-role="links"]');
        
        app.links.forEach(function(item){
            item.addEventListener("click", app.nav);
        });
        
        document.querySelector(".fab").addEventListener("click",app.getScores);
    },
    
    loadData: function(){
        let lsData = localStorage.getItem('riba0007.matchList');
        
        if (lsData == null){
            app.getScores();
        } else {
            app.matchList = JSON.parse(lsData);
            if (app.matchList.scores.length == 0){
                app.getScores();
            } else if (app.matchList.timestamp == null || (new Date()-app.matchList.timestamp) >= 3600000) {
                app.getScores();
            } else {
                app.drawScores();
                app.drawTimetable();
            }
        } 
        //console.log(app.matchList);    
    },
    
    loadApp: function() {
        app.loadItens();
        app.loadData();
    }
}

//initialize app
if (document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1) {
    //console.log("device");
    app.initialize();
} else {
    //console.log("browser");
    app.loadApp();
}