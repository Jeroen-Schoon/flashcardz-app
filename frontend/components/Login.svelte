<script>
    export let user;
    export let logged_in;
    export let registering;

    let username;
    let password;

    // Login a user
    async function login(event) {
        event.preventDefault(); // Prevent refreshing the page after submitting form
        try {
            const response = await fetch('/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: username, password: password })
            });

            if (!response.ok) {
                alert("Invalid login credentials");
                const errorMessage = await response.json();
                throw new Error(errorMessage.error || 'Login failed');
            }

            const data = await response.json();
            user = data.user;
            logged_in = true;

        } catch (error) {
            console.error('Error during login: ', error.message);
        }
    }

    // Go to the register page
    function register(event) {
        event.preventDefault();
        registering = true;
    }
</script>

<form class="login centered" on:submit={login}>
    <h2>Login</h2>
    <input type="text" placeholder="Username..." bind:value={username} required />
    <input type="password" placeholder="Password..." bind:value={password} required />
    <input type="submit" value="Login" class="submit" />
    <p>
        Or, if you don't have an account yet:
        <a href="#" on:click={register}>Register here</a>
    </p>
</form>