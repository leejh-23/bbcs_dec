document.addEventListener("DOMContentLoaded", function () { // this runs when the dom has been loaded
    const loginButton = document.getElementById("loginButton"); // gets elements in the nav bar
    const registerButton = document.getElementById("registerButton");
    const profileButton = document.getElementById("profileButton");
    const logoutButton = document.getElementById("logoutButton");
        
    // Check if token exists in local storage
    const token = localStorage.getItem("token");

    const toggleNavbarElements = (isLoggedIn) => {
        if (isLoggedIn) { // user is logged in 
            loginButton.classList.add("d-none");
            registerButton.classList.add("d-none");
            profileButton.classList.remove("d-none");
            logoutButton.classList.remove("d-none");
        } 
        else {            
            loginButton.classList.remove("d-none");
            registerButton.classList.remove("d-none");
            profileButton.classList.add("d-none");
            logoutButton.classList.add("d-none");
        }
    };

    const handleTokenRefresh = () => {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            alert('Your session has expired. Please log in again.');
            window.location.href = 'login.html';
            return;
        }

        const data = {refreshToken: refreshToken};

        const refreshCallback = (responseStatus, responseData) => {
            console.log("refreshCallback:", responseStatus, responseData);

            if (responseStatus === 200) {
                localStorage.setItem("token", responseData.token);
            } 
            else {
                alert(responseData.error || "Token renewal failed.");
                window.location.href = 'login.html';
            }
        };

        fetchMethod(currentUrl + "/api/token/refresh", refreshCallback, "POST", data, token);
    };

    if (token) {
        const callback = (responseStatus, responseData) => {
            console.log("responseStatus:", responseStatus);
            console.log("responseData:", responseData);

            if (responseStatus === 200) {
                const currentUserId = responseData.userId;
                window.currentUserId = currentUserId;

                if (window.onUserIdSet) {
                    window.onUserIdSet(window.currentUserId);
                }

                toggleNavbarElements(true);
            } 
            else if (responseStatus === 401) { // token has expired
                localStorage.removeItem("token");
                handleTokenRefresh();
            }
        };

        fetchMethod(currentUrl + "/api/verify", callback, "GET", null, token);
    } 
    else {
        toggleNavbarElements(false);
    }

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "index.html";
    });  
});