<script>
    export let user;
    export let registering;
    export let logged_in;

    let password;
    let username;

    // Register a new user
    async function register_new_user(event) {
        event.preventDefault();
        try {
            const response = await fetch('/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: username, password: password })
            });

            if (!response.ok) {
                alert("User already exists! try a different username.");
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Register failed');
            }

            const data = await response.json();
            user = data.user;
            logged_in = true; // Automatically login after registration
            registering = false;

        } catch (error) {
            console.error('Error during register: ', error.message);
        }
    }

    // Go to the login page
    function login(event) {
        event.preventDefault();
        registering = false
    }
</script>

<form class="login centered" on:submit={register_new_user}>
    <h2>Register</h2>
    <input type="text" placeholder="Username..." bind:value={username} required />
    <input type="password" placeholder="Password..." bind:value={password} required />
    <input type="submit" value="Register" class="submit" />
    <p>
        Already have an account? 
        <a href="#" on:click={login}>Login here</a>
    </p>
</form>