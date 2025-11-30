document.addEventListener("DOMContentLoaded", async () => {
    const userInfo = document.getElementById("user-info");
    const token = localStorage.getItem("token");

    if (!token) {
        console.log("No token found — user not logged in.");
        return;
    }

    try {
        // ====== FETCH USER DETAILS ======
        const res = await fetch("/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            console.log("Invalid or expired token.");
            localStorage.removeItem("token");
            return;
        }

        const data = await res.json();
        const user = data.user;
        
        const name = user?.user_metadata?.name || "No name";
        const email = user?.email || "No email";
        const joinDate = user?.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "Unknown";

        // Show user profile
        userInfo.innerHTML = `
            <h2>${name}</h2>
            <p>Email: ${email}</p>
            <p>Member Since: ${joinDate}</p>
            <button class="edit-btn" id="editProfileBtn">Edit Profile</button>
        `;

        // ====== HANDLE EDIT BUTTON ======
        document.getElementById("editProfileBtn").addEventListener("click", () => {
            document.getElementById("edit-form").style.display = "block";
            document.getElementById("edit-name").value = name;
            document.getElementById("edit-email").value = email;
        });

        // ====== HANDLE SAVE BUTTON ======
        document.getElementById("saveProfileBtn").addEventListener("click", async () => {
            const updatedName = document.getElementById("edit-name").value;
            const updatedEmail = document.getElementById("edit-email").value;

            const updateRes = await fetch("/api/updateProfile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: updatedName,
                    email: updatedEmail,
                }),
            });

            if (updateRes.ok) {
                alert("Profile updated successfully!");
                location.reload(); // Refresh page to show updated details
            } else {
                const err = await updateRes.text();
                alert("Error updating profile: " + err);
            }
        });

    } catch (err) {
        console.error("Error fetching user profile:", err);
    }
});
