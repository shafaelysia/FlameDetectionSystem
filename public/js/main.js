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
  const tempRef = ref(database, "sensors/temperature");
  const humRef = ref(database, "sensors/humidity");
  const flameValueRef = ref(database, "sensors/flameValue");
  const flameDetectedRef = ref(database, "sensors/flameDetected");

  onValue(tempRef, (snapshot) => {
    const temperature = snapshot.val();
    document.getElementById("temperature").innerText = temperature || "N/A";
  });

  onValue(humRef, (snapshot) => {
    const humidity = snapshot.val();
    document.getElementById("humidity").innerText = humidity || "N/A";
  });

  onValue(flameValueRef, (snapshot) => {
    const flameValue = snapshot.val();
    document.getElementById("flameValue").innerText = flameValue || "N/A";
  });

  onValue(flameDetectedRef, (snapshot) => {
    // Modal popover when flame is detected
    const flameDetected = snapshot.val();
    if (flameDetected) {
      var toastElList = [].slice.call(document.querySelectorAll('.toast'))
      var toastList = toastElList.map(function(toastEl) {
        return bootstrap.Toast.getOrCreateInstance(toastEl)
      })
      toastList.forEach(toast => toast.show())
    }
  });
}