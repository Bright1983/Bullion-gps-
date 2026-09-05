<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bullion GPS Management</title>
<style>
body{font-family:Arial;margin:0;background:#f4f7f5;color:#17201b}
header{background:#075c39;color:white;padding:18px}
main{padding:18px;max-width:700px;margin:auto}
.card{background:white;padding:18px;margin:15px 0;border-radius:12px}
input,button{width:100%;padding:12px;margin:7px 0;box-sizing:border-box}
button{background:#075c39;color:white;border:0;border-radius:8px;font-weight:bold}
.gps{background:#e8f5ed;padding:12px;border-radius:8px}
.hidden{display:none}
</style>
</head>

<body>

<header>
<h1>BULLION</h1>
<div>GPS Management System</div>
</header>

<main>

<div id="login" class="card">
<h2>Field Officer Login</h2>
<input id="user" placeholder="Username">
<input id="pass" type="password" placeholder="Password">
<button onclick="login()">LOGIN</button>
<p id="error"></p>
</div>

<div id="app" class="hidden">

<div class="card">
<h2>Farm Registration</h2>

<input id="farmer" placeholder="Farmer name">
<input id="phone" placeholder="Phone number">
<input id="district" placeholder="District">
<input id="ward" placeholder="Ward / Area">
<input id="village" placeholder="Village">
<input id="farm" placeholder="Farm / Plot ID">
<input id="area" type="number" step="0.01" placeholder="Area planted (ha)">
<input id="kg" type="number" placeholder="Estimated tobacco (kg)">

<button onclick="gps()">CAPTURE GPS</button>

<div class="gps">
<div id="gpsStatus">GPS not captured</div>
<div id="coordinates"></div>
</div>

<button onclick="saveFarm()">SAVE FARM</button>
</div>

<div class="card">
<h2>My Registrations</h2>
<div id="records"></div>
</div>

</div>

</main>

<script>

let latitude=null;
let longitude=null;

function login(){

let u=document.getElementById("user").value;
let p=document.getElementById("pass").value;

if((u.startsWith("officer") && p==="Officer123") ||
   (u==="manager" && p==="Bullion123")){

document.getElementById("login").classList.add("hidden");
document.getElementById("app").classList.remove("hidden");
load();

}else{

document.getElementById("error").innerText="Invalid login";

}

}

function gps(){

if(!navigator.geolocation){
alert("GPS is not supported on this device");
return;
}

document.getElementById("gpsStatus").innerText="Getting GPS location...";

navigator.geolocation.getCurrentPosition(

function(position){

latitude=position.coords.latitude;
longitude=position.coords.longitude;

document.getElementById("gpsStatus").innerText="GPS captured";
document.getElementById("coordinates").innerText=
"Latitude: "+latitude.toFixed(6)+
" | Longitude: "+longitude.toFixed(6)+
" | Accuracy: ±"+Math.round(position.coords.accuracy)+"m";

},

function(error){

document.getElementById("gpsStatus").innerText=
"GPS failed. Turn on Location and allow Chrome permission.";

},

{enableHighAccuracy:true,timeout:20000,maximumAge:0}

);

}

function saveFarm(){

if(latitude===null){

alert("Capture GPS first");
return;

}

let records=JSON.parse(localStorage.getItem("bullionFarms")||"[]");

records.push({

farmer:document.getElementById("farmer").value,
phone:document.getElementById("phone").value,
district:document.getElementById("district").value,
ward:document.getElementById("ward").value,
village:document.getElementById("village").value,
farm:document.getElementById("farm").value,
area:document.getElementById("area").value,
kg:document.getElementById("kg").value,
latitude:latitude,
longitude:longitude,
date:new Date().toLocaleString()

});

localStorage.setItem("bullionFarms",JSON.stringify(records));

alert("Farm saved successfully");

document.querySelectorAll("input").forEach(x=>{
if(x.id!=="user"&&x.id!=="pass")x.value="";
});

latitude=null;
longitude=null;

document.getElementById("gpsStatus").innerText="GPS not captured";
document.getElementById("coordinates").innerText="";

load();

}

function load(){

let records=JSON.parse(localStorage.getItem("bullionFarms")||"[]");

let html="";

records.forEach((r,i)=>{

html+=`
<div style="border-bottom:1px solid #ddd;padding:10px">
<b>${r.farmer}</b><br>
${r.district} ${r.ward}<br>
Area: ${r.area} ha<br>
GPS: ${r.latitude}, ${r.longitude}<br>
${r.date}
</div>`;

});

document.getElementById("records").innerHTML=
html||"No farms registered yet.";

}

</script>

</body>
</html>
