import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyC6ekkd4HsO1AYY_ZhIo7zXtBw6LIQy1-4",
  authDomain: "feed-81797.firebaseapp.com",
  projectId: "feed-81797",
  storageBucket: "feed-81797.appspot.com",
  messagingSenderId: "22897163267",
  appId: "1:22897163267:web:295b653165c305e499e236"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Login Button
document.getElementById("loginBtn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Login Successful ✅");
      window.location.href = "NGO_profile.html";
    })
    .catch((error) => {
      alert(error.message);
    });
});
