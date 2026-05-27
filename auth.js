// AUTH GUARD
// This script checks if the user has entered the password.
// If not, it redirects them back to the login page (index.html).

(function () {
    // Check if the "authorized" flag exists in Session Storage
    if (!sessionStorage.getItem('generic_authorized')) {
        // If not found, stop everything and go to login
        console.log("Access Denied. Redirecting to login...");

        // Prevent the page from showing (safe for head execution)
        document.documentElement.style.display = 'none';

        // Use replace so they can't click "Back" to return here
        window.location.replace("index.html");
    }
})();
