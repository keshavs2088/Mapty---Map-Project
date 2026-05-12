"use strict";

const mapView = document.querySelector(".map");
const locationElm = document.querySelector(".location");
const distanceElm = document.querySelector(".distance");
const durationElm = document.querySelector(".duration");
const paceElm = document.querySelector(".pace");
const cadenceElm = document.querySelector(".cadence");
const elevationElm = document.querySelector(".elevation");
const addWorkoutElm = document.querySelector(".add-workout");
const cyclingWorkoutElm = document.querySelector(".cycling");
const runningWorkoutElm = document.querySelector(".running");
const containerWorkoutValueElm = document.querySelector(".workout-value");
const newWorkoutElm = document.querySelector(".new-workout");

class Workout {
  #location;
  #date;
  constructor(distance, duration, pace) {
    this.distance = distance;
    this.duration = duration;
    this.pace = pace;
  }

  _setlocation(location) {
    this.#location = location;
  }

  _setdate(date) {
    this.#date = date;
  }

  _getlocation() {
    return this.#location;
  }
}

class Running extends Workout {
  constructor(distance, duration, pace, cadence) {
    super(distance, duration, pace);
    this.cadence = cadence;
  }
}

class Cycling extends Workout {
  constructor(distance, duration, pace, elevation) {
    super(distance, duration, pace);
    this.elevation = elevation;
  }
}

const toggleWorkout = function (type) {
  runningWorkoutElm.classList.toggle("active", type === "running");
  cyclingWorkoutElm.classList.toggle("active", type === "cycling");

  cadenceElm.classList.toggle("hidden", type === "cycling");
  elevationElm.classList.toggle("hidden", type === "running");
};

runningWorkoutElm.addEventListener("click", function () {
  toggleWorkout("running");
});

cyclingWorkoutElm.addEventListener("click", function () {
  toggleWorkout("cycling");
});

newWorkoutElm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (cyclingWorkoutElm.classList.contains("active"))
    newWorkoutObjectCreation("cycling");
  else newWorkoutObjectCreation("running");
});

let newWorkoutArr = [];
let newWorkout;

const newWorkoutObjectCreation = function (workoutType) {
  console.log(workoutType);
  if (workoutType === "running") {
    newWorkout = new Running(
      distanceElm.value,
      durationElm.value,
      paceElm.value,
      cadenceElm.value,
    );
  }

  if (workoutType === "cycling") {
    newWorkout = new Cycling(
      distanceElm.value,
      durationElm.value,
      paceElm.value,
      elevationElm.value,
    );
  }

  newWorkout._setlocation(locationElm.value);
  newWorkout._setdate(new Date());
  newWorkoutArr.push(newWorkout);

  distanceElm.value =
    durationElm.value =
    paceElm.value =
    cadenceElm.value =
    elevationElm.value =
      "";
};

let lattitude;
let longitude;
navigator.geolocation.getCurrentPosition((position) => {
  lattitude = position.coords.latitude;
  longitude = position.coords.longitude;

  let map = L.map(mapView).setView([lattitude, longitude], 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //click on map
  map.on("click", function (e) {
    console.log(e);
    L.marker(e.latlng)
      .addTo(map)
      .bindPopup("A pretty CSS popup.<br> Easily customizable.")
      .openPopup();
    locationElm.value = e.latlng;
    containerWorkoutValueElm.classList.remove("inactive");
  });
});
