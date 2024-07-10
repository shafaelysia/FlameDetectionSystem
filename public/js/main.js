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
const temperatureChartCtx = document.getElementById('temperatureChart').getContext('2d');
const humidityChartCtx = document.getElementById('humidityChart').getContext('2d');
const flameChartCtx = document.getElementById('flameChart').getContext('2d');

const temperatureChart = new Chart(temperatureChartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperature (°C)',
      data: [],
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      fill: false
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour'
        }
      },
      y: {
        beginAtZero: true
      }
    }
  }
});

const humidityChart = new Chart(humidityChartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Humidity (%)',
      data: [],
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      fill: false
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour'
        }
      },
      y: {
        beginAtZero: true
      }
    }
  }
});

const flameChart = new Chart(flameChartCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Flame Value',
      data: [],
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1,
      fill: false
    }]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour'
        }
      },
      y: {
        beginAtZero: true
      }
    }
  }
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

// Initialize empty arrays for chart data
let temperatureList = [];
let humidityList = [];
let flameValueList = [];
let flameDetectedList = [];
let timestampList = [];

// Load sensor data from database
function loadSensorData() {
  const sensorsRef = ref(database, "sensors");
  let sensorDataList = [];

  onValue(sensorsRef, (snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const sensorData = childSnapshot.val();
      sensorDataList.push(sensorData);
    });

    processSensorData(sensorDataList);
  });
}

// Process and display sensor data
function processSensorData(sensorDataList) {
  sensorDataList.forEach((sensorData) => {
    // Check if the timestamp already exists in the list
    if (!timestampList.includes(sensorData.timestamp)) {
      temperatureList.push(sensorData.temperature);
      humidityList.push(sensorData.humidity);
      flameValueList.push(sensorData.flameValue);
      flameDetectedList.push(sensorData.flameDetected);
      timestampList.push(sensorData.timestamp);

      // Update latest values
      updateLatestValue('temperature', sensorData.temperature);
      updateLatestValue('humidity', sensorData.humidity);
      updateLatestValue('flameValue', sensorData.flameValue);

      // Update flame log table
      if (sensorData.flameDetected) {
        addFlameLogEntry(sensorData.timestamp);
      }
    }
  });

  if (flameDetectedList[flameDetectedList.length - 1] === true) {
    showFlameDetectedToast();
  }
  // After data processing, update charts
  updateChart(temperatureChart, temperatureList, timestampList);
  updateChart(humidityChart, humidityList, timestampList);
  updateChart(flameChart, flameValueList, timestampList);
}

function updateChart(chart, values, timestamps) {
  // Clear previous data
  chart.data.labels.pop();
  chart.data.datasets.forEach(dataset => {
    dataset.data.pop()
  });

  chart.update();

  // Add new data
  timestamps.forEach((timestamp, index) => {
    const time = new Date(timestamp);
    chart.data.labels.push(time);
    chart.data.datasets[0].data[index] = values[index];
  });
  chart.update();
}

function updateLatestValue(id, value) {
  document.getElementById(id).innerText = value || "N/A";
}

function addFlameLogEntry(timestamp) {
  const tableBody = document.querySelector("#flameLogTable tbody");
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.textContent = new Date(timestamp).toLocaleString();
  row.appendChild(cell);
  tableBody.appendChild(row);
}

function showFlameDetectedToast() {
  var toastElList = [].slice.call(document.querySelectorAll('.toast'));
  var toastList = toastElList.map(function (toastEl) {
    return new bootstrap.Toast(toastEl);
  });
  toastList.forEach(toast => toast.show());
}
