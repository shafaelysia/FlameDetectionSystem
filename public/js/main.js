import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// Chart.js instances
const temperatureChartCtx = document
  .getElementById("temperatureChart")
  .getContext("2d");
const humidityChartCtx = document
  .getElementById("humidityChart")
  .getContext("2d");
const flameChartCtx = document.getElementById("flameChart").getContext("2d");

const temperatureChart = new Chart(temperatureChartCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperature (°C)",
        data: [],
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

const humidityChart = new Chart(humidityChartCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Humidity (%)",
        data: [],
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

const flameChart = new Chart(flameChartCtx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Flame Value",
        data: [],
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
        fill: false,
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "time",
        time: {
          unit: "hour",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCme5GyqT2cHQImHwrp_4IN6xlOztlBTM8",
  authDomain: "flamedetectionsystem-311e7.firebaseapp.com",
  databaseURL: "https://flamedetectionsystem-311e7-default-rtdb.firebaseio.com",
  projectId: "flamedetectionsystem-311e7",
  storageBucket: "flamedetectionsystem-311e7.appspot.com",
  messagingSenderId: "472071333082",
  appId: "1:472071333082:web:203dd356c8b696d229b1e3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const database = getDatabase(app);

// Registration
document
  .querySelector("#sign-up .form-row-last input")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.querySelector("#your_email").value;
    const password = document.querySelector("#password").value;
    const confirmPassword = document.querySelector("#confirm_password").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        alert("Registration successful!");
      })
      .catch((error) => {
        console.error("Error registering user:", error.message);
        alert(error.message);
      });
  });

// Login
document
  .querySelector("#sign-in .form-row-last input")
  .addEventListener("click", (e) => {
    e.preventDefault();
    const email = document.querySelector("#your_email_1").value;
    const password = document.querySelector("#password_1").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        showMainPage(user);
      })
      .catch((error) => {
        alert(error.message);
      });
  });

// Logout
document.querySelector("#logout").addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth)
    .then(() => {
      document.getElementById("main-page").style.display = "none";
      document.getElementById("login-page").style.display = "block";
    })
    .catch((error) => {
      console.error("Error logging out:", error.message);
    });
});

// Show main page after login
function showMainPage(user) {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("main-page").style.display = "block";
  document.getElementById("user-email").textContent = user.email;
  loadSensorData();
}

// Load sensor data from database
function loadSensorData() {
  const sensorsRef = ref(database, "sensors");

  onValue(sensorsRef, (snapshot) => {
    let sensorDataList = [];
    snapshot.forEach((childSnapshot) => {
      const sensorData = childSnapshot.val();
      sensorDataList.push(sensorData);
    });
    processSensorData(sensorDataList);
  });
}

// Update latest data function
function updateLatestValue(id, value) {
  document.getElementById(id).innerText = value || "N/A";
}

// Process and display sensor data
function processSensorData(sensorDataList) {
  // Initialize empty arrays for chart data
  let temperatureList = [];
  let humidityList = [];
  let flameValueList = [];
  let flameDetectedList = [];
  let timestampList = [];

  sensorDataList.forEach((sensorData) => {
    const localTime = new Date(sensorData.timestamp).toString();
    // Check if the timestamp already exists in the list
    if (!timestampList.includes(localTime)) {
      temperatureList.push(sensorData.temperature);
      humidityList.push(sensorData.humidity);
      flameValueList.push(sensorData.flameValue);
      flameDetectedList.push(sensorData.flameDetected);
      timestampList.push(localTime);

      // Update latest values
      updateLatestValue("temperature", sensorData.temperature);
      updateLatestValue("humidity", sensorData.humidity);
      updateLatestValue("flameValue", sensorData.flameValue);

      // Update flame log table
      if (sensorData.flameDetected) {
        addFlameLogEntry(localTime);
      }
    }
  });

  if (flameDetectedList[flameDetectedList.length - 1] === true) {
    showFlameDetectedToast();
  }

  updateChart(temperatureChart, temperatureList, timestampList);
  updateChart(humidityChart, humidityList, timestampList);
  updateChart(flameChart, flameValueList, timestampList);
}

// Update Chart
function updateChart(chart, values, timestamps) {
  // Clear previous data;
  if (chart.data.labels != []) {
    chart.data.labels = [];
  }
  if (chart.data.datasets.data != []) {
    chart.data.datasets.data = [];
  }
  chart.update();

  // Add new data
  timestamps.forEach((timestamp, index) => {
    const date = new Date(timestamp);
    // console.log("time: " + date)
    if (!isNaN(date)) {
      // Ensure the date is valid
      chart.data.labels.push(date);
      chart.data.datasets[0].data.push(values[index]);
    } else {
      console.error(`Invalid date: ${timestamp}`);
    }
  });
  chart.update();
}

// Update Flame Log Table
function addFlameLogEntry(timestamp) {
  const tableBody = document.querySelector("#flameLogTable tbody");
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.textContent = new Date(timestamp).toLocaleString();
  row.appendChild(cell);
  tableBody.appendChild(row);
}

// Show Toast when Flame is Detected
function showFlameDetectedToast() {
  var toastElList = [].slice.call(document.querySelectorAll(".toast"));
  var toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl);
  });
  toastList.forEach((toast) => toast.show());
}
