!function t(e,n,a){function o(i,s){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!s&&c)return c(i,!0);if(r)return r(i,!0);var l=new Error("Cannot find module '"+i+"'");throw l.code="MODULE_NOT_FOUND",l}var u=n[i]={exports:{}};e[i][0].call(u.exports,function(t){var n=e[i][1][t];return o(n||t)},u,u.exports,t,e,n,a)}return n[i].exports}for(var r="function"==typeof require&&require,i=0;i<a.length;i++)o(a[i]);return o}({1:[function(t,e,n){"use strict";e.exports={apiKey:"AIzaSyCsTL7ZOxNOAUByHQVgGAUIW6OcjXbaCDQ",authDomain:"borkedin.firebaseapp.com",databaseURL:"https://borkedin.firebaseio.com",projectId:"borkedin",storageBucket:"",messagingSenderId:"769825906375"}},{}],2:[function(t,e,n){"use strict";function a(t){Array.from(document.getElementsByClassName("page-hidden")).forEach(function(t){t.style.display="none"}),document.getElementById("page-"+t).style.display="block"}function o(t){if(p.innerText=t.name,f.innerText=t.address,g.src="https://maps.googleapis.com/maps/api/streetview?size=600x300&location="+t.latitude+","+t.longitude+"&heading=151.78&pitch=-0.76&key="+d,h.style.display="none",y.style.display="none",t.name in m){var e=m[t.name];e.vr&&(y.href="./"+e.vr+".html",y.style.display="block"),e.meetup&&(h.href=e.meetup,h.style.display="block")}}function r(t){var e={title:v.value,range:k.value,description:w.value};return u.ref("profile/"+t+"/experience").push(e)}function i(t){console.log(t),I.innerText=t.name,_.style.backgroundImage="url('"+t.image+"')",v.value="",k.value="",w.value="",E.innerHTML="";var e=t.experience||{};for(var n in e){var a=t.experience[n],o=s.getExperienceCard(a);E.appendChild(o)}b.innerHTML="";var r=t.skills||{};Object.keys(r).map(function(t){return r[t]}).sort(function(t,e){return e.endorsements-t.endorsements}).forEach(function(t){var e=s.getSkillRow(t);b.appendChild(e)})}var s=t("./views").Views(),c=t("./parks").ParksModule(),l=t("./config"),u=firebase.initializeApp(l).database(),d="AIzaSyBIZRYftboGELfzOFmSUrcMkYwWtQN7sF8",m=(function(t){t=t.split("+").join(" ");for(var e,n={},a=/[?&]?([^=]+)=([^&]*)/g;e=a.exec(t);)n[decodeURIComponent(e[1])]=decodeURIComponent(e[2]);return n}(document.location.search).game,{"Centennial Park":{vr:"cen"},"William A. Pitts Park":{vr:"wap"}}),p=document.getElementById("park-name"),f=document.getElementById("park-address"),g=document.getElementById("park-image"),h=document.getElementById("park-meetup"),y=document.getElementById("park-vr"),v=document.getElementById("experience-title"),k=document.getElementById("experience-range"),w=document.getElementById("experience-description"),x=document.getElementById("experience-submit"),I=document.getElementById("profile-doggo-name"),_=document.getElementById("profile-doggo-image"),E=document.getElementById("experience-holder"),b=document.getElementById("skill-holder");window.main=function(){var t={"/profile/:profileid":function(t){console.log(t),a("profile"),u.ref("profile/"+t).on("value",function(t){i(t.val()||{})}),x.addEventListener("click",function(e){r(t).then(function(t){}).catch(console.error)})},"/parks/:cityid":function(t){console.log(t),c.CITIES.indexOf(t)>-1?(a("parks"),c.getParks(t).then(function(t){var e=document.getElementById("map-holder");c.renderMap(t,e,o);o(t[0])}).catch(console.error)):document.location="./#/404"},"/vr/:parkid":function(t){console.log(t),document.location="./"+t+".html"},"/404":function(){a("404")}};Router(t).init()}},{"./config":1,"./parks":3,"./views":4}],3:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var a={nashville:function(){return new Promise(function(t,e){$.get("https://data.nashville.gov/resource/xbru-cfzi.json",{dog_park:"Yes"}).then(function(e){var n=e.filter(function(t){return t.mapped_location}).map(function(t){return{name:t.park_name,address:t.mapped_location_address,latitude:t.mapped_location.coordinates[1],longitude:t.mapped_location.coordinates[0],cityid:"nashville",data:t}});t(n)}).catch(e)})},chicago:function(){return new Promise(function(t,e){$.get("https://data.cityofchicago.org/resource/4xwe-2j3y.json",{$where:"dog_friendly >= 1"}).then(function(e){var n=e.filter(function(t){return t.location}).map(function(t){return{name:t.park_name,address:t.location_address,latitude:t.location.coordinates[1],longitude:t.location.coordinates[0],cityid:"chicago",data:t}});t(n)}).catch(e)})},losangeles:function(){return new Promise(function(t,e){$.get("https://data.lacity.org/resource/xyvg-dst2.json",{locationtype:"Dog Parks"}).then(function(e){var n=e.filter(function(t){return t.geolat&&t.geolong}).map(function(t){return{name:t.location_name,address:(t.stnumber||"")+" "+(t.stdirection||"")+" "+(t.stname||"")+" "+(t.stsuffix||""),latitude:parseFloat(t.geolat),longitude:parseFloat(t.geolong),cityid:"losangeles",data:t}});t(n)}).catch(e)})},newyork:function(){return new Promise(function(t,e){$.get("https://data.cityofnewyork.us/resource/p7jc-c8ak.json",{typecatego:"Community Park"}).then(function(e){var n=e.filter(function(t){return t.the_geom}).map(function(t){var e=t.the_geom.coordinates[0][0][0];return{name:t.signname,address:t.location,latitude:e[1],longitude:e[0],cityid:"newyork",data:t}});t(n)}).catch(e)})},seattle:function(){return new Promise(function(t,e){$.get("https://data.seattle.gov/resource/fa7z-wkeh.json",{}).then(function(e){var n=e.filter(function(t){return t.location_1}).map(function(t){var e={};try{e=JSON.parse(t.location_1)}catch(t){}return{name:t.common_name,address:e.address||"No Address",latitude:parseFloat(t.location_1.latitude),longitude:parseFloat(t.location_1.longitude),cityid:"seattle",data:t}});t(n)}).catch(e)})},calgary:function(){return new Promise(function(t,e){$.get("https://data.calgary.ca/resource/enr4-crti.json",{}).then(function(e){console.log(e);var n=e.filter(function(t){return t.the_geom}).map(function(t){var e=t.the_geom.coordinates[0][0][0];return{name:t.description,address:t.off_leash_area_id,latitude:e[1],longitude:e[0],cityid:"calgary",data:t}});t(n)}).catch(e)})}};n.ParksModule=function(){return{CITIES:Object.keys(a),getParks:function(t){return new Promise(function(e,n){var o=a[t];o?o().then(e).catch(n):n("We do not currently have data for this city. Message your city council!")})},renderMap:function(t,e,n){for(var a=t[0],o=new google.maps.Map(e,{center:{lat:a.latitude,lng:a.longitude},zoom:10,styles:[{featureType:"landscape",stylers:[{hue:"#FFA800"},{saturation:0},{lightness:0},{gamma:1}]},{featureType:"road.highway",stylers:[{hue:"#53FF00"},{saturation:-73},{lightness:40},{gamma:1}]},{featureType:"road.arterial",stylers:[{hue:"#FBFF00"},{saturation:0},{lightness:0},{gamma:1}]},{featureType:"road.local",stylers:[{hue:"#00FFFD"},{saturation:0},{lightness:30},{gamma:1}]},{featureType:"water",stylers:[{hue:"#00BFFF"},{saturation:6},{lightness:8},{gamma:1}]},{featureType:"poi",stylers:[{hue:"#679714"},{saturation:33.4},{lightness:-25.4},{gamma:1}]}]}),r=!1,i=0;i<t.length;i++)!function(){var e=t[i],a="\n\t\t\t\t\t<h1>"+e.name+"</h1>\n\t\t\t\t",s=new google.maps.InfoWindow({content:a}),c=new google.maps.Marker({position:{lat:e.latitude,lng:e.longitude},map:o,title:e.name});c.addListener("click",function(){n(e),s.open(o,c),r&&r.close(),r=s})}();return o}}}},{}],4:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});n.Views=function(){return{getExperienceCard:function(t){var e='\n\t\t\t\t<div class="media">\n\t\t\t\t\t<div class="media-left">\n\t\t\t\t\t\t<figure class="image is-64x64">\n\t\t\t\t\t\t\t<img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image">\n\t\t\t\t\t\t</figure>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="media-content">\n\t\t\t\t\t\t<h3 class="title is-3">'+t.title+'</h3>\n\t\t\t\t\t\t<p class="subtitle is-5">'+t.range+"</p>\n\t\t\t\t\t\t<p>"+t.description+"</p>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t",n=document.createElement("div");return n.innerHTML=e,n.classList.add("profile-experience"),n},getSkillRow:function(t){var e=t.frequency<.45?"is-success":"is-warning",n='\n\t\t\t\t<td>\n\t\t\t\t\t<div class="tags has-addons">\n\t\t\t\t\t\t<span class="tag is-medium">'+t.skill+'</i></span>\n\t\t\t\t\t\t<span class="tag is-medium '+e+'">'+t.endorsements+'</i></span>\n\t\t\t\t\t</div>\n\t\t\t\t</td>\n\t\t\t\t<td>\n\t\t\t\t\t<p class="has-text-right"><span class="is-bold">'+Math.round(100*t.frequency)+"%</span> of members are skilled in this.</p>\n\t\t\t\t</td>\n\t\t\t",a=document.createElement("tr");return a.innerHTML=n,a}}}},{}]},{},[2]);
//# sourceMappingURL=maps/main.js.map
