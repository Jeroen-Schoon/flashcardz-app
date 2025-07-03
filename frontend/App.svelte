<script>
    import Titlebar from "./components/Titlebar.svelte";
    import Login from "./components/Login.svelte";
    import Register from "./components/Register.svelte";
    import Categories from "./components/Categories.svelte";

    // Ensure that vapidKeys is defined before using it
    const vapidKeys = {
        publicKey: 'BOoKqFYaUWjE3-5P11iJ_xu3T9L2fLxCp1XoYuuwRe7dCP635UpUbSYKq14WEymdiMQkpyV6xBZ6O8knfQ63tlk',
        privateKey: 'YjrNAvwFv8UhIDa26KwFOnx9oSNvZJBorOOH-PtJj-I' // This is not used on the client-side
    };

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
            }).catch(error => {
            console.log('Service Worker registration failed:', error);
            });
        });
    }

    // Request permission to send notifications
    async function requestNotificationPermission() {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            subscribeToPushNotifications(); // Call the subscription function after permission is granted
        } else {
            console.log('Notification permission denied.');
        }
    }

    // Function to subscribe to Push Notifications
    async function subscribeToPushNotifications() {
        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKeys.publicKey), // VAPID public key
        });

        await fetch('/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        console.log('Push subscription saved on the server');
    }

    // Utility function to convert the VAPID key
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    let shareData = {
        title: 'Flashcardz - practice everywhere!',
        text: 'Ever found your physical flashcards too floppy and boring? Look no further! Open the app and fill in your own flashcards. You can learn anywhere, everywhere!',
        url: window.location.href // Get the current URL
    };
    let categories = [];
    let registering;
    let logged_in;
    let user;

    let isOnline = true;

    // Event listeners for online/offline status
    window.addEventListener('online', () => {
        isOnline = true;
    });

    window.addEventListener('offline', () => {
        isOnline = false;
    });

    window.addEventListener('load', async () => {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered with scope:', registration.scope);
        await requestNotificationPermission(); // Ask permission when loading
    });

    // Immediately empty categories list after logging out,
    // to prevent showing other user's data (for a split second) after logging in.
    $: if (!logged_in) {
        categories = [];
    }

    // Trigger category fetching when logged_in changes
    $: if (logged_in) {
        getUserCategories(user.id);
    }

    // Function to trigger the web share
    async function shareContent() {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log('Content shared successfully');
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('We\'re Sorry... Web Share API is not supported in your browser.')
        }
    }

    // Get all categories belonging to the user
    async function getUserCategories(userId) {
        try {
            const response = await fetch(`/user/${userId}/categories`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Fetching user_categories failed');
            }

            const data = await response.json();

            // Extract category names and IDs into an array of objects
            categories = data.categories.map(category => ({
                id: category.id,
                name: category.name
            }));

        } catch (error) {
            console.error(error.message);
        }
    }
</script>

<Titlebar bind:user={user} bind:logged_in={logged_in} bind:isOnline={isOnline}/>

{#if !logged_in & !isOnline}
    <img src="assets/png/logo-no-background.png" alt="Logo">
    <h2>OOPS!<br>You are currently offline, you cannot login or register while not online.</h2>
{:else if !logged_in & !registering}
    <!-- Show login page -->
    <img src="assets/png/logo-no-background.png" alt="Logo">
    <Login bind:user={user} bind:logged_in={logged_in} bind:registering={registering} />
{:else if !logged_in & registering}
    <!-- Show register page -->
    <img src="assets/png/logo-no-background.png" alt="Logo">
    <Register bind:user={user} bind:logged_in={logged_in} bind:registering={registering} />
{:else}
    <!-- Show categories of the logged-in user -->
    <Categories bind:categories={categories} bind:userId={user.id} refreshCategories={getUserCategories} />
    <button class="go-back-button" on:click={shareContent}>Share</button>
{/if}
