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
const listRecordsElm = document.querySelector(".workout-records");
const noRecordElm = document.querySelector(".no-record");

let workoutsArray = [];
let newWorkout;
let mapMarker;
let map;

class Workout {
  #location;
  #date;
  #locationObject;
  constructor(distance, duration, pace) {
    this.distance = distance;
    this.duration = duration;
    this.pace = pace;
  }

  _setlocation(location) {
    this.#location = location;
  }

  _setdate(date) {
    const formattedDate = new Intl.DateTimeFormat("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    this.#date = formattedDate;
  }

  _setlocationObject(locationObject) {
    this.#locationObject = locationObject;
  }

  getDate() {
    return this.#date;
  }

  getlocation() {
    return this.#location;
  }
  getlocationObject() {
    return this.#locationObject;
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

const MarkerIcon = L.Icon.extend({
  options: {
    // shadowUrl: "leaf-shadow.png",
    iconSize: [80, 100],
    shadowSize: [50, 64],
    iconAnchor: [40, 70],
    shadowAnchor: [4, 62],
    popupAnchor: [0, -40],
  },
});

const runningMarker = new MarkerIcon({ iconUrl: "runningMarker.png" });
const cyclingMarker = new MarkerIcon({ iconUrl: "cyclingMarker.png" });

const toggleWorkout = function (type) {
  runningWorkoutElm.classList.toggle("active", type === "running");
  cyclingWorkoutElm.classList.toggle("active", type === "cycling");

  cadenceElm.classList.toggle("hidden", type === "cycling");
  elevationElm.classList.toggle("hidden", type === "running");
};

const newWorkoutObjectCreation = function (workoutType) {
  if (workoutType === "running")
    newWorkout = new Running(
      distanceElm.value,
      durationElm.value,
      paceElm.value,
      cadenceElm.value,
    );

  if (workoutType === "cycling")
    newWorkout = new Cycling(
      distanceElm.value,
      durationElm.value,
      paceElm.value,
      elevationElm.value,
    );

  newWorkout._setlocation(locationElm.value);
  newWorkout._setdate(new Date());
  newWorkout._setlocationObject(mapMarker);

  const cadence = `🔄️ ${newWorkout.cadence} (spm)`;
  const elevation = `⛰️ ${newWorkout.elevation} (m)`;

  if (checkValidation()) {
    //add popup
    mapMarker
      .bindPopup(
        `${newWorkout.getDate()} <br> 🛣️ ${newWorkout.distance} (km) 🕔 ${newWorkout.duration} (min) <br> 🚀 ${newWorkout.pace} (min/km) ${workoutType === "running" ? cadence : elevation}`,
        { className: `${workoutType}-popup` },
      )
      .openPopup();

    //add a new record on UI and create a new value in array
    workoutsArray.push(newWorkout);
    addRecord(workoutType);
  }

  //reset the form
  locationElm.value =
    distanceElm.value =
    durationElm.value =
    paceElm.value =
    cadenceElm.value =
    elevationElm.value =
      "";
  containerWorkoutValueElm.classList.add("inactive");
  addWorkoutElm.classList.add("inactive");
};

const checkValidation = function () {
  if (
    distanceElm.value > 0 &&
    durationElm.value > 0 &&
    paceElm.value > 0 &&
    (elevationElm.value > 0 || cadenceElm.value > 0)
  )
    return true;
  else {
    alert("Workout units should be positive integers !!!");
    mapMarker.remove();
  }
};

const addRecord = function (workoutType) {
  const cadence = `🔄️ ${newWorkout.cadence} (spm)`;
  const elevation = `⛰️ ${newWorkout.elevation} (m)`;
  let html = `<li class="record">
              <div class="workout-location hidden">${newWorkout.getlocation()}</div>
              <img
                class="workout-img ${workoutType}-record_highlight"
                src="${workoutType}.png"
                alt="${workoutType} man icon"
              />
              <div class="workout-summary">
                <p>🛣️ ${newWorkout.distance} km</p>
                <p>🕔 ${newWorkout.duration} min</p>
                <p>🚀 ${newWorkout.pace} min/km</p>
                <p>${workoutType === "running" ? cadence : elevation}</p>
                <p class="workout-date inactive">${newWorkout.getDate()}</p>
              </div>
              <button class="delete-record">❌</button>
            </li>`;

  listRecordsElm.insertAdjacentHTML("beforeend", html);
  noRecordElm.classList.add("hidden");
};

//move map to the marker
const moveMaptoMarker = function (event) {
  const workoutCoords = event.target
    .closest(".record")
    .firstElementChild.textContent.split(",");
  console.log(workoutCoords);
  map.setView([workoutCoords[0], workoutCoords[1]], 14, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
};

//Delete workout records and marker
const deleteRecord = function (event) {
  if (event.target.classList.contains("delete-record")) {
    const deleteLocation =
      event.target.closest(".record").firstElementChild.textContent;
    const position = workoutsArray.findIndex(
      (workout) => workout.getlocation() === deleteLocation,
    );
    workoutsArray[position].getlocationObject().remove();
    event.target.closest(".record").remove();
    workoutsArray.splice(position, 1);
  }

  //display the no record message
  if (workoutsArray.length === 0) noRecordElm.classList.remove("hidden");
};

//Load Map
navigator.geolocation.getCurrentPosition((position) => {
  let latitude = position.coords.latitude;
  let longitude = position.coords.longitude;

  map = L.map(mapView).setView([latitude, longitude], 14);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //click on map
  map.on("click", function (e) {
    //remove unused markers
    if (mapMarker) {
      if (mapMarker.options.icon.options.iconUrl === "marker-icon.png")
        map.removeLayer(mapMarker);
    }

    //Place marker on map
    mapMarker = L.marker(e.latlng).addTo(map);

    locationElm.value = `${e.latlng.lat},${e.latlng.lng}`;
    containerWorkoutValueElm.classList.remove("inactive");
    addWorkoutElm.classList.remove("inactive");
  });
});

//toggle workout
runningWorkoutElm.addEventListener("click", function () {
  toggleWorkout("running");
});

//toggle workout
cyclingWorkoutElm.addEventListener("click", function () {
  toggleWorkout("cycling");
});

//Add a new workout
newWorkoutElm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (cyclingWorkoutElm.classList.contains("active")) {
    newWorkoutObjectCreation("cycling");
    mapMarker.setIcon(cyclingMarker);
  } else {
    newWorkoutObjectCreation("running");
    mapMarker.setIcon(runningMarker);
  }
});

//delete records
listRecordsElm.addEventListener("click", function (e) {
  //delete records
  if (e.target.classList.contains("delete-record")) {
    deleteRecord(e);
    return;
  }

  //move map to marker
  if (e.target.closest(".record")) moveMaptoMarker(e);
});

//calculate cadence and pace
containerWorkoutValueElm.addEventListener("input", function () {
  if (distanceElm.value && durationElm.value) {
    paceElm.value = (durationElm.value / distanceElm.value).toFixed(2);
    cadenceElm.value = (distanceElm.value / durationElm.value).toFixed(2);
  }
});
